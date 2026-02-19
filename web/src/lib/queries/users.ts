/**
 * Server-side queries for Users
 */

import { db, users, memberships } from "@db";
import { eq, and, desc, like, or, sql } from "drizzle-orm";
import { cache } from "react";

/**
 * Get all active users for a tenant with their membership details
 * Active users are those who have a membership record
 */
export const getActiveUsers = cache(async (
  tenantId: string,
  options?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }
) => {
  const { page = 1, pageSize = 50, search } = options || {};
  const offset = (page - 1) * pageSize;

  // Build search condition
  const searchConditions = search
    ? [
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`),
      ]
    : [];

  const whereConditions = [
    eq(memberships.tenantId, tenantId),
    ...(searchConditions.length > 0 ? [or(...searchConditions)] : []),
  ];

  // Query users with their membership data
  const results = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      role: memberships.role,
      permissions: memberships.permissions,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      membershipCreatedAt: memberships.createdAt,
      membershipUpdatedAt: memberships.updatedAt,
    })
    .from(users)
    .innerJoin(memberships, eq(users.id, memberships.userId))
    .where(and(...whereConditions))
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(memberships, eq(users.id, memberships.userId))
    .where(and(...whereConditions));

  const total = Number(countResult[0]?.count || 0);

  return {
    users: results.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role || "member",
      permissions: user.permissions || [],
      status: true, // Active users have membership
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      clerkId: user.id, // In this system, users.id IS the Clerk ID
      tenant: tenantId,
      username: user.name || user.email.split("@")[0],
    })),
    counts: total,
  };
});

/**
 * Get all users for a tenant (both active and inactive)
 * This queries users who may or may not have active memberships
 * For inactive users, we'll need to track them separately or query Clerk
 */
export const getUsers = cache(async (
  tenantId: string,
  options?: {
    page?: number;
    pageSize?: number;
    search?: string;
    activeOnly?: boolean;
  }
) => {
  const { page = 1, pageSize = 50, search, activeOnly = true } = options || {};
  
  if (activeOnly) {
    return getActiveUsers(tenantId, { page, pageSize, search });
  }

  // For now, return active users only
  // Inactive users tracking would need additional implementation
  return getActiveUsers(tenantId, { page, pageSize, search });
});

/**
 * Get a single user by ID with membership details
 */
export const getUserById = cache(async (userId: string, tenantId: string) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      role: memberships.role,
      permissions: memberships.permissions,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(memberships, and(
      eq(users.id, memberships.userId),
      eq(memberships.tenantId, tenantId)
    ))
    .where(eq(users.id, userId))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  const user = result[0];
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role || "member",
    permissions: user.permissions || [],
    status: !!user.role, // Has membership = active
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    clerkId: user.id,
    tenant: tenantId,
    username: user.name || user.email.split("@")[0],
  };
});

