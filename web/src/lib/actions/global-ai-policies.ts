/**
 * Server actions for Global AI Policies
 */

'use server';

import { db, globalAiPolicies } from '@db';
import { eq, desc, and, sql, or, ilike } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export interface GetGlobalAiPoliciesOptions {
  region?: string;
  country?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Get global AI policies with optional filters, search, and pagination
 */
export const getGlobalAiPolicies = async (
  options?: GetGlobalAiPoliciesOptions
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const { region, country, status, search, page, pageSize } = options || {};

    // Pagination defaults
    const pageNum = page && page > 0 ? page : 1;
    const limit = pageSize && pageSize > 0 ? Math.min(pageSize, 200) : 50;
    const offset = (pageNum - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    // Filter conditions
    if (region) {
      whereConditions.push(eq(globalAiPolicies.region, region));
    }
    if (country) {
      whereConditions.push(eq(globalAiPolicies.country, country));
    }
    if (status) {
      whereConditions.push(eq(globalAiPolicies.status, status));
    }

    // Search condition (case-insensitive search across multiple fields)
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereConditions.push(
        or(
          ilike(globalAiPolicies.policyName, searchTerm),
          ilike(globalAiPolicies.shortName, searchTerm),
          ilike(globalAiPolicies.country, searchTerm),
          ilike(globalAiPolicies.summary, searchTerm)
        )
      );
    }

    // Get total count
    const countConditions = [...whereConditions];
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(globalAiPolicies)
      .where(countConditions.length > 0 ? and(...countConditions) : undefined);

    const total = Number(count) || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Execute query with pagination
    const policies = await db
      .select()
      .from(globalAiPolicies)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(globalAiPolicies.effectiveDate))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: policies,
      pagination: {
        page: pageNum,
        pageSize: limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching global AI policies:', error);
    throw new Error('Failed to fetch global AI policies');
  }
};

/**
 * Get a specific global AI policy by ID
 */
export const getGlobalAiPolicyById = async (id: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    if (!id) {
      throw new Error('Invalid policy ID');
    }

    const policy = await db
      .select()
      .from(globalAiPolicies)
      .where(eq(globalAiPolicies.id, id))
      .limit(1);

    if (policy.length === 0) {
      throw new Error('Policy not found');
    }

    return {
      success: true,
      data: policy[0],
    };
  } catch (error) {
    console.error('Error fetching global AI policy:', error);
    throw error;
  }
};
