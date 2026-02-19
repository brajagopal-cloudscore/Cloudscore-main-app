import { auth } from "@clerk/nextjs/server";
import { getApplicationsWithSummary } from "@/lib/queries/applications";
import { ApplicationsList } from "./_components/ApplicationsList";

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ApplicationsPage({ params }: PageProps) {
  const { tenant } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Authentication required");
  }

  return (
    <div className="p-6">
      <ApplicationsList tenant={tenant} tenantId={orgId} userId={userId} />
    </div>
  );
}
