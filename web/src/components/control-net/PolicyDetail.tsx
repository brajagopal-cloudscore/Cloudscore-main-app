"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  FileText,
  Copy,
  Check,
  Settings,
  Shield,
  Calendar,
  User,
  SquareUser,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { PolicyDetails } from "./Polices";
import { getPhaseColor } from "../playground/Playground";
import { getFormattedDateString } from "@/lib/utils/helpers";
import PolicyIntegration from "./PolicyIntegration";
import { useTenant } from "@/contexts/TenantContext";

import { errorToast } from "@/lib/utils/toast";
import { useParams, useRouter } from "next/navigation";
import { fetchPolicyDetails } from "@/lib/api/policies";
// YAML Viewer Component
const YAMLViewer: React.FC<{ yaml: string }> = ({ yaml }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy YAML:", err);
    }
  };

  const formatYAML = (yamlString: string) => {
    if (!yamlString) return "No YAML content available";

    // Basic YAML formatting with syntax highlighting
    return yamlString.split("\n").map((line, index) => {
      const trimmedLine = line.trim();
      let className = "text-gray-700";

      if (trimmedLine.startsWith("#") || trimmedLine.startsWith("- #")) {
        className = "text-green-600"; // Comments
      } else if (trimmedLine.includes(":") && !trimmedLine.startsWith(" ")) {
        className = "text-blue-600 font-medium"; // Keys
      } else if (trimmedLine.startsWith("- ")) {
        className = "text-purple-600"; // List items
      } else if (trimmedLine.match(/^\s+[a-zA-Z_][a-zA-Z0-9_]*:/)) {
        className = "text-indigo-600"; // Nested keys
      } else if (trimmedLine.match(/^\s*-\s*[a-zA-Z_]/)) {
        className = "text-orange-600"; // List values
      }

      return (
        <div
          key={index}
          className={`${className} font-mono text-xs leading-relaxed`}
        >
          {line || "\u00A0"} {/* Non-breaking space for empty lines */}
        </div>
      );
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2 mr-2">
        <h4 className="text-xl font-semibold">YAML Configuration</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 px-2"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
        <pre className="text-xs leading-relaxed">{formatYAML(yaml)}</pre>
      </div>
    </div>
  );
};

// Guardrail Card Component
const GuardrailCard: React.FC<{
  guardrail: any;
  databaseGuardrail: any;
  source: "yaml" | "database";
}> = ({ guardrail, databaseGuardrail, source }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "T0":
        return "bg-red-500/10 text-red-500";
      case "T1":
        return "bg-yellow-500/10 text-yellow-500";
      case "T2":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="border  rounded-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium ">
          {databaseGuardrail.name || databaseGuardrail.key}
        </h3>
        <div className="flex space-x-2">
          <Badge
            variant="outline"
            className={`text-xs ${getPhaseColor(guardrail.phase)}`}
          >
            {guardrail.phase}
          </Badge>
        </div>
      </div>
      <p className="text-muted-foreground mb-3">
        {databaseGuardrail.description}
      </p>
      {/* <div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-muted-foreground">Key:</span>
          <span className="text-gray-900">{databaseGuardrail?.key}</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-muted-foreground">Pack Name:</span>
          <span className="text-gray-900">{databaseGuardrail?.packName}</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-muted-foreground">Function Name:</span>
          <span className="text-gray-900">{databaseGuardrail?.functionName}</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-muted-foreground">Performance Budget Ms:</span>
          <span className="text-gray-900">{databaseGuardrail?.performanceBudgetMs}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium">Default Parameters:</span>
          <div className="ml-2 space-y-1">
            {databaseGuardrail.defaultParams && Object.entries(databaseGuardrail.defaultParams)
              .filter(([key, value]: any) => value !== null && value !== undefined && value !== '')
              .map(([key, value]) => {
                return (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-mono">{key}:</span>
                    <span className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                      {value?.toString() || 'NA'}
                    </span>
                  </div>
                )
              })}
          </div>
        </div> 
       </div> */}
    </div>
  );
};

