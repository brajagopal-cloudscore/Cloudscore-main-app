// lib/api/policies.ts

import * as policyActions from '@/lib/actions/policies';

// Helper function to fetch policies for an application
export async function fetchApplicationPolicies(tenantSlugOrId: string, applicationId: string): Promise<TransformedPolicy[]> {
  try {
    const result = await policyActions.getApplicationPolicies(tenantSlugOrId, applicationId);
    return (result.data || []) as unknown as TransformedPolicy[];
  } catch (error) {
    console.error('Error fetching application policies:', error);
    throw error;
  }
}

// Helper function to fetch all tenant policies
export async function fetchTenantPolicies(tenantSlugOrId: string): Promise<TransformedPolicy[]> {
  try {
    const result = await policyActions.getTenantPolicies(tenantSlugOrId);
    return (result.data || []) as unknown as TransformedPolicy[];
  } catch (error) {
    console.error('Error fetching tenant policies:', error);
    throw error;
  }
}

// Helper function to fetch policy details
export async function fetchPolicyDetails(tenantSlug: string, policyId: string): Promise<any> {
  try {
    const data = await policyActions.getPolicyDetails(tenantSlug, policyId);
    return data;
  } catch (error) {
    console.error('Error fetching policy details:', error);
    if ((error as Error).message === 'Policy not found') {
      return null;
    }
    throw error;
  }
}

export interface Policy {
  id: string;
  tenant_id: string;
  name: string;
  version: string;
  slug?: string;
  description?: string;
  ai_system_policy_prompt?: string;
  yaml: string;
  hash: string;
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  is_active: boolean;
  metadata: Record<string, any>;
  created_by: string;
  updated_by?: string;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  compiled?: Record<string, any>;
  composition_strategy?: Record<string, any>;
}

// Transformed policy format returned by getTenantPolicies and getApplicationPolicies
export interface TransformedPolicy {
  id: string;
  name: string;
  description: string | null;
  rulesCount: number;
  yaml: string | null;
  createdAt: string;
  version: string;
  slug: string | null;
  status: 'active' | 'draft' | 'deprecated' | 'archived';
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  updatedAt: string;
}

// Since there's no GET endpoint for policies, we'll use localStorage for now
export async function fetchPolicies(tenantId: string): Promise<Policy[]> {
  try {
    const stored = localStorage.getItem(`policies_${tenantId}`)
    console.log(stored)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading policies from localStorage:', error)
    return []
  }
}

// Save policies to localStorage
export function savePolicies(tenantId: string, policies: Policy[]): void {
  try {
    localStorage.setItem(`policies_${tenantId}`, JSON.stringify(policies))
  } catch (error) {
    console.error('Error saving policies to localStorage:', error)
  }
}

// Delete policy by ID
export async function deletePolicy(tenantSlug: string, policyId: string): Promise<boolean> {
  try {
    await policyActions.deletePolicy(tenantSlug, policyId);
    return true
  } catch (error) {
    console.error('Error deleting policy:', error)
    throw error
  }
}

// Get policy by ID
export async function getPolicyById(tenantSlug: string, policyId: string): Promise<Policy | null> {
  try {
    const result = await policyActions.getPolicyById(tenantSlug, policyId);
    return result as Policy
  } catch (error) {
    console.error('Error fetching policy by ID:', error)
    if ((error as Error).message === 'Policy not found') {
      return null
    }
    throw error
  }
}