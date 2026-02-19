/**
 * Utility functions for tracking application updates
 * Updates the application's updated_by and updated_at fields whenever related data changes
 */

import { db, applications } from '@db';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

/**
 * Updates the application's last updated timestamp and user
 * @param applicationId - The ID of the application to update
 * @param userId - The ID of the user making the change (optional, will get from auth if not provided)
 */
export const updateApplicationTimestamp = async (
  applicationId: string,
  userId?: string
): Promise<void> => {
  try {
    // Get user ID from auth if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const authResult = await auth();
      currentUserId = authResult.userId || undefined;
    }

    if (!currentUserId) {
      return;
    }

    // Update the application's updated_by and updated_at fields
    await db
      .update(applications)
      .set({
        updatedBy: currentUserId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(applications.id, applicationId));

  } catch (error) {
    console.error('Error updating application timestamp:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Wrapper function that executes an operation and then updates the application timestamp
 * @param applicationId - The ID of the application
 * @param operation - The operation to execute
 * @param userId - The ID of the user making the change (optional)
 */
export const withApplicationTracking = async <T>(
  applicationId: string,
  operation: () => Promise<T>,
  userId?: string
): Promise<T> => {
  try {
    // Execute the main operation
    const result = await operation();
    
    // Update application timestamp after successful operation
    await updateApplicationTimestamp(applicationId, userId);
    
    return result;
  } catch (error) {
    // Re-throw the error to maintain the original behavior
    throw error;
  }
};
