// src/actions/organization.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  createOrganization, 
  createPersonalOrganization, 
  inviteUserToOrganization,
  updateUserRole,
  removeUserFromOrganization,
  type CreateOrganizationData,
  type InviteUserData,
} from '@db';
import { requireActiveTenantId, hasPermission } from '@db';

/**
 * Server action to create a new organization
 */
export async function createOrganizationAction(data: CreateOrganizationData) {
  try {
    const result = await createOrganization(data);
    
    // Redirect to the new organization
    redirect(`/org/${result.organization.slug}/dashboard`);
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Failed to create organization');
  }
}

/**
 * Server action to invite a user to an organization
 */
export async function inviteUserAction(data: InviteUserData) {
  try {
    const context = await requireActiveTenantId();
    
    if (!hasPermission(context, 'invite_users')) {
      throw new Error('Insufficient permissions to invite users');
    }

    const invitation = await inviteUserToOrganization(context.tenantId, data);
    
    revalidatePath(`/org/${context.tenantId}/members`);
    
    return { success: true, invitation };
  } catch (error) {
    console.error('Error inviting user:', error);
    throw new Error('Failed to invite user');
  }
}

/**
 * Server action to update user role
 */
export async function updateUserRoleAction(
  userId: string, 
  role: string
) {
  try {
    const context = await requireActiveTenantId();
    
    if (!hasPermission(context, 'manage_users')) {
      throw new Error('Insufficient permissions to manage users');
    }

    await updateUserRole(context.tenantId, userId, role);
    
    revalidatePath(`/org/${context.tenantId}/members`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Server action to remove user from organization
 */
export async function removeUserAction(userId: string) {
  try {
    const context = await requireActiveTenantId();
    
    if (!hasPermission(context, 'manage_users')) {
      throw new Error('Insufficient permissions to manage users');
    }

    // Prevent removing the last owner
    if (context.userRole === 'org:owner') {
      throw new Error('Cannot remove the last owner');
    }

    await removeUserFromOrganization(context.tenantId, userId);
    
    revalidatePath(`/org/${context.tenantId}/members`);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing user:', error);
    throw new Error('Failed to remove user');
  }
}

/**
 * Server action to create personal organization for new users
 */
export async function createPersonalOrganizationAction(userId: string, userEmail: string) {
  try {
    const result = await createPersonalOrganization(userId, userEmail);
    
    // Redirect to the new personal organization
    redirect(`/org/${result.organization.slug}/dashboard`);
  } catch (error) {
    console.error('Error creating personal organization:', error);
    throw new Error('Failed to create personal organization');
  }
}
