/**
 * Server-side queries for Provider Models
 * Organization-approved API models catalog
 */

import { db, providerModels, modelArtifacts } from '@db';
import { eq, and, desc, or, isNull, sql } from 'drizzle-orm';
import { cache } from 'react';

// Get all provider models for a tenant (including global models)
export const getProviderModels = cache(async (tenantId: string) => {
  const models = await db.query.providerModels.findMany({
    where: or(
      eq(providerModels.tenantId, tenantId),
      isNull(providerModels.tenantId) // Include global models
    ),
    orderBy: [desc(providerModels.createdAt)],
  });

  // For each model, try to find matching artifact metadata
  const modelsWithMetadata = await Promise.all(
    models.map(async (model) => {
      if (model.provider === 'huggingface' && model.modelUrl) {
        try {
          // Try to find artifact by matching URL patterns
          const artifact = await db.query.modelArtifacts.findFirst({
            where: and(
              eq(modelArtifacts.source, 'hf'),
              sql`${modelArtifacts.uri} LIKE ${`%${model.modelUrl}%`} OR ${model.modelUrl} LIKE ${`%${modelArtifacts.uri}%`}`
            ),
            columns: {
              artifactMetadata: true,
              detectedFormat: true,
              approvalStatus: true,
            }
          });

          return {
            ...model,
            artifactMetadata: artifact?.artifactMetadata || null,
            detectedFormat: artifact?.detectedFormat || null,
            approvalStatus: artifact?.approvalStatus || null,
          };
        } catch (error) {
          console.error('Error fetching artifact metadata for model:', model.id, error);
          return model;
        }
      }
      return model;
    })
  );

  return modelsWithMetadata;
});

// Get single provider model by ID
export const getProviderModelById = cache(async (modelId: string) => {
  const model = await db.query.providerModels.findFirst({
    where: eq(providerModels.id, modelId),
  });

  if (!model) {
    throw new Error('Provider model not found');
  }

  // Try to find matching artifact metadata for Hugging Face models
  if (model.provider === 'huggingface' && model.modelUrl) {
    try {
      const artifact = await db.query.modelArtifacts.findFirst({
        where: and(
          eq(modelArtifacts.source, 'hf'),
          sql`${modelArtifacts.uri} LIKE ${`%${model.modelUrl}%`} OR ${model.modelUrl} LIKE ${`%${modelArtifacts.uri}%`}`
        ),
        columns: {
          artifactMetadata: true,
          detectedFormat: true,
          approvalStatus: true,
        }
      });

      return {
        ...model,
        artifactMetadata: artifact?.artifactMetadata || null,
        detectedFormat: artifact?.detectedFormat || null,
        approvalStatus: artifact?.approvalStatus || null,
      };
    } catch (error) {
      console.error('Error fetching artifact metadata for model:', model.id, error);
    }
  }

  return model;
});

// Get models by provider (e.g., all OpenAI models)
export const getModelsByProvider = cache(async (tenantId: string, provider: string) => {
  return await db.query.providerModels.findMany({
    where: and(
      or(
        eq(providerModels.tenantId, tenantId),
        isNull(providerModels.tenantId)
      ),
      eq(providerModels.provider, provider as any)
    ),
    orderBy: [desc(providerModels.createdAt)],
  });
});

// Get only tenant-specific models (not global)
export const getTenantModels = cache(async (tenantId: string) => {
  return await db.query.providerModels.findMany({
    where: eq(providerModels.tenantId, tenantId),
    orderBy: [desc(providerModels.createdAt)],
  });
});

