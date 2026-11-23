import { Context, Next } from 'hono';
import type { Env } from '../types/env.js';
import type { User } from '../types/index.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 5,
  admin: 4,
  vendedor: 3,
  operador: 2,
  viewer: 1,
};

export function requireRole(...roles: string[]) {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const minRequired = Math.min(...roles.map((r) => ROLE_HIERARCHY[r] ?? 0));

    if (userLevel < minRequired) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}
