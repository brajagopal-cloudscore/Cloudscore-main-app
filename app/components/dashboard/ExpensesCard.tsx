"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GripVertical, BarChart2, ArrowUpRight } from "lucide-react";

const data = [
  { month: "Nov", value: 20300 },
  { month: "Dec", value: 14600 },
  { month: "Jan", value: 11300 },
  { month: "Feb", value: 6400 },
  { month: "Feb (F)", value: 8700, isForecast: true },
];

const formatDollar = (v: number) => {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary font-semibold">{formatDollar(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function ExpensesCard() {
  const total = data.slice(0, 4).reduce((s, d) => s + d.value, 0);
  const feb = data.find((d) => d.month === "Feb")!.value;
  const forecast = data.find((d) => d.isForecast)!.value;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-base">Expenses</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>

        {/* Period chips */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium">
            <span className="text-muted-foreground">Nov–Feb</span>
            <span className="font-semibold">{formatDollar(total)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium">
            <span className="text-muted-foreground">Feb</span>
            <span className="font-semibold">{formatDollar(feb)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium">
            <span className="text-muted-foreground">Forecast</span>
            <span className="font-semibold">{formatDollar(forecast)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatDollar}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isForecast ? "var(--color-primary)" : "var(--color-chart-1)"}
                  opacity={entry.isForecast ? 0.55 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

