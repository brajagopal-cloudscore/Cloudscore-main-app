"use server";
import {
  applicationModels,
  applicationPolicies,
  db,
  guardrails,
  observabilityLogs,
  policyGuardrails,
} from "@/db";
import { and, eq, inArray, notInArray, isNotNull, sql } from "drizzle-orm";

const ALLOWED_CODES = [200, 201];
export interface ControlnetStats {
  models: number;
  policies: number;
  guardrails: number;
  requestCount: number;
  blockCount: number;
  allowCount: number;
  averageLatency: number;

  logs: {
    path: string | null;
    timestamp: string;
    requestPayload: unknown;
  }[];
}

export const getControlnetStats = async ({
  tenantId,
  applicationId,
}: {
  tenantId: string;
  applicationId: string;
}): Promise<ControlnetStats> => {
  // Get all policy IDs linked to this application
  const policyIds = (
    await db.query.applicationPolicies.findMany({
      where: and(
        eq(applicationPolicies.tenantId, tenantId),
        eq(applicationPolicies.applicationId, applicationId)
      ),
    })
  ).map((ele) => ele.policyId);

  const policyGuardrailList = (
    await db.query.policyGuardrails.findMany({
      where: and(inArray(policyGuardrails.policyId, policyIds)),
      columns: { guardrailId: true },
    })
  ).map((ele) => ele.guardrailId);

  const guardrailCount = Array.from(
    new Set(
      (
        await db.query.guardrails.findMany({
          where: and(inArray(guardrails.id, policyGuardrailList)),
        })
      ).map((ele) => ele.fallbackGuardrailId)
    )
  ).length;

  const models = (
    await db.query.applicationModels.findMany({
      where: and(
        eq(applicationModels.tenantId, tenantId),
        eq(applicationModels.applicationId, applicationId)
      ),
    })
  ).length;

  // Filter by application_id (auto-resolved by ControlNet from policy)

  const logs = await db.query.observabilityLogs.findMany({
    columns: {
      path: true,
      timestamp: true,
      requestPayload: true,
    },
    where: and(
      eq(observabilityLogs.tenantId, tenantId),
      eq(observabilityLogs.applicationId, applicationId)
    ),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit: 3,
  });

  // Get all logs for metrics calculation
  const allLogs = await db.query.observabilityLogs.findMany({
    columns: {
      path: true,
      guardrailResults: true,
      latencyMs: true,
      statusCode: true,
      createdAt: true,
      requestPayload: true,
    },
    where: and(
      isNotNull(observabilityLogs.statusCode),
      notInArray(observabilityLogs.statusCode, [500]),
      eq(observabilityLogs.tenantId, tenantId),
      eq(observabilityLogs.applicationId, applicationId)
    ),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
  });

  const requestCount = allLogs.length;

  const allowCount = allLogs.filter((log) => {
    return log.statusCode === 200 || log.statusCode === 201;
  }).length;
  const blockCount = requestCount - allowCount;

  const logsWithLatency = allLogs.filter((log) => log.latencyMs != null && log.latencyMs > 0);
  const totalLatency = logsWithLatency.reduce(
    (sum, log) => sum + log.latencyMs!,
    0
  );
  const averageLatency =
    logsWithLatency.length > 0 ? Math.round(totalLatency / logsWithLatency.length) : 0;

  return {
    models,
    policies: policyIds.length,
    guardrails: guardrailCount,
    requestCount,
    blockCount,
    allowCount,
    averageLatency,
    logs,
  };
};
