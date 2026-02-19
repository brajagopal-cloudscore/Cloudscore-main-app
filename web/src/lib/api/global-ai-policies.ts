// lib/api/global-ai-policies.ts

import * as globalAiPolicyActions from '@/lib/actions/global-ai-policies';

export interface GetGlobalAiPoliciesOptions {
  region?: string;
  country?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fetch global AI policies with optional filters, search, and pagination
 */
export async function fetchGlobalAiPolicies(
  options?: GetGlobalAiPoliciesOptions
) {
  try {
    const result = await globalAiPolicyActions.getGlobalAiPolicies(options);
    return {
      data: result.data || [],
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('Error fetching global AI policies:', error);
    throw error;
  }
}

/**
 * Fetch a global AI policy by ID
 */
export async function fetchGlobalAiPolicyById(id: string) {
  try {
    const result = await globalAiPolicyActions.getGlobalAiPolicyById(id);
    return result.data;
  } catch (error) {
    console.error('Error fetching global AI policy:', error);
    throw error;
  }
}
