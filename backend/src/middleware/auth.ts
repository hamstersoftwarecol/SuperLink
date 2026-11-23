import { Context, Next } from 'hono';
import { verifyJWT } from '../services/crypto.js';
import type { Env } from '../types/env.js';
import type { User } from '../types/index.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

export const requireAuth = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT
    const payload = await verifyJWT(token, c.env.JWT_SECRET);

    // Check session in KV
    const session = await c.env.SESSIONS.get(`session:${token}`);
    if (!session) {
      return c.json({ error: 'Session expired or invalid' }, 401);
    }

    // Look up the user in the database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ? AND is_active = 1'
    )
      .bind(payload.sub)
      .first<User>();

    if (!user) {
      return c.json({ error: 'User not found or deactivated' }, 401);
    }

    c.set('user', user);
    c.set('tenant_id', payload.tenant);
    c.set('jwtToken', token);

    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};
