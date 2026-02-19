// src/lib/api/tenant-utils.ts
import { auth } from '@clerk/nextjs/server';
import { db, tenants, users } from '@db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { ServerAPITrackingOptions, trackServerAPICall, trackServerAPIError } from '@/lib/server-api-tracking';

export interface TenantApiContext {
  tenant: {
    id: string; // Clerk org ID
    slug: string;
    name: string;
  };
  userId: string; // Clerk user ID (users.id stores Clerk ID directly)
  clerkUserId: string; // Same as userId (kept for backward compatibility)
  orgId: string;
}

/**
 * Validate tenant access for API routes
 * Throws errors if validation fails
 */
export async function validateTenantAccess(tenantSlug: string): Promise<TenantApiContext> {
  const { userId: clerkUserId, orgId } = await auth();

  if (!clerkUserId) {
    throw new Error('Authentication required');
  }

  if (!orgId) {
    throw new Error('No active organization');
  }

  // Find tenant by slug
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Verify user has access to this tenant
  if (tenant.id !== orgId) {
    throw new Error('Access denied');
  }

  // Get user by Clerk user ID (now same as local ID)
  const localUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUserId),
  });

  if (!localUser) {
    throw new Error('User not found in local database');
  }

  return {
    tenant: {
      id: tenant.id, // Clerk org ID
      slug: tenant.slug,
      name: tenant.name,
    },
    userId: localUser.id, // Clerk user ID (users.id stores Clerk ID directly)
    clerkUserId: localUser.id, // Same as userId (users.id IS the Clerk ID)
    orgId,
  };
}

/**
 * Create a tenant-scoped API handler
 * Automatically validates tenant access and adds tracking
 */
export function createTenantApiHandler(
  handler: (req: NextRequest, context: TenantApiContext) => Promise<NextResponse>,
  trackingOptions: ServerAPITrackingOptions = {}
) {
  return async (req: NextRequest, { params }: { params: Promise<{ tenant: string }> }) => {
    const startTime = Date.now();
    let response: NextResponse | undefined;
    let error: Error | undefined;

    try {
      const { tenant } = await params;
      const context = await validateTenantAccess(tenant);
      response = await handler(req, context);
      return response;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      
      // Track error
      await trackServerAPIError(req, error, trackingOptions);
      
      const message = error.message;
      
      if (message === 'Authentication required') {
        response = NextResponse.json({ error: message }, { status: 401 });
      } else if (message === 'No active organization') {
        response = NextResponse.json({ error: message }, { status: 400 });
      } else if (message === 'Tenant not found') {
        response = NextResponse.json({ error: message }, { status: 404 });
      } else if (message === 'Access denied') {
        response = NextResponse.json({ error: message }, { status: 403 });
      } else {
        console.error('API Error:', error);
        response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
      
      throw err;
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(req, response, startTime, error, trackingOptions);
      }
    }
  };
}
