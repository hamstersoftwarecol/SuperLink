import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import type { User, Product } from '../types/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { createAuditLog } from '../services/audit.js';
import { generateId } from '../utils/id.js';
import { apiRateLimit } from '../middleware/rate-limit.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

const products = new Hono<{ Bindings: Env; Variables: Variables }>();

products.use('/*', apiRateLimit);
products.use('/*', requireAuth);

// GET /api/products — List with pagination, search, filters
products.get('/', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const search = c.req.query('search');
    const active = c.req.query('active');

    let query = 'SELECT * FROM products WHERE tenant_id = ?';
    const params: (string | number)[] = [tenantId];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countParams = params.slice(0, -2); // remove limit/offset for count

    const { results } = await c.env.DB.prepare(query)
      .bind(...params)
      .all<Product>();

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
    return c.json({ error: 'Failed to list products', details: String(err) }, 500);
  }
});

// GET /api/products/:id
products.get('/:id', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const productId = c.req.param('id');

    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ? AND tenant_id = ?'
    )
      .bind(productId, tenantId)
      .first<Product>();

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json(product);
  } catch (err) {
    return c.json({ error: 'Failed to get product', details: String(err) }, 500);
  }
});

// POST /api/products — Create (vendedor+)
products.post('/', requireRole('vendedor'), async (c) => {
  try {
    const user = c.get('user');
    const tenantId = c.get('tenant_id');

    const body = await c.req.json<{
      name: string;
      description?: string;
      price: number;
      compare_price?: number;
      image_url?: string;
      stock?: number;
    }>();

    if (!body.name || body.price === undefined) {
      return c.json({ error: 'Missing required fields: name, price' }, 400);
    }

    const productId = generateId();

    await c.env.DB.prepare(
      `INSERT INTO products (id, tenant_id, name, description, price, compare_price, image_url, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        productId,
        tenantId,
        body.name,
        body.description ?? null,
        body.price,
        body.compare_price ?? null,
        body.image_url ?? null,
        body.stock ?? 0
      )
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: user.id,
      action: 'create_product',
      entity: 'product',
      entity_id: productId,
      details: JSON.stringify({ name: body.name, price: body.price }),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    )
      .bind(productId)
      .first<Product>();

    return c.json(product, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create product', details: String(err) }, 500);
  }
});

// PUT /api/products/:id — Update (vendedor+)
products.put('/:id', requireRole('vendedor'), async (c) => {
  try {
    const user = c.get('user');
    const tenantId = c.get('tenant_id');
    const productId = c.req.param('id');
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    // Check product exists and belongs to tenant
    const existing = await c.env.DB.prepare(
      'SELECT id FROM products WHERE id = ? AND tenant_id = ?'
    )
      .bind(productId, tenantId)
      .first();

    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const body = await c.req.json<{
      name?: string;
      description?: string;
      price?: number;
      compare_price?: number;
      image_url?: string;
      stock?: number;
      is_active?: number;
    }>();

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description); }
    if (body.price !== undefined) { fields.push('price = ?'); values.push(body.price); }
    if (body.compare_price !== undefined) { fields.push('compare_price = ?'); values.push(body.compare_price); }
    if (body.image_url !== undefined) { fields.push('image_url = ?'); values.push(body.image_url); }
    if (body.stock !== undefined) { fields.push('stock = ?'); values.push(body.stock); }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active); }

    if (fields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    fields.push("updated_at = datetime('now')");
    values.push(productId, tenantId);

    await c.env.DB.prepare(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
    )
      .bind(...values)
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: user.id,
      action: 'update_product',
      entity: 'product',
      entity_id: productId,
      details: JSON.stringify(body),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    )
      .bind(productId)
      .first<Product>();

    return c.json(product);
  } catch (err) {
    return c.json({ error: 'Failed to update product', details: String(err) }, 500);
  }
});

// DELETE /api/products/:id — Soft delete (vendedor+)
products.delete('/:id', requireRole('vendedor'), async (c) => {
  try {
    const user = c.get('user');
    const tenantId = c.get('tenant_id');
    const productId = c.req.param('id');

    const existing = await c.env.DB.prepare(
      'SELECT id FROM products WHERE id = ? AND tenant_id = ?'
    )
      .bind(productId, tenantId)
      .first();

    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    await c.env.DB.prepare(
      `UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
    )
      .bind(productId, tenantId)
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: user.id,
      action: 'delete_product',
      entity: 'product',
      entity_id: productId,
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({ message: 'Product deactivated' });
  } catch (err) {
    return c.json({ error: 'Failed to delete product', details: String(err) }, 500);
  }
});

export default products;
