"use server";

import { db, guardrails, tenants } from "@/db";
import { revalidatePath } from "next/cache";
import { eq, and, isNull } from "drizzle-orm";

export interface CreateGuardrailInput {
  tenantSlug: string;
  userId: string;
  key: string;
  name: string;
  description: string;
  tier: "T0" | "T1" | "T2";
  category: string;
  infrastructure: "rule" | "llm" | "na";
  pack_name: string;
  function_name: string;
  default_params?: Record<string, any>;
}

export async function createGuardrail(input: CreateGuardrailInput) {
  const { tenantSlug, userId, ...guardrailData } = input;

  // Get tenant ID from slug
  const tenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  // Calculate performance budget based on tier
  const performanceBudgetMs =
    guardrailData.tier === "T0" ? 5 : guardrailData.tier === "T1" ? 20 : 100;

  // Insert guardrail
  const [newGuardrail] = await db
    .insert(guardrails)
    .values({
      tenantId: tenant.id,
      createdBy: userId,
      key: guardrailData.key,
      name: guardrailData.name,
      packName: guardrailData.pack_name,
      functionName: guardrailData.function_name,
      description: guardrailData.description,
      tier: guardrailData.tier,
      performanceBudgetMs: performanceBudgetMs.toString(),
      infrastructure: guardrailData.infrastructure,
      defaultParams: guardrailData.default_params || {},
      isEnabled: true,
      isGlobal: false,
      isCertified: false,
    })
    .returning();

  revalidatePath(`/${tenantSlug}/guardrails`);

  return newGuardrail;
}

export async function installMarketplaceGuardrail(input: {
  tenantSlug: string;
  userId: string;
  sourceGuardrailId: string;
}) {
  const { tenantSlug, userId, sourceGuardrailId } = input;
  console.log(input);
  // Get tenant
  const tenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  // Get source guardrail (must be global and not deleted)
  const sourceGuardrail = await db.query.guardrails.findFirst({
    where: (g, { eq, and, isNull }) =>
      and(
        eq(g.id, sourceGuardrailId),
        eq(g.isGlobal, true),
        isNull(g.deletedAt)
      ),
  });

  if (!sourceGuardrail) {
    throw new Error("Source guardrail not found or not global");
  }

  // Check if already installed (exclude soft-deleted)
  const existing = await db.query.guardrails.findFirst({
    where: (g, { eq, and, isNull }) =>
      and(
        eq(g.tenantId, tenant.id),
        eq(g.key, sourceGuardrail.key),
        isNull(g.deletedAt)
      ),
  });

  if (existing) {
    throw new Error("Guardrail already installed");
  }

  // Clone the guardrail for this tenant
  const [installed] = await db
    .insert(guardrails)
    .values({
      tenantId: tenant.id,
      createdBy: userId,
      key: sourceGuardrail.key,
      name: sourceGuardrail.name,
      packName: sourceGuardrail.packName,
      functionName: sourceGuardrail.functionName,
      description: sourceGuardrail.description,
      tier: sourceGuardrail.tier,
      performanceBudgetMs: sourceGuardrail.performanceBudgetMs,
      infrastructure: sourceGuardrail.infrastructure,
      inputSchema: sourceGuardrail.inputSchema,
      outputSchema: sourceGuardrail.outputSchema,
      category: sourceGuardrail.category,
      defaultParams: sourceGuardrail.defaultParams,
      isEnabled: true,
      isGlobal: false,
      isCertified: false,
      // Link to the original global guardrail
      fallbackGuardrailId: sourceGuardrailId,
    })
    .returning();

  revalidatePath(`/${tenantSlug}/guardrails`);

  return installed;
}
