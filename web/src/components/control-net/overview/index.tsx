"use client";

import Stats from "./stats";
import RecentEndpointsTable from "../../common/recents";
import {
  useApplicationGraph,
  useApplicationLogs,
} from "@/store/applicationLogs.store";
import ObservabilityChart from "@/components/common/observability-chart";
export default function ControlNetOverview() {
  const props = useApplicationLogs();
  const chartProps = useApplicationGraph();

  return (
    <div className=" space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold ">Control Overview</h1>
      </div>
      <Stats></Stats>
      <ObservabilityChart {...chartProps}></ObservabilityChart>
      <RecentEndpointsTable
        hideApplicationName={true}
        {...props}
      ></RecentEndpointsTable>
    </div>
  );
}
