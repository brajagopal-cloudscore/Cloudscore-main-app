/**
 * Stakeholders Page (Server Component)
 */

import { getStakeholders } from '@/lib/queries/stakeholders';
import { StakeholdersList } from './_components/StakeholdersList';
import { auth } from '@clerk/nextjs/server';

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function StakeholdersPage({ params }: PageProps) {
  const { applicationId } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Authentication required');
  }

  // Fetch stakeholders
  const stakeholders = await getStakeholders(applicationId);

  return (
    
      <StakeholdersList
        initialStakeholders={stakeholders as any}
        applicationId={applicationId}
        tenantId={orgId}
        userId={userId}
      />
  
  );
}
