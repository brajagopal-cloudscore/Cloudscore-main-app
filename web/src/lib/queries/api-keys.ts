/**
 * Server-side queries for API Keys
 */

import { db, apiKeys } from "@db";
import { eq, and, desc, isNull } from "drizzle-orm";
import { cache } from "react";

// Get all API keys for a tenant
export const getApiKeys = cache(async (tenantId: string) => {
  return await db.query.apiKeys.findMany({
    where: eq(apiKeys.tenantId, tenantId),
    with: {
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      user_revokedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(apiKeys.createdAt)],
  });
});

// Get single API key by ID
export const getApiKeyById = cache(async (keyId: string) => {
  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.id, keyId),
  });

  if (!key) {
    throw new Error("API key not found");
  }

  return key;
});

// Get active API keys only
export const getActiveApiKeys = cache(async (tenantId: string) => {
  return await db.query.apiKeys.findMany({
    where: and(
      eq(apiKeys.tenantId, tenantId),
      eq(apiKeys.isActive, true),
      isNull(apiKeys.revokedAt)
    ),
    orderBy: [desc(apiKeys.createdAt)],
  });
});
