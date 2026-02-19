"use server";
import {
  applicationModels,
  applicationPolicies,
  db,
  observabilityLogs,
  policyGuardrails,
  applications,
  guardrails,
} from "@/db";
import {
  and,
  eq,
  inArray,
  sql,
  isNull,
  isNotNull,
  notInArray,
  ne,
} from "drizzle-orm";
import { ControlnetStats } from "../actions/controlnet";
import { cache } from "react";
export interface ObservabilityStats extends ControlnetStats {
  applications: number;
}

export const getObservabilityStats = cache(
  async ({ tenantId }: { tenantId: string }): Promise<ObservabilityStats> => {
    const applicationsList = (
      await db.query.applications.findMany({
        where: and(
          eq(applications.tenantId, tenantId),
          isNull(applications.deletedAt),
          ne(applications.status, "Archived")
        ),
      })
    ).map((ele) => {
      return ele.id;
    });
    const applicationsCount = applicationsList.length;
    const policies = (
      await db.query.applicationPolicies.findMany({
        where: inArray(applicationPolicies.applicationId, applicationsList),
      })
    ).map((ele) => ele.policyId);

    const policyGuardrailList = (
      await db.query.policyGuardrails.findMany({
        where: and(inArray(policyGuardrails.policyId, policies)),
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
        where: and(eq(applicationModels.tenantId, tenantId)),
      })
    ).length;

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
        isNotNull(observabilityLogs.statusCode),
        notInArray(observabilityLogs.statusCode, [500])
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
      policies: policies.length,
      guardrails: guardrailCount,
      applications: applicationsCount,
      requestCount,
      blockCount,
      allowCount,
      averageLatency,
      logs: [],
    };
  }
);
