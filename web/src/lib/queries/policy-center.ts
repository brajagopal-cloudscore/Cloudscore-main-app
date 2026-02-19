/**
 * Server-side queries for Policy Center
 * Used in Server Components (SSR)
 */

import { db, policyCenter } from "@db";
import { cache } from "react";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Get all global policy center policies
 * (Only those with parentPolicyId = NULL)
 */
export const getPolicyCenterPolicies = cache(async () => {
  return await db.query.policyCenter.findMany({
    where: isNull(policyCenter.parentPolicyId),
    orderBy: (policies, { asc }) => [asc(policies.name)],
  });
});

/**
 * Get global policy center policies by category
 * @param category - The category to filter by
 */
export const getPolicyCenterPoliciesByCategory = cache(
  async (category: string) => {
    return await db.query.policyCenter.findMany({
      where: and(
        eq(policyCenter.category, category),
        isNull(policyCenter.parentPolicyId)
      ),
      orderBy: (policies, { asc }) => [asc(policies.name)],
    });
  }
);

/**
 * Get global policy center policies by country
 * @param country - The country to filter by
 */
export const getPolicyCenterPoliciesByCountry = cache(
  async (country: string) => {
    return await db.query.policyCenter.findMany({
      where: and(
        eq(policyCenter.country, country),
        isNull(policyCenter.parentPolicyId)
      ),
      orderBy: (policies, { asc }) => [asc(policies.name)],
    });
  }
);

/**
 * Get active global policy center policies
 */
export const getActivePolicyCenterPolicies = cache(async () => {
  return await db.query.policyCenter.findMany({
    where: and(
      eq(policyCenter.isActive, true),
      isNull(policyCenter.parentPolicyId)
    ),
    orderBy: (policies, { asc }) => [asc(policies.name)],
  });
});
