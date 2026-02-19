"use server";
import * as policyCenterActions from "@/lib/actions/policy-center";
import { createAuditEvent } from "@/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { IoMdReturnLeft } from "react-icons/io";
export interface GetPolicyCenterPoliciesOptions {
  category?: string;
  country?: string;
  state?: string;
  active?: string;
  search?: string;
}

/**
 * Fetch policy center policies with filters
 */
export async function fetchPolicyCenterPolicies(
  options?: GetPolicyCenterPoliciesOptions
) {
  try {
    const result =
      await policyCenterActions.getPolicyCenterPoliciesAction(options);
    return result.data || [];
  } catch (error) {
    console.error("Error fetching policy center policies:", error);
    throw error;
  }
}

/**
 * Create a new policy center policy
 */
export async function createPolicyCenterPolicy(input: {
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
}) {
  try {
    const result = await policyCenterActions.createPolicyCenterPolicy(input);
    return result.data;
  } catch (error) {
    console.error("Error creating policy center policy:", error);
    throw error;
  }
}

/**
 * Fetch a policy center policy by ID
 */
export async function fetchPolicyCenterPolicyById(id: string) {
  try {
    const result = await policyCenterActions.getPolicyCenterPolicyById(id);
    return result.data;
  } catch (error) {
    console.error("Error fetching policy center policy:", error);
    throw error;
  }
}

/**
 * Update policy center policy status
 */
export async function updatePolicyCenterPolicyStatus(
  id: string,
  isActive: boolean
) {
  try {
    const result = await policyCenterActions.updatePolicyCenterPolicyStatus(
      id,
      isActive
    );
    const user = await auth();
    if (!user || user === null) return;
    await createAuditEvent({
      tenantId: user.orgId as string,
      actorUserId: user.userId as string,
      action: isActive
        ? "tenant_compliance_policy.enabled"
        : "tenant_compliance_policy.disabled",
      targetType: "tenant_compliance_policy",
      targetId: id,
      metadata: {
        updatedBy: user,
        compliancePolicy: result.policy,
        status: isActive ? "enabled" : "disabled",
      },
    });
    return result;
  } catch (error) {
    console.error("Error updating policy center policy:", error);
    throw error;
  }
}

/**
 * Fetch active policies for organization
 */
export async function fetchActivePolicies() {
  try {
    const result = await policyCenterActions.getActivePolicies();
    return result.active || [];
  } catch (error) {
    console.error("Error fetching active policies:", error);
    throw error;
  }
}
