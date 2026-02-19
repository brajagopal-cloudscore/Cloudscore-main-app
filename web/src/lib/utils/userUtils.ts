/**
 * Utility functions for user-related operations
 */

import { fetchOrganizationMembers } from '@/lib/api/users';

interface ClerkUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

/**
 * Get user name from user ID by fetching organization members
 * @param userId - The user ID to look up
 * @param tenantId - The tenant/organization ID
 * @returns Promise<string> - The user's name or the ID if not found
 */
export async function getUserNameFromId(userId: string, tenantId: string): Promise<string> {
  if (!userId || !tenantId) {
    return userId || 'Unknown';
  }

  try {
    const data = await fetchOrganizationMembers(tenantId);
    
    if (data && data.length > 0) {
      const user = data.find((u: ClerkUser) => u.id === userId);
      return user ? user.name : userId;
    }
    
    return userId;
  } catch (error) {
    console.error('Error fetching user name:', error);
    return userId;
  }
}

/**
 * Get multiple user names from user IDs
 * @param userIds - Array of user IDs to look up
 * @param tenantId - The tenant/organization ID
 * @returns Promise<Record<string, string>> - Object mapping user IDs to names
 */
export async function getUserNamesFromIds(userIds: string[], tenantId: string): Promise<Record<string, string>> {
  if (!userIds.length || !tenantId) {
    return {};
  }

  try {
    const data = await fetchOrganizationMembers(tenantId);
    
    if (data && data.length > 0) {
      const userMap: Record<string, string> = {};
      data.forEach((user: ClerkUser) => {
        userMap[user.id] = user.name;
      });
      
      // Fill in missing users with their IDs
      userIds.forEach(id => {
        if (!userMap[id]) {
          userMap[id] = id;
        }
      });
      
      return userMap;
    }
    
    return userIds.reduce((acc, id) => ({ ...acc, [id]: id }), {});
  } catch (error) {
    console.error('Error fetching user names:', error);
    return userIds.reduce((acc, id) => ({ ...acc, [id]: id }), {});
  }
}
