/**
 * API Keys Page (Server Component with SSR)
 */

import { auth } from '@clerk/nextjs/server';
import { getApiKeys } from '@/lib/queries/api-keys';
import { ApiKeysList } from './_components/ApiKeysList';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function APIKeysPage({ params }: PageProps) {
  const { tenant } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Authentication required');
  }

  // Fetch API keys from database (SSR)
  const keys = await getApiKeys(orgId);

  return (
    <div className="p-6">
      <ApiKeysList
        initialKeys={keys as any}
        tenant={tenant}
        tenantId={orgId}
        userId={userId}
      />
    </div>
  );
}
