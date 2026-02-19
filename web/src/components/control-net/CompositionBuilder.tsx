"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Shield,
  GripVertical,
  Info,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import { getGuardrailIcon } from "@/lib/utils/guardrailIcons";

// Simplified: Just guards with params, no complex composition types
export interface CompositionNode {
  id: string;
  type: "guard";
  guardrailKey: string;
  guardrailName: string;
  params?: Record<string, any>;
}

interface CompositionBuilderProps {
  availableGuardrails: Array<{
    key: string;
    name: string;
    tier: string;
    description: string;
    default_params?: Record<string, any>;
  }>;
  value: CompositionNode[];
  onChange: (nodes: CompositionNode[]) => void;
  phase: "input" | "output" | "tool_args" | "tool_result";
  readOnly?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  T0: "bg-emerald-100 text-emerald-800 border-emerald-300",
  T1: "bg-amber-100 text-amber-800 border-amber-300",
  T2: "bg-rose-100 text-rose-800 border-rose-300",
};

export function CompositionBuilder({
  availableGuardrails,
  value,
  onChange,
  phase,
  readOnly = false,
}: CompositionBuilderProps) {
  const [selectedGuardrail, setSelectedGuardrail] = useState<string>("");
  const [expandedParams, setExpandedParams] = useState<Set<string>>(new Set());

  // Filter out already-added guardrails from dropdown
  const addedKeys = new Set(value.map((node) => node.guardrailKey));
  const availableOptions = availableGuardrails.filter(
    (g) => !addedKeys.has(g.key)
  );

  const toggleParamExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedParams);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedParams(newExpanded);
  };

  const addGuard = () => {
    if (!selectedGuardrail) return;

    const guardrail = availableGuardrails.find(
      (g) => g.key === selectedGuardrail
    );
    if (!guardrail) return;

    // Pre-populate with default parameters if available
    const defaultParams = guardrail.default_params || {};

    const newNode: CompositionNode = {
      id: `guard-${Date.now()}`,
      type: "guard",
      guardrailKey: guardrail.key,
      guardrailName: guardrail.name,
      params: { ...defaultParams }, // Use default params
    };

    onChange([...value, newNode]);
    setSelectedGuardrail("");

    // Auto-expand params section for guards with defaults
    if (Object.keys(defaultParams).length > 0) {
      const newExpanded = new Set(expandedParams);
      newExpanded.add(newNode.id);
      setExpandedParams(newExpanded);
    }
  };

  const removeNode = (nodeId: string) => {
    onChange(value.filter((n) => n.id !== nodeId));
  };

  const updateNodeParam = (
    nodeId: string,
    paramKey: string,
    paramValue: any
  ) => {
    onChange(
      value.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            params: { ...node.params, [paramKey]: paramValue },
          };
        }
        return node;
      })
    );
  };

  const moveNode = (nodeId: string, direction: "up" | "down") => {
    const index = value.findIndex((n) => n.id === nodeId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const newValue = [...value];
      [newValue[index - 1], newValue[index]] = [
        newValue[index],
        newValue[index - 1],
      ];
      onChange(newValue);
    } else if (direction === "down" && index < value.length - 1) {
      const newValue = [...value];
      [newValue[index], newValue[index + 1]] = [
        newValue[index + 1],
        newValue[index],
      ];
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      {/* <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm  font-medium">
                Automatic Optimization
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Just list the guardrails you want. Our system automatically
                parallelizes, optimizes execution order, and applies intelligent
                tiering for best performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Add Guard */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Add Guardrail to {phase.replace("_", " ")}
            </CardTitle>
            <CardDescription>
              Select guardrails to enforce in this phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select
                value={selectedGuardrail}
                onValueChange={setSelectedGuardrail}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a guardrail...">
                    {selectedGuardrail && (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const selected = availableGuardrails.find(
                            (g) => g.key === selectedGuardrail
                          );
                          if (!selected) return null;
                          const IconComponent = getGuardrailIcon(selected.key);
                          return (
                            <>
                              <IconComponent className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{selected.name}</span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      All guardrails have been added
                    </div>
                  ) : (
                    availableOptions.map((g) => {
                      const IconComponent = getGuardrailIcon(g.key);
                      return (
                        <SelectItem
                          key={g.key}
                          value={g.key}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start gap-2 py-1">
                            <IconComponent className="w-4 h-4 mt-0.5 text-black flex-shrink-0" />
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <div className="text-sm font-medium ">
                                {g.name}
                              </div>
                              <div className="text-xs text-muted-foreground leading-relaxed">
                                {g.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={addGuard}
                disabled={!selectedGuardrail || availableOptions.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guardrail List */}
      {value.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Guardrails ({value.length})
            </CardTitle>
            <CardDescription>
              Guardrails will be automatically optimized and executed in
              parallel when possible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {value.map((node, index) => {
              const guardrail = availableGuardrails.find(
                (g) => g.key === node.guardrailKey
              );
              const isExpanded = expandedParams.has(node.id);
              const hasCustomParams =
                node.params && Object.keys(node.params).length > 0;
              const IconComponent = getGuardrailIcon(node.guardrailKey);

              return (
                <div key={node.id} className="border rounded-lg bg-muted">
                  {/* Main Row */}
                  <div className="flex items-center gap-3 p-3  transition-colors">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />

                    <div className="flex items-center gap-2 min-w-0">
                      <IconComponent className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {/* <Badge
                            className={`${TIER_COLORS[guardrail?.tier || "T0"]} text-xs`}
                          >
                            {guardrail?.tier || "T0"}
                          </Badge> */}
                          <span className="font-medium text-sm truncate">
                            {node.guardrailName}
                          </span>
                          {hasCustomParams && (
                            <Badge variant="outline" className="text-xs">
                              Customized
                            </Badge>
                          )}
                        </div>
                        <code className="text-xs text-muted-foreground font-mono">
                          {node.guardrailKey}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleParamExpansion(node.id)}
                        className="h-8 w-8 p-0"
                        title="Configure parameters"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveNode(node.id, "up")}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveNode(node.id, "down")}
                            disabled={index === value.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeNode(node.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Parameter Editor */}
                  {isExpanded && (
                    <div className="border-t  p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                        <Settings className="w-4 h-4" />
                        Parameters
                      </div>

                      {/* Generic Parameter Editor - Works for ALL guards based on default_params */}
                      {(() => {
                        const defaultParams = guardrail?.default_params || {};
                        const allParams = { ...defaultParams, ...node.params };

                        if (Object.keys(allParams).length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground italic">
                              No configurable parameters for this guard.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {Object.entries(allParams).map(
                              ([paramKey, paramValue]) => {
                                const currentValue =
                                  node.params?.[paramKey] ?? paramValue;

                                // Severity dropdown
                                if (paramKey === "severity") {
                                  return (
                                    <div key={paramKey} className="space-y-2">
                                      <Label
                                        htmlFor={`${node.id}-${paramKey}`}
                                        className="text-sm"
                                      >
                                        Severity Level
                                      </Label>
                                      <Select
                                        value={currentValue || "high"}
                                        onValueChange={(val) =>
                                          !readOnly &&
                                          updateNodeParam(
                                            node.id,
                                            paramKey,
                                            val
                                          )
                                        }
                                      >
                                        <SelectTrigger
                                          id={`${node.id}-${paramKey}`}
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">
                                            Low
                                          </SelectItem>
                                          <SelectItem value="med">
                                            Medium
                                          </SelectItem>
                                          <SelectItem value="high">
                                            High
                                          </SelectItem>
                                          <SelectItem value="critical">
                                            Critical
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <p className="text-xs text-muted-foreground">
                                        How strictly to enforce violations
                                      </p>
                                    </div>
                                  );
                                }

                                // Mode dropdown (for guards like pii.redact)
                                if (
                                  paramKey === "mode" &&
                                  typeof paramValue === "string"
                                ) {
                                  const modeOptions = [
                                    "mask",
                                    "remove",
                                    "hash",
                                    "tokenize",
                                  ].filter((m) => m);
                                  return (
                                    <div key={paramKey} className="space-y-2">
                                      <Label
                                        htmlFor={`${node.id}-${paramKey}`}
                                        className="text-sm capitalize"
                                      >
                                        {paramKey.replace(/_/g, " ")}
                                      </Label>
                                      <Select
                                        value={currentValue}
                                        onValueChange={(val) =>
                                          !readOnly &&
                                          updateNodeParam(
                                            node.id,
                                            paramKey,
                                            val
                                          )
                                        }
                                      >
                                        <SelectTrigger
                                          id={`${node.id}-${paramKey}`}
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="mask">
                                            Mask - Replace with [TYPE]
                                          </SelectItem>
                                          <SelectItem value="remove">
                                            Remove - Delete entirely
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  );
                                }

                                // Number input
                                if (typeof paramValue === "number") {
                                  const isThreshold =
                                    paramKey.includes("threshold");
                                  const min = isThreshold
                                    ? 0
                                    : paramKey === "threshold" &&
                                        node.guardrailKey?.includes("pii")
                                      ? 1
                                      : undefined;
                                  return (
                                    <div key={paramKey} className="space-y-2">
                                      <Label
                                        htmlFor={`${node.id}-${paramKey}`}
                                        className="text-sm capitalize"
                                      >
                                        {paramKey.replace(/_/g, " ")}
                                      </Label>
                                      <Input
                                        id={`${node.id}-${paramKey}`}
                                        type="number"
                                        step={isThreshold ? "0.01" : "1"}
                                        min={min}
                                        max={isThreshold ? "1" : undefined}
                                        value={currentValue}
                                        onChange={(e) =>
                                          !readOnly &&
                                          updateNodeParam(
                                            node.id,
                                            paramKey,
                                            parseFloat(e.target.value)
                                          )
                                        }
                                        className="font-mono"
                                        readOnly={readOnly}
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        {isThreshold
                                          ? "0.0 to 1.0 (higher = stricter)"
                                          : `Default: ${paramValue}`}
                                      </p>
                                    </div>
                                  );
                                }

                                // Boolean checkbox
                                if (typeof paramValue === "boolean") {
                                  return (
                                    <div
                                      key={paramKey}
                                      className="flex items-center space-x-2 py-2"
                                    >
                                      <input
                                        id={`${node.id}-${paramKey}`}
                                        type="checkbox"
                                        checked={currentValue}
                                        onChange={(e) =>
                                          !readOnly &&
                                          updateNodeParam(
                                            node.id,
                                            paramKey,
                                            e.target.checked
                                          )
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                        disabled={readOnly}
                                      />
                                      <Label
                                        htmlFor={`${node.id}-${paramKey}`}
                                        className="text-sm capitalize cursor-pointer"
                                      >
                                        {paramKey.replace(/_/g, " ")}
                                      </Label>
                                    </div>
                                  );
                                }

                                // Array input (comma-separated)
                                if (Array.isArray(paramValue)) {
                                  // Show nice placeholder based on param name
                                  let placeholder =
                                    "Enter comma-separated values";
                                  if (paramKey === "types")
                                    placeholder =
                                      "e.g., EMAIL, PHONE, SSN, CREDIT_CARD";
                                  if (paramKey === "categories")
                                    placeholder =
                                      "e.g., hate, violence, sexual";
                                  if (paramKey === "competitors")
                                    placeholder =
                                      "e.g., Microsoft, Google, Amazon";
                                  if (paramKey.includes("tools"))
                                    placeholder =
                                      "e.g., search, calculate, send_email";
                                  if (paramKey.includes("patterns"))
                                    placeholder =
                                      "e.g., vote for, election, candidate";

                                  return (
                                    <div key={paramKey} className="space-y-2">
                                      <Label
                                        htmlFor={`${node.id}-${paramKey}`}
                                        className="text-sm capitalize"
                                      >
                                        {paramKey.replace(/_/g, " ")}
                                      </Label>
                                      <Input
                                        id={`${node.id}-${paramKey}`}
                                        placeholder={placeholder}
                                        defaultValue={
                                          Array.isArray(currentValue)
                                            ? currentValue.join(", ")
                                            : ""
                                        }
                                        onBlur={(e) => {
                                          if (!readOnly) {
                                            const items = e.target.value
                                              .split(",")
                                              .map((t) => t.trim())
                                              .filter((t) => t);
                                            updateNodeParam(
                                              node.id,
                                              paramKey,
                                              items
                                            );
                                          }
                                        }}
                                        className="font-mono text-sm"
                                        readOnly={readOnly}
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        Comma-separated list
                                      </p>
                                    </div>
                                  );
                                }

                                // String input (default)
                                return (
                                  <div key={paramKey} className="space-y-2">
                                    <Label
                                      htmlFor={`${node.id}-${paramKey}`}
                                      className="text-sm capitalize"
                                    >
                                      {paramKey.replace(/_/g, " ")}
                                    </Label>
                                    <Input
                                      id={`${node.id}-${paramKey}`}
                                      value={currentValue || ""}
                                      onChange={(e) =>
                                        !readOnly &&
                                        updateNodeParam(
                                          node.id,
                                          paramKey,
                                          e.target.value
                                        )
                                      }
                                      className="font-mono text-sm"
                                      readOnly={readOnly}
                                    />
                                  </div>
                                );
                              }
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium  mb-2">No guardrails added</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Select guardrails above to add them to this phase. The system will
              automatically optimize execution.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
