/**
 * Server actions for Guardrails
 */

'use server';

import { db, guardrails, tenants } from '@db';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { createAuditEvent } from '@/lib/server/audit';

export interface CreateGuardrailInput {
  tenantSlug: string;
  key: string;
  version?: string;
  category?: string;
  description?: string;
  tier: string;
  performance_budget_ms?: number;
  requires_onnx?: boolean;
  onnx_model_id?: string;
  default_params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  is_enabled?: boolean;
  pack_name?: string;
  function_name?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  fallback_strategy?: string;
}

export const getGuardrails = async (tenantSlugOrId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error('Authentication required');

  // Try to find by ID first, then by slug
  let tenantRow = await db.select().from(tenants).where(eq(tenants.id, tenantSlugOrId)).limit(1);
  if (!tenantRow.length) {
    tenantRow = await db.select().from(tenants).where(eq(tenants.slug, tenantSlugOrId)).limit(1);
  }
  if (!tenantRow.length) throw new Error('Tenant not found');
  const tenantId = tenantRow[0].id;

  const guardrailsList = await db.query.guardrails.findMany({
    where: and(
      eq(guardrails.tenantId, tenantId),
      isNull(guardrails.deletedAt)
    ),
    orderBy: (guardrails, { desc }) => [desc(guardrails.createdAt)],
  });

  return {
    success: true,
    guardrails: guardrailsList.map(guardrail => ({
      id: guardrail.id,
      tenant_id: guardrail.tenantId,
      key: guardrail.key,
      version: guardrail.version,
      category: guardrail.category,
      description: guardrail.description,
      tier: guardrail.tier,
      performance_budget_ms: guardrail.performanceBudgetMs ? Number(guardrail.performanceBudgetMs) : undefined,
      requires_onnx: guardrail.requiresOnnx,
      onnx_model_id: guardrail.onnxModelId,
      default_params: guardrail.defaultParams,
      metadata: guardrail.metadata,
      is_enabled: guardrail.isEnabled,
      pack_name: guardrail.packName,
      function_name: guardrail.functionName,
      input_schema: guardrail.inputSchema,
      output_schema: guardrail.outputSchema,
      fallback_strategy: guardrail.fallbackStrategy,
      created_by: guardrail.createdBy,
      updated_by: guardrail.updatedBy,
      created_at: guardrail.createdAt,
      updated_at: guardrail.updatedAt,
      deleted_at: guardrail.deletedAt,
    })),
    tenant: { id: tenantId, slug: tenantRow[0].slug },
  };
};

export const createGuardrail = async (input: CreateGuardrailInput) => {
  const { userId } = await auth();
  if (!userId) throw new Error('Authentication required');

  // Try to find by ID first, then by slug
  let tenantRow = await db.select().from(tenants).where(eq(tenants.id, input.tenantSlug)).limit(1);
  if (!tenantRow.length) {
    tenantRow = await db.select().from(tenants).where(eq(tenants.slug, input.tenantSlug)).limit(1);
  }
  if (!tenantRow.length) throw new Error('Tenant not found');
  const tenantId = tenantRow[0].id;

  if (!input.key || !input.tier) {
    throw new Error('Key and tier are required');
  }

  const newGuardrail = await db.insert(guardrails).values({
    tenantId,
    key: input.key,
    version: input.version || 'v1',
    category: input.category,
    description: input.description,
    tier: input.tier as any,
    performanceBudgetMs: input.performance_budget_ms ? input.performance_budget_ms.toString() : null,
    requiresOnnx: input.requires_onnx || false,
    onnxModelId: input.onnx_model_id,
    defaultParams: input.default_params || {},
    metadata: input.metadata || {},
    isEnabled: input.is_enabled !== undefined ? input.is_enabled : true,
    packName: input.pack_name,
    functionName: input.function_name,
    inputSchema: input.input_schema,
    outputSchema: input.output_schema,
    fallbackStrategy: input.fallback_strategy || 'skip',
    createdBy: userId,
    updatedBy: userId,
  }).returning();

  try {
    await createAuditEvent({
      tenantId,
      actorUserId: userId,
      action: 'guardrail.created',
      targetType: 'guardrail',
      targetId: newGuardrail[0].id,
      metadata: { key: input.key, version: input.version || 'v1' },
    });
  } catch (e) {
    console.error('Failed to write audit event (guardrail.created):', e);
  }

  return {
    success: true,
    guardrail: newGuardrail[0],
    message: 'Guardrail created successfully',
  };
};
