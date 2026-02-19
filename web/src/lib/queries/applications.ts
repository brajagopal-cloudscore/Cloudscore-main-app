/**
 * Server-side queries for Applications
 * Used in Server Components (SSR)
 */

import {
  db,
  applications,
  applicationPolicies,
  risks,
  useCases,
  redTeamingTests,
  euAiActAssessments,
  users,
} from "@db";
import { eq, and, desc, sql, isNull, ne, or, ilike } from "drizzle-orm";
import { cache } from "react";

// Get all applications for a tenant
export const getApplications = cache(async (tenantId: string) => {
  return await db.query.applications.findMany({
    where: and(
      eq(applications.tenantId, tenantId),
      isNull(applications.deletedAt),
      ne(applications.status, "Archived")
    ),
    orderBy: [desc(applications.createdAt)],
  });
});

// Get application base data with users
const getApplicationBase = cache(async (applicationId: string) => {
  return await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
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
});

// Get application governance data (use cases, risks, documentation, models)
const getApplicationGovernanceData = cache(async (applicationId: string) => {
  return await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      useCases: {
        with: {
          risks: true,
        },
      },
      risks: {
        orderBy: [desc(risks.riskLevel)],
      },
      applicationDocumentations: true,
      applicationModels: true,
      stakeholders: true,
    },
  });
});

// Get application security policies with guardrails
const getApplicationPoliciesData = cache(async (applicationId: string) => {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      applicationPolicies: {
        with: {
          policy: {
            with: {
              policyGuardrails: {
                with: {
                  guardrail: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return app;
});

// Get application datasets, tests, and assessments
const getApplicationAssessmentData = cache(async (applicationId: string) => {
  return await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      datasets: true,
      redTeamingTests: {
        orderBy: [desc(redTeamingTests.testedAt)],
        limit: 10,
      },
      complianceAssessments: true,
      euAiActAssessments: {
        orderBy: [desc(euAiActAssessments.assessmentDate)],
        limit: 1,
      },
    },
  });
});

// Get single application with full details
// API Contract: Returns application with all base fields (id, name, description, status, tenantId, etc.)
// plus all relations: createdByUser, updatedByUser, useCases, risks, stakeholders,
// applicationPolicies, datasets, redTeamingTests, etc.

export const getApplicationMetadata = cache(async (applicationId: string) => {
  return await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    columns: {
      tenantId: true,
      goviqEnabled: true,
      controlnetEnabled: true,
    },
  });
});

export const getApplicationWithDetails = cache(
  async (applicationId: string) => {
    const [base, governance, policies, assessments] = await Promise.all([
      getApplicationBase(applicationId),
      getApplicationGovernanceData(applicationId),
      getApplicationPoliciesData(applicationId),
      getApplicationAssessmentData(applicationId),
    ]);

    if (!base || !governance || !policies || !assessments) {
      throw new Error("Application not found");
    }

    // Combine base fields with all relation arrays
    // Base includes: id, name, description, status, goviqEnabled, controlnetEnabled,
    // tenantId, createdAt, updatedAt, createdBy, updatedBy, deletedAt + createdByUser, updatedByUser
    return {
      ...base,
      useCases: governance.useCases,
      risks: governance.risks,
      applicationDocumentations: governance.applicationDocumentations,
      applicationModels: governance.applicationModels,
      stakeholders: governance.stakeholders,
      applicationPolicies: policies.applicationPolicies,
      datasets: assessments.datasets,
      redTeamingTests: assessments.redTeamingTests,
      complianceAssessments: assessments.complianceAssessments,
      euAiActAssessments: assessments.euAiActAssessments,
    };
  }
);

// Get application statistics (for dashboards)
export const getApplicationStats = cache(async (applicationId: string) => {
  const stats = await db
    .select({
      total_use_cases: sql<number>`count(distinct ${useCases.id})`,
      total_risks: sql<number>`count(distinct ${risks.id})`,
      critical_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'Critical' then ${risks.id} end)`,
      high_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'High' then ${risks.id} end)`,
      mitigated_risks: sql<number>`count(distinct case when ${risks.mitigationStatus} = 'Completed' then ${risks.id} end)`,
      active_policies: sql<number>`count(distinct case when ${applicationPolicies.isActive} = true then ${applicationPolicies.policyId} end)`,
      active_guardrails: sql<number>`0`,
    })
    .from(applications)
    .leftJoin(useCases, eq(useCases.applicationId, applications.id))
    .leftJoin(risks, eq(risks.applicationId, applications.id))
    .leftJoin(
      applicationPolicies,
      eq(applicationPolicies.applicationId, applications.id)
    )
    .where(eq(applications.id, applicationId))
    .groupBy(applications.id);

  return (
    stats[0] || {
      total_use_cases: 0,
      total_risks: 0,
      critical_risks: 0,
      high_risks: 0,
      mitigated_risks: 0,
      active_policies: 0,
      active_guardrails: 0,
    }
  );
});
import { alias } from "drizzle-orm/pg-core";
export const getApplicationsWithSummary = cache(async (tenantId: string) => {
  // Create aliases for the users table to join twice
  const createdByUser = alias(users, "createdByUser");
  const updatedByUser = alias(users, "updatedByUser");

  const appsWithStats = await db
    .select({
      id: applications.id,
      name: applications.name,
      slug: applications.slug,
      description: applications.description,
      status: applications.status,
      goviqEnabled: applications.goviqEnabled,
      controlnetEnabled: applications.controlnetEnabled,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      createdBy: applications.createdBy,
      updatedBy: applications.updatedBy,
      // User details
      createdByName: createdByUser.name,
      createdByEmail: createdByUser.email,
      updatedByName: updatedByUser.name,
      updatedByEmail: updatedByUser.email,
      // Aggregate stats
      use_cases: sql<number>`count(distinct ${useCases.id})`.as("use_cases"),
      risks: sql<number>`count(distinct ${risks.id})`.as("risks"),
      critical_risks:
        sql<number>`count(distinct case when ${risks.riskLevel} = 'Critical' then ${risks.id} end)`.as(
          "critical_risks"
        ),
      mitigated_risks:
        sql<number>`count(distinct case when ${risks.mitigationStatus} = 'Completed' then ${risks.id} end)`.as(
          "mitigated_risks"
        ),
      active_policies:
        sql<number>`count(distinct case when ${applicationPolicies.isActive} = true then ${applicationPolicies.policyId} end)`.as(
          "active_policies"
        ),
    })
    .from(applications)
    .leftJoin(useCases, eq(useCases.applicationId, applications.id))
    .leftJoin(risks, eq(risks.applicationId, applications.id))
    .leftJoin(createdByUser, eq(applications.createdBy, createdByUser.id))
    .leftJoin(updatedByUser, eq(applications.updatedBy, updatedByUser.id))
    .leftJoin(
      applicationPolicies,
      eq(applicationPolicies.applicationId, applications.id)
    )
    .where(
      and(
        eq(applications.tenantId, tenantId),
        isNull(applications.deletedAt),
        ne(applications.status, "Archived")
      )
    )
    .groupBy(
      applications.id,
      createdByUser.id,
      createdByUser.name,
      createdByUser.email,
      updatedByUser.id,
      updatedByUser.name,
      updatedByUser.email
    )
    .orderBy(desc(applications.createdAt));

  return appsWithStats.map((app) => ({
    ...app,
    createdByUser: app.createdByName
      ? {
          name: app.createdByName,
          email: app.createdByEmail,
        }
      : null,
    updatedByUser: app.updatedByName
      ? {
          name: app.updatedByName,
          email: app.updatedByEmail,
        }
      : null,
    stats: {
      use_cases: Number(app.use_cases) || 0,
      risks: Number(app.risks) || 0,
      critical_risks: Number(app.critical_risks) || 0,
      mitigated_risks: Number(app.mitigated_risks) || 0,
      active_policies: Number(app.active_policies) || 0,
    },
  }));
});

