/**
 * Server-side queries for Use Cases
 * Used in Server Components (SSR)
 */

import { db, useCases, risks, applications } from "@db";
import { eq, and, desc, isNull } from "drizzle-orm";
import { cache } from "react";

// Get all use cases for an application
export const getUseCases = cache(async (applicationId: string) => {
  return await db.query.useCases.findMany({
    where: and(
      eq(useCases.applicationId, applicationId),
      isNull(useCases.deletedAt)
    ),
    with: {
      application: {
        columns: {
          id: true,
          name: true,
        },
      },
      risks: {
        orderBy: [desc(risks.riskLevel)],
      },
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
    orderBy: [desc(useCases.createdAt)],
  });
});

// Get single use case with details
export const getUseCaseWithDetails = cache(async (useCaseId: string) => {
  const useCase = await db.query.useCases.findFirst({
    where: eq(useCases.id, useCaseId),
    with: {
      application: true,
      risks: {
        orderBy: [desc(risks.riskLevel)],
      },
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
  });

  if (!useCase) {
    throw new Error("Use case not found");
  }

  return useCase;
});
