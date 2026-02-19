"use server";

import { getProviderModels } from "@/lib/queries/provider-models";

export async function getProviderModelsForPlayground(tenantId: string) {
  if (!tenantId) {
    return {
      status: false,
      message: "Tenant ID is required",
      models: [],
    };
  }

  try {
    const models = await getProviderModels(tenantId);
    
    const availableModels = models
      .filter((model) => model.availabilityStatus === "available")
      .map((model) => ({
        id: model.id,
        modelId: model.modelId,
        displayName: model.displayName || model.modelId,
        provider: model.provider,
      }))
      .sort((a, b) => {
        if (a.provider !== b.provider) {
          return a.provider.localeCompare(b.provider);
        }
        return a.displayName.localeCompare(b.displayName);
      });

    return {
      status: true,
      models: availableModels,
      message: `Found ${availableModels.length} available models`,
    };
  } catch (error) {
    console.error("Failed to fetch provider models:", error);
    return {
      status: false,
      message: "Failed to fetch models",
      models: [],
    };
  }
}

