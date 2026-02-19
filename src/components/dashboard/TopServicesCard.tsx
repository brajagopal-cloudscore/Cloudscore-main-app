"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GripVertical, Cloud, ArrowUpRight } from "lucide-react";

const services = [
  { name: "microsoft.compute", value: 4178.66, color: "#3b82f6" },
  { name: "AmazonECS", value: 818.23, color: "#ef4444" },
  { name: "AmazonEC2", value: 399.91, color: "#a855f7" },
  { name: "AmazonCloudWatch", value: 261.44, color: "#22c55e" },
  { name: "Other", value: 247.76, color: "#f59e0b" },
];

const total = services.reduce((s, d) => s + d.value, 0);

const formatCurrency = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function TopServicesCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Cloud className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-base">Top Services</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={services}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--color-card)"
                >
                  {services.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Expenses</span>
              <span className="text-base font-bold">{formatCurrency(total).replace(".00", "")}</span>
            </div>
          </div>

          {/* Service list */}
          <div className="flex-1 space-y-2.5">
            {services.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm text-foreground truncate">{s.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                  {formatCurrency(s.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
