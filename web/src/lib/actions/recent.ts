"use server";

import { db, observabilityLogs, applicationPolicies } from "@db";
import {
  and,
  eq,
  desc,
  inArray,
  notInArray,
  isNotNull,
  sql,
  ilike,
  gte,
  or,
} from "drizzle-orm";

const ALLOWED_CODES = [200, 201];

// Application observability logs are filtered by application_id
// ControlNet auto-resolves application_id from policy via application_policies table
// So observability_logs.application_id should always be set when policies are properly linked

export interface RecentEndpointsPaginatedResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  prev: number | null;
  next: number | null;

  data: (typeof observabilityLogs.$inferSelect & { applicationName: string })[];
}

export const getApplicationRecentEndpoints = async ({
  tenantId,
  applicationId,
  page = 1,
  limit = 10,
  show = "all",
  search,
}: {
  tenantId: string;
  applicationId: string;
  page?: number;
  limit?: number;
  show?: string;
  search?: string;
}): Promise<RecentEndpointsPaginatedResponse> => {
  const offset = (page - 1) * limit;

  const filters: any[] = [
    eq(observabilityLogs.tenantId, tenantId),
    eq(observabilityLogs.applicationId, applicationId),
    isNotNull(observabilityLogs.statusCode),
    notInArray(observabilityLogs.statusCode, [500]),
  ];

  // Apply show filter
  if (show === "blocked") {
    filters.push(notInArray(observabilityLogs.statusCode, ALLOWED_CODES));
  } else if (show === "allowed") {
    filters.push(inArray(observabilityLogs.statusCode, ALLOWED_CODES));
  }
  // If show === "all", don't filter by status code
  
  if (search && search.trim() !== "") {
    const term = `%${search.trim()}%`;

    filters.push(
      or(
        ilike(observabilityLogs.path, term),
        ilike(observabilityLogs.method, term),
        ilike(sql`CAST(${observabilityLogs.requestPayload} AS TEXT)`, term)
      )
    );
  }

  const logs = await db.query.observabilityLogs.findMany({
    where: and(...filters),
    orderBy: desc(observabilityLogs.createdAt),
    with: {
      application: true,
    },
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(observabilityLogs)
    .where(and(...filters));

  const total = Number(count);
  const totalPage = Math.ceil(total / limit);

  return {
    data: logs.map((ele) => {
      return { ...ele, applicationName: ele.application?.name ?? "Unknown" };
    }),
    page,
    limit,
    total,
    totalPage,
    prev: page > 1 ? page - 1 : null,
    next: page < totalPage ? page + 1 : null,
  };
};
export const getTenantRecentEndpoints = async ({
  tenantId,
  page = 1,
  limit = 10,
  show = "all",
  search,
}: {
  tenantId: string;
  page?: number;
  limit?: number;
  show?: string;
  search?: string;
}): Promise<RecentEndpointsPaginatedResponse> => {
  const offset = (page - 1) * limit;

  const filters: any[] = [
    eq(observabilityLogs.tenantId, tenantId),
    isNotNull(observabilityLogs.statusCode),
    notInArray(observabilityLogs.statusCode, [500]),
  ];

  // Apply show filter
  if (show === "blocked") {
    filters.push(notInArray(observabilityLogs.statusCode, ALLOWED_CODES));
  } else if (show === "allowed") {
    filters.push(inArray(observabilityLogs.statusCode, ALLOWED_CODES));
  }
  // If show === "all", don't filter by status code

  if (search && search.trim() !== "") {
    const term = `%${search.trim()}%`;

    filters.push(
      or(
        ilike(observabilityLogs.path, term),
        ilike(observabilityLogs.method, term),
        ilike(sql`CAST(${observabilityLogs.requestPayload} AS TEXT)`, term)
      )
    );
  }

  const logs = await db.query.observabilityLogs.findMany({
    where: and(...filters),
    orderBy: desc(observabilityLogs.createdAt),
    limit,
    offset,
    with: {
      application: true,
    },
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(observabilityLogs)
    .where(and(...filters));

  const total = Number(count);
  const totalPage = Math.ceil(total / limit);

  return {
    data: logs.map((ele) => {
      return { ...ele, applicationName: ele.application?.name ?? "Unknown" };
    }),
    page,
    limit,
    total,
    totalPage,
    prev: page > 1 ? page - 1 : null,
    next: page < totalPage ? page + 1 : null,
  };
};
export interface RequestStatsGraphResponse {
  totalAccepted: number;
  totalBlocked: number;
  totalRequests: number;
  daily: {
    day: string;
    passed: number;
    blocked: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
  }[];
}

export const getApplicationGraphStats = async ({
  tenantId,
  applicationId,
}: {
  tenantId: string;
  applicationId: string;
}): Promise<RequestStatsGraphResponse> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const startDateStr = startDate.toISOString(); // ✅ Convert to ISO string

  const baseFilters: any[] = [
    eq(observabilityLogs.tenantId, tenantId),
    eq(observabilityLogs.applicationId, applicationId),
    isNotNull(observabilityLogs.statusCode),
    notInArray(observabilityLogs.statusCode, [500]),
    gte(observabilityLogs.createdAt, startDateStr), // ✅ Use string instead of Date
  ];

  // ----- TOTAL ACCEPTED -----
  const acceptedResult = await db
    .select({
      accepted: sql<number>`count(*)`,
    })
    .from(observabilityLogs)
    .where(
      and(...baseFilters, inArray(observabilityLogs.statusCode, ALLOWED_CODES))
    );

  const accepted = acceptedResult[0]?.accepted ?? 0;

  // ----- TOTAL BLOCKED -----
  const blockedResult = await db
    .select({
      blocked: sql<number>`count(*)`,
    })
    .from(observabilityLogs)
    .where(
      and(
        ...baseFilters,
        notInArray(observabilityLogs.statusCode, ALLOWED_CODES)
      )
    );

  const blocked = blockedResult[0]?.blocked ?? 0;

  const totalRequests = accepted + blocked;

  // Get category breakdown for blocked requests
  const blockedLogs = await db.query.observabilityLogs.findMany({
    columns: {
      guardrailResults: true,
    },
    where: and(
      ...baseFilters,
      notInArray(observabilityLogs.statusCode, ALLOWED_CODES),
      isNotNull(observabilityLogs.guardrailResults)
    ),
  });

  const categoryCounts = new Map<string, number>();
  for (const log of blockedLogs) {
    const results = log.guardrailResults as any;
    const violatedGuard = results?.violated_guard || results?._summary?.violation;
    const ruleId = violatedGuard?.rule_id || violatedGuard?.rule_id;
    
    if (ruleId && typeof ruleId === 'string') {
      const category = ruleId.split('.')[0];
      if (category) {
        const normalizedCategory = category.toLowerCase();
        categoryCounts.set(
          normalizedCategory,
          (categoryCounts.get(normalizedCategory) || 0) + 1
        );
      }
    }
  }

  const categoryBreakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const rows = await db
    .select({
      day: sql<string>`to_char(${observabilityLogs.createdAt}, 'YYYY-MM-DD')`,
      passed: sql<number>`
        count(
          CASE WHEN ${observabilityLogs.statusCode} = ANY(ARRAY[${sql.raw(
            ALLOWED_CODES.join(",")
          )}]::int[]) THEN 1 END
        )
      `,
      blocked: sql<number>`
        count(
          CASE WHEN ${observabilityLogs.statusCode} <> ALL(ARRAY[${sql.raw(
            ALLOWED_CODES.join(",")
          )}]::int[]) THEN 1 END
        )
      `,
    })
    .from(observabilityLogs)
    .where(and(...baseFilters))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  // Generate full 30 days
  const daily = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayKey = d.toISOString().slice(0, 10);

    const row = rows.find((r) => r.day === dayKey);

    daily.push({
      day: dayKey,
      passed: row?.passed ?? 0,
      blocked: row?.blocked ?? 0,
    });
  }

  return {
    totalAccepted: accepted,
    totalBlocked: blocked,
    totalRequests,
    daily,
    categoryBreakdown,
  };
};

export const getTenantGraphStats = async ({
  tenantId,
}: {
  tenantId: string;
}): Promise<RequestStatsGraphResponse> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const startDateStr = startDate.toISOString(); // ✅ Convert to ISO string

  const baseFilters: any[] = [
    eq(observabilityLogs.tenantId, tenantId),
    isNotNull(observabilityLogs.statusCode),
    notInArray(observabilityLogs.statusCode, [500]),
    gte(observabilityLogs.createdAt, startDateStr), // ✅ Use string instead of Date
  ];

  // ----- TOTAL ACCEPTED -----
  const acceptedResult = await db
    .select({
      accepted: sql<number>`count(*)`,
    })
    .from(observabilityLogs)
    .where(
      and(...baseFilters, inArray(observabilityLogs.statusCode, ALLOWED_CODES))
    );

  const accepted = acceptedResult[0]?.accepted ?? 0;

  // ----- TOTAL BLOCKED -----
  const blockedResult = await db
    .select({
      blocked: sql<number>`count(*)`,
    })
    .from(observabilityLogs)
    .where(
      and(
        ...baseFilters,
        notInArray(observabilityLogs.statusCode, ALLOWED_CODES)
      )
    );

  const blocked = blockedResult[0]?.blocked ?? 0;

  const totalRequests = accepted + blocked;

  // Get category breakdown for blocked requests
  const blockedLogs = await db.query.observabilityLogs.findMany({
    columns: {
      guardrailResults: true,
    },
    where: and(
      ...baseFilters,
      notInArray(observabilityLogs.statusCode, ALLOWED_CODES),
      isNotNull(observabilityLogs.guardrailResults)
    ),
  });

  const categoryCounts = new Map<string, number>();
  for (const log of blockedLogs) {
    const results = log.guardrailResults as any;
    const violatedGuard = results?.violated_guard || results?._summary?.violation;
    const ruleId = violatedGuard?.rule_id || violatedGuard?.rule_id;
    
    if (ruleId && typeof ruleId === 'string') {
      const category = ruleId.split('.')[0];
      if (category) {
        const normalizedCategory = category.toLowerCase();
        categoryCounts.set(
          normalizedCategory,
          (categoryCounts.get(normalizedCategory) || 0) + 1
        );
      }
    }
  }

  const categoryBreakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const rows = await db
    .select({
      day: sql<string>`to_char(${observabilityLogs.createdAt}, 'YYYY-MM-DD')`,
      passed: sql<number>`
        count(
          CASE WHEN ${observabilityLogs.statusCode} = ANY(ARRAY[${sql.raw(
            ALLOWED_CODES.join(",")
          )}]::int[]) THEN 1 END
        )
      `,
      blocked: sql<number>`
        count(
          CASE WHEN ${observabilityLogs.statusCode} <> ALL(ARRAY[${sql.raw(
            ALLOWED_CODES.join(",")
          )}]::int[]) THEN 1 END
        )
      `,
    })
    .from(observabilityLogs)
    .where(and(...baseFilters))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  // Generate full 30 days
  const daily = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayKey = d.toISOString().slice(0, 10);

    const row = rows.find((r) => r.day === dayKey);

    daily.push({
      day: dayKey,
      passed: row?.passed ?? 0,
      blocked: row?.blocked ?? 0,
    });
  }

  return {
    totalAccepted: accepted,
    totalBlocked: blocked,
    totalRequests,
    daily,
    categoryBreakdown,
  };
};
