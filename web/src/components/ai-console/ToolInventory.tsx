"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter } from "lucide-react";
import { aiTools, ApprovalStatus, RiskLevel } from "./constants";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const approvalColors: Record<ApprovalStatus, string> = {
  approved: "bg-risk-low/15 text-risk-low",
  pending: "bg-risk-medium/15 text-risk-medium",
  unapproved: "bg-risk-high/15 text-risk-high",
};

const riskColors: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
};

export function ToolInventory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">(
    "all"
  );

  const filteredTools = aiTools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tool.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="rounded-xl border bg-card shadow-sm w-full h-[500px]">
      {/* Header */}
      <div className="p-5 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">AI Tool Inventory</h3>
          <span className="text-xs text-muted-foreground">
            {aiTools.length} tools
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 items-center">
          {/* Search Input */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Select
              value={statusFilter}
              onValueChange={(val) =>
                setStatusFilter(val as ApprovalStatus | "all")
              }
            >
              <SelectTrigger className="pl-9">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unapproved">Unapproved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <ScrollArea className="max-h-[450px]">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Last Used</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool, i) => (
                <TableRow
                  key={tool.id}
                  className="hover:bg-accent/50 transition cursor-pointer"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Tool Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tool.icon}</span>
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tool.category}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Usage */}
                  <TableCell className="text-muted-foreground">
                    {tool.usageWeekly} / {tool.usageMonthly}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-md capitalize px-2 py-1",
                        approvalColors[tool.approvalStatus]
                      )}
                    >
                      {tool.approvalStatus}
                    </Badge>
                  </TableCell>

                  {/* Risk */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          riskColors[tool.riskRating]
                        )}
                      />
                      <span className="text-xs text-muted-foreground capitalize">
                        {tool.riskRating}
                      </span>
                    </div>
                  </TableCell>

                  {/* Last Used */}
                  <TableCell className="text-xs text-muted-foreground">
                    {tool.lastUsed}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-5 text-muted-foreground"
                >
                  No matching tools found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
