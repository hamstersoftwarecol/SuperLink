import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import type { User } from '../types/index.js';
import { requireAuth } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rate-limit.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

const dashboard = new Hono<{ Bindings: Env; Variables: Variables }>();

dashboard.use('/*', apiRateLimit);
dashboard.use('/*', requireAuth);

// GET /api/dashboard/overview — KPIs
dashboard.get('/overview', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const cacheKey = `cache:dashboard:${tenantId}:overview`;

    // Check cache
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    const stats = await c.env.DB.prepare(
      `SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders
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
        shipped_orders: number;
        confirmed_orders: number;
      }>();

    const totalProducts = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM products WHERE tenant_id = ? AND is_active = 1'
    )
      .bind(tenantId)
      .first<{ total: number }>();

    const totalUsers = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM users WHERE tenant_id = ? AND is_active = 1'
    )
      .bind(tenantId)
      .first<{ total: number }>();

    const conversionRate = stats && stats.total_orders > 0
      ? (stats.delivered_orders / stats.total_orders) * 100
      : 0;

    const result = {
      total_orders: stats?.total_orders ?? 0,
      total_revenue: stats?.total_revenue ?? 0,
      avg_order_value: stats?.avg_order_value ?? 0,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      orders_by_status: {
        pending: stats?.pending_orders ?? 0,
        confirmed: stats?.confirmed_orders ?? 0,
        shipped: stats?.shipped_orders ?? 0,
        delivered: stats?.delivered_orders ?? 0,
        cancelled: stats?.cancelled_orders ?? 0,
      },
      total_products: totalProducts?.total ?? 0,
      total_users: totalUsers?.total ?? 0,
    };

    // Cache for 5 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 300,
    });

    return c.json(result);
  } catch (err) {
    return c.json({ error: 'Failed to get dashboard overview', details: String(err) }, 500);
  }
});

// GET /api/dashboard/orders-chart — Orders over time
dashboard.get('/orders-chart', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const days = parseInt(c.req.query('days') || '30', 10);
    const cacheKey = `cache:dashboard:${tenantId}:orders-chart:${days}`;

    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    const { results } = await c.env.DB.prepare(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE tenant_id = ? AND created_at >= datetime('now', ?)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )
      .bind(tenantId, `-${days} days`)
      .all<{ date: string; order_count: number; revenue: number }>();

    const result = { period: `${days}_days`, data: results };

    await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 300,
    });

    return c.json(result);
  } catch (err) {
    return c.json({ error: 'Failed to get orders chart data', details: String(err) }, 500);
  }
});

// GET /api/dashboard/top-products — Best selling products
dashboard.get('/top-products', async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const cacheKey = `cache:dashboard:${tenantId}:top-products:${limit}`;

    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    const { results } = await c.env.DB.prepare(
      `SELECT
        p.id,
        p.name,
        p.price,
        p.image_url,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.tenant_id = ?
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT ?`
    )
      .bind(tenantId, limit)
      .all<{
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        total_sold: number;
        total_revenue: number;
      }>();

    const result = { data: results };

    await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 300,
    });

    return c.json(result);
  } catch (err) {
    return c.json({ error: 'Failed to get top products', details: String(err) }, 500);
  }
});

export default dashboard;
