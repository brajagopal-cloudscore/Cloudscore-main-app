// lib/api/guardrails.ts
import { GuardTier } from '@/types/guardrails';
import { getGuardrails } from '@/lib/actions/guardrails';

export interface GuardrailConfig {
  // Security
  injectionAttack: boolean;
  systemPromptLeak: boolean;
  // Privacy  
  piiDetector: boolean;
  copyrightIP: boolean;
  // Compliance
  policyViolation: boolean;
  // Moderation
  toxicityDetector: boolean;
  nsfwDetector: boolean;
  topicDetector: boolean;
  keywordDetector: boolean;
  // Integrity
  bias: boolean;
  spongeAttack: boolean;
  hallucination: boolean;
  adherence: boolean;
  relevancy: boolean;
}

export interface Guardrail {
  id: string;
  tenant_id: string;
  key: string;
  version: string;
  category?: string;
  description?: string;
  tier: GuardTier;
  performance_budget_ms?: number;
  requires_onnx: boolean;
  onnx_model_id?: string;
  default_params: Record<string, any>;
  metadata: Record<string, any>;
  is_enabled: boolean;
  pack_name?: string;
  function_name?: string;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  fallback_strategy: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PolicyGuardrail {
  id: string;
  tenant_id: string;
  policy_id: string;
  guardrail_id: string;
  phase: string;
  target?: Record<string, any>;
  params: Record<string, any>;
  threshold?: number;
  weight?: number;
  tier_override?: GuardTier;
  order_index: number;
  enabled: boolean;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGuardrailRequest {
  // tenant_id removed - backend derives from X-Tenant-ID header via require_tenant_auth()
  // created_by/updated_by removed - backend derives from JWT via tenant.auth.user_id
  key: string;
  version?: string;
  category?: string;
  description?: string;
  tier: GuardTier;
  performance_budget_ms?: number;
  requires_onnx?: boolean;
  onnx_model_id?: string;
  default_params?: Record<string, any>;
  metadata?: Record<string, any>;
  is_enabled?: boolean;
  pack_name?: string;
  function_name?: string;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  fallback_strategy?: string;
}

// Fetch guardrails from the database via API
export async function fetchGuardrails(tenantSlugOrId: string): Promise<Guardrail[]> {
  try {
    const data = await getGuardrails(tenantSlugOrId);
    return data.guardrails as Guardrail[] || []
  } catch (error) {
    console.error('Error fetching guardrails from API:', error)
    // Fallback to localStorage if API fails
    try {
      const stored = localStorage.getItem(`guardrails_${tenantSlugOrId}`)
      if (!stored) return []
      return JSON.parse(stored)
    } catch (localError) {
      console.error('Error loading guardrails from localStorage:', localError)
      return []
    }
  }
}

// Create guardrail via server action
export async function createGuardrail(tenantSlugOrId: string, data: CreateGuardrailRequest): Promise<Guardrail> {
  const { createGuardrail: createGuardrailAction } = await import('@/lib/actions/guardrails');
  const result = await createGuardrailAction({
    tenantSlug: tenantSlugOrId,
    ...data,
  });
  // Transform database record (camelCase) to Guardrail interface (snake_case)
  const guardrail = result.guardrail;
  if (!guardrail.tenantId || !guardrail.createdBy) {
    throw new Error('Invalid guardrail data: missing required fields');
  }
  return {
    id: guardrail.id,
    tenant_id: guardrail.tenantId,
    key: guardrail.key,
    version: guardrail.version,
    category: guardrail.category || undefined,
    description: guardrail.description || undefined,
    tier: guardrail.tier as GuardTier,
    performance_budget_ms: guardrail.performanceBudgetMs ? Number(guardrail.performanceBudgetMs) : undefined,
    requires_onnx: guardrail.requiresOnnx,
    onnx_model_id: guardrail.onnxModelId || undefined,
    default_params: guardrail.defaultParams || {},
    metadata: guardrail.metadata || {},
    is_enabled: guardrail.isEnabled,
    pack_name: guardrail.packName || undefined,
    function_name: guardrail.functionName || undefined,
    input_schema: guardrail.inputSchema || undefined,
    output_schema: guardrail.outputSchema || undefined,
    fallback_strategy: guardrail.fallbackStrategy || 'skip',
    created_by: guardrail.createdBy,
    updated_by: guardrail.updatedBy || undefined,
    created_at: guardrail.createdAt,
    updated_at: guardrail.updatedAt,
    deleted_at: guardrail.deletedAt || undefined,
  };
}

// Frontend-only policy-guardrail management
export function savePolicyGuardrails(tenantId: string, policyGuardrails: PolicyGuardrail[]): void {
  try {
    localStorage.setItem(`policy_guardrails_${tenantId}`, JSON.stringify(policyGuardrails))
  } catch (error) {
    console.error('Error saving policy-guardrails to localStorage:', error)
  }
}

export function loadPolicyGuardrails(tenantId: string): PolicyGuardrail[] {
  try {
    const stored = localStorage.getItem(`policy_guardrails_${tenantId}`)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading policy-guardrails from localStorage:', error)
    return []
  }
}

export function createPolicyGuardrail(tenantId: string, data: Omit<PolicyGuardrail, 'id' | 'created_at' | 'updated_at'>): PolicyGuardrail {
  const now = new Date().toISOString()
  const policyGuardrail: PolicyGuardrail = {
    ...data,
    id: `policy_guardrail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    updated_at: now,
  }
  
  const existing = loadPolicyGuardrails(tenantId)
  const updated = [...existing, policyGuardrail]
  savePolicyGuardrails(tenantId, updated)
  
  return policyGuardrail
}
