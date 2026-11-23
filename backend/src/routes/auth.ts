import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import type { User } from '../types/index.js';
import { hashPassword, verifyPassword, signJWT } from '../services/crypto.js';
import { createAuditLog } from '../services/audit.js';
import { generateId } from '../utils/id.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rate-limit.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Apply rate limiting to all auth routes
auth.use('/*', authRateLimit);

// POST /api/auth/register
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<{
      email: string;
      password: string;
      name: string;
      tenant_name: string;
      tenant_slug: string;
    }>();

    if (!body.email || !body.password || !body.name || !body.tenant_name || !body.tenant_slug) {
      return c.json({ error: 'Missing required fields: email, password, name, tenant_name, tenant_slug' }, 400);
    }

    // Check if email already exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(body.email)
      .first();
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Check if tenant slug already exists
    const existingTenant = await c.env.DB.prepare('SELECT id FROM tenants WHERE slug = ?')
      .bind(body.tenant_slug)
      .first();
    if (existingTenant) {
      return c.json({ error: 'Tenant slug already taken' }, 409);
    }

    const tenantId = generateId();
    const userId = generateId();
    const passwordHash = await hashPassword(body.password);

    // Create tenant and user in a batch
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)`
      ).bind(tenantId, body.tenant_name, body.tenant_slug),
      c.env.DB.prepare(
        `INSERT INTO users (id, tenant_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, 'admin')`
      ).bind(userId, tenantId, body.email, passwordHash, body.name),
    ]);

    // Generate JWT
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const token = await signJWT(
      { sub: userId, tenant: tenantId, role: 'admin', exp },
      c.env.JWT_SECRET
    );

    // Store session in KV (7 day TTL)
    await c.env.SESSIONS.put(`session:${token}`, JSON.stringify({ userId, tenantId }), {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: userId,
      action: 'register',
      entity: 'user',
      entity_id: userId,
      details: JSON.stringify({ email: body.email }),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({
      token,
      user: {
        id: userId,
        email: body.email,
        name: body.name,
        role: 'admin',
        tenant_id: tenantId,
      },
    }, 201);
  } catch (err) {
    return c.json({ error: 'Registration failed', details: String(err) }, 500);
  }
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<{ email: string; password: string }>();

    if (!body.email || !body.password) {
      return c.json({ error: 'Missing required fields: email, password' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    )
      .bind(body.email)
      .first<User>();

    if (!user || !user.password_hash) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const token = await signJWT(
      { sub: user.id, tenant: user.tenant_id, role: user.role, exp },
      c.env.JWT_SECRET
    );

    await c.env.SESSIONS.put(`session:${token}`, JSON.stringify({ userId: user.id, tenantId: user.tenant_id }), {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    await createAuditLog(c.env.DB, {
      tenant_id: user.tenant_id,
      user_id: user.id,
      action: 'login',
      entity: 'user',
      entity_id: user.id,
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    return c.json({ error: 'Login failed', details: String(err) }, 500);
  }
});

// POST /api/auth/logout
auth.post('/logout', requireAuth, async (c) => {
  try {
    const token = c.get('jwtToken');
    const user = c.get('user');

    await c.env.SESSIONS.delete(`session:${token}`);

    await createAuditLog(c.env.DB, {
      tenant_id: user.tenant_id,
      user_id: user.id,
      action: 'logout',
      entity: 'user',
      entity_id: user.id,
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({ message: 'Logged out successfully' });
  } catch (err) {
    return c.json({ error: 'Logout failed', details: String(err) }, 500);
  }
});

// GET /api/auth/me
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenant_id: user.tenant_id,
    avatar_url: user.avatar_url,
    provider: user.provider,
    created_at: user.created_at,
  });
});

// POST /api/auth/google
auth.post('/google', async (c) => {
  try {
    const body = await c.req.json<{ token: string; tenant_slug?: string; tenant_name?: string }>();

    if (!body.token) {
      return c.json({ error: 'Missing Google token' }, 400);
    }

    // Verify token with Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${body.token}`
    );
    if (!googleRes.ok) {
      return c.json({ error: 'Invalid Google token' }, 401);
    }

    const googlePayload = await googleRes.json<{
      sub: string;
      email: string;
      name: string;
      picture: string;
      aud: string;
    }>();

    if (googlePayload.aud !== c.env.GOOGLE_CLIENT_ID) {
      return c.json({ error: 'Google token audience mismatch' }, 401);
    }

    // Check if user already exists
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    )
      .bind(googlePayload.email)
      .first<User>();

    if (user) {
      // Update Google provider info if not set
      if (!user.provider_id) {
        await c.env.DB.prepare(
          `UPDATE users SET provider = 'google', provider_id = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?`
        )
          .bind(googlePayload.sub, googlePayload.picture, user.id)
          .run();
      }
    } else {
      // Need tenant info for new user registration via Google
      if (!body.tenant_slug || !body.tenant_name) {
        return c.json({ error: 'New users must provide tenant_name and tenant_slug' }, 400);
      }

      const existingTenant = await c.env.DB.prepare('SELECT id FROM tenants WHERE slug = ?')
        .bind(body.tenant_slug)
        .first();
      if (existingTenant) {
        return c.json({ error: 'Tenant slug already taken' }, 409);
      }

      const tenantId = generateId();
      const userId = generateId();

      await c.env.DB.batch([
        c.env.DB.prepare(
          `INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)`
        ).bind(tenantId, body.tenant_name, body.tenant_slug),
        c.env.DB.prepare(
          `INSERT INTO users (id, tenant_id, email, name, avatar_url, role, provider, provider_id) VALUES (?, ?, ?, ?, ?, 'admin', 'google', ?)`
        ).bind(userId, tenantId, googlePayload.email, googlePayload.name, googlePayload.picture, googlePayload.sub),
      ]);

      user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .first<User>();

      if (!user) {
        return c.json({ error: 'Failed to create user' }, 500);
      }
    }

    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const token = await signJWT(
      { sub: user.id, tenant: user.tenant_id, role: user.role, exp },
      c.env.JWT_SECRET
    );

    await c.env.SESSIONS.put(`session:${token}`, JSON.stringify({ userId: user.id, tenantId: user.tenant_id }), {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    await createAuditLog(c.env.DB, {
      tenant_id: user.tenant_id,
      user_id: user.id,
      action: 'google_login',
      entity: 'user',
      entity_id: user.id,
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    return c.json({ error: 'Google authentication failed', details: String(err) }, 500);
  }
});

export default auth;
