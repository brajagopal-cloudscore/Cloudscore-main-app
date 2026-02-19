import { db, guardrails } from "@/db";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { GuardrailsPageClient } from "./page-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function GuardrailsPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { tenant: tenantSlug } = await params;

  // Get tenant
  const tenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  // Fetch tenant's guardrails
  const installeduardrails = (
    await db.query.guardrails.findMany({
      where: and(
        eq(guardrails.tenantId, tenant.id),
        isNull(guardrails.deletedAt)
      ),

      orderBy: (g, { desc }) => [desc(g.createdAt)],
    })
  ).map((ele) => ele.fallbackGuardrailId || "");

  const tenantGuardrails = await db.query.guardrails.findMany({
    where: and(
      inArray(guardrails.id, installeduardrails),
      isNull(guardrails.deletedAt)
    ),

    orderBy: (g, { desc }) => [desc(g.createdAt)],
  });
  // Fetch global marketplace guardrails (only enabled ones)
  const marketplaceGuardrails = await db.query.guardrails.findMany({
    where: and(
      eq(guardrails.isGlobal, true),
      eq(guardrails.isEnabled, true),
      isNull(guardrails.deletedAt)
    ),
    orderBy: (g, { desc }) => [desc(g.isCertified), desc(g.createdAt)],
  });

  return (
    <div className="">
      <GuardrailsPageClient
        tenantSlug={tenantSlug}
        userId={userId}
        tenantGuardrails={tenantGuardrails}
        marketplaceGuardrails={marketplaceGuardrails}
      />
    </div>
  );
}
