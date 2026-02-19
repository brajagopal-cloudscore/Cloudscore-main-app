import React from "react";
import { Risk } from "../type";
import { Clock, AlertCircle } from "lucide-react";
const statusColorMap: Record<string, string> = {
  Low: "green",
  Rare: "green",
  Minor: "green",
  Possible: "yellow",
  Unlikely: "yellow",
  Medium: "orange",
  Moderate: "orange",
  Likely: "orange",
  High: "red",
  Major: "red",
  Critical: "red",
  "Not Started": "gray",
  "In Progress": "blue",
  "Requires Review": "yellow",
  Completed: "green",
};

function StatusChip({ value }: { value: string }) {
  const color = statusColorMap[value] || "gray";

  return (
    <span
      className={`p-1 rounded-full text-sm font-medium bg-${color}-500/10 text-${color}-500`}
    >
      {value === "In Progress" ? <Clock /> : <AlertCircle />}
    </span>
  );
}

export default function View({ risk }: { risk: Risk }) {
  return (
    <>
      <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Use Case</h2>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Name:</strong> {risk.useCase?.useCase}
          </p>
          <p>
            <strong>Description:</strong> {risk.useCase?.whatItDoes}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Owner */}
        <div className="p-6 h-48 rounded-xl border bg-card shadow relative flex flex-col justify-between">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Owner</h3>
          </div>
          <div>
            <p className="font-medium">{risk.ownerUser.name}</p>
            <p className="text-muted-foreground text-sm">
              {risk.ownerUser.email}
            </p>
          </div>
        </div>

    
        <div className="p-6 h-48 rounded-xl border bg-card shadow relative flex flex-col justify-between">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Control Owner</h3>
          </div>
          <div>
            <p className="font-medium">{risk.controlOwnerUser?.name}</p>
            <p className="text-muted-foreground text-sm">
              {risk.controlOwnerUser?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        
        <div className="p-6 h-48 rounded-xl border bg-card shadow flex flex-col justify-between relative">
          <div className="flex justify-between">
            <h3 className="font-semibold">Risk Level</h3>
            <StatusChip value={risk.riskLevel} />
          </div>
          <p className="text-xl font-bold">{risk.riskLevel}</p>
        </div>

    
        <div className="p-6 h-48 rounded-xl border bg-card shadow flex flex-col justify-between relative">
          <div className="flex justify-between">
            <h3 className="font-semibold">Severity</h3>
            <StatusChip value={risk.severity} />
          </div>
          <p className="text-xl font-bold">{risk.severity}</p>
        </div>

        <div className="p-6 h-48 rounded-xl border bg-card shadow flex flex-col justify-between relative">
          <div className="flex justify-between">
            <h3 className="font-semibold">Likelihood</h3>
            <StatusChip value={risk.likelihood} />
          </div>
          <p className="text-xl font-bold">{risk.likelihood}</p>
        </div>

       
        <div className="p-6 h-48 rounded-xl border bg-card shadow flex flex-col justify-between relative">
          <div className="flex justify-between">
            <h3 className="font-semibold">Mitigation Status</h3>
            <StatusChip value={risk.mitigationStatus} />
          </div>
          <p className="text-xl font-bold">{risk.mitigationStatus}</p>
        </div>
      </div>
    </>
  );
}
