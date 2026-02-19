/**
 * Server-side queries for Risks
 * Used in Server Components (SSR)
 */

import { db, risks, useCases } from "@db";
import { eq, desc, sql } from "drizzle-orm";
import { cache } from "react";

// Get all risks for an application
export const getRisksByApplication = cache(async (applicationId: string) => {
  return await db.query.risks.findMany({
    where: eq(risks.applicationId, applicationId),
    with: {
      useCase: true,
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
    orderBy: [desc(risks.createdAt)],
  });
});

// Get single risk with full details
export const getRiskWithDetails = cache(async (riskId: string) => {
  const risk = await db.query.risks.findFirst({
    where: eq(risks.id, riskId),
    with: {
      useCase: {
        with: {
          application: true,
        },
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

  if (!risk) {
    throw new Error("Risk not found");
  }

  return risk;
});

// Get all risks by use case ID
export const getRisksByUseCase = cache(async (useCaseId: string) => {
  return await db.query.risks.findMany({
    where: eq(risks.useCaseId, useCaseId),
    with: {
      useCase: true,
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
    orderBy: [desc(risks.createdAt)],
  });
});

// Get risk by use case ID (deprecated - kept for backward compatibility, returns first risk)
export const getRiskByUseCase = cache(async (useCaseId: string) => {
  const risks = await getRisksByUseCase(useCaseId);
  return risks[0] || null;
});

// Get risk statistics for an application
export const getRiskStats = cache(async (applicationId: string) => {
  const stats = await db
    .select({
      total_risks: sql<number>`count(distinct ${risks.id})`,
      critical_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'Critical' then ${risks.id} end)`,
      high_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'High' then ${risks.id} end)`,
      medium_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'Medium' then ${risks.id} end)`,
      low_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'Low' then ${risks.id} end)`,
      mitigated_risks: sql<number>`count(distinct case when ${risks.mitigationStatus} = 'Completed' then ${risks.id} end)`,
      in_progress_risks: sql<number>`count(distinct case when ${risks.mitigationStatus} = 'In Progress' then ${risks.id} end)`,
      not_started_risks: sql<number>`count(distinct case when ${risks.mitigationStatus} = 'Not Started' then ${risks.id} end)`,
    })
    .from(risks)
    .where(eq(risks.applicationId, applicationId))
    .groupBy(risks.applicationId);

  return (
    stats[0] || {
      total_risks: 0,
      critical_risks: 0,
      high_risks: 0,
      medium_risks: 0,
      low_risks: 0,
      mitigated_risks: 0,
      in_progress_risks: 0,
      not_started_risks: 0,
    }
  );
});

// Get risks with their use case summary
export const getRisksWithSummary = cache(async (applicationId: string) => {
  const risksWithUseCases = await db
    .select({
      id: risks.id,
      riskName: risks.riskName,
      description: risks.description,
      owner: risks.owner,
      severity: risks.severity,
      likelihood: risks.likelihood,
      riskLevel: risks.riskLevel,
      mitigationStatus: risks.mitigationStatus,
      mitigationPlan: risks.mitigationPlan,
      targetDate: risks.targetDate,
      lastReviewDate: risks.lastReviewDate,
      categories: risks.categories,
      createdAt: risks.createdAt,
      updatedAt: risks.updatedAt,
      // Use case info
      useCaseId: useCases.id,
      useCaseFunction: useCases.function,
      useCaseUseCase: useCases.useCase,
    })
    .from(risks)
    .leftJoin(useCases, eq(risks.useCaseId, useCases.id))
    .where(eq(risks.applicationId, applicationId))
    .orderBy(desc(risks.createdAt));

  return risksWithUseCases;
});

// Check if a use case has any risks
export const useCaseHasRisk = cache(async (useCaseId: string) => {
  const foundRisks = await db.query.risks.findMany({
    where: eq(risks.useCaseId, useCaseId),
    columns: {
      id: true,
    },
  });

  return foundRisks.length > 0;
});
