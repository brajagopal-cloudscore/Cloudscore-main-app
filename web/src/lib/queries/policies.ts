/**
 * Server-side queries for Policies
 * Used in Server Components (SSR)
 */

import { db, policies, policyGuardrails, guardrails } from "@db";
import { eq, and, desc, sql, isNull, inArray, or, ilike } from "drizzle-orm";
import { cache } from "react";

// Types for YAML parsing (simplified - will parse on frontend if needed)
interface YamlGuard {
  id: string;
  target?: string;
  with?: Record<string, any>;
}

interface YamlComposition {
  input?: string;
  output?: string;
  tool_args?: string;
  tool_result?: string;
  root?: string;
}

interface ParsedPolicyYaml {
  policy?: string;
  description?: string;
  guards?: YamlGuard[];
  compose?: YamlComposition;
}

/**
 * Simple YAML parsing using regex (fallback approach)
 * For full YAML parsing, the frontend can use a YAML library
 */
function extractGuardrailIdsFromYaml(yamlContent: string | null): string[] {
  if (!yamlContent) {
    return [];
  }

  try {
    // Simple regex to extract guardrail IDs from YAML
    // Looks for patterns like: id: business.competitor_protection
    const idMatches = yamlContent.match(/id:\s*([a-zA-Z0-9._-]+)/g);
    if (!idMatches) {
      return [];
    }

    return idMatches.map((match) => {
      const id = match.replace(/id:\s*/, "").trim();
      return id;
    });
  } catch (error) {
    console.error("Error extracting guardrail IDs from YAML:", error);
    return [];
  }
}

/**
 * Extract composition from YAML using regex
 */
function extractCompositionFromYaml(
  yamlContent: string | null
): YamlComposition | null {
  if (!yamlContent) {
    return null;
  }

  try {
    // Look for compose section
    const composeMatch = yamlContent.match(/compose:\s*\n((?:\s+.*\n?)*)/);
    if (!composeMatch) {
      return null;
    }

    const composeSection = composeMatch[1];
    const composition: YamlComposition = {};

    // Extract input, output, tool_args, tool_result, root
    const inputMatch = composeSection.match(/input:\s*(.+)/);
    const outputMatch = composeSection.match(/output:\s*(.+)/);
    const toolArgsMatch = composeSection.match(/tool_args:\s*(.+)/);
    const toolResultMatch = composeSection.match(/tool_result:\s*(.+)/);
    const rootMatch = composeSection.match(/root:\s*(.+)/);

    if (inputMatch) composition.input = inputMatch[1].trim();
    if (outputMatch) composition.output = outputMatch[1].trim();
    if (toolArgsMatch) composition.tool_args = toolArgsMatch[1].trim();
    if (toolResultMatch) composition.tool_result = toolResultMatch[1].trim();
    if (rootMatch) composition.root = rootMatch[1].trim();

    return Object.keys(composition).length > 0 ? composition : null;
  } catch (error) {
    console.error("Error extracting composition from YAML:", error);
    return null;
  }
}

// Get all policies for a tenant
export const getPolicies = cache(async (tenantId: string) => {
  return await db.query.policies.findMany({
    where: and(eq(policies.tenantId, tenantId), isNull(policies.deletedAt)),
    with: {
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      user_updatedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(policies.createdAt)],
  });
});

// Get single policy with full details including guardrails from YAML
export const getPolicyWithDetails = cache(async (policyId: string) => {
  const policy = await db.query.policies.findFirst({
    where: eq(policies.id, policyId),
    with: {
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      user_updatedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      // Get policy guardrails from database (if any)
      policyGuardrails: {
        with: {
          guardrail: true,
        },
        orderBy: [policyGuardrails.orderIndex],
      },
    },
  });

  if (!policy) {
    throw new Error("Policy not found");
  }

  // Parse YAML to extract guardrail IDs and composition
  const guardrailIds = extractGuardrailIdsFromYaml(policy.yaml);
  const composition = extractCompositionFromYaml(policy.yaml);

  // Fetch guardrail details for IDs found in YAML
  let yamlGuardrails: any[] = [];
  if (guardrailIds.length > 0) {
    yamlGuardrails = await db.query.guardrails.findMany({
      where: inArray(guardrails.key, guardrailIds),
      columns: {
        id: true,
        key: true,
        name: true,
        description: true,
        category: true,
        tier: true,
        version: true,
        isEnabled: true,
        defaultParams: true,
        metadata: true,
      },
    });
  }

  return {
    ...policy,
    // Add parsed YAML data
    composition,
    yamlGuardrails,
    // Keep existing database guardrails for backward compatibility
    databaseGuardrails: policy.policyGuardrails,
  };
});

