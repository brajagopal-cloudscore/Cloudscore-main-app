"use client";
import { summaryStats } from "./constants";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, Activity, TrendingUp } from "lucide-react";

const riskColors = {
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
  critical: "text-risk-critical",
};

const riskBg = {
  low: "bg-risk-low/10",
  medium: "bg-risk-medium/10",
  high: "bg-risk-high/10",
  critical: "bg-risk-critical/10",
};

export function RiskSnapshot() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Sessions Card */}
      <div className="bg-card rounded-lg p-4 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">AI Sessions</span>
        </div>
        <div className="text-2xl font-bold text-foreground mb-2">
          {summaryStats.sessions24h.toLocaleString()}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>7d: {summaryStats.sessions7d.toLocaleString()}</span>
          <span>30d: {summaryStats.sessions30d.toLocaleString()}</span>
        </div>
      </div>

      {/* Incidents Card */}
      <div className="bg-card rounded-lg p-4 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-risk-high/10">
            <AlertTriangle className="w-5 h-5 text-risk-high" />
          </div>
          <span className="text-sm text-muted-foreground">Incidents</span>
        </div>
        <div className="text-2xl font-bold text-risk-high">
          {summaryStats.unapprovedIncidents}
        </div>
        <div className="text-xs text-muted-foreground">
          Unapproved tool usage flagged
        </div>
      </div>

      {/* Risk Score Card */}
      <div className="bg-card rounded-lg p-4 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              riskBg[summaryStats.complianceRisk]
            )}
          >
            <Shield
              className={cn("w-5 h-5", riskColors[summaryStats.complianceRisk])}
            />
          </div>
          <span className="text-sm text-muted-foreground">Risk Level</span>
        </div>
        <div
          className={cn(
            "text-2xl font-bold capitalize",
            riskColors[summaryStats.complianceRisk]
          )}
        >
          {summaryStats.complianceRisk}
        </div>
        <div className="text-xs text-muted-foreground">
          Compliance risk score
        </div>
      </div>

      {/* Approved vs Unapproved */}
      <div className="bg-card rounded-lg p-4 card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-status-info/10">
            <TrendingUp className="w-5 h-5 text-status-info" />
          </div>
          <span className="text-sm text-muted-foreground">Tool Usage</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-risk-low">
            {summaryStats.approvedUsagePercent}%
          </span>
          <span className="text-sm text-muted-foreground">approved</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 h-full"
            style={{ width: `${summaryStats.approvedUsagePercent}%` }}
          />
          <div
            className="bg-red-500 h-full"
            style={{ width: `${summaryStats.unapprovedUsagePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
