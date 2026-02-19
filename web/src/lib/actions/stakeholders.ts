/**
 * Server actions for Stakeholders
 */

'use server';

import { db, stakeholders } from '@db';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { withApplicationTracking } from '@/lib/utils/application-tracking';
import { createAuditEvent } from '@/lib/server/audit';

interface CreateStakeholderInput {
  tenantId: string;
  applicationId: string;
  userName: string;
  role: string;
  email?: string;
  department?: string;
  responsibilities?: string;
}

export const createStakeholder = async (input: CreateStakeholderInput) => {
  return withApplicationTracking(input.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const [stakeholder] = await db
      .insert(stakeholders)
      .values({
        ...input,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    revalidatePath(`/applications/${input.applicationId}`);
    
    try {
      await createAuditEvent({
        tenantId: input.tenantId,
        actorUserId: userId,
        action: 'stakeholder.created',
        targetType: 'stakeholder',
        targetId: stakeholder.id,
        metadata: { userName: input.userName, role: input.role },
      });
    } catch (e) {
      console.error('Failed to write audit event (stakeholder.created):', e);
    }
    
    return stakeholder;
  });
};

export const updateStakeholder = async (id: string, input: Partial<CreateStakeholderInput>) => {
  // Get the stakeholder first to get the applicationId
  const existingStakeholder = await db.query.stakeholders.findFirst({
    where: eq(stakeholders.id, id),
  });

  if (!existingStakeholder) {
    throw new Error('Stakeholder not found');
  }

  return withApplicationTracking(existingStakeholder.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const [stakeholder] = await db
      .update(stakeholders)
      .set({
        ...input,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(stakeholders.id, id))
      .returning();

    if (!stakeholder) {
      throw new Error('Stakeholder not found');
    }

    revalidatePath(`/applications/${stakeholder.applicationId}`);
    
    try {
      await createAuditEvent({
        tenantId: existingStakeholder.tenantId,
        actorUserId: userId,
        action: 'stakeholder.updated',
        targetType: 'stakeholder',
        targetId: stakeholder.id,
        metadata: { update: input },
      });
    } catch (e) {
      console.error('Failed to write audit event (stakeholder.updated):', e);
    }
    
    return stakeholder;
  });
};

export const deleteStakeholder = async (id: string) => {
  // Get the stakeholder first to get the applicationId
  const existingStakeholder = await db.query.stakeholders.findFirst({
    where: eq(stakeholders.id, id),
  });

  if (!existingStakeholder) {
    throw new Error('Stakeholder not found');
  }

  return withApplicationTracking(existingStakeholder.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const [stakeholder] = await db
      .delete(stakeholders)
      .where(eq(stakeholders.id, id))
      .returning();

    if (!stakeholder) {
      throw new Error('Stakeholder not found');
    }

    revalidatePath(`/applications/${stakeholder.applicationId}`);
    
    try {
      await createAuditEvent({
        tenantId: stakeholder.tenantId,
        actorUserId: userId,
        action: 'stakeholder.deleted',
        targetType: 'stakeholder',
        targetId: id,
      });
    } catch (e) {
      console.error('Failed to write audit event (stakeholder.deleted):', e);
    }
    
    return { success: true };
  });
};

