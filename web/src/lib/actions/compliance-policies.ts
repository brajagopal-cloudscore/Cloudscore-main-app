/**
 * Server actions for Compliance Policies (Application-level Policy Center)
 */

'use server';

import { db, applicationPolicyCenter, policyCenter, tenants } from '@db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createAuditEvent } from '@/lib/server/audit';

/**
 * Get compliance policies for an application
 */
export const getApplicationCompliancePolicies = async (
  tenantSlugOrId: string,
  applicationId: string
) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Authentication required');
  }

  // Try to find tenant by ID first, then by slug
  let tenantRow = await db.select().from(tenants).where(eq(tenants.id, tenantSlugOrId)).limit(1);
  if (!tenantRow.length) {
    tenantRow = await db.select().from(tenants).where(eq(tenants.slug, tenantSlugOrId)).limit(1);
  }
  if (!tenantRow.length) throw new Error('Tenant not found');
  const tenantId = tenantRow[0].id;

  // Verify tenant matches orgId
  if (tenantId !== orgId) {
    throw new Error('Access denied');
  }

  try {
    const orgActivePolicies = await db.query.policyCenter.findMany({
      where: and(
        eq(policyCenter.tenantId, orgId),
        eq(policyCenter.isActive, true)
      ),
    });

    const applicationActivepolicies =
      await db.query.applicationPolicyCenter.findMany({
        where: and(
          eq(applicationPolicyCenter.applicationId, applicationId),
          eq(applicationPolicyCenter.tenantId, orgId)
        ),
      });

    const policies = orgActivePolicies.map((policy) => {
      return {
        ...policy,
        isActive:
          applicationActivepolicies.find(
            (ele) => ele.policyId === policy.parentPolicyId
          )?.isActive || false,
      };
    });

    return {
      success: true,
      policies,
      message: `Policies Status for application ${applicationId}`,
    };
  } catch (error) {
    console.error('Error getting compliance policies:', error);
    throw new Error(`Failed to get policies for application ${applicationId}`);
  }
};

/**
 * Update compliance policy status for an application
 */
export const updateApplicationCompliancePolicy = async (
  tenantSlugOrId: string,
  applicationId: string,
  policyId: string,
  isActive: boolean
) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error('Authentication required');
  }

  // Try to find tenant by ID first, then by slug
  let tenantRow = await db.select().from(tenants).where(eq(tenants.id, tenantSlugOrId)).limit(1);
  if (!tenantRow.length) {
    tenantRow = await db.select().from(tenants).where(eq(tenants.slug, tenantSlugOrId)).limit(1);
  }
  if (!tenantRow.length) throw new Error('Tenant not found');
  const tenantId = tenantRow[0].id;

  // Verify tenant matches orgId
  if (tenantId !== orgId) {
    throw new Error('Access denied');
  }

  try {
    // Verify policy exists and is enabled by platform
    const verify = await db.query.policyCenter.findFirst({
      where: and(eq(policyCenter.id, policyId), eq(policyCenter.disable, false)),
    });

    if (!verify) {
      throw new Error('Policy is either doesn\'t exist or is disabled');
    }

    // Check if the organisation admin has enabled it
    const isEnabled = await db.query.policyCenter.findFirst({
      where: and(
        eq(policyCenter.parentPolicyId, policyId),
        eq(policyCenter.tenantId, orgId),
      ),
    });

    if (!isEnabled) {
      throw new Error('Policy is not enabled by admin');
    }

    let exist = await db.query.applicationPolicyCenter.findFirst({
      where: and(
        eq(applicationPolicyCenter.applicationId, applicationId),
        eq(applicationPolicyCenter.policyId, policyId),
        eq(applicationPolicyCenter.tenantId, orgId)
      ),
    });

    if (!exist) {
      const [newPolicy] = await db
        .insert(applicationPolicyCenter)
        .values({
          applicationId,
          policyId,
          tenantId: orgId,
          isActive,
        })
        .returning();

      exist = newPolicy;
    } else {
      const [updated] = await db
        .update(applicationPolicyCenter)
        .set({ isActive })
        .where(
          and(
            eq(applicationPolicyCenter.applicationId, applicationId),
            eq(applicationPolicyCenter.policyId, policyId),
            eq(applicationPolicyCenter.tenantId, orgId)
          )
        )
        .returning();

      exist = updated;
    }

    try {
      await createAuditEvent({
        tenantId: orgId,
        actorUserId: userId,
        action: 'compliance_policy.updated',
        targetType: 'compliance_policy',
        targetId: policyId,
        metadata: { applicationId, isActive },
      });
    } catch (e) {
      console.error('Failed to write audit event (compliance_policy.updated):', e);
    }

    revalidatePath(`/${tenantRow[0].slug}/applications/${applicationId}`);

    return {
      success: true,
      message: `Status updated for policy ${policyId}`,
    };
  } catch (error) {
    console.error('Error updating compliance policy:', error);
    throw error;
  }
};
