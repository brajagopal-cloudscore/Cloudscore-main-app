"use server";

import { db } from "@db";
import { providerModelMetadata } from "@db";
import { eq } from "drizzle-orm";

export async function getModelsByProvider(provider: string) {
  try {
    if (!provider) {
      return {
        status: false,
        message: "Provider is required",
        models: [],
      };
    }

    const models = await db
      .select({
        id: providerModelMetadata.id,
        provider: providerModelMetadata.provider,
        modelId: providerModelMetadata.modelId, // API identifier for auto-fill (may be null if not migrated)
        displayName: providerModelMetadata.displayName,
        contextWindow: providerModelMetadata.contextWindow,
        inputCost: providerModelMetadata.inputCost,
        outputCost: providerModelMetadata.outputCost,
      })
      .from(providerModelMetadata)
      //   @ts-ignore
      .where(eq(providerModelMetadata.provider, provider))
      .orderBy(providerModelMetadata.displayName);

    // Ensure all values are non-null for React controlled inputs
    const sanitizedModels = models.map((m) => ({
      ...m,
      modelId: m.modelId ?? "",
      contextWindow: m.contextWindow ?? "",
      inputCost: m.inputCost ?? "",
      outputCost: m.outputCost ?? "",
    }));

    return {
      status: true,
      models: sanitizedModels,
      message: `Found ${sanitizedModels.length} models for ${provider}`,
    };
  } catch (error) {
    console.error("Failed to fetch models by provider:", error);
    return {
      status: false,
      message: "Failed to fetch models",
      models: [],
    };
  }
}
