"use client";

import React from "react";

import Stats from "./stats";
import RecentEndpointsTable from "../common/recents";
import { useTenantGraph, useTenantLogs } from "@/store/tenantLogs.store";
import ObservabilityChart from "../common/observability-chart";
export default function Observability() {
  const props = useTenantLogs();
  const chartProps = useTenantGraph();
  return (
    <div className=" space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Unified Observability Dashboard</h1>
      </div>
      <Stats></Stats>
      <ObservabilityChart {...chartProps}></ObservabilityChart>
      <RecentEndpointsTable {...props}></RecentEndpointsTable>
    </div>
  );
}
