"use client";

import { userRisks, departmentRisk } from "./constants";
import { cn } from "@/lib/utils";
import { User, Building2 } from "lucide-react";

function getRiskColor(score: number) {
  if (score >= 75) return { text: "text-red-500", bg: "bg-red-500" };
  if (score >= 50) return { text: "text-yellow-500", bg: "bg-yellow-500" };
  return { text: "text-green-500", bg: "bg-green-500" };
}

export function UserRiskScoreboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Risk Table */}
      <div className="bg-card rounded-lg border border-border card-shadow">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">
            User Risk Scoreboard
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                  Risk Score
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                  Unapproved
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                  Sensitive
                </th>
              </tr>
            </thead>
            <tbody>
              {userRisks.map((user, i) => {
                const riskColor = getRiskColor(user.riskScore);
                return (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-accent/50 transition-colors  "
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="p-3">
                      <p className="font-medium text-sm text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.department}
                      </p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", riskColor.bg)}
                            style={{ width: `${user.riskScore}%` }}
                          />
                        </div>
                        <span
                          className={cn("text-sm font-medium", riskColor.text)}
                        >
                          {user.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      {user.unapprovedUsage}
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      {user.sensitiveDataEvents}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Risk */}
      <div className="bg-card rounded-lg border border-border card-shadow">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">
            Department Risk Overview
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {departmentRisk.map((dept, i) => {
            const riskColor = getRiskColor(dept.risk);
            return (
              <div
                key={dept.name}
                className=" "
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {dept.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({dept.users} users)
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold", riskColor.text)}>
                    {dept.risk}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      riskColor.bg
                    )}
                    style={{ width: `${dept.risk}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
