"use client";
import { cn } from "@/lib/utils";
import { Shield, Plus, Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PolicyTool {
  id: string;
  name: string;
  status: "approved" | "forbidden" | "pending";
}

const initialPolicies: PolicyTool[] = [
  { id: "1", name: "GitHub Copilot", status: "approved" },
  { id: "2", name: "Microsoft Copilot", status: "approved" },
  { id: "3", name: "ChatGPT", status: "forbidden" },
  { id: "4", name: "Claude AI", status: "pending" },
  { id: "5", name: "Midjourney", status: "forbidden" },
  { id: "6", name: "Perplexity", status: "forbidden" },
];

const statusConfig = {
  approved: {
    label: "Approved",
    color: "text-green-500",
    bg: "bg-green-500/10",
    icon: Check,
  },
  forbidden: {
    label: "Forbidden",
    color: "text-red-500",
    bg: "bg-red-500/10",
    icon: X,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    icon: Shield,
  },
};

export function GovernancePanel() {
  const [policies, setPolicies] = useState(initialPolicies);

  const updateStatus = (id: string, status: PolicyTool["status"]) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const approved = policies.filter((p) => p.status === "approved");
  const forbidden = policies.filter((p) => p.status === "forbidden");
  const pending = policies.filter((p) => p.status === "pending");

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Governance & Policy Management
          </h3>
        </div>
        <Button size="sm" variant="outline" className="text-xs">
          <Plus className="w-3 h-3 mr-1" />
          Add Tool
        </Button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Approved */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-foreground">
              Approved ({approved.length})
            </span>
          </div>
          {approved.map((tool) => (
            <ToolPolicyItem
              key={tool.id}
              tool={tool}
              onStatusChange={updateStatus}
            />
          ))}
        </div>

        {/* Pending */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium text-foreground">
              Pending Review ({pending.length})
            </span>
          </div>
          {pending.map((tool) => (
            <ToolPolicyItem
              key={tool.id}
              tool={tool}
              onStatusChange={updateStatus}
            />
          ))}
        </div>

        {/* Forbidden */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-foreground">
              Forbidden ({forbidden.length})
            </span>
          </div>
          {forbidden.map((tool) => (
            <ToolPolicyItem
              key={tool.id}
              tool={tool}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolPolicyItem({
  tool,
  onStatusChange,
}: {
  tool: PolicyTool;
  onStatusChange: (id: string, status: PolicyTool["status"]) => void;
}) {
  const config = statusConfig[tool.status];

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 group hover:border-border transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{tool.name}</span>
        <div className="flex items-center gap-1  group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onStatusChange(tool.id, "approved")}
            className="p-1 rounded hover:bg-green-500/10 text-muted-foreground hover:text-green-500"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => onStatusChange(tool.id, "forbidden")}
            className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
