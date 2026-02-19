// src/app/[tenant]/layout.tsx
import { headers } from "next/headers";
import { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db, tenants } from "@db";
import { eq } from "drizzle-orm";
import { TenantProvider } from "@/contexts/TenantContext";
import LayoutWithConditionalSidebar from "@/components/app/LayoutWithConditionalSidebar";
import { TenantHeader } from "@/components/app/TenantHeader";
import { UserGuideModal } from "@/components/common/UserGuided";
interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const headersList = await headers();
  const { tenant: tenantSlug } = await params;
  const { userId, orgId } = await auth();

  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const email = user.primaryEmailAddress?.emailAddress;

  const isAdminUser = !!email && email.endsWith("@kentron.ai");

  const pathname =
    headersList.get("x-pathname") || headersList.get("referer") || "";

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Find tenant by slug
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  // Redirect if tenant not found
  if (!tenant) {
    redirect("/");
  }

  // Verify user has access to this tenant
  if (tenant.id !== orgId) {
    redirect("/unauthorized?reason=tenant-access-denied");
  }

  return (
    <TenantProvider
      tenantData={{
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan,
        govIQEnabled: tenant.govIqEnabled || false,
        controlnetEnabled: tenant.controlnetEnabled || true,
        metadata: tenant.metadata,
      }}
    >
      <div
        className="tenant-layout h-screen flex flex-col overflow-hidden relative"
        data-tenant-id={tenant.id}
        data-tenant-slug={tenant.slug}
      >
        <UserGuideModal></UserGuideModal>
        {/* Top Header */}
        <TenantHeader />
        {/* Layout with conditional sidebar */}
        <LayoutWithConditionalSidebar isAdminUser={isAdminUser}>
          {children}
        </LayoutWithConditionalSidebar>
      </div>
    </TenantProvider>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  return {
    title: tenant ? `${tenant.name} - AI Governance` : "Tenant Not Found",
    description: tenant?.description || "AI Governance Platform",
  };
}
