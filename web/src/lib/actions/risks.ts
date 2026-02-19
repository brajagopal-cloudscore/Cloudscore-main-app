/**
 * Server actions for Risks
 * Used for mutations from client components
 */

"use server";

import { db, risks, tenants, applications, riskList } from "@db";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { withApplicationTracking } from "@/lib/utils/application-tracking";
import { createAuditEvent } from "@/lib/server/audit";
import { input } from "@nextui-org/react";

interface CreateRiskInput {
  tenantId: string;
  applicationId: string;
  useCaseId?: string;
  riskName: string;
  description?: string;
  owner: string;
  severity: "Minor" | "Moderate" | "Major" | "Catastrophic";
  likelihood: "Rare" | "Unlikely" | "Possible" | "Likely";
  riskLevel: "Low" | "Medium" | "High";
  mitigationStatus?:
    | "Not Started"
    | "In Progress"
    | "Requires Review"
    | "Completed";
  controlOwner: string | null;
  mitigationPlan?: string;
  targetDate?: string;
  lastReviewDate?: string;
  categories?: string[];
  metadata?: Record<string, any>;
}

interface UpdateRiskInput extends Partial<CreateRiskInput> {
  id: string;
}

// Create risk
export const createRisk = async (input: CreateRiskInput) => {
  return withApplicationTracking(input.applicationId, async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Authentication required");
    }

    const [risk] = await db
      .insert(risks)
      .values({
        ...input,
        mitigationStatus: input.mitigationStatus || "Not Started",
        categories: input.categories || [],
        metadata: input.metadata || {},
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    revalidatePath(`/applications/${input.applicationId}`);

    console.log("risk", risk);
    try {
      console.log("creating audit event");
      await createAuditEvent({
        tenantId: input.tenantId,
        actorUserId: userId,
        action: "risk.created",
        targetType: "risk",
        targetId: risk.id,
        metadata: { applicationId: input.applicationId, name: input.riskName },
      });
    } catch (e) {
      console.error("Failed to write audit event (risk.created):", e);
    }

    return risk;
  });
};

// Update risk
export const updateRisk = async (input: UpdateRiskInput) => {
  // Get the risk first to get the applicationId
  const existingRisk = await db.query.risks.findFirst({
    where: eq(risks.id, input.id),
  });

  if (!existingRisk) {
    throw new Error("Risk not found");
  }

  return withApplicationTracking(existingRisk.applicationId, async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Authentication required");
    }

    const { id, ...updateData } = input;

    const [risk] = await db
      .update(risks)
      .set({
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(risks.id, id))
      .returning();

    if (!risk) {
      throw new Error("Risk not found");
    }

    revalidatePath(`/applications/${risk.applicationId}`);

    try {
      await createAuditEvent({
        tenantId: existingRisk.tenantId,
        actorUserId: userId,
        action: "risk.updated",
        targetType: "risk",
        targetId: risk.id,
        metadata: { update: updateData },
      });
    } catch (e) {
      console.error("Failed to write audit event (risk.updated):", e);
    }

    return risk;
  });
};

// Delete risk (hard delete)
export const deleteRisk = async (id: string) => {
  // Get the risk first to get the applicationId
  const existingRisk = await db.query.risks.findFirst({
    where: eq(risks.id, id),
  });

  if (!existingRisk) {
    throw new Error("Risk not found");
  }

  return withApplicationTracking(existingRisk.applicationId, async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Authentication required");
    }

    await db.delete(risks).where(eq(risks.id, id));

    revalidatePath(`/applications/${existingRisk.applicationId}`);

    try {
      await createAuditEvent({
        tenantId: existingRisk.tenantId,
        actorUserId: userId,
        action: "risk.deleted",
        targetType: "risk",
        targetId: id,
      });
    } catch (e) {
      console.error("Failed to write audit event (risk.deleted):", e);
    }

    return { success: true };
  });
};

// Get all risks by use case ID
export const getRisksByUseCase = async (useCaseId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const risksData = await db.query.risks.findMany({
    where: eq(risks.useCaseId, useCaseId),
    with: {
      useCase: true,
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      user_updatedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (risks, { desc }) => [desc(risks.createdAt)],
  });

  return risksData;
};

// Get risk by use case ID (deprecated - kept for backward compatibility, returns first risk)
export const getRiskByUseCase = async (useCaseId: string) => {
  const risks = await getRisksByUseCase(useCaseId);
  return risks[0] || null;
};

// Get all risks for an application, optionally filtered by use case
export const getRisksByApplication = async (
  tenantSlugOrId: string,
  applicationId: string,
  useCaseId?: string
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  // Try to find tenant by ID first, then by slug
  let tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantSlugOrId))
    .limit(1);
  if (!tenantRow.length) {
    tenantRow = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlugOrId))
      .limit(1);
  }
  if (!tenantRow.length) throw new Error("Tenant not found");
  const tenantId = tenantRow[0].id;

  // Verify application exists and belongs to tenant
  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, applicationId),
      eq(applications.tenantId, tenantId),
      isNull(applications.deletedAt)
    ),
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Build where conditions
  const conditions = [eq(risks.applicationId, applicationId)];

  // If useCaseId is provided, filter by it as well
  if (useCaseId) {
    conditions.push(eq(risks.useCaseId, useCaseId));
  }

  // Get risks for the application (and optionally filtered by use case)
  const risksData = await db.query.risks.findMany({
    where: and(...conditions),
    with: {
      useCase: true,
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      user_updatedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (risks, { desc }) => [desc(risks.createdAt)],
  });

  return risksData;
};

// Get risk list items (templates from database)
export const getRiskListItems = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const riskListItems = await db
    .select()
    .from(riskList)
    .orderBy(riskList.riskName);

  return riskListItems;
};
