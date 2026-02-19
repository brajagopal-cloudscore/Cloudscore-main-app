"use server";

import { auth } from "@clerk/nextjs/server";
import {
  db,
  onnxModels,
  guardrails,
  riskCategories,
  riskCategoryLinks,
} from "@db";
import { eq, and, desc, like } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface OnnxModel {
  id: string;
  modelId: string;
  name: string;
  description?: string | null;
  modelType: string;
  family: string[];
  version: string;
  fileSize?: number | null;
  avgInferenceMs?: string | null;
  p50Ms?: string | null;
  p95Ms?: string | null;
  auroc?: string | null;
  supportedLanguages?: string[] | null;
  costTier?: string | null;
  storageUrl?: string | null;
  metadata?: Record<string, any> | null | unknown;
  isActive: boolean;
  createdAt: string;
  visibility?: "shared" | "tenant";
}

/**
 * Get ONNX models for a tenant
 * Returns both shared models (global) and tenant-specific models
 */
export async function getOnnxModels(tenantId?: string): Promise<OnnxModel[]> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const allModels = await db
      .select()
      .from(onnxModels)
      .where(eq(onnxModels.isActive, true))
      .orderBy(desc(onnxModels.createdAt));

    // Filter by visibility - show shared models and tenant-specific models
    const filteredModels: OnnxModel[] = [];

    for (const model of allModels) {
      let metadata = model.metadata as Record<string, any> | null;

      // Handle case where metadata might be a JSON string
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          console.warn(
            "[getOnnxModels] Failed to parse metadata as JSON:",
            metadata
          );
          metadata = {};
        }
      }

      // Get risk categories for this model (use risk_category_links instead of legacy family field)
      let familyArray = model.family || [];

      try {
        const categoryLinks = await db
          .select({ slug: riskCategories.slug })
          .from(riskCategoryLinks)
          .innerJoin(
            riskCategories,
            eq(riskCategoryLinks.categoryId, riskCategories.id)
          )
          .where(
            and(
              eq(riskCategoryLinks.entityType, "onnx_model"),
              eq(riskCategoryLinks.entityId, model.id)
            )
          );

        if (categoryLinks.length > 0) {
          familyArray = categoryLinks.map((link) => link.slug);
        }
      } catch (e) {
        // Fallback to legacy family field
      }

      //  removed filteration of model based on tenant level as this will only be used by kentron users
      filteredModels.push({
        ...model,
        visibility: "tenant",
        metadata,
        family: familyArray,
      });
    }

    console.log(filteredModels);
    console.log(
      `[getOnnxModels] tenantId: ${tenantId}, total models in DB: ${allModels.length}, filtered: ${filteredModels.length}`
    );

    // Log first model details if any exist for debugging
    if (allModels.length > 0 && filteredModels.length === 0) {
      const firstModel = allModels[0];
      const metadata = firstModel.metadata as Record<string, any> | null;
      console.log(
        `[getOnnxModels] First model metadata.tenant_id: ${metadata?.tenant_id}, requesting tenantId: ${tenantId}`
      );
    }

    return filteredModels;
  } catch (error) {
    console.error("[getOnnxModels] Error:", error);
    throw error;
  }
}

export async function createOnnxModel(data: {
  modelId: string;
  name: string;
  description?: string;
  modelType: string;
  version: string;
  fileSize?: number;
  storageUrl?: string;
  supportedLanguages?: string[];
  costTier?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [model] = await db
    .insert(onnxModels)
    .values({
      modelId: data.modelId,
      name: data.name,
      description: data.description,
      modelType: data.modelType,
      version: data.version,
      fileSize: data.fileSize,
      storageUrl: data.storageUrl,
      supportedLanguages: data.supportedLanguages || ["en"],
      costTier: data.costTier,
    })
    .returning();

  return model;
}

export async function deleteOnnxModel(modelId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(onnxModels)
    .set({ isActive: false })
    .where(eq(onnxModels.modelId, modelId));
}

export async function updateOnnxModel(
  modelId: string,
  updates: {
    name?: string;
    description?: string;
    modelType?: string;
    family?: string[];
    metadata?: Record<string, any>;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [updated] = await db
    .update(onnxModels)
    .set({
      name: updates.name,
      description: updates.description,
      modelType: updates.modelType,
      family: updates.family,
      metadata: updates.metadata || {},
    })
    .where(eq(onnxModels.modelId, modelId))
    .returning();

  // Update risk_category_links if family changed
  if (updates.family && updated) {
    // Get the model ID (uuid)
    const modelRecord = await db
      .select({ id: onnxModels.id })
      .from(onnxModels)
      .where(eq(onnxModels.modelId, modelId))
      .limit(1);

    if (modelRecord.length > 0) {
      const modelUuid = modelRecord[0].id;

      // Delete old links
      await db
        .delete(riskCategoryLinks)
        .where(
          and(
            eq(riskCategoryLinks.entityType, "onnx_model"),
            eq(riskCategoryLinks.entityId, modelUuid)
          )
        );

      // Create new links for each family
      const linkPromises = updates.family.map(async (familySlug) => {
        // Find risk category by slug
        const categories = await db
          .select()
          .from(riskCategories)
          .where(eq(riskCategories.slug, familySlug))
          .limit(1);

        if (categories.length > 0) {
          await db.insert(riskCategoryLinks).values({
            categoryId: categories[0].id,
            entityType: "onnx_model",
            entityId: modelUuid,
          });
        }
      });

      await Promise.all(linkPromises);
    }
  }

  return updated;
}

export async function getGuardrailsByFamily(family: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const guards = await db
    .select()
    .from(guardrails)
    .where(and(eq(guardrails.family, family), eq(guardrails.isEnabled, true)));

  return guards;
}

export async function linkModelToGuardrail(
  guardrailId: string,
  modelId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(guardrails)
    .set({
      onnxModelId: modelId,
      requiresOnnx: true,
      updatedBy: userId,
    })
    .where(eq(guardrails.id, guardrailId));
}

export async function searchModels(query: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const models = await db
    .select()
    .from(onnxModels)
    .where(
      and(like(onnxModels.name, `%${query}%`), eq(onnxModels.isActive, true))
    )
    .limit(10);

  return models;
}
