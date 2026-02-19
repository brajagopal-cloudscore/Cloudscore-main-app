/**
 * Model Registry Page (Server Component with SSR)
 * Organization-approved API models catalog
 */

import { auth } from '@clerk/nextjs/server';
import { getTenantModels } from '@/lib/queries/provider-models';
import { ModelRegistryList } from './_components/ModelRegistryList';

interface ModelRegistryPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ModelRegistryPage({ params }: ModelRegistryPageProps) {
  const { tenant } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Authentication required');
  }

  // Fetch models from database (SSR) - only org-specific models
  const models = await getTenantModels(orgId);

  return (
    <div className="p-6">
      <ModelRegistryList
        initialModels={models as any}
        tenant={tenant}
        tenantId={orgId}
        userId={userId}
      />
    </div>
  );
}
