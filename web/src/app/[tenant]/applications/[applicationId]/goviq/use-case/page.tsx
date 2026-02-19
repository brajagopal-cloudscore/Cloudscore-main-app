/**
 * Use Cases Page (Server Component)
 * Displays use cases with their associated risks
 */

import { getUseCases } from '@/lib/queries/use-cases';
import UseCaseApp from './Usecase';
import { auth } from '@clerk/nextjs/server';

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function UseCasePage({ params }: PageProps) {
  const { applicationId } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Authentication required');
  }

  // Fetch use cases with risks (SSR)
  const useCases = await getUseCases(applicationId);

  return (
    <UseCaseApp
      initialUseCases={useCases}
      applicationId={applicationId}
      tenantId={orgId}
      userId={userId}
    />
  );
}
