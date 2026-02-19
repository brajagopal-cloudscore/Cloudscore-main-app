"use server";
import {
  applicationModels,
  applicationPolicies,
  db,
  observabilityLogs,
  policyGuardrails,
  applications,
  stakeholders,
} from "@/db";
import { and, eq, inArray, sql } from "drizzle-orm";

export interface ControlnetStats {
  models: number;
  policies: number;
  guardrails: number;
  applications: number;
  stakeholders: number;
  requestCount: number;
  blockCount: number;
  allowCount: number;
  averageLatency: number;
  recentEndpoints: {
    path: string | null;
    statusCode: number | null;
    createdAt: string | null;
    blocked: boolean;
    latencyMs: number | null;
    requestBody: unknown;
  }[];
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

  const guardrails = (
    await db.query.policyGuardrails.findMany({
      where: and(inArray(policyGuardrails.policyId, policyIds)),
      columns: { guardrailId: true },
    })
  )
    .map((r) => r.guardrailId)
    .filter((id, index, arr) => arr.indexOf(id) === index).length;

  const models = (
    await db.query.applicationModels.findMany({
      where: and(
        eq(applicationModels.tenantId, tenantId),
        eq(applicationModels.applicationId, applicationId)
      ),
    })
  ).length;

  const applicationsCount = (
    await db.query.applications.findMany({
      where: eq(applications.tenantId, tenantId),
    })
  ).length;

  const stakeholdersCount = (
    await db.query.stakeholders.findMany({
      where: eq(stakeholders.tenantId, tenantId),
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
      eq(observabilityLogs.tenantId, tenantId),
      eq(observabilityLogs.applicationId, applicationId)
    ),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
  });

  const requestCount = allLogs.length;
  const blockCount = allLogs.filter((log) => {
    const result = log.guardrailResults as any;
    return result?._summary?.decision === "block" || result?.blocked === true;
  }).length;
  const allowCount = allLogs.filter((log) => {
    const result = log.guardrailResults as any;
    return (
      result?._summary?.decision === "allowed" || result?.blocked === false
    );
  }).length;

  const logsWithLatency = allLogs.filter((log) => log.latencyMs != null && log.latencyMs > 0);
  const totalLatency = logsWithLatency.reduce(
    (sum, log) => sum + log.latencyMs!,
    0
  );
  const averageLatency =
    logsWithLatency.length > 0 ? Math.round(totalLatency / logsWithLatency.length) : 0;

  const recentEndpoints = allLogs.slice(0, 10).map((log) => {
    const result = log.guardrailResults as any;
    const blocked =
      result?._summary?.decision === "block" || result?.blocked === true;

    return {
      path: log.path,
      statusCode: log.statusCode,
      createdAt: log.createdAt,
      blocked,
      latencyMs: log.latencyMs,
      requestBody: log.requestPayload,
    };
  });

  return {
    models,
    policies: policyIds.length,
    guardrails,
    applications: applicationsCount,
    stakeholders: stakeholdersCount,
    requestCount,
    blockCount,
    allowCount,
    averageLatency,
    recentEndpoints,
    logs,
  };
};
