import { db, guardrails } from "@/db"
import { eq, and, isNull } from "drizzle-orm"
import { PolicyEditClient } from "./page-client"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPolicyDetails } from "@/lib/actions/policies"

interface PageProps {
  params: Promise<{
    tenant: string
    applicationId: string
    policyId: string
  }>
}

export default async function EditPolicyPage({ params }: PageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const { tenant: tenantSlug, applicationId, policyId } = await params

  // Get tenant
  const tenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, tenantSlug),
  })

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  // Fetch policy details
  let policyDetails
  try {
    policyDetails = await getPolicyDetails(tenantSlug, policyId)
  } catch (error) {
    return <div>Policy not found</div>
  }

  // Fetch tenant's available guardrails (including installed global ones)
  const availableGuardrails = await db.query.guardrails.findMany({
    where: and(
      eq(guardrails.tenantId, tenant.id),
      eq(guardrails.isEnabled, true),
      isNull(guardrails.deletedAt)
    ),
    orderBy: (guardrails, { asc }) => [asc(guardrails.tier), asc(guardrails.name)],
  })

  return (
    <div className="">
      <PolicyEditClient
        tenantSlug={tenantSlug}
        userId={userId}
        applicationId={applicationId}
        policyId={policyId}
        policyDetails={{
          ...policyDetails,
          description: policyDetails.description || "",
        }}
        availableGuardrails={availableGuardrails.map(g => ({
          id: g.id,
          key: g.key,
          name: g.name || g.key,
          tier: g.tier || "",
          description: g.description || "",
          defaultParams: (g.defaultParams as Record<string, any>) || {},
        }))}
      />
    </div>
  )
}

