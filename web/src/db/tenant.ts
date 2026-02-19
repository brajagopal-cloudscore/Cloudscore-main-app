// src/db/tenant.ts
import { auth } from '@clerk/nextjs/server';
import { db, tenants, users, memberships, auditEvents } from '@db';
import { eq, and, or, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';

export interface TenantContext {
  tenantId: string; // Clerk org ID
  userId: string;   // Clerk user ID
  userRole: string;
  permissions: string[];
  isAdmin: boolean;
  membershipId?: string;
}

/**
 * Get the active tenant ID from Clerk auth context
 * Maps Clerk orgId to local tenant ID with full RBAC context
 */
export async function requireActiveTenantId(): Promise<TenantContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  if (!orgId) {
    throw new Error('No active organization found');
  }

  // Find tenant by Clerk org ID
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, orgId),
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Find user
  const localUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!localUser) {
    throw new Error('User not found in local database');
  }

  // Get user membership for role and permissions
  const membership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.tenantId, tenant.id),
      eq(memberships.userId, localUser.id)
    ),
  });

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  // Use Clerk's role system - keep it simple
  const allPermissions = membership.permissions;

  const userRole = orgRole || membership.role || 'member';
  const isAdmin = ['org:admin', 'admin', 'org:owner'].includes(userRole);

  return {
    tenantId: tenant.id, // Clerk org ID
    userId: localUser.id, // Clerk user ID
    userRole,
    permissions: allPermissions,
    isAdmin,
    membershipId: `${membership.tenantId}-${membership.userId}`,
  };
}

/**
 * Get tenant context without throwing errors (for optional checks)
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    return await requireActiveTenantId();
  } catch {
    return null;
  }
}

/**
 * Create a tenant-scoped query helper
 */
export function createTenantQuery<T>(tenantId: string) {
  return {
    whereTenant: (condition: any) => ({
      ...condition,
      tenantId: eq(condition.tenantId || 'tenant_id', tenantId),
    }),
  };
}


/**
 * Generate a unique slug from organization name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Domain-based organization utilities
export const extractDomainFromEmail = (email: string): string => {
  const parts = email.split('@');
  if (parts.length !== 2) {
    throw new Error('Invalid email format');
  }
  const domainParts = parts[1].split('.');
  if (domainParts.length < 2) {
    throw new Error('Invalid email domain');
  }
  return domainParts[0];
};

export const createOrgSlugFromDomain = (domain: string): string => {
  return domain.toLowerCase();
};

export const createOrgNameFromDomain = (domain: string): string => {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
};

export const isKentronEmail = (email: string): boolean => {
  return email.endsWith('@kentron.ai');
};

// Clerk organization helpers
export const findClerkOrgBySlug = async (clerk: any, slug: string) => {
  const orgList = await clerk.organizations.getOrganizationList({ limit: 100 });
  return orgList.data.find((org: any) => org.slug === slug);
};

export const createClerkOrganization = async (clerk: any, name: string, slug: string, createdBy: string) => {
  return clerk.organizations.createOrganization({
    name,
    slug,
    createdBy,
  });
};

export const addUserToClerkOrg = async (clerk: any, orgId: string, userId: string, role: string) => {
  return clerk.organizations.createOrganizationMembership({
    organizationId: orgId,
    userId,
    role,
  });
};

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const query = db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });

  if (excludeId) {
    // Add exclude condition if needed
  }

  const existing = await query;
  return !existing;
}

/**
 * Check if user has specific permission (RBAC)
 */
export function hasPermission(context: TenantContext, permission: string): boolean {
  return context.permissions.includes(permission) || context.permissions.includes('*') || context.isAdmin;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(context: TenantContext, permissions: string[]): boolean {
  if (context.isAdmin || context.permissions.includes('*')) return true;
  return permissions.some(permission => context.permissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(context: TenantContext, permissions: string[]): boolean {
  if (context.isAdmin || context.permissions.includes('*')) return true;
  return permissions.every(permission => context.permissions.includes(permission));
}

/**
 * Check if user has specific role
 */
export function hasRole(context: TenantContext, role: string): boolean {
  return context.userRole === role || context.isAdmin;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(context: TenantContext, roles: string[]): boolean {
  return roles.includes(context.userRole) || context.isAdmin;
}

/**
 * Create audit event for tracking actions
 */
export async function createAuditEvent(data: {
  tenantId: string;
  actorUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  await db.insert(auditEvents).values({
    ...data,
    ipAddress,
    userAgent,
    metadata: data.metadata || {},
  });
}

/**
 * Get audit events for a tenant (with pagination)
 */
export async function getAuditEvents(
  tenantId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: string;
    targetType?: string;
    actorUserId?: string;
  } = {}
) {
  const { limit = 50, offset = 0, action, targetType, actorUserId } = options;

  const conditions = [eq(auditEvents.tenantId, tenantId)];

  if (action) {
    conditions.push(eq(auditEvents.action, action));
  }
  if (targetType) {
    conditions.push(eq(auditEvents.targetType, targetType));
  }
  if (actorUserId) {
    conditions.push(eq(auditEvents.actorUserId, actorUserId));
  }

  const whereConditions = and(...conditions);

  return db.query.auditEvents.findMany({
    where: whereConditions,
    with: {
      actorUser: true,
    },
    orderBy: (events, { desc }) => [desc(events.createdAt)],
    limit,
    offset,
  });
}

/**
 * Simple RBAC - use Clerk's built-in roles
 */
export const ROLES = {
  OWNER: 'org:owner',
  ORG_ADMIN: 'org:admin',
  ADMIN: 'admin',
  ORG_MEMBER: 'org:member',
  MEMBER: 'member',
  VIEWER: 'org:viewer',
} as const;
