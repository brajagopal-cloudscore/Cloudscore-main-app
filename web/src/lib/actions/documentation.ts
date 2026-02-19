/**
 * Server actions for Application Documentation
 */

"use server";

import { db, applicationDocumentation, applications, tenants } from "@db";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { updateApplicationTimestamp } from "@/lib/utils/application-tracking";
import { revalidatePath } from "next/cache";
import { createAuditEvent } from "@/lib/server/audit";

export interface GetDocumentationInput {
  tenantId: string;
  applicationId: string;
  sectionType?: string;
  riskId: string | null;
}

export const getDocumentation = async (input: GetDocumentationInput) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");
  if (!input.riskId) {
    input.riskId = "";
  }
  // Try to find tenant by ID first, then by slug
  let tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, input.tenantId))
    .limit(1);
  if (!tenantRow.length) {
    tenantRow = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, input.tenantId))
      .limit(1);
  }
  if (!tenantRow.length) throw new Error("Tenant not found");
  const tenantId = tenantRow[0].id;

  // Verify application belongs to tenant
  const app = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, input.applicationId),
        eq(applications.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!app.length) throw new Error("Application not found");

  const riskCondition = input.riskId
    ? eq(applicationDocumentation.riskId, input.riskId)
    : isNull(applicationDocumentation.riskId);
  const conditions = [
    riskCondition,
    eq(applicationDocumentation.tenantId, tenantId),
    eq(applicationDocumentation.applicationId, input.applicationId),
  ];

  if (input.sectionType) {
    conditions.push(
      eq(applicationDocumentation.sectionType, input.sectionType as any)
    );
  }

  const docs = await db
    .select()
    .from(applicationDocumentation)
    .where(and(...(conditions as any)));
  return docs;
};

export interface UpsertDocumentationField {
  fieldKey: string;
  fieldTitle: string;
  content?: string;
  status?: string;
  priority?: string;
  files?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface UpsertDocumentationInput {
  tenantId: string;
  applicationId: string;
  riskId: string | null;
  sectionType: string;
  fields: UpsertDocumentationField[];
}

export const upsertDocumentation = async (input: UpsertDocumentationInput) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");

  // Try to find tenant by ID first, then by slug
  let tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, input.tenantId))
    .limit(1);
  if (!tenantRow.length) {
    tenantRow = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, input.tenantId))
      .limit(1);
  }
  if (!tenantRow.length) throw new Error("Tenant not found");
  const tenantId = tenantRow[0].id;

  // Verify application belongs to tenant
  const app = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, input.applicationId),
        eq(applications.tenantId, tenantId)
      )
    )
    .limit(1);
  if (!app.length) throw new Error("Application not found");

  if (!input.sectionType || !input.fields) {
    throw new Error("sectionType and fields are required");
  }

  const results: any[] = [];
  for (const field of input.fields) {
    if (!field.fieldKey || !field.fieldTitle) continue;

    const STATUS_VALUES = ["Not started", "In Progress", "Done"] as const;
    type StatusValue = (typeof STATUS_VALUES)[number];
    const PRIORITY_VALUES = [
      "low priority",
      "medium priority",
      "high priority",
    ] as const;
    type PriorityValue = (typeof PRIORITY_VALUES)[number];

    const normalizedStatus: StatusValue = STATUS_VALUES.includes(
      field.status as any
    )
      ? (field.status as StatusValue)
      : "Not started";

    const normalizedPriority: PriorityValue = PRIORITY_VALUES.includes(
      field.priority as any
    )
      ? (field.priority as PriorityValue)
      : "medium priority";

    const riskCondition = input.riskId
      ? eq(applicationDocumentation.riskId, input.riskId)
      : isNull(applicationDocumentation.riskId);
    const existing = await db
      .select()
      .from(applicationDocumentation)
      .where(
        and(
          riskCondition,
          eq(applicationDocumentation.applicationId, input.applicationId),
          eq(applicationDocumentation.sectionType, input.sectionType as any),
          eq(applicationDocumentation.fieldKey, field.fieldKey)
        )
      )
      .limit(1);

    if (existing.length) {
      const [updated] = await db
        .update(applicationDocumentation)
        .set({
          content: field.content || "",
          status: normalizedStatus,
          priority: normalizedPriority,
          files: field.files || [],
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(applicationDocumentation.id, existing[0].id))
        .returning();
      results.push(updated);
    } else {
      const [inserted] = await db
        .insert(applicationDocumentation)
        .values({
          tenantId: tenantId,
          applicationId: input.applicationId,
          riskId: input.riskId,
          sectionType: input.sectionType as any,
          fieldKey: field.fieldKey,
          fieldTitle: field.fieldTitle,
          content: field.content || "",
          status: normalizedStatus,
          priority: normalizedPriority,
          files: field.files || [],
          metadata: field.metadata || {},
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();
      results.push(inserted);
    }
  }

  await updateApplicationTimestamp(input.applicationId, userId);
  revalidatePath(`/applications/${input.applicationId}`);

  try {
    await createAuditEvent({
      tenantId: tenantId,
      actorUserId: userId,
      action: "documentation.upserted",
      targetType: "application",
      targetId: input.applicationId,
      metadata: {
        sectionType: input.sectionType,
        fields: input.fields.map((f) => f.fieldKey),
      },
    });
  } catch (e) {
    console.error("Failed to write audit event (documentation.upserted):", e);
  }

  return { success: true, documentation: results };
};
