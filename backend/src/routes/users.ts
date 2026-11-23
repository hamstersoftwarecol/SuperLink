import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import type { User } from '../types/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole, hasRole } from '../middleware/rbac.js';
import { createAuditLog } from '../services/audit.js';
import { apiRateLimit } from '../middleware/rate-limit.js';

type Variables = {
  user: User;
  tenant_id: string;
  jwtToken: string;
};

const users = new Hono<{ Bindings: Env; Variables: Variables }>();

users.use('/*', apiRateLimit);
users.use('/*', requireAuth);

// GET /api/users — List users in tenant (admin+)
users.get('/', requireRole('admin'), async (c) => {
  try {
    const tenantId = c.get('tenant_id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const { results } = await c.env.DB.prepare(
      `SELECT id, tenant_id, email, name, avatar_url, role, provider, is_active, created_at, updated_at
       FROM users WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
      .bind(tenantId, limit, offset)
      .all<User>();

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM users WHERE tenant_id = ?'
    )
      .bind(tenantId)
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
    return c.json({ error: 'Failed to list users', details: String(err) }, 500);
  }
});

// GET /api/users/:id — Get user detail (admin+ or self)
users.get('/:id', async (c) => {
  try {
    const currentUser = c.get('user');
    const tenantId = c.get('tenant_id');
    const targetId = c.req.param('id');

    // Allow self-access or admin+
    if (targetId !== currentUser.id && !hasRole(currentUser.role, 'admin')) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const user = await c.env.DB.prepare(
      `SELECT id, tenant_id, email, name, avatar_url, role, provider, is_active, created_at, updated_at
       FROM users WHERE id = ? AND tenant_id = ?`
    )
      .bind(targetId, tenantId)
      .first<User>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (err) {
    return c.json({ error: 'Failed to get user', details: String(err) }, 500);
  }
});

// PUT /api/users/:id — Update user (admin+ or self for profile)
users.put('/:id', async (c) => {
  try {
    const currentUser = c.get('user');
    const tenantId = c.get('tenant_id');
    const targetId = c.req.param('id');

    if (targetId !== currentUser.id && !hasRole(currentUser.role, 'admin')) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const body = await c.req.json<{ name?: string; avatar_url?: string; email?: string }>();

    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (body.name !== undefined) {
      fields.push('name = ?');
      values.push(body.name);
    }
    if (body.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(body.avatar_url);
    }
    if (body.email !== undefined && hasRole(currentUser.role, 'admin')) {
      fields.push('email = ?');
      values.push(body.email);
    }

    if (fields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    fields.push("updated_at = datetime('now')");
    values.push(targetId, tenantId);

    await c.env.DB.prepare(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
    )
      .bind(...values)
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: currentUser.id,
      action: 'update_user',
      entity: 'user',
      entity_id: targetId,
      details: JSON.stringify(body),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    const updated = await c.env.DB.prepare(
      `SELECT id, tenant_id, email, name, avatar_url, role, provider, is_active, created_at, updated_at
       FROM users WHERE id = ? AND tenant_id = ?`
    )
      .bind(targetId, tenantId)
      .first<User>();

    return c.json(updated);
  } catch (err) {
    return c.json({ error: 'Failed to update user', details: String(err) }, 500);
  }
});

// DELETE /api/users/:id — Deactivate user (admin+)
users.delete('/:id', requireRole('admin'), async (c) => {
  try {
    const currentUser = c.get('user');
    const tenantId = c.get('tenant_id');
    const targetId = c.req.param('id');

    if (targetId === currentUser.id) {
      return c.json({ error: 'Cannot deactivate yourself' }, 400);
    }

    await c.env.DB.prepare(
      `UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
    )
      .bind(targetId, tenantId)
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: currentUser.id,
      action: 'deactivate_user',
      entity: 'user',
      entity_id: targetId,
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({ message: 'User deactivated' });
  } catch (err) {
    return c.json({ error: 'Failed to deactivate user', details: String(err) }, 500);
  }
});

// PUT /api/users/:id/role — Change user role (admin+)
users.put('/:id/role', requireRole('admin'), async (c) => {
  try {
    const currentUser = c.get('user');
    const tenantId = c.get('tenant_id');
    const targetId = c.req.param('id');

    const body = await c.req.json<{ role: string }>();
    const validRoles = ['super_admin', 'admin', 'vendedor', 'operador', 'viewer'];
    if (!validRoles.includes(body.role)) {
      return c.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, 400);
    }

    // Only super_admin can assign super_admin
    if (body.role === 'super_admin' && currentUser.role !== 'super_admin') {
      return c.json({ error: 'Only super admins can assign super_admin role' }, 403);
    }

    await c.env.DB.prepare(
      `UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
    )
      .bind(body.role, targetId, tenantId)
      .run();

    await createAuditLog(c.env.DB, {
      tenant_id: tenantId,
      user_id: currentUser.id,
      action: 'change_role',
      entity: 'user',
      entity_id: targetId,
      details: JSON.stringify({ new_role: body.role }),
      ip_address: c.req.header('CF-Connecting-IP') || undefined,
    });

    return c.json({ message: 'Role updated', role: body.role });
  } catch (err) {
    return c.json({ error: 'Failed to change role', details: String(err) }, 500);
  }
});

export default users;
