/**
 * Models Info Page (Server Component)
 */

import { getApplicationModels } from "@/lib/queries/application-models";
import { ModelsInfoList } from "./_components/ModelsInfoList";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function ModelsInfoPage({ params }: PageProps) {
  const { applicationId } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Authentication required");
  }

  const models = await getApplicationModels(applicationId);

  return (
    <ModelsInfoList
      initialModels={models as any}
      applicationId={applicationId}
      tenantId={orgId}
      userId={userId}
    />
  );
}
