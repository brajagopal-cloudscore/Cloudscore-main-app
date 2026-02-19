import { auth } from "@clerk/nextjs/server";
import { getApplicationMetadata } from "@/lib/queries/applications";
import { notFound } from "next/navigation";
import ApplicationSidebar from "./Sidebar";
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function layout({ children, params }: LayoutProps) {
  const { applicationId } = await params;
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Authentication required");
  }

  let application;
  try {
    application = await getApplicationMetadata(applicationId);
    if (!application || application.tenantId !== orgId) {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching application:", error);
    notFound();
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <ApplicationSidebar applicationMetadata={application} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
