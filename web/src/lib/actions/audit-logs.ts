/**
 * Server actions for Audit Logs
 */

'use server';

import { db, tenants, auditEvents, users } from '@db';
import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';

export interface GetAuditLogsInput {
  tenantSlug: string;
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
  actorUserId?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getAuditLogs = async (input: GetAuditLogsInput) => {
  const page = input.page && input.page > 0 ? input.page : 1;
  const pageSize = input.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, 200) : 50;

  const tenantRow = await db.select().from(tenants).where(eq(tenants.slug, input.tenantSlug)).limit(1);
  if (!tenantRow.length) {
    return { results: [], total: 0, pagination: { page, pageSize, totalPages: 1 } };
  }
  const tenantId = tenantRow[0].id;

  const conditions = [eq(auditEvents.tenantId, tenantId)];
  if (input.search) {
    const term = `%${input.search}%`;
    conditions.push(
      or(
        ilike(auditEvents.action, term),
        ilike(auditEvents.targetType, term),
        ilike(auditEvents.targetId, term)
      )
    );
  }
  if (input.action) conditions.push(ilike(auditEvents.action, `%${input.action}%`));
  if (input.actorUserId) conditions.push(eq(auditEvents.actorUserId, input.actorUserId));
  if (input.targetType) conditions.push(ilike(auditEvents.targetType, `%${input.targetType}%`));
  if (input.dateFrom) conditions.push(gte(auditEvents.createdAt, input.dateFrom));
  if (input.dateTo) conditions.push(lte(auditEvents.createdAt, input.dateTo));

  const whereExpr = and(...conditions);
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select({
      id: auditEvents.id,
      tenantId: auditEvents.tenantId,
      actorUserId: auditEvents.actorUserId,
      action: auditEvents.action,
      targetType: auditEvents.targetType,
      targetId: auditEvents.targetId,
      metadata: auditEvents.metadata,
      ipAddress: auditEvents.ipAddress,
      userAgent: auditEvents.userAgent,
      createdAt: auditEvents.createdAt,
      actorEmail: users.email,
      actorName: users.name,
    })
    .from(auditEvents)
    .leftJoin(users, eq(users.id, auditEvents.actorUserId))
    .where(whereExpr)
    .orderBy(desc(auditEvents.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditEvents)
    .where(whereExpr);

  const total = Number(count) || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    results: rows.map(r => {
      const metadata = (r.metadata as Record<string, unknown>) || {};
      const contextFromMetadata = (metadata.context as Record<string, unknown>) || {};
      
      // Build comprehensive context object from metadata.context and direct columns
      const context = {
        ip_address: r.ipAddress || (contextFromMetadata.ip_address as string) || null,
        user_agent: r.userAgent || (contextFromMetadata.user_agent as string) || (contextFromMetadata.ua as string) || null,
        ua: r.userAgent || (contextFromMetadata.ua as string) || (contextFromMetadata.user_agent as string) || null,
        referer: (contextFromMetadata.referer as string) || null,
        session_id: (contextFromMetadata.session_id as string) || null,
        location: (contextFromMetadata.location as { type?: string; url?: string; domain?: string }) || null,
      };

      return {
        id: r.id,
        tenantId: r.tenantId,
        actorUserId: r.actorUserId,
        action: r.action,
        entity: r.targetType,
        entityId: r.targetId,
        context,
        metadata,
        ipAddress: r.ipAddress,
        userAgent: r.userAgent,
        created_at: r.createdAt,
        actor: { id: r.actorUserId, name: r.actorName, user: { name: r.actorName, email: r.actorEmail } },
      };
    }),
    total,
    pagination: { page, pageSize, totalPages },
  };
};

export const getAuditLogById = async (tenantSlug: string, id: string) => {
  const tenantRow = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
  if (!tenantRow.length) return null;
  const tenantId = tenantRow[0].id;

  const rows = await db
    .select({
      id: auditEvents.id,
      tenantId: auditEvents.tenantId,
      actorUserId: auditEvents.actorUserId,
      action: auditEvents.action,
      targetType: auditEvents.targetType,
      targetId: auditEvents.targetId,
      metadata: auditEvents.metadata,
      ipAddress: auditEvents.ipAddress,
      userAgent: auditEvents.userAgent,
      createdAt: auditEvents.createdAt,
      actorEmail: users.email,
      actorName: users.name,
    })
    .from(auditEvents)
    .leftJoin(users, eq(users.id, auditEvents.actorUserId))
    .where(and(eq(auditEvents.tenantId, tenantId), eq(auditEvents.id, id)))
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];
  const metadata = (r.metadata as Record<string, unknown>) || {};
  const contextFromMetadata = (metadata.context as Record<string, unknown>) || {};
  
  // Build comprehensive context object from metadata.context and direct columns
  const context = {
    ip_address: r.ipAddress || (contextFromMetadata.ip_address as string) || null,
    user_agent: r.userAgent || (contextFromMetadata.user_agent as string) || (contextFromMetadata.ua as string) || null,
    ua: r.userAgent || (contextFromMetadata.ua as string) || (contextFromMetadata.user_agent as string) || null,
    referer: (contextFromMetadata.referer as string) || null,
    session_id: (contextFromMetadata.session_id as string) || null,
    location: (contextFromMetadata.location as { type?: string; url?: string; domain?: string }) || null,
  };

  return {
    id: r.id,
    tenantId: r.tenantId,
    actorUserId: r.actorUserId,
    action: r.action,
    entity: r.targetType,
    entityId: r.targetId,
    context,
    metadata,
    ipAddress: r.ipAddress,
    userAgent: r.userAgent,
    created_at: r.createdAt,
    actor: { id: r.actorUserId, name: r.actorName, user: { name: r.actorName, email: r.actorEmail } },
  };
};


