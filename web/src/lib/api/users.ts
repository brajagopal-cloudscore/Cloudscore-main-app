// lib/api/users.ts

import * as userActions from '@/lib/actions/users';

/**
 * Fetch organization members
 */
export async function fetchOrganizationMembers(tenantId: string) {
  try {
    const result = await userActions.getOrganizationMembers(tenantId);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
}