// Get policy with guardrails (both from YAML and database)
export const getPolicyWithGuardrails = cache(async (policyId: string) => {
  const policy = await getPolicyWithDetails(policyId);

  // Combine guardrails from both sources
  const allGuardrails = [
    ...policy.yamlGuardrails.map((g) => ({
      ...g,
      source: "yaml" as const,
    })),
    ...policy.databaseGuardrails.map((pg) => ({
      ...pg.guardrail,
      source: "database" as const,
      phase: pg.phase,
      params: pg.params,
      threshold: pg.threshold,
      weight: pg.weight,
      tierOverride: pg.tierOverride,
      orderIndex: pg.orderIndex,
      enabled: pg.enabled,
    })),
  ];

  return {
    ...policy,
    allGuardrails,
  };
});

// Get policies with summary statistics
export const getPoliciesWithSummary = cache(async (tenantId: string) => {
  const policies = await getPolicies(tenantId);

  // Add summary data for each policy
  const policiesWithSummary = await Promise.all(
    policies.map(async (policy) => {
      const guardrailIds = extractGuardrailIdsFromYaml(policy.yaml);
      const composition = extractCompositionFromYaml(policy.yaml);

      // Count guardrails from YAML
      const yamlGuardrailCount = guardrailIds.length;

      // Count guardrails from database
      const databaseGuardrailCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(policyGuardrails)
        .where(eq(policyGuardrails.policyId, policy.id));

      return {
        ...policy,
        summary: {
          totalGuardrails:
            yamlGuardrailCount + Number(databaseGuardrailCount[0]?.count || 0),
          yamlGuardrails: yamlGuardrailCount,
          databaseGuardrails: Number(databaseGuardrailCount[0]?.count || 0),
          hasComposition: !!composition,
        },
      };
    })
  );

  return policiesWithSummary;
});

// Get policy by ID with minimal data (for quick lookups)
export const getPolicyById = cache(async (policyId: string) => {
  return await db.query.policies.findFirst({
    where: eq(policies.id, policyId),
    columns: {
      id: true,
      name: true,
      version: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

// Get policy YAML content only
export const getPolicyYaml = cache(async (policyId: string) => {
  const policy = await db.query.policies.findFirst({
    where: eq(policies.id, policyId),
    columns: {
      yaml: true,
      name: true,
    },
  });

  return policy;
});

// Get policy composition data only
export const getPolicyComposition = cache(async (policyId: string) => {
  const policy = await db.query.policies.findFirst({
    where: eq(policies.id, policyId),
    columns: {
      yaml: true,
      compositionStrategy: true,
    },
  });

  if (!policy) {
    return null;
  }

  const composition = extractCompositionFromYaml(policy.yaml);

  return {
    yamlComposition: composition,
    databaseComposition: policy.compositionStrategy,
  };
});

// Get guardrails used in a policy (from both YAML and database)
export const getPolicyGuardrails = cache(async (policyId: string) => {
  const policy = await getPolicyWithGuardrails(policyId);

  return {
    yamlGuardrails: policy.yamlGuardrails,
    databaseGuardrails: policy.databaseGuardrails,
    allGuardrails: policy.allGuardrails,
  };
});

// Search policies by name or description
export const searchPolicies = cache(
  async (tenantId: string, searchTerm: string) => {
    const term = `%${searchTerm}%`;
    return await db.query.policies.findMany({
      where: and(
        eq(policies.tenantId, tenantId),
        isNull(policies.deletedAt),
        or(
          ilike(policies.name, term),
          ilike(policies.description, term)
        )
      ),
      with: {
        user_createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(policies.createdAt)],
    });
  }
);

// Get policies by status
export const getPoliciesByStatus = cache(
  async (tenantId: string, status: string) => {
    return await db.query.policies.findMany({
      where: and(
        eq(policies.tenantId, tenantId),
        eq(policies.status, status as any),
        isNull(policies.deletedAt)
      ),
      with: {
        user_createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(policies.createdAt)],
    });
  }
);

// Get active policies only
export const getActivePolicies = cache(async (tenantId: string) => {
  return await getPoliciesByStatus(tenantId, "active");
});

// Get draft policies only
export const getDraftPolicies = cache(async (tenantId: string) => {
  return await getPoliciesByStatus(tenantId, "draft");
});
