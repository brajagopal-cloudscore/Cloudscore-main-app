// src/lib/api-key-manager.ts
import crypto from "crypto";
import { db, apiKeys } from "@db";
import { eq, and } from "drizzle-orm";

const API_KEY_PREFIX = "sk_";
const API_KEY_LENGTH = 32;

/**
 * Generate a cryptographically secure API key
 * Format: sk_live_<random_string> or sk_test_<random_string>
 */
export function generateApiKey(environment: "live" | "test" = "live"): {
  plainKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  const randomBytes = crypto.randomBytes(API_KEY_LENGTH);
  const randomString = randomBytes.toString("base64url");
  const plainKey = `${API_KEY_PREFIX}${environment}_${randomString}`;

  // Hash the key using SHA-256
  const keyHash = crypto.createHash("sha256").update(plainKey).digest("hex");

  // Store first 12 chars as prefix for identification
  const keyPrefix = plainKey.substring(0, 12);

  return {
    plainKey,
    keyHash,
    keyPrefix,
  };
}

/**
 * Hash an API key for lookup
 */
export function hashApiKey(plainKey: string): string {
  return crypto.createHash("sha256").update(plainKey).digest("hex");
}

/**
 * Create a new API key for a tenant
 */
export async function createApiKey(params: {
  tenantId: string;
  name: string;
  createdBy: string;
  permissions?: string[];
  rateLimitPerMinute?: number;
  expiresAt?: Date;
  environment?: "live" | "test";
}) {
  const { plainKey, keyHash, keyPrefix } = generateApiKey(params.environment);

  const [newKey] = await db
    .insert(apiKeys)
    .values({
      tenantId: params.tenantId,
      name: params.name,
      keyHash,
      keyPrefix,
      createdBy: params.createdBy,
      permissions: params.permissions || [],
      rateLimitPerMinute: params.rateLimitPerMinute,
      expiresAt: params.expiresAt?.toISOString(),
      isActive: true,
    })
    .returning();

  return {
    ...newKey,
    plainKey, // Only return plain key once during creation
  };
}

/**
 * Validate an API key and return tenant context
 */
export async function validateApiKey(plainKey: string): Promise<{
  isValid: boolean;
  tenantId?: string;
  permissions?: string[];
  rateLimitPerMinute?: number;
  apiKeyId?: string;
} | null> {
  const keyHash = hashApiKey(plainKey);

  const apiKey = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, keyHash),
    with: {
      tenant: true,
    },
  });

  if (!apiKey) {
    return { isValid: false };
  }

  // Check if key is active
  if (!apiKey.isActive) {
    return { isValid: false };
  }

  // Check if key is expired
  if (apiKey.expiresAt) {
    const expiryDate = new Date(apiKey.expiresAt);
    if (expiryDate < new Date()) {
      return { isValid: false };
    }
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiKeys.id, apiKey.id));

  return {
    isValid: true,
    tenantId: apiKey.tenantId,
    permissions: apiKey.permissions,
    rateLimitPerMinute: apiKey.rateLimitPerMinute || undefined,
    apiKeyId: apiKey.id,
  };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(apiKeyId: string, revokedBy: string) {
  await db
    .update(apiKeys)
    .set({
      isActive: false,
      revokedBy,
      revokedAt: new Date().toISOString(),
    })
    .where(eq(apiKeys.id, apiKeyId));
}

/**
 * List API keys for a tenant (without exposing full keys)
 */
export async function listTenantApiKeys(tenantId: string) {
  return await db.query.apiKeys.findMany({
    where: eq(apiKeys.tenantId, tenantId),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
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
  });
}

/**
 * Rotate an API key (create new one and revoke old one)
 */
export async function rotateApiKey(params: {
  oldKeyId: string;
  tenantId: string;
  name: string;
  createdBy: string;
  permissions?: string[];
  environment?: "live" | "test";
}) {
  // Create new key
  const newKey = await createApiKey({
    tenantId: params.tenantId,
    name: params.name,
    createdBy: params.createdBy,
    permissions: params.permissions,
    environment: params.environment,
  });

  // Revoke old key
  await revokeApiKey(params.oldKeyId, params.createdBy);

  return newKey;
}
