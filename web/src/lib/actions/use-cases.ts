/**
 * Server actions for Use Cases
 * Used for mutations from client components
 */

'use server';

import { db, useCases, risks } from '@db';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { withApplicationTracking } from '@/lib/utils/application-tracking';
import { createAuditEvent } from '@/lib/server/audit';

interface CreateUseCaseInput {
  tenantId: string;
  applicationId: string;
  function: string;
  useCase: string;
  whatItDoes: string;
  agentPatterns?: string[];
  keyInputs: string[];
  primaryOutputs: string[];
  businessImpact: string[];
  kpis: string[];
}

interface CreateRiskInput {
  tenantId: string;
  applicationId: string;
  useCaseId?: string;
  riskName: string;
  description?: string;
  owner: string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Catastrophic';
  likelihood: 'Rare' | 'Unlikely' | 'Possible' | 'Likely';
  riskLevel: 'Low' | 'Medium' | 'High';
  mitigationPlan?: string;
  targetDate?: string;
  categories?: string[];
}

// Create use case
export const createUseCase = async (input: CreateUseCaseInput) => {
  return withApplicationTracking(input.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const [useCase] = await db
      .insert(useCases)
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
        action: 'use_case.created',
        targetType: 'use_case',
        targetId: useCase.id,
        metadata: { function: input.function, useCase: input.useCase },
      });
    } catch (e) {
      console.error('Failed to write audit event (use_case.created):', e);
    }
    
    return useCase;
  });
};

// Create use case with risks (atomic operation)
export const createUseCaseWithRisks = async (
  useCaseInput: CreateUseCaseInput,
) => {
  return withApplicationTracking(useCaseInput.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    // Insert use case
    const [useCase] = await db
      .insert(useCases)
      .values({
        ...useCaseInput,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    revalidatePath(`/applications/${useCaseInput.applicationId}`);
    
    try {
      await createAuditEvent({
        tenantId: useCaseInput.tenantId,
        actorUserId: userId,
        action: 'use_case.created',
        targetType: 'use_case',
        targetId: useCase.id,
        metadata: { function: useCaseInput.function, useCase: useCaseInput.useCase },
      });
    } catch (e) {
      console.error('Failed to write audit event (use_case.created):', e);
    }
    
    return useCase;
  });
};

// Update use case
export const updateUseCase = async (
  id: string,
  input: Partial<CreateUseCaseInput>
) => {
  // Get the use case first to get the applicationId
  const existingUseCase = await db.query.useCases.findFirst({
    where: eq(useCases.id, id),
  });

  if (!existingUseCase) {
    throw new Error('Use case not found');
  }

  return withApplicationTracking(existingUseCase.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const [useCase] = await db
      .update(useCases)
      .set({
        ...input,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(useCases.id, id))
      .returning();

    if (!useCase) {
      throw new Error('Use case not found');
    }

    revalidatePath(`/applications/${useCase.applicationId}`);
    
    try {
      await createAuditEvent({
        tenantId: existingUseCase.tenantId,
        actorUserId: userId,
        action: 'use_case.updated',
        targetType: 'use_case',
        targetId: useCase.id,
        metadata: { update: input },
      });
    } catch (e) {
      console.error('Failed to write audit event (use_case.updated):', e);
    }
    
    return useCase;
  });
};

// Delete use case (hard delete) and cascade delete associated risk
export const deleteUseCase = async (id: string) => {
  // Get the use case first to get the applicationId for revalidation
  const existingUseCase = await db.query.useCases.findFirst({
    where: eq(useCases.id, id),
  });

  if (!existingUseCase) {
    throw new Error('Use case not found');
  }

  return withApplicationTracking(existingUseCase.applicationId, async () => {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    // Cascade delete associated risk first (hard delete)
    await db.delete(risks).where(eq(risks.useCaseId, id));

    // Then delete the use case (hard delete)
    await db.delete(useCases).where(eq(useCases.id, id));

    revalidatePath(`/applications/${existingUseCase.applicationId}`);
    
    try {
      await createAuditEvent({
        tenantId: existingUseCase.tenantId,
        actorUserId: userId,
        action: 'use_case.deleted',
        targetType: 'use_case',
        targetId: id,
      });
    } catch (e) {
      console.error('Failed to write audit event (use_case.deleted):', e);
    }
    
    return { success: true };
  });
};

