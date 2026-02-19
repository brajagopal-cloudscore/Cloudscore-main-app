// src/actions/client-onboarding.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createOrganization, inviteUserToOrganization } from '@db';

export interface OrganizationMetadata {
  companySize?: string;
  industry?: string;
  notes?: string;
  // Additional metadata fields that get added internally
  createdBy?: string;
  invitedEmail?: string;
  onboardingStatus?: 'pending' | 'active' | 'suspended';
}

export interface CreateClientOrganizationData {
  clientName: string;
  clientEmail: string;
  clientSlug?: string;
  plan?: string;
  metadata?: OrganizationMetadata;
}

/**
 * Server action for Kentron AI to create a new organization
 * Only users with @kentron.ai emails can access this (checked in middleware)
 * Can create organizations for any user (kentron.ai or external)
 */
export async function createClientOrganizationAction(data: CreateClientOrganizationData) {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  // Verify user is from Kentron AI (page access control)
  const userEmail = sessionClaims?.email as string | undefined;
  if (!userEmail || !userEmail.endsWith('@kentron.ai')) {
    throw new Error('Only Kentron AI users can create organizations');
  }

  // NOTE: The invited user (data.clientEmail) can be ANY email domain

  try {
    // Try to create the organization with the provided slug
    let organization;
    let attemptCount = 0;
    const maxAttempts = 5;
    let currentSlug = data.clientSlug;

    while (attemptCount < maxAttempts) {
      try {
        const result = await createOrganization({
          name: data.clientName,
          slug: currentSlug,
          plan: data.plan || 'free',
          metadata: {
            ...data.metadata,
            createdBy: 'kentron-ai',
            invitedEmail: data.clientEmail,
            onboardingStatus: 'pending',
          },
        }, {
          createdByKentron: true,
        });
        
        organization = result.organization;
        break; // Success!
        
      } catch (clerkError: any) {
        // Handle slug conflict by auto-incrementing
        if (clerkError.status === 422 && clerkError.errors?.[0]?.code === 'form_identifier_exists') {
          attemptCount++;
          currentSlug = `${data.clientSlug}-${attemptCount}`;
          console.log(`[createClientOrganization] Slug taken, trying: ${currentSlug}`);
          
          if (attemptCount >= maxAttempts) {
            throw new Error(`Could not find available slug after ${maxAttempts} attempts. Please try a different name.`);
          }
          continue;
        }
        // Re-throw other errors
        throw clerkError;
      }
    }

    if (!organization) {
      throw new Error('Failed to create organization');
    }

    console.log('[createClientOrganization] Organization created:', organization.id);

    // Send invitation to user immediately
    const invitation = await inviteUserToOrganization(organization.id, {
      email: data.clientEmail,
      role: 'org:admin',
      redirectUrl: process.env.NEXT_PUBLIC_APP_URL || '/',
    });

    console.log('[createClientOrganization] Invitation sent to:', data.clientEmail);

    // Note: Audit event will be created by webhook when organization is synced to DB
    // This avoids foreign key constraint issues since webhook handles DB sync

    revalidatePath('/admin/workspaces');
    
    return {
      success: true,
      organization,
      invitation,
      message: `Organization "${data.clientName}" created with slug "${organization.slug}". Invitation sent to ${data.clientEmail}`,
    };
  } catch (error: any) {
    console.error('[createClientOrganization] Error:', {
      message: error.message,
      status: error.status,
      errors: error.errors,
    });
    
    // Return user-friendly error messages
    if (error.status === 400 || error.status === 422) {
      throw new Error(error.message || 'Invalid organization data. Please check your inputs.');
    }
    
    throw new Error('Failed to create organization. Please try again or contact support.');
  }
}

/**
 * Get list of organizations (for Kentron AI dashboard)
 */
export async function getClientOrganizationsAction() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  // Verify user is from Kentron AI
  const userEmail = sessionClaims?.email as string | undefined;
  if (!userEmail || !userEmail.endsWith('@kentron.ai')) {
    throw new Error('Only Kentron AI users can view organizations');
  }

  // This would need to be implemented to get all organizations
  // For now, return empty array
  return [];
}

/**
 * Update organization status
 */
export async function updateClientOrganizationStatusAction(
  organizationId: string, 
  status: 'active' | 'suspended' | 'pending'
) {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  // Verify user is from Kentron AI
  const userEmail = sessionClaims?.email as string | undefined;
  if (!userEmail || !userEmail.endsWith('@kentron.ai')) {
    throw new Error('Only Kentron AI users can update organization status');
  }

  // Implementation would update the organization metadata with new status
  // This is a placeholder for the actual implementation
  console.log(`Updating organization ${organizationId} status to ${status}`);
  
  return { success: true, status };
}
