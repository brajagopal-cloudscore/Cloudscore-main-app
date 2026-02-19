// lib/api/compliance-policies.ts

import * as complianceActions from '@/lib/actions/compliance-policies';

/**
 * Fetch compliance policies for an application
 */
export async function fetchApplicationCompliancePolicies(
  tenantSlugOrId: string,
  applicationId: string
) {
  try {
    const result = await complianceActions.getApplicationCompliancePolicies(
      tenantSlugOrId,
      applicationId
    );
    return result.policies || [];
  } catch (error) {
    console.error('Error fetching compliance policies:', error);
    throw error;
  }
}

/**
 * Update compliance policy status for an application
 */
export async function updateApplicationCompliancePolicy(
  tenantSlugOrId: string,
  applicationId: string,
  policyId: string,
  isActive: boolean
) {
  try {
    const result = await complianceActions.updateApplicationCompliancePolicy(
      tenantSlugOrId,
      applicationId,
      policyId,
      isActive
    );
    return result;
  } catch (error) {
    console.error('Error updating compliance policy:', error);
    throw error;
  }
}
