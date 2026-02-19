"use client";

import { dataExposure, complianceTrends } from "./constants";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const colorMap: Record<string, string> = {
  danger: "bg-red-500",
  warning: "bg-orange-500",
  purple: "bg-purple-500",
  info: "bg-blue-500",
  cyan: "bg-cyan-500",
};

export function DataExposurePanel() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm h-96">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          Data Exposure & Compliance Risk
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Sensitive data categories potentially exposed
        </p>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Exposure List */}
        <div className="space-y-4">
          {dataExposure.map((item, i) => (
            <div key={item.category} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{item.category}</span>

                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.count}</span>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      item.trend > 0 ? "text-risk-high" : "text-risk-low"
                    )}
                  >
                    {item.trend > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(item.trend)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    colorMap[item.color]
                  )}
                  style={{ width: `${(item.count / 250) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* --- FIXED AREA CHART --- */}
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            Incident Trend (Last 6 Months)
          </p>

          <div className="h-64">
            {" "}
            {/* Ensure fixed height for container */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrends}>
                {/* Gradient Fix (Supports dark mode + CSS variables) */}
                <defs>
                  <linearGradient id="riskColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--risk-high))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--risk-high))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                {/* Axis */}
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  // tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  width={28}
                  axisLine={false}
                  tickLine={false}
                  // tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />

                {/* Tooltip styled to match shadcn */}
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload?.length) return null;
                    return (
                      <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-medium mb-1">{label}</p>
                        <p className="text-muted-foreground">
                          Incidents: {payload[0].value}
                        </p>
                      </div>
                    );
                  }}
                />

                {/* Area Line */}
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="red"
                  strokeWidth={2}
                  fill="rgba(239, 68, 68, 0.1)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
