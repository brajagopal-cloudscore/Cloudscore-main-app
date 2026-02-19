"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RequestStatsGraphResponse } from "@/lib/actions/recent";

const formatDateLabel = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
};

const formatTooltipDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  } catch {
    return dateString;
  }
};

export default function ObservabilityChart(props: {
  isFetching: boolean;
  isLoading: boolean;
  data: RequestStatsGraphResponse | undefined;
}) {
  const { data: apiData, isLoading, isFetching } = props;
  const data =
    apiData?.daily?.length && apiData.daily.length > 0
      ? apiData.daily.map((ele) => {
          return {
            ...ele,
            passed: Number(ele.passed || "0"),
            blocked: Number(ele.blocked || "0"),
            formattedDay: formatDateLabel(ele.day),
          };
        })
      : [];

  const chartConfig = {
    passed: { label: "Passed Requests", color: "#16a34a" },
    blocked: { label: "Blocked Requests", color: "#dc2626" },
  } satisfies ChartConfig;
  
  const categoryColors: Record<string, string> = {
    Pii: "#ef4444",
    Toxicity: "#f59e0b",
    Jailbreak: "#8b5cf6",
    Safety: "#3b82f6",
    Privacy: "#ec4899",
    Security: "#10b981",
    Bias: "#6366f1",
    Business: "#14b8a6",
  };

  const categoryBreakdown = apiData?.categoryBreakdown || [];

  const isZeroData =
    data.length > 0 &&
    data.every((d) => Number(d.passed) === 0 && Number(d.blocked) === 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
      {/* Area Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Daily Request Trends</CardTitle>
          <CardDescription>
            Passed vs Blocked requests over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching || isLoading ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground animate-pulse">
              Loading Data
            </div>
          ) : (
            <>
              {isZeroData ? (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground ">
                  No data available
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="w-full h-[400px] "
                >
                  <AreaChart data={data}>
                    <XAxis 
                      dataKey="formattedDay" 
                      tick={{ fontSize: 10 }} 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        labelFormatter={(value, payload) => {
                          if (payload && payload[0]?.payload?.day) {
                            return formatTooltipDate(payload[0].payload.day);
                          }
                          return value;
                        }}
                      />} 
                    />

                    <Area
                      type="monotone"
                      dataKey="passed"
                      stroke="#16a34a"
                      fill="rgba(22, 163, 74, 0.05)"
                      strokeWidth={2}
                      name="Passed Requests"
                    />
                    <Area
                      type="monotone"
                      dataKey="blocked"
                      stroke="#dc2626"
                      fill="rgba(220, 38, 38, 0.05)"
                      strokeWidth={2}
                      name="Blocked Requests"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Blocked Requests by Category</CardTitle>
          <CardDescription>
            Breakdown of blocked requests by guardrail category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground animate-pulse">
              Loading Data
            </div>
          ) : (
            <>
              {categoryBreakdown.length === 0 ? (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No blocked requests
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="w-full h-[400px]"
                >
                  <BarChart data={categoryBreakdown} layout="vertical">
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => [`${value} requests`, ""]}
                      />} 
                    />
                    <Bar
                      dataKey="count"
                      fill="#dc2626"
                      radius={[0, 4, 4, 0]}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={categoryColors[entry.category] || "#dc2626"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
