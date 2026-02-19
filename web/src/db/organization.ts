// src/db/organization.ts
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { db, tenants, users, memberships } from '@db';
import { eq, and } from 'drizzle-orm';
import { generateSlug, isSlugAvailable } from './tenant';

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  plan?: string;
  metadata?: Record<string, any>;
}

export interface InviteUserData {
  email: string;
  role: string;
  redirectUrl?: string;
}

/**
 * Create a new organization in Clerk and sync to local database
 */
export async function createOrganization(
  data: CreateOrganizationData,
  options?: { createdByKentron?: boolean }
) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  // Generate slug if not provided - let Clerk validate uniqueness
  const slug = data.slug || generateSlug(data.name);

  // Create organization in Clerk - Clerk handles slug uniqueness
  const clerk = await clerkClient();
  
  console.log('[createOrganization] Creating in Clerk:', {
    name: data.name,
    slug,
    createdBy: userId,
  });
  
  let organization;
  try {
    organization = await clerk.organizations.createOrganization({
      name: data.name,
      createdBy: userId,
      slug: slug,
      publicMetadata: {
        plan: data.plan || 'free',
        createdByKentron: options?.createdByKentron || false, // Flag for webhook
        ...data.metadata,
      },
    });
    
    console.log('[createOrganization] Clerk org created:', organization.id);
  } catch (clerkError: any) {
    console.error('[createOrganization] Clerk API Error:', {
      message: clerkError.message,
      status: clerkError.status,
      errors: clerkError.errors,
      clerkTraceId: clerkError.clerkTraceId,
    });
    throw clerkError;
  }

  // Verify organization was created
  if (!organization || !organization.id) {
    throw new Error('Failed to create organization in Clerk');
  }

  console.log('[createOrganization] Organization created in Clerk:', organization.id);
  console.log('[createOrganization] Webhook will sync to database automatically');

  // Return organization - webhook handles DB sync
  return {
    organization,
    tenant: null, // Will be synced by webhook
  };
}

/**
 * Create a personal organization for a user (auto-create on first sign-in)
 */
export async function createPersonalOrganization(userId: string, userEmail: string) {
  const userName = userEmail.split('@')[0];
  const name = `${userName}'s Workspace`;
  
  return createOrganization({
    name,
    plan: 'free',
    metadata: {
      type: 'personal',
      autoCreated: true,
    },
  });
}

/**
 * Invite a user to an organization
 */
export async function inviteUserToOrganization(
  organizationId: string, 
  data: InviteUserData
) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  console.log('[inviteUserToOrganization] Inviting user:', {
    organizationId,
    inviterUserId: userId,
    emailAddress: data.email,
    role: data.role,
  });

  // Create invitation in Clerk
  const clerk = await clerkClient();
  
  try {
    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId,
      inviterUserId: userId,
      emailAddress: data.email,
      role: data.role,
      // Redirect to root - will auto-redirect to /{tenantSlug}/applications based on page.tsx logic
      redirectUrl: data.redirectUrl || process.env.NEXT_PUBLIC_APP_URL || '/',
    });
    
    console.log('[inviteUserToOrganization] Invitation created:', invitation.id);
    return invitation;
  } catch (clerkError: any) {
    console.error('[inviteUserToOrganization] Clerk Invitation Error:', {
      message: clerkError.message,
      status: clerkError.status,
      errors: clerkError.errors,
      clerkTraceId: clerkError.clerkTraceId,
      fullError: JSON.stringify(clerkError, null, 2),
    });
    throw clerkError;
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string) {
  const clerk = await clerkClient();
  const members = await clerk.organizations.getOrganizationMembershipList({
    organizationId,
  });

  return members.data;
}

/**
 * Update user role in organization
 */
export async function updateUserRole(
  organizationId: string, 
  userId: string, 
  role: string
) {
  // Update in Clerk
  const clerk = await clerkClient();
  await clerk.organizations.updateOrganizationMembership({
    organizationId,
    userId,
    role,
  });

  // Update in local database
  await db.update(memberships)
    .set({ 
      role,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(memberships.tenantId, organizationId),
        eq(memberships.userId, userId)
      )
    );
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  organizationId: string, 
  userId: string
) {
  // Remove from Clerk
  const clerk = await clerkClient();
  await clerk.organizations.deleteOrganizationMembership({
    organizationId,
    userId,
  });

  // Remove from local database
  await db.delete(memberships)
    .where(
      and(
        eq(memberships.tenantId, organizationId),
        eq(memberships.userId, userId)
      )
    );
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId?: string) {
  const { userId: currentUserId } = await auth();
  
  if (!currentUserId) {
    throw new Error('Authentication required');
  }

  const targetUserId = userId || currentUserId;

  // Get organizations from Clerk
  const clerk = await clerkClient();
  const clerkOrganizations = await clerk.users.getOrganizationMembershipList({
    userId: targetUserId,
  });

  // Get local tenant data for all organizations
  const organizationIds = clerkOrganizations.data.map(m => m.organization.id);
  
  if (organizationIds.length === 0) {
    return [];
  }

  // Query all tenants at once using IN clause
  const localTenants = await db.query.tenants.findMany({
    where: (tenants, { inArray }) => inArray(tenants.id, organizationIds),
  });

  // Map Clerk organizations with local tenant data
  return clerkOrganizations.data.map(clerkOrg => {
    const tenant = localTenants.find(t => t.id === clerkOrg.organization.id);
    return {
      ...clerkOrg.organization,
      tenant,
      role: clerkOrg.role,
    };
  });
}
