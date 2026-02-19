// src/lib/utils/clerk.server.ts
import { auth, currentUser } from '@clerk/nextjs/server';

export async function getCurrentUserServer() {
  const { userId, orgId, orgRole } = await auth();
  const user = await currentUser();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const tenantId = orgId || userId;
  
  if (!tenantId) {
    throw new Error('No tenant ID available');
  }

  return {
    userId,
    tenantId,
    userRole: user?.publicMetadata?.role as string | undefined,
    orgRole,
    isAdmin: ['admin', 'member'].includes(
      ((user?.publicMetadata?.role as string) || '').toLowerCase()
    ),
    user,
  };
}
