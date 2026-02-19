/**
 * Server actions for Policy Center
 */

'use server';

import { db, policyCenter } from '@db';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  getPolicyCenterPolicies,
  getPolicyCenterPoliciesByCategory,
  getPolicyCenterPoliciesByCountry,
  getActivePolicyCenterPolicies,
} from '@/lib/queries/policy-center';

export interface GetPolicyCenterPoliciesOptions {
  category?: string;
  country?: string;
  state?: string;
  active?: string;
  search?: string;
}

/**
 * Get policy center policies with filters
 */
export const getPolicyCenterPoliciesAction = async (
  options?: GetPolicyCenterPoliciesOptions
) => {
  const { orgId } = await auth();
  if (!orgId || orgId === null) {
    throw new Error('Authentication Failed');
  }

  const { category, country, state, active, search } = options || {};

  let policies;

  // Use query functions for optimized server-side filtering
  if (category && country) {
    // When both filters are provided, fetch by category first then filter by country
    policies = await getPolicyCenterPoliciesByCategory(category);
    policies = policies.filter((p) => p.country === country);
  } else if (category) {
    policies = await getPolicyCenterPoliciesByCategory(category);
  } else if (country) {
    policies = await getPolicyCenterPoliciesByCountry(country);
  } else if (active === 'true' || active === '1') {
    policies = await getActivePolicyCenterPolicies();
  } else {
    policies = await getPolicyCenterPolicies();
  }

  // Additional client-side filtering for state
  if (state) {
    if (state === 'federal') {
      // For federal policies, state is null or empty
      policies = policies.filter((p) => !p.state || p.state === '');
    } else {
      policies = policies.filter((p) => p.state === state);
    }
  }

  // Filter by search term
  let filteredPolicies = policies;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPolicies = policies.filter(
      (policy) =>
        policy.name?.toLowerCase().includes(searchLower) ||
        policy.description?.toLowerCase().includes(searchLower) ||
        policy.category?.toLowerCase().includes(searchLower)
    );
  }

  const orgActivePolicies = (
    await db.query.policyCenter.findMany({
      where: and(
        eq(policyCenter.tenantId, orgId),
        eq(policyCenter.isActive, true)
      ),
    })
  ).map((ele) => ele.parentPolicyId) as string[];

  const data = filteredPolicies.map((ele) => {
    return {
      ...ele,
      isActive: orgActivePolicies.includes(ele.id),
    };
  });

  return {
    success: true,
    data,
  };
};

/**
 * Create a new policy center policy
 */
export const createPolicyCenterPolicy = async (input: {
  name: string;
  description: string;
  category: string;
  country: string;
  state?: string;
  projectsCompliant?: number;
  totalProjects?: number;
  tags?: string[];
  icon?: string;
  color?: string;
  type?: string;
  disable?: boolean;
}) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const newPolicy = await db
      .insert(policyCenter)
      .values({
        name: input.name,
        description: input.description,
        category: input.category,
        country: input.country,
        state: input.state,
        projectsCompliant: input.projectsCompliant || 0,
        totalProjects: input.totalProjects || 0,
        tags: input.tags || [],
        icon: input.icon,
        color: input.color,
        type: input.type,
        disable: input.disable || false,
      })
      .returning();

    return {
      success: true,
      data: newPolicy[0],
    };
  } catch (error) {
    console.error('Error creating policy center policy:', error);
    throw new Error('Failed to create policy center policy');
  }
};

/**
 * Get a specific policy center policy by ID
 */
export const getPolicyCenterPolicyById = async (id: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const policy = await db
      .select()
      .from(policyCenter)
      .where(eq(policyCenter.id, id))
      .limit(1);

    if (policy.length === 0) {
      throw new Error('Policy not found');
    }

    return {
      success: true,
      data: policy[0],
    };
  } catch (error) {
    console.error('Error fetching policy center policy:', error);
    throw error;
  }
};

/**
 * Update policy center policy active status
 */
export const updatePolicyCenterPolicyStatus = async (
  id: string,
  isActive: boolean
) => {
  const { orgId } = await auth();
  if (!orgId || orgId === null) {
    throw new Error('Authentication Failed');
  }

  try {
    const verify = await db.query.policyCenter.findFirst({
      where: and(eq(policyCenter.id, id), eq(policyCenter.disable, false)),
    });

    if (!verify) {
      throw new Error('Policy is either doesn\'t exist or is disabled');
    }

    let exist = await db.query.policyCenter.findFirst({
      where: and(
        eq(policyCenter.parentPolicyId, id),
        eq(policyCenter.tenantId, orgId)
      ),
    });

    if (!exist) {
      const [newPolicy] = await db
        .insert(policyCenter)
        .values({
          name: verify.name,
          description: verify.description,
          category: verify.category,
          country: verify.country,
          state: verify.state,
          projectsCompliant: verify.projectsCompliant,
          totalProjects: verify.totalProjects,
          tags: verify.tags,
          icon: verify.icon,
          color: verify.color,
          type: verify.type,
          disable: verify.disable,
          metadata: verify.metadata,
          parentPolicyId: verify.id,
          tenantId: orgId,
          isActive,
        })
        .returning();

      exist = newPolicy;
    } else {
      const [updated] = await db
        .update(policyCenter)
        .set({ isActive })
        .where(eq(policyCenter.id, exist.id))
        .returning();

      exist = updated;
    }

    revalidatePath('/admin/settings/policy-center');

    return {
      policy:exist,
      success: true,
      message: `Status updated for policy ${id}`,
    };
  } catch (error) {
    console.error('Error updating policy center policy:', error);
    throw error;
  }
};

/**
 * Get active policies for organization
 */
export const getActivePolicies = async () => {
  const { orgId } = await auth();

  if (!orgId || orgId === null) {
    throw new Error('Authentication Failed');
  }

  try {
    const orgActivePolicies = await db.query.policyCenter.findMany({
      where: and(
        eq(policyCenter.tenantId, orgId),
        eq(policyCenter.isActive, true)
      ),
    });

    return {
      success: true,
      active: orgActivePolicies,
    };
  } catch (error) {
    console.error('[ACTIVE POLICY] Error:', error);
    throw new Error('Failed to fetch active policies');
  }
};
