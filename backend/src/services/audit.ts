import { generateId } from '../utils/id.js';

export async function createAuditLog(
  db: D1Database,
  params: {
    tenant_id: string | null;
    user_id: string | null;
    action: string;
    entity?: string;
    entity_id?: string;
    details?: string;
    ip_address?: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      generateId(),
      params.tenant_id,
      params.user_id,
      params.action,
      params.entity ?? null,
      params.entity_id ?? null,
      params.details ?? null,
      params.ip_address ?? null
    )
    .run();
}
