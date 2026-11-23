import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import type { User, Order, OrderItem, OrderStatusHistory } from '../types/index.js';
import { requireAuth } from '../middleware/auth.js';
import { createAuditLog } from '../services/audit.js';
import { generateId } from '../utils/id.js';
import { apiRateLimit } from '../middleware/rate-limit.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

const orders = new Hono<{ Bindings: Env; Variables: Variables }>();

orders.use('/*', apiRateLimit);
orders.use('/*', requireAuth);

// GET /api/orders/stats — Order statistics (before /:id to avoid route conflict)
orders.get('/stats', async (c) => {
  try {
    const tenantId = c.get('tenant_id');

    const stats = await c.env.DB.prepare(
      `SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
       FROM orders WHERE tenant_id = ?`
    )
      .bind(tenantId)
      .first<{
        total_orders: number;
        total_revenue: number;
        avg_order_value: number;
        delivered_orders: number;
        cancelled_orders: number;
        pending_orders: number;
      }>();

    return c.json(stats);
  } catch (err) {
    return c.json({ error: 'Failed to get order stats', details: String(err) }, 500);
  }
});

// GET /api/orders — List with pagination, status filter, date range
orders.get('/', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const status = c.req.query('status');
    const dateFrom = c.req.query('date_from');
    const dateTo = c.req.query('date_to');
    const search = c.req.query('search');

    let query = 'SELECT * FROM orders WHERE tenant_id = ?';
    const params: (string | number)[] = [tenantId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND created_at <= ?';
      params.push(dateTo);
    }

    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR tracking_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countParams = params.slice(0, -2);

    const { results } = await c.env.DB.prepare(query)
      .bind(...params)
      .all<Order>();

    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...countParams)
      .first<{ total: number }>();

    return c.json({
      data: results,
      pagination: {
        page,
        limit,
        total: countResult?.total ?? 0,
        totalPages: Math.ceil((countResult?.total ?? 0) / limit),
      },
    });
  } catch (err) {
    return c.json({ error: 'Failed to list orders', details: String(err) }, 500);
  }
});

// GET /api/orders/:id
orders.get('/:id', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const orderId = c.req.param('id');

    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ? AND tenant_id = ?'
    )
      .bind(orderId, tenantId)
      .first<Order>();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const { results: items } = await c.env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    )
      .bind(orderId)
      .all<OrderItem>();

    return c.json({ ...order, items });
  } catch (err) {
    return c.json({ error: 'Failed to get order', details: String(err) }, 500);
  }
});

// POST /api/orders — Create order
orders.post('/', async (c) => {
  try {
    const user = c.get('user');
    const tenantId = c.get('tenant_id');

    const body = await c.req.json<{
      customer_name: string;
      customer_email?: string;
      customer_phone?: string;
      customer_address?: string;
      customer_city?: string;
      customer_department?: string;
      payment_method?: string;
      shipping_cost?: number;
      notes?: string;
      items: Array<{ product_id: string; quantity: number }>;
    }>();

    if (!body.customer_name || !body.items || body.items.length === 0) {
      return c.json({ error: 'Missing required fields: customer_name, items' }, 400);
    }

    // Fetch product prices and validate
    const productIds = body.items.map((item) => item.product_id);
    const placeholders = productIds.map(() => '?').join(',');
    const { results: productsResult } = await c.env.DB.prepare(
      `SELECT id, price, stock, is_active FROM products WHERE id IN (${placeholders}) AND tenant_id = ?`
    )
      .bind(...productIds, tenantId)
      .all<{ id: string; price: number; stock: number; is_active: number }>();

    const productMap = new Map(productsResult.map((p) => [p.id, p]));

    // Validate all products exist and are active
    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return c.json({ error: `Product ${item.product_id} not found` }, 404);
      }
      if (!product.is_active) {
        return c.json({ error: `Product ${item.product_id} is not active` }, 400);
      }
      if (product.stock < item.quantity) {
        return c.json({ error: `Insufficient stock for product ${item.product_id}` }, 400);
      }
    }

    const orderId = generateId();
    let subtotal = 0;
    const orderItems: { id: string; product_id: string; quantity: number; unit_price: number }[] = [];

    for (const item of body.items) {
      const product = productMap.get(item.product_id)!;
      const unitPrice = product.price;
      subtotal += unitPrice * item.quantity;
      orderItems.push({
        id: generateId(),
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }

    const shippingCost = body.shipping_cost ?? 0;
    const total = subtotal + shippingCost;

    const statements: D1PreparedStatement[] = [];

    // Insert order
    statements.push(
      c.env.DB.prepare(
        `INSERT INTO orders (id, tenant_id, user_id, customer_name, customer_email, customer_phone,
         customer_address, customer_city, customer_department, payment_method, subtotal, shipping_cost, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        orderId,
        tenantId,
        user.id,
        body.customer_name,
        body.customer_email ?? null,
        body.customer_phone ?? null,
        body.customer_address ?? null,
        body.customer_city ?? null,
        body.customer_department ?? null,
        body.payment_method ?? 'cod',
        subtotal,
        shippingCost,
        total,
        body.notes ?? null
      )
    );

    // Insert order items
    for (const item of orderItems) {
      statements.push(
        c.env.DB.prepare(
          `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`
        ).bind(item.id, orderId, item.product_id, item.quantity, item.unit_price)
      );
    }

    // Update stock
    for (const item of body.items) {
      statements.push(
        c.env.DB.prepare(
          `UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
        ).bind(item.quantity, item.product_id, tenantId)
      );
    }

    await c.env.DB.batch(statements);

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: user.id,
      action: 'create_order',
      entity: 'order',
      entity_id: orderId,
      details: JSON.stringify({ total, items_count: orderItems.length }),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    )
      .bind(orderId)
      .first<Order>();

    return c.json({ ...order, items: orderItems }, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create order', details: String(err) }, 500);
  }
});

