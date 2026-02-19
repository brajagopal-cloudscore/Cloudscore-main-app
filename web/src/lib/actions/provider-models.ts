/**
 * Server actions for Provider Models
 * Used for mutations from client components
 */

"use server";

import { db, providerModels, tenants } from "@db";
import { eq, and } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

import { revalidatePath } from "next/cache";
import axios from "axios";
import { headers } from "next/headers";
import { createAuditEvent } from "@/db/tenant";

interface CreateProviderModelInput {
  tenantId?: string; // Optional for global models
  provider: string;
  modelId: string;
  displayName?: string;
  family?: string;
  modality?: string[];
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  supportsStreaming?: boolean;
  supportsJson?: boolean;
  inputCostPer1K?: string;
  outputCostPer1K?: string;
  currency?: string;
  pricingMetadata?: any;
  availabilityStatus?: string;
  // Database fields
  modelUrl?: string;
  purposeUseCase?: string;
  riskLevel?: "Low" | "Medium" | "High" | "N/A";
  category?: "llm" | "3rd_party" | "1st_party";
}

const createProviderModelInternal = async (input: CreateProviderModelInput) => {
  try {
    const { userId, getToken, orgId } = await auth();

    if (!userId || !orgId) {
      return {
        status: false,
        message: "Authentication required",
      };
    }

    const [existingModel] = await db
      .select()
      .from(providerModels)
      .where(
        and(
          eq(providerModels.tenantId, orgId),
          // @ts-ignore
          eq(providerModels.provider, input.provider),
          eq(providerModels.modelId, input.modelId)
        )
      )
      .limit(1);

    if (existingModel) {
      return {
        status: false,
        message: "Model already existing",
      };
    }

    if (input.provider === "huggingface") {
      const modelGuardUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
      if (!modelGuardUrl) {
        // Continue without HF scan if URL is not configured
      } else {
        try {
          const token = await getToken();
          const res = await axios.post(
            `${modelGuardUrl}/modelguard/scan/model`,
            {
              uri: input.modelUrl,
            },
            {
              headers: {
                "x-tenant-id": orgId,
                Authorization: "Bearer " + token,
              },
            }
          );
        } catch (err: any) {
          console.warn("Request Failed", err);
          return {
            status: false,
            message:
              err.response?.data?.detail ||
              err.response?.data?.message ||
              err.message ||
              "Failed to register this model.",
          };
        }
      }
    }

    const [model] = await db
      .insert(providerModels)
      .values({
        ...input,
        tenantId: orgId,
        createdBy: userId,
        updatedBy: userId,
      } as any)
      .returning();

    if (!model) {
      return {
        status: false,
        message: "Failed to create model in database",
      };
    }

    // Log audit event for model creation
    try {
      await createAuditEvent({
        tenantId: orgId,
        actorUserId: userId,
        action: "model.registry.created",
        targetType: "provider_model",
        targetId: model.id,
        metadata: {
          provider: input.provider,
          modelId: input.modelId,
          displayName: input.displayName,
          category: input.category,
          riskLevel: input.riskLevel,
        },
      });
    } catch (auditError) {
      console.error(
        "Failed to log audit event for model creation:",
        auditError
      );
      // Don't fail the main operation if audit logging fails
    }

    revalidatePath("/model-registry");

    return {
      message: "Model registered successfully",
      status: true,
      model,
    };
  } catch (error: any) {
    console.error("[CREATE MODEL ERROR]", error);
    return {
      status: false,
      message: error.message || "An unexpected error occurred",
    };
  }
};

export const createProviderModel = createProviderModelInternal;

export const updateProviderModel = async (
  id: string,
  input: Partial<CreateProviderModelInput>
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const [model] = await db
    .update(providerModels)
    .set({
      ...input,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    } as any)
    .where(eq(providerModels.id, id))
    .returning();

  if (!model) {
    throw new Error("Provider model not found");
  }

  // Log audit event for model update
  try {
    await createAuditEvent({
      tenantId: model.tenantId || "global",
      actorUserId: userId,
      action: "model.registry.updated",
      targetType: "provider_model",
      targetId: model.id,
      metadata: {
        provider: model.provider,
        modelId: model.modelId,
        displayName: model.displayName,
        updatedFields: Object.keys(input),
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event for model update:", auditError);
    // Don't fail the main operation if audit logging fails
  }

  revalidatePath("/model-registry");

  return model;
};

export const deleteProviderModel = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  // Get model info before deletion for audit logging
  const [existingModel] = await db
    .select()
    .from(providerModels)
    .where(eq(providerModels.id, id))
    .limit(1);

  if (!existingModel) {
    throw new Error("Provider model not found");
  }

  const [model] = await db
    .delete(providerModels)
    .where(eq(providerModels.id, id))
    .returning();

  // Log audit event for model deletion
  try {
    await createAuditEvent({
      tenantId: existingModel.tenantId || "global",
      actorUserId: userId,
      action: "model.registry.deleted",
      targetType: "provider_model",
      targetId: existingModel.id,
      metadata: {
        provider: existingModel.provider,
        modelId: existingModel.modelId,
        displayName: existingModel.displayName,
        category: existingModel.category,
      },
    });
  } catch (auditError) {
    console.error("Failed to log audit event for model deletion:", auditError);
    // Don't fail the main operation if audit logging fails
  }

  revalidatePath("/model-registry");

  return { success: true };
};

export const getProviderModelById = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const [model] = await db
    .select()
    .from(providerModels)
    .where(eq(providerModels.id, id))
    .limit(1);

  return model || null;
};