// Get archived applications with summary (supports optional DB-level pagination)
export const getArchivedApplications = cache(
  async (
    tenantId: string,
    searchTerm?: string,
    page?: number,
    pageSize?: number
  ) => {
    const conditions = [
      eq(applications.tenantId, tenantId),
      isNull(applications.deletedAt),
      eq(applications.status, "Archived"),
    ];

    // Add search condition if search term is provided
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          ilike(applications.name, term),
          ilike(applications.description, term)
        )
      );
    }

    let query = db
      .select({
        id: applications.id,
        name: applications.name,
        slug: applications.slug,
        description: applications.description,
        status: applications.status,
        goviqEnabled: applications.goviqEnabled,
        controlnetEnabled: applications.controlnetEnabled,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        updatedBy: applications.updatedBy,
        deletedAt: applications.deletedAt,
        archivedByName: users.name,
        archivedByEmail: users.email,
        // Aggregate stats
        use_cases: sql<number>`count(distinct ${useCases.id})`.as("use_cases"),
        risks: sql<number>`count(distinct ${risks.id})`.as("risks"),
        critical_risks:
          sql<number>`count(distinct case when ${risks.riskLevel} = 'Critical' then ${risks.id} end)`.as(
            "critical_risks"
          ),
        mitigated_risks:
          sql<number>`count(distinct case when ${risks.mitigationStatus} = 'Completed' then ${risks.id} end)`.as(
            "mitigated_risks"
          ),
        active_policies:
          sql<number>`count(distinct case when ${applicationPolicies.isActive} = true then ${applicationPolicies.policyId} end)`.as(
            "active_policies"
          ),
      })
      .from(applications)
      .leftJoin(useCases, eq(useCases.applicationId, applications.id))
      .leftJoin(risks, eq(risks.applicationId, applications.id))
      .leftJoin(
        applicationPolicies,
        eq(applicationPolicies.applicationId, applications.id)
      )
      .leftJoin(users, eq(users.id, applications.updatedBy))
      .where(and(...conditions))
      .groupBy(
        applications.id,
        applications.updatedBy,
        users.id,
        users.name,
        users.email
      )
      .orderBy(desc(applications.updatedAt));

    if (page && pageSize) {
      const offset = Math.max(0, (page - 1) * pageSize);
      // @ts-expect-error drizzle chain typing
      query = query.limit(pageSize).offset(offset);
    }

    const appsWithStats = await query;

    return appsWithStats.map((app) => ({
      ...app,
      stats: {
        use_cases: Number(app.use_cases) || 0,
        risks: Number(app.risks) || 0,
        critical_risks: Number(app.critical_risks) || 0,
        mitigated_risks: Number(app.mitigated_risks) || 0,
        active_policies: Number(app.active_policies) || 0,
      },
    }));
  }
);

