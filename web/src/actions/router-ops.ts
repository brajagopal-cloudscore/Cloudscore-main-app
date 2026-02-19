"use server";

import { auth } from "@clerk/nextjs/server";
import {
  db,
  routerPrompts,
  routerCentroids,
  routerPromptCentroids,
  riskCategories,
  onnxModels,
  riskCategoryLinks,
} from "@db";
import { eq, and, desc, sql, inArray, ilike } from "drizzle-orm";

export interface RouterPrompt {
  id: string;
  tenantId: string;
  prompt: string;
  category?: string | null;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RouterCentroid {
  id: string;
  tenantId: string;
  family: string;
  centroid?: number[] | null;
  threshold?: string | null;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TestPromptResult {
  selectedFamilies: string[];
  allScores: Array<{
    family: string;
    similarity: number;
    selected: boolean;
    reason: string;
  }>;
  latencyMs: number;
}

export async function getRouterPrompts(
  tenantId: string,
  params?: {
    q?: string;
    page?: number;
    limit?: number;
    category?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const searchQuery = params?.q?.trim() || "";
  const categoryFilter = params?.category?.trim() || "";

  const offset = (page - 1) * limit;
  let conditions = [];

  if (searchQuery) {
    conditions.push(ilike(routerPrompts.prompt, `%${searchQuery}%`));
  }

  if (categoryFilter) {
    conditions.push(eq(routerPrompts.category, categoryFilter));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(routerPrompts)
    .where(and(...conditions));

  const total = Number(countResult.count) || 0;
  const totalPages = Math.ceil(total / limit);

  // Get paginated data
  const prompts = await db
    .select()
    .from(routerPrompts)
    .where(and(...conditions))
    .orderBy(desc(routerPrompts.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    data: prompts,
    total,
    totalPages,
    page,
    limit,
  };
}
export async function createRouterPrompt(
  tenantId: string,
  data: {
    prompt: string;
    category?: string;
    metadata?: Record<string, any>;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [prompt] = await db
    .insert(routerPrompts)
    .values({
      prompt: data.prompt,
      category: data.category,
      metadata: data.metadata || {},
    })
    .returning();

  // Auto-link prompt to centroid if category matches
  if (data.category) {
    // First ensure centroid exists for this category
    let centroid = await db
      .select()
      .from(routerCentroids)
      .where(
        and(
          eq(routerCentroids.tenantId, tenantId),
          eq(routerCentroids.family, data.category),
          eq(routerCentroids.isActive, true)
        )
      )
      .limit(1);

    // If no centroid exists, create one
    if (centroid.length === 0) {
      const [newCentroid] = await db
        .insert(routerCentroids)
        .values({
          tenantId,
          family: data.category,
          threshold: "0.3", // Default threshold
          metadata: {
            description: `Auto-created for ${data.category} prompts`,
            auto_created: true,
          },
          createdBy: userId,
        })
        .returning();

      centroid = [newCentroid];
    }

    // Now link the prompt to the centroid
    const existingLink = await db
      .select()
      .from(routerPromptCentroids)
      .where(
        and(
          eq(routerPromptCentroids.promptId, prompt.id),
          eq(routerPromptCentroids.centroidId, centroid[0].id)
        )
      )
      .limit(1);

    if (existingLink.length === 0) {
      // Create link
      await db.insert(routerPromptCentroids).values({
        tenantId,
        promptId: prompt.id,
        centroidId: centroid[0].id,
        weight: "1.0",
        createdBy: userId,
      });
    }
  }

  return prompt;
}

export async function deleteRouterPrompt(tenantId: string, promptId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(routerPrompts).where(and(eq(routerPrompts.id, promptId)));
}

export async function deleteRouterPrompts(
  tenantId: string,
  promptIds: string[]
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(routerPrompts)
    .where(and(inArray(routerPrompts.id, promptIds)));
}

export async function getRouterCentroids(tenantId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const centroids = await db
    .select()
    .from(routerCentroids)
    .where(eq(routerCentroids.tenantId, tenantId))
    .orderBy(routerCentroids.family);

  // Fetch prompt counts for each centroid via junction table
  const centroidsWithCounts = await Promise.all(
    centroids.map(async (centroid) => {
      const links = await db
        .select()
        .from(routerPromptCentroids)
        .where(eq(routerPromptCentroids.centroidId, centroid.id));

      return {
        ...centroid,
        promptCount: links.length,
      };
    })
  );

  return centroidsWithCounts;
}

function _getCategoryColor(slug: string): string {
  const colorMap: Record<string, string> = {
    jailbreak: "red",
    toxicity: "orange",
    pii: "blue",
    privacy: "blue",
    safety: "green",
    security: "red",
    bias: "purple",
    financial: "green",
    legal: "blue",
    sentiment: "purple",
    uncategorized: "gray",
  };

  // Try exact match first
  if (slug in colorMap) {
    return colorMap[slug];
  }

  // Try partial matches
  for (const key in colorMap) {
    if (slug.toLowerCase().includes(key)) {
      return colorMap[key];
    }
  }

  // Default color
  return "gray";
}

async function syncExistingModelsToRiskCategory(familySlug: string) {
  try {
    // Get the risk category ID
    const category = await db
      .select({ id: riskCategories.id })
      .from(riskCategories)
      .where(eq(riskCategories.slug, familySlug))
      .limit(1);

    if (category.length === 0) {
      console.warn(`Risk category ${familySlug} not found for sync`);
      return;
    }

    const categoryId = category[0].id;

    // Find existing ONNX models with this family that aren't linked yet
    const unlinkedModels = await db
      .select({ id: onnxModels.id })
      .from(onnxModels)
      .leftJoin(
        riskCategoryLinks,
        and(
          eq(riskCategoryLinks.entityType, "onnx_model"),
          eq(riskCategoryLinks.entityId, onnxModels.id),
          eq(riskCategoryLinks.categoryId, categoryId)
        )
      )
      .where(
        and(
          eq(onnxModels.isActive, true),
          sql`${onnxModels.family} @> ARRAY[${familySlug}]::text[]`, // Check if family array contains the slug
          sql`${riskCategoryLinks.id} IS NULL` // No existing link
        )
      );

    // Create links for unlinked models
    if (unlinkedModels.length > 0) {
      const linkValues = unlinkedModels.map((model) => ({
        categoryId,
        entityType: "onnx_model" as const,
        entityId: model.id,
      }));

      await db.insert(riskCategoryLinks).values(linkValues);
      console.log(
        `Synced ${unlinkedModels.length} existing models to risk category: ${familySlug}`
      );
    }
  } catch (error) {
    console.error(
      `Error syncing models to risk category ${familySlug}:`,
      error
    );
  }
}

export async function syncAllModelsToRiskCategories(tenantId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get all active ONNX models with families
    const models = await db
      .select({ id: onnxModels.id, family: onnxModels.family })
      .from(onnxModels)
      .where(eq(onnxModels.isActive, true));

    let syncedCount = 0;

    for (const model of models) {
      if (model.family && Array.isArray(model.family)) {
        for (const familySlug of model.family) {
          // Check if risk category exists
          const category = await db
            .select({ id: riskCategories.id })
            .from(riskCategories)
            .where(eq(riskCategories.slug, familySlug))
            .limit(1);

          if (category.length > 0) {
            const categoryId = category[0].id;

            // Check if link already exists
            const existingLink = await db
              .select({ id: riskCategoryLinks.id })
              .from(riskCategoryLinks)
              .where(
                and(
                  eq(riskCategoryLinks.entityType, "onnx_model"),
                  eq(riskCategoryLinks.entityId, model.id),
                  eq(riskCategoryLinks.categoryId, categoryId)
                )
              )
              .limit(1);

            if (existingLink.length === 0) {
              // Create the link
              await db.insert(riskCategoryLinks).values({
                categoryId,
                entityType: "onnx_model",
                entityId: model.id,
              });
              syncedCount++;
            }
          }
        }
      }
    }

    return { syncedCount, totalModels: models.length };
  } catch (error) {
    console.error("Error syncing all models to risk categories:", error);
    throw error;
  }
}

export async function createOrUpdateRouterCentroid(
  tenantId: string,
  data: {
    family: string; // This should match risk_categories.slug
    centroid?: number[];
    threshold?: string;
    metadata?: Record<string, any>;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify the family (risk category) exists, create if it doesn't
  const riskCategory = await db
    .select()
    .from(riskCategories)
    .where(eq(riskCategories.slug, data.family))
    .limit(1);

  if (riskCategory.length === 0) {
    // Auto-create the risk category
    const [newCategory] = await db
      .insert(riskCategories)
      .values({
        name: data.family
          .replace("_", " ")
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: data.family,
        description: `Risk category for ${data.family} detection`,
        severity: "medium",
        tierRecommendation: "T1",
        color: _getCategoryColor(data.family),
        metadata: { auto_created: true },
      })
      .returning();

    console.log(`Auto-created risk category: ${data.family}`);

    // Sync any existing models with this family to the new risk category
    await syncExistingModelsToRiskCategory(data.family);
  }

  const existing = await db
    .select()
    .from(routerCentroids)
    .where(
      and(
        eq(routerCentroids.tenantId, tenantId),
        eq(routerCentroids.family, data.family)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(routerCentroids)
      .set({
        centroid: data.centroid ? JSON.stringify(data.centroid) : null,
        threshold: data.threshold,
        metadata: data.metadata || {},
        updatedBy: userId,
      })
      .where(eq(routerCentroids.id, existing[0].id))
      .returning();

    return updated;
  } else {
    const [created] = await db
      .insert(routerCentroids)
      .values({
        tenantId,
        family: data.family, // This should match risk_categories.slug
        centroid: data.centroid ? JSON.stringify(data.centroid) : null,
        threshold: data.threshold,
        metadata: data.metadata || {},
        createdBy: userId,
      })
      .returning();

    return created;
  }
}

export async function deleteRouterCentroid(
  tenantId: string,
  centroidId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(routerCentroids)
    .where(
      and(
        eq(routerCentroids.id, centroidId),
        eq(routerCentroids.tenantId, tenantId)
      )
    );
}

export async function linkPromptToCentroid(
  tenantId: string,
  data: {
    promptId: string;
    centroidId: string;
    weight?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db
    .select()
    .from(routerPromptCentroids)
    .where(
      and(
        eq(routerPromptCentroids.promptId, data.promptId),
        eq(routerPromptCentroids.centroidId, data.centroidId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(routerPromptCentroids)
      .set({
        weight: data.weight || "1.0",
        isActive: true,
      })
      .where(eq(routerPromptCentroids.id, existing[0].id));
  } else {
    await db.insert(routerPromptCentroids).values({
      tenantId,
      promptId: data.promptId,
      centroidId: data.centroidId,
      weight: data.weight || "1.0",
      createdBy: userId,
    });
  }
}

export async function unlinkPromptFromCentroid(
  tenantId: string,
  linkId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(routerPromptCentroids)
    .set({ isActive: false })
    .where(
      and(
        eq(routerPromptCentroids.id, linkId),
        eq(routerPromptCentroids.tenantId, tenantId)
      )
    );
}

export async function testPromptRouting(
  tenantId: string,
  prompt: string
): Promise<TestPromptResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Call backend API for actual routing test
  const apiUrl =
    process.env.NEXT_PUBLIC_CONTROLNET_API_URL ||
    process.env.CONTROLNET_API_URL ||
    "http://localhost:8000";

  console.log("apiUrl", apiUrl);

  const response = await fetch(`${apiUrl}/v1/router/test-prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
    },
    body: JSON.stringify({
      prompt,
      top_k: 2,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to test prompt routing" }));
    throw new Error(errorData.detail || "Failed to test prompt routing");
  }

  const result = await response.json();
  return result;
}

export async function getRiskCategories() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const categories = await db
    .select()
    .from(riskCategories)
    .orderBy(riskCategories.name);

  if (!Array.isArray(categories)) {
    throw new Error("Invalid database response: expected array");
  }

  return categories;
}

export async function autoLinkExistingPrompts(tenantId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get all prompts that have a category but no link to centroid
  const prompts = await db
    .select()
    .from(routerPrompts)
    .where(and(eq(routerPrompts.isActive, true)));

  let linked = 0;

  for (const prompt of prompts) {
    if (!prompt.category) continue;

    // Find matching centroid
    const centroid = await db
      .select()
      .from(routerCentroids)
      .where(
        and(
          eq(routerCentroids.tenantId, tenantId),
          eq(routerCentroids.family, prompt.category),
          eq(routerCentroids.isActive, true)
        )
      )
      .limit(1);

    if (centroid.length === 0) continue;

    // Check if link exists
    const existingLink = await db
      .select()
      .from(routerPromptCentroids)
      .where(
        and(
          eq(routerPromptCentroids.promptId, prompt.id),
          eq(routerPromptCentroids.centroidId, centroid[0].id)
        )
      )
      .limit(1);

    if (existingLink.length === 0) {
      // Create link
      await db.insert(routerPromptCentroids).values({
        tenantId,
        promptId: prompt.id,
        centroidId: centroid[0].id,
        weight: "1.0",
        createdBy: userId,
      });
      linked++;
    }
  }

  return { linked };
}

export async function createMissingCentroidsForRiskCategories(
  tenantId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get all risk categories
  const categories = await db
    .select()
    .from(riskCategories)
    .orderBy(riskCategories.slug);

  // Get existing centroids
  const existingCentroids = await db
    .select()
    .from(routerCentroids)
    .where(eq(routerCentroids.tenantId, tenantId));

  const existingFamilies = new Set(existingCentroids.map((c) => c.family));
  const created = [];

  // Create centroids for missing risk categories
  for (const category of categories) {
    if (!existingFamilies.has(category.slug)) {
      const [centroid] = await db
        .insert(routerCentroids)
        .values({
          tenantId,
          family: category.slug, // This matches risk_categories.slug
          threshold: "0.3", // Default threshold
          metadata: {
            description: category.description,
            auto_created: true,
          },
          createdBy: userId,
        })
        .returning();

      created.push(centroid);
    }
  }

  return { created: created.length, centroids: created };
}
