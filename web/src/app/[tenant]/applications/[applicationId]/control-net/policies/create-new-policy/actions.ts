"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { db, guardrails, tenants } from "@/db"
import { eq } from "drizzle-orm"
import type { CompositionNode } from "@/components/control-net/CompositionBuilder"
import { updateApplicationTimestamp } from '@/lib/utils/application-tracking'

export interface CreatePolicyInput {
  tenantSlug: string
  userId: string
  applicationId?: string // Optional application ID for tracking
  name: string
  description: string
  inputComposition: CompositionNode[]
  outputComposition: CompositionNode[]
  toolArgsComposition: CompositionNode[]
  toolResultComposition: CompositionNode[]
}

/**
 * Convert CompositionNodes to GuardrailLinks format for ControlNet API
 * Simplified: nodes are just a flat list of guards with params
 */
async function compositionToGuardrailLinks(
  composition: CompositionNode[],
  phase: "input" | "output" | "tool_args" | "tool_result",
  tenantId: string
): Promise<any[]> {
  // Extract all guardrail keys
  const guardrailKeys = composition
    .filter(node => node.type === "guard" && node.guardrailKey)
    .map(node => node.guardrailKey!)
  
  if (guardrailKeys.length === 0) return []
  
  // Fetch guardrail IDs from database
  const guardrailRecords = await db.query.guardrails.findMany({
    where: (g, { eq, and, inArray }) => and(
      eq(g.tenantId, tenantId),
      inArray(g.key, guardrailKeys)
    ),
    columns: { id: true, key: true }
  })
  
  const keyToId = new Map(guardrailRecords.map(g => [g.key, g.id]))
  
  // Convert to guardrail links (simple flat list)
  const links = composition
    .filter(node => node.type === "guard" && node.guardrailKey)
    .map((node, index) => {
      const guardrailId = keyToId.get(node.guardrailKey!)
      if (!guardrailId) return null
      
      return {
        guardrail_id: guardrailId,
        phase,
        order_index: index,
        params: node.params || {},
        enabled: true
      }
    })
    .filter(link => link !== null)
  
  return links
}

/**
 * Determine composition strategy
 * For now, default to "allOf" - Python will optimize automatically
 */
function getCompositionStrategy(nodes: CompositionNode[]): string {
  // Python backend handles optimization, so just use allOf
  return "allOf"
}

export async function createPolicy(input: CreatePolicyInput) {
  const { tenantSlug, userId, applicationId, ...policyData } = input

  // Get tenant from slug
  const tenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, tenantSlug),
  })

  if (!tenant) {
    throw new Error("Tenant not found")
  }

  // Convert composition nodes to guardrail links
  const [inputLinks, outputLinks, toolArgsLinks, toolResultLinks] = await Promise.all([
    compositionToGuardrailLinks(policyData.inputComposition, "input", tenant.id),
    compositionToGuardrailLinks(policyData.outputComposition, "output", tenant.id),
    compositionToGuardrailLinks(policyData.toolArgsComposition, "tool_args", tenant.id),
    compositionToGuardrailLinks(policyData.toolResultComposition, "tool_result", tenant.id),
  ])

  const allGuardrailLinks = [...inputLinks, ...outputLinks, ...toolArgsLinks, ...toolResultLinks]

  if (allGuardrailLinks.length === 0) {
    throw new Error("At least one guardrail must be selected")
  }

  // Build composition config
  const composition = {
    input: getCompositionStrategy(policyData.inputComposition),
    output: getCompositionStrategy(policyData.outputComposition),
    tool_args: getCompositionStrategy(policyData.toolArgsComposition),
    tool_result: getCompositionStrategy(policyData.toolResultComposition),
  }

  // Get auth headers
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  // Call ControlNet API to create policy (Python generates YAML)
  // Server actions run in Node.js, so we need absolute URL to controlnet service
  const controlnetUrl = process.env.CONTROLNET_INTERNAL_URL || 'http://controlnet:8000'
  const response = await fetch(`${controlnetUrl}/v1/policies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-ID": tenantSlug,
      "X-User-ID": userId,
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify({
      name: policyData.name,
      description: policyData.description,
      version: "v1",
      guardrails: allGuardrailLinks,
      composition,
      status: "draft",
      is_active: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create policy: ${error}`)
  }

  const result = await response.json()

  // Update application timestamp if applicationId is provided
  if (applicationId) {
    await updateApplicationTimestamp(applicationId, userId)
  }

  revalidatePath(`/${tenantSlug}/policies`)

  return result
}