// // Get archived applications with summary using DB-level pagination
// export const getArchivedApplicationsPaginated = cache(async (
//   tenantId: string,
//   searchTerm: string | undefined,
//   page: number,
//   pageSize: number,
// ) => {
//   const conditions = [
//     eq(applications.tenantId, tenantId),
//     isNull(applications.deletedAt),
//     sql`${applications.status} = 'Archived'`
//   ];

//   if (searchTerm && searchTerm.trim()) {
//     conditions.push(
//       sql`(
//         ${applications.name} ILIKE ${`%${searchTerm.trim()}%`} OR
//         ${applications.description} ILIKE ${`%${searchTerm.trim()}%`}
//       )`
//     );
//   }

//   const [{ count }] = await db
//     .select({ count: sql<number>`count(distinct ${applications.id})` })
//     .from(applications)
//     .leftJoin(useCases, eq(useCases.applicationId, applications.id))
//     .leftJoin(risks, eq(risks.applicationId, applications.id))
//     .leftJoin(applicationPolicies, eq(applicationPolicies.applicationId, applications.id))
//     .where(and(...conditions));

//   const offset = Math.max(0, (page - 1) * pageSize);

//   const appsWithStats = await db
//     .select({
//       id: applications.id,
//       name: applications.name,
//       slug: applications.slug,
//       description: applications.description,
//       status: applications.status,
//       goviqEnabled: applications.goviqEnabled,
//       controlnetEnabled: applications.controlnetEnabled,
//       createdAt: applications.createdAt,
//       updatedAt: applications.updatedAt,
//       deletedAt: applications.deletedAt,
//       // Aggregate stats
//       use_cases: sql<number>`count(distinct ${useCases.id})`.as('use_cases'),
//       risks: sql<number>`count(distinct ${risks.id})`.as('risks'),
//       critical_risks: sql<number>`count(distinct case when ${risks.riskLevel} = 'Critical' then ${risks.id} end)`.as('critical_risks'),
//       mitigated_risks: sql<number>`count(distinct case when ${risks.mitigationStatus} = 'Completed' then ${risks.id} end)`.as('mitigated_risks'),
//       active_policies: sql<number>`count(distinct case when ${applicationPolicies.isActive} = true then ${applicationPolicies.policyId} end)`.as('active_policies'),
//     })
//     .from(applications)
//     .leftJoin(useCases, eq(useCases.applicationId, applications.id))
//     .leftJoin(risks, eq(risks.applicationId, applications.id))
//     .leftJoin(applicationPolicies, eq(applicationPolicies.applicationId, applications.id))
//     .where(and(...conditions))
//     .groupBy(applications.id)
//     .orderBy(desc(applications.updatedAt))
//     .limit(pageSize)
//     .offset(offset);

//   const mapped = appsWithStats.map(app => ({
//     ...app,
//     stats: {
//       use_cases: Number(app.use_cases) || 0,
//       risks: Number(app.risks) || 0,
//       critical_risks: Number(app.critical_risks) || 0,
//       mitigated_risks: Number(app.mitigated_risks) || 0,
//       active_policies: Number(app.active_policies) || 0,
//     },
//   }));

//   return { applications: mapped, total: Number(count) || 0 };
// });
