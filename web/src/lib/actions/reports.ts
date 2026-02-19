/**
 * Server actions for Reports
 */

'use server';

import { db, tenants, applications, useCases, risks } from '@db';
import { eq, and, isNull, sql, ne } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

/**
 * Get summary metrics for reports dashboard
 */
export const getSummaryMetrics = async (tenantSlug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required');
  }

  // Get tenant ID from slug
  const tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
  if (!tenant.length) {
    throw new Error('Tenant not found');
  }

  const tenantId = tenant[0].id;

  // Get total number of applications
  const totalApplications = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(applications)
    .where(
      and(
        eq(applications.tenantId, tenantId),
        isNull(applications.deletedAt),
        ne(applications.status, "Archived")
      )
    );

  // Get total number of use cases
  const totalUseCases = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(useCases)
    .innerJoin(applications, eq(useCases.applicationId, applications.id))
    .where(
      and(
        eq(useCases.tenantId, tenantId),
        eq(applications.tenantId, tenantId),
        isNull(useCases.deletedAt),
        isNull(applications.deletedAt),
        sql`${applications.status} != 'Archived'`
      )
    );

  // Get count by AI system type (agentPatterns)
  const useCasesBySystemType = await db
    .select({
      systemType: sql<string>`unnest(${useCases.agentPatterns})`,
      count: sql<number>`count(*)`,
    })
    .from(useCases)
    .innerJoin(applications, eq(useCases.applicationId, applications.id))
    .where(
      and(
        eq(useCases.tenantId, tenantId),
        eq(applications.tenantId, tenantId),
        isNull(useCases.deletedAt),
        isNull(applications.deletedAt),
        sql`${applications.status} != 'Archived'`
      )
    )
    .groupBy(sql`unnest(${useCases.agentPatterns})`);

  // Format the response
  const systemTypeCounts = {
    'In-house ML': 0,
    'GenAI': 0,
    '3rd Party': 0,
    'Agent': 0,
  };

  // Populate the data from the query results
  useCasesBySystemType.forEach((item) => {
    if (item.systemType in systemTypeCounts) {
      systemTypeCounts[item.systemType as keyof typeof systemTypeCounts] = item.count;
    }
  });

  return {
    success: true,
    data: {
      totalApplications: totalApplications[0]?.count || 0,
      totalUseCases: totalUseCases[0]?.count || 0,
      systemTypeCounts,
    },
  };
};

/**
 * Get use case counts grouped by risk classification
 */
export const getUseCasesByRisk = async (tenantSlug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required');
  }

  // Get tenant ID from slug
  const tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
  if (!tenant.length) {
    throw new Error('Tenant not found');
  }

  const tenantId = tenant[0].id;

  // Get use case counts by risk classification
  // This query counts use cases that have associated risks, grouped by risk level
  const useCasesByRisk = await db
    .select({
      riskLevel: risks.riskLevel,
      useCaseCount: sql<number>`count(distinct ${useCases.id})`,
    })
    .from(useCases)
    .innerJoin(applications, eq(useCases.applicationId, applications.id))
    .innerJoin(risks, eq(useCases.id, risks.useCaseId))
    .where(
      and(
        eq(useCases.tenantId, tenantId),
        eq(applications.tenantId, tenantId),
        isNull(useCases.deletedAt),
        isNull(applications.deletedAt)
      )
    )
    .groupBy(risks.riskLevel);

  // Get total use cases count (including those without risks)
  const totalUseCases = await db
    .select({
      totalCount: sql<number>`count(distinct ${useCases.id})`,
    })
    .from(useCases)
    .innerJoin(applications, eq(useCases.applicationId, applications.id))
    .where(
      and(
        eq(useCases.tenantId, tenantId),
        eq(applications.tenantId, tenantId),
        isNull(useCases.deletedAt),
        isNull(applications.deletedAt)
      )
    );

  // Get use cases without risks
  const useCasesWithoutRisks = await db
    .select({
      count: sql<number>`count(distinct ${useCases.id})`,
    })
    .from(useCases)
    .innerJoin(applications, eq(useCases.applicationId, applications.id))
    .leftJoin(risks, eq(useCases.id, risks.useCaseId))
    .where(
      and(
        eq(useCases.tenantId, tenantId),
        eq(applications.tenantId, tenantId),
        isNull(useCases.deletedAt),
        isNull(applications.deletedAt),
        sql`${risks.id} IS NULL`
      )
    );

  // Format the response to match the frontend expectations
  const riskClassificationData = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    'No Risk': useCasesWithoutRisks[0]?.count || 0,
  };

  // Populate the data from the query results
  useCasesByRisk.forEach((item) => {
    if (item.riskLevel in riskClassificationData) {
      riskClassificationData[item.riskLevel as keyof typeof riskClassificationData] = item.useCaseCount;
    }
  });

  return {
    success: true,
    data: {
      riskClassification: riskClassificationData,
      totalUseCases: totalUseCases[0]?.totalCount || 0,
      summary: {
        withRisks: Object.values(riskClassificationData).reduce((sum, count) =>
          riskClassificationData['No Risk'] === count ? sum : sum + count, 0
        ),
        withoutRisks: riskClassificationData['No Risk'],
      },
    },
  };
};