// PUT /api/orders/:id — Update order
orders.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const tenantId = c.get('tenant_id');
    const orderId = c.req.param('id');

    const existing = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ? AND tenant_id = ?'
    )
      .bind(orderId, tenantId)
      .first<Order>();

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const body = await c.req.json<{
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      customer_address?: string;
      customer_city?: string;
      customer_department?: string;
      payment_method?: string;
      shipping_cost?: number;
      notes?: string;
      tracking_code?: string;
    }>();

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.customer_name !== undefined) { fields.push('customer_name = ?'); values.push(body.customer_name); }
    if (body.customer_email !== undefined) { fields.push('customer_email = ?'); values.push(body.customer_email); }
    if (body.customer_phone !== undefined) { fields.push('customer_phone = ?'); values.push(body.customer_phone); }
    if (body.customer_address !== undefined) { fields.push('customer_address = ?'); values.push(body.customer_address); }
    if (body.customer_city !== undefined) { fields.push('customer_city = ?'); values.push(body.customer_city); }
    if (body.customer_department !== undefined) { fields.push('customer_department = ?'); values.push(body.customer_department); }
    if (body.payment_method !== undefined) { fields.push('payment_method = ?'); values.push(body.payment_method); }
    if (body.shipping_cost !== undefined) { fields.push('shipping_cost = ?'); values.push(body.shipping_cost); }
    if (body.notes !== undefined) { fields.push('notes = ?'); values.push(body.notes); }
    if (body.tracking_code !== undefined) { fields.push('tracking_code = ?'); values.push(body.tracking_code); }

    if (fields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    // Recalculate total if shipping_cost changed
    if (body.shipping_cost !== undefined) {
      const newTotal = existing.subtotal + body.shipping_cost;
      fields.push('total = ?');
      values.push(newTotal);
    }

    fields.push("updated_at = datetime('now')");
    values.push(orderId, tenantId);

    await c.env.DB.prepare(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
    )
      .bind(...values)
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: user.id,
      action: 'update_order',
      entity: 'order',
      entity_id: orderId,
      details: JSON.stringify(body),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    const updated = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    )
      .bind(orderId)
      .first<Order>();

    return c.json(updated);
  } catch (err) {
    return c.json({ error: 'Failed to update order', details: String(err) }, 500);
  }
});

// Valid status transitions for COD pipeline
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  returned: [],
  cancelled: [],
};

// PATCH /api/orders/:id/status — Update status with transition validation and history
orders.patch('/:id/status', async (c) => {
  try {
    const user = c.get('user');
    const tenantId = c.get('tenant_id');
    const orderId = c.req.param('id');

    const body = await c.req.json<{
      status: string;
      payment_status?: string;
      notes?: string;
      tracking_code?: string;
    }>();

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
    }

    const existing = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ? AND tenant_id = ?'
    )
      .bind(orderId, tenantId)
      .first<Order>();

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const allowed = VALID_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(body.status)) {
      return c.json({
        error: `Cannot transition from '${existing.status}' to '${body.status}'. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      }, 400);
    }

    const fields: string[] = ['status = ?'];
    const values: (string | number | null)[] = [body.status];

    if (body.payment_status) {
      const validPaymentStatuses = ['pending', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(body.payment_status)) {
        return c.json({ error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` }, 400);
      }
      fields.push('payment_status = ?');
      values.push(body.payment_status);
    }

    if (body.tracking_code) {
      fields.push('tracking_code = ?');
      values.push(body.tracking_code);
    }

    if (body.status === 'delivered' && existing.payment_method === 'cod') {
      fields.push('payment_status = ?');
      values.push('paid');
    }

    fields.push("updated_at = datetime('now')");
    values.push(orderId, tenantId);

    const historyId = generateId();

    const statements: D1PreparedStatement[] = [
      c.env.DB.prepare(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
      ).bind(...values),
      c.env.DB.prepare(
        `INSERT INTO order_status_history (id, order_id, tenant_id, status, previous_status, changed_by, changed_by_name, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(historyId, orderId, tenantId, body.status, existing.status, user.id, user.name, body.notes ?? null),
    ];

    await c.env.DB.batch(statements);

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: user.id,
      action: 'update_order_status',
      entity: 'order',
      entity_id: orderId,
      details: JSON.stringify({ old_status: existing.status, new_status: body.status, notes: body.notes }),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    const updated = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    )
      .bind(orderId)
      .first<Order>();

    return c.json(updated);
  } catch (err) {
    return c.json({ error: 'Failed to update order status', details: String(err) }, 500);
  }
});

// GET /api/orders/:id/history — Status change timeline
orders.get('/:id/history', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const orderId = c.req.param('id');

    const order = await c.env.DB.prepare(
      'SELECT id FROM orders WHERE id = ? AND tenant_id = ?'
    )
      .bind(orderId, tenantId)
      .first();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM order_status_history WHERE order_id = ? AND tenant_id = ? ORDER BY created_at ASC'
    )
      .bind(orderId, tenantId)
      .all<OrderStatusHistory>();

    return c.json(results);
  } catch (err) {
    return c.json({ error: 'Failed to get order history', details: String(err) }, 500);
  }
});

export default orders;