export const PolicyDetail = () => {
  const [policy, setPolicy] = useState<PolicyDetails | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { tenant } = useTenant();

  const router = useRouter();

  const { policyId } = useParams();

  const loadPolicyDetails = useCallback(async () => {
    if (!policyId || !tenant?.slug) return;

    try {
      setLoading(true);
      const policyData = await fetchPolicyDetails(
        tenant.slug,
        policyId.toString()
      );
      if (policyData) {
        setPolicy(policyData as PolicyDetails);
      } else {
        errorToast("Policy not found");
      }
    } catch (err) {
      errorToast("Failed to load policy details");
    } finally {
      setLoading(false);
    }
  }, [policyId, tenant?.slug]);

  useEffect(() => {
    loadPolicyDetails();
  }, [loadPolicyDetails]);

  const getStatusBadge = (status: string, isActive: boolean) => {
    const statusLower = status?.toLowerCase() || "draft";

    if (statusLower === "active" && isActive) {
      return <Badge className="bg-green-500/10 text-green-500 ">Active</Badge>;
    } else if (statusLower === "draft") {
      return <Badge className="bg-yellow-500/10 text-yellow-500 ">Draft</Badge>;
    } else if (statusLower === "deprecated") {
      return (
        <Badge className="bg-orange-500/10 text-orange-500 ">Deprecated</Badge>
      );
    } else if (statusLower === "archived") {
      return <Badge className="bg-muted text-muted-foreground">Archived</Badge>;
    } else {
      return (
        <Badge className="bg-muted text-muted-foreground">
          {status || "Unknown"}
        </Badge>
      );
    }
  };

  if (!policy || isLoading) {
    return (
      <>
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading policy details...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-2xl mb-4">
        <div className="flex items-center gap-4 ">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Policy Details</h1>
          </div>
        </div>
      </div>

      <div className="flex-1  space-y-6 mb-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-sm  mt-1">{policy.name}</p>
            </div>
            {/* <div>
              <label className="text-sm font-medium text-muted-foreground">
                Version
              </label>
              <p className="text-sm  mt-1">{policy.version}</p>
            </div> */}
            {/* <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                {getStatusBadge(policy.status, policy.isActive)}
              </div>
            </div> */}
          </div>
          <div className="overflow-x-auto">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <p className="text-sm  mt-1">
              {policy.description || "No description"}
            </p>
          </div>
          <div className="flex flex-row gap-2 flex-wrap my-2 text-sm">
            <div className="flex flex-row items-center gap-1 pr-2 ">
              <User className="h-4 w-4" />
              <span>Created by: {policy.createdByUser?.name || "Unknown"}</span>
            </div>
            <div className="flex flex-row items-center gap-1 pr-2 ">
              <Calendar className="h-4 w-4" />
              <span>Created: {getFormattedDateString(policy.createdAt)}</span>
            </div>
            <div className="flex flex-row items-center gap-1 pr-2 ">
              <SquareUser className="h-4 w-4" />
              <span>Updated by: {policy.updatedByUser?.name || "Unknown"}</span>
            </div>
            <div className="flex flex-row items-center gap-1 pr-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: {getFormattedDateString(policy.updatedAt)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Database Guardrails */}
        {policy.databaseGuardrails.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold  flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Guardrails ({policy.databaseGuardrails.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policy.databaseGuardrails.map((policyGuardrail) => (
                <GuardrailCard
                  key={policyGuardrail.id}
                  databaseGuardrail={policyGuardrail.guardrail}
                  guardrail={policyGuardrail}
                  source="database"
                />
              ))}
            </div>
          </div>
        )}

        {/* YAML Content */}
        {/* {policy.yaml && (
          <>
            <Separator />
            <div className="space-y-4">
              <YAMLViewer yaml={policy.yaml} />
            </div>
          </>
        )} */}
      </div>

      <Separator />

      <PolicyIntegration selectedPolicy={policy.id}></PolicyIntegration>
    </>
  );
};

export default PolicyDetail;
