import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/env.js';

import auth from './routes/auth.js';
import dashboard from './routes/dashboard.js';
import orders from './routes/orders.js';
import products from './routes/products.js';
import users from './routes/users.js';

type Variables = {
  user: import('./types/index.js').User;
  tenant_id: string;
  jwtToken: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS
app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Health check
app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// Mount routes
app.route('/api/auth', auth);
app.route('/api/dashboard', dashboard);
app.route('/api/orders', orders);
app.route('/api/products', products);
app.route('/api/users', users);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
