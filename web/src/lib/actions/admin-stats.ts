/**
 * Server actions for Admin Dashboard Statistics
 */

'use server';

import { db, applications, memberships, users, tenants } from '@db';
import { eq, and, sql, isNull, ne } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

/**
 * Get admin dashboard statistics for a tenant.
 * Returns counts of active applications and active users.
 */
export async function getAdminStats(tenantSlug: string) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Authentication required');
    }

    // Get tenant by slug
    const tenantRow = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);

    if (!tenantRow.length) {
      throw new Error('Tenant not found');
    }

    const tenantId = tenantRow[0].id;

    // Verify tenant matches orgId
    if (tenantId !== orgId) {
      throw new Error('Unauthorized access to tenant');
    }

    // Get count of active applications (not archived and not deleted)
    const [activeApplicationsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(
        and(
          eq(applications.tenantId, tenantId),
          isNull(applications.deletedAt),
          ne(applications.status, "Archived")
        )
      );

    // Get count of active users (users with membership records)
    const [activeUsersCount] = await db
      .select({ count: sql<number>`count(distinct ${users.id})` })
      .from(users)
      .innerJoin(memberships, eq(users.id, memberships.userId))
      .where(eq(memberships.tenantId, tenantId));

    return {
      success: true,
      data: {
        activeApplicationsCount: Number(activeApplicationsCount?.count || 0),
        activeUsersCount: Number(activeUsersCount?.count || 0),
      },
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch admin stats',
      data: {
        activeApplicationsCount: 0,
        activeUsersCount: 0,
      },
    };
  }
}

