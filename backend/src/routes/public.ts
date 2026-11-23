import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import type { Product, Tenant } from '../types/index.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { generateId } from '../utils/id.js';

const publicRoutes = new Hono<{ Bindings: Env }>();

// Rate limit public order creation more aggressively
const orderRateLimit = rateLimit({ limit: 30, windowSeconds: 60 });

// GET /api/public/:tenantSlug/products/:productSlug
// Returns product data for the public product page (no auth)
publicRoutes.get('/:tenantSlug/products/:productSlug', async (c) => {
  try {
    const tenantSlug = c.req.param('tenantSlug');
    const productSlug = c.req.param('productSlug');

    // Look up tenant with branding
    const tenant = await c.env.DB.prepare(
      'SELECT id, name, slug, brand_color, logo_url, whatsapp FROM tenants WHERE slug = ? AND is_active = 1'
    )
      .bind(tenantSlug)
      .first<Pick<Tenant, 'id' | 'name' | 'slug' | 'brand_color' | 'logo_url' | 'whatsapp'>>();

    if (!tenant) {
      return c.json({ error: 'Store not found' }, 404);
    }

    // Look up product with landing page fields
    const product = await c.env.DB.prepare(
      `SELECT id, name, slug, description, price, compare_price, image_url, images, features, stock
       FROM products
       WHERE tenant_id = ? AND slug = ? AND is_active = 1`
    )
      .bind(tenant.id, productSlug)
      .first();

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    let images: string[] = [];
    let features: string[] = [];
    try { images = JSON.parse((product as any).images || '[]'); } catch {}
    try { features = JSON.parse((product as any).features || '[]'); } catch {}

    return c.json({
      store: {
        name: tenant.name,
        slug: tenant.slug,
        brand_color: tenant.brand_color || '#2563eb',
        logo_url: tenant.logo_url,
        whatsapp: tenant.whatsapp,
      },
      product: { ...product, images, features },
    });
  } catch (err) {
    return c.json({ error: 'Failed to load product', details: String(err) }, 500);
  }
});

// POST /api/public/:tenantSlug/orders
// Creates a COD order from the public product page (no auth)
publicRoutes.post('/:tenantSlug/orders', orderRateLimit, async (c) => {
  try {
    const tenantSlug = c.req.param('tenantSlug');

    const tenant = await c.env.DB.prepare(
      'SELECT id FROM tenants WHERE slug = ? AND is_active = 1'
    )
      .bind(tenantSlug)
      .first<Pick<Tenant, 'id'>>();

    if (!tenant) {
      return c.json({ error: 'Store not found' }, 404);
    }

    const body = await c.req.json<{
      product_id: string;
      quantity: number;
      customer_name: string;
      customer_phone: string;
      customer_address: string;
      customer_city: string;
      customer_department: string;
      customer_email?: string;
      notes?: string;
    }>();

    // Validate required fields
    if (
      !body.product_id ||
      !body.quantity ||
      !body.customer_name ||
      !body.customer_phone ||
      !body.customer_address ||
      !body.customer_city ||
      !body.customer_department
    ) {
      return c.json({
        error: 'Campos requeridos: product_id, quantity, customer_name, customer_phone, customer_address, customer_city, customer_department',
      }, 400);
    }

    // Basic phone validation (Colombian format)
    const phone = body.customer_phone.replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 12) {
      return c.json({ error: 'Número de teléfono inválido' }, 400);
    }

    if (body.quantity < 1 || body.quantity > 10) {
      return c.json({ error: 'Cantidad debe ser entre 1 y 10' }, 400);
    }

    // Look up product and check stock
    const product = await c.env.DB.prepare(
      'SELECT id, price, stock, name FROM products WHERE id = ? AND tenant_id = ? AND is_active = 1'
    )
      .bind(body.product_id, tenant.id)
      .first<Pick<Product, 'id' | 'price' | 'stock' | 'name'>>();

    if (!product) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }

    if (product.stock !== null && product.stock < body.quantity) {
      return c.json({ error: 'Stock insuficiente' }, 400);
    }

    const subtotal = product.price * body.quantity;
    const shippingCost = 0; // Will be calculated by courier integration later
    const total = subtotal + shippingCost;

    const orderId = generateId();
    const orderItemId = generateId();

    // Create order + order item + decrement stock in a batch
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO orders (id, tenant_id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_department, status, payment_method, payment_status, subtotal, shipping_cost, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'cod', 'pending', ?, ?, ?, ?)`
      ).bind(
        orderId,
        tenant.id,
        body.customer_name,
        body.customer_email ?? null,
        phone,
        body.customer_address,
        body.customer_city,
        body.customer_department,
        subtotal,
        shippingCost,
        total,
        body.notes ?? null
      ),
      c.env.DB.prepare(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(orderItemId, orderId, product.id, body.quantity, product.price),
      c.env.DB.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ?'
      ).bind(body.quantity, product.id),
    ]);

    return c.json({
      order_id: orderId,
      status: 'pending',
      total,
      message: '¡Pedido recibido! Te contactaremos para confirmar.',
    }, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create order', details: String(err) }, 500);
  }
});

export default publicRoutes;
