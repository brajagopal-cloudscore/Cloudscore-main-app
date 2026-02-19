"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import {
  CompositionBuilder,
  type CompositionNode,
} from "@/components/control-net/CompositionBuilder";
import { toast } from "react-hot-toast";
import { getToastErrorMessage } from "@/lib/utils/policy-error-parser";
import { Policy } from "@/components/control-net/Polices";
import { fetchApplicationPolicies } from "@/lib/api/policies";
import { useAuthAxios } from "@/lib/api/auth-axios";
import { useTenant } from "@/contexts/TenantContext";

interface Guardrail {
  id: string;
  key: string;
  name: string;
  tier: string;
  description: string;
  defaultParams: Record<string, any>;
}

interface PolicyDetails {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  yaml: string | null;
  composition: any;
  yamlGuardrails: any[];
  databaseGuardrails: any[];
  createdByUser: any;
  updatedByUser: any;
}

interface PolicyEditClientProps {
  tenantSlug: string;
  userId: string;
  applicationId: string;
  policyId: string;
  policyDetails: PolicyDetails;
  availableGuardrails: Guardrail[];
}

/**
 * Convert policy guardrails to composition nodes
 */
function guardrailsToCompositionNodes(
  guardrails: any[],
  phase: "input" | "output"
): CompositionNode[] {
  return guardrails
    .filter((pg) => pg.phase === phase)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .map((pg) => {
      const guardrail = pg.guardrail || pg;
      return {
        id: `${phase}-${guardrail.key}-${pg.orderIndex || 0}`,
        type: "guard" as const,
        guardrailKey: guardrail.key,
        guardrailName: guardrail.name || guardrail.key,
        params: pg.params || guardrail.defaultParams || {},
      };
    });
}

/**
 * Convert YAML guardrails to composition nodes
 * This is a fallback if database guardrails are not available
 */
function yamlGuardrailsToCompositionNodes(
  yamlGuardrails: any[],
  composition: any,
  phase: "input" | "output"
): CompositionNode[] {
  // If we have composition info, use it to determine order
  // Otherwise, just use the guardrails in order
  return yamlGuardrails.map((g, index) => ({
    id: `${phase}-${g.key}-${index}`,
    type: "guard" as const,
    guardrailKey: g.key,
    guardrailName: g.name || g.key,
    params: g.defaultParams || {},
  }));
}

export function PolicyEditClient({
  tenantSlug,
  userId,
  applicationId,
  policyId,
  policyDetails,
  availableGuardrails,
}: PolicyEditClientProps) {
  const router = useRouter();
  const authAxios = useAuthAxios();
  const [isSaving, setIsSaving] = useState(false);
  const { tenant } = useTenant();
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    if (tenant) {
      loadPolicies();
    }
  }, [tenant]);

  const loadPolicies = useCallback(async () => {
    if (!tenant) return;
    try {
      const data = await fetchApplicationPolicies(tenant.slug, applicationId);
      const mappedPolicies: Policy[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        ai_system_policy_prompt: "",
        yaml: p.yaml || "",
        rulesCount: p.rulesCount || 0,
        createdAt: p.createdAt || "",
        version: p.version || "v1",
      }));
      setPolicies(mappedPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
  }, [tenant, applicationId]);

  // Initialize form data from policy details
  const initialComposition = useMemo(() => {
    // Prefer database guardrails over YAML guardrails
    const hasDatabaseGuardrails =
      policyDetails.databaseGuardrails &&
      policyDetails.databaseGuardrails.length > 0;

    if (hasDatabaseGuardrails) {
      return {
        input: guardrailsToCompositionNodes(
          policyDetails.databaseGuardrails,
          "input"
        ),
        output: guardrailsToCompositionNodes(
          policyDetails.databaseGuardrails,
          "output"
        ),
      };
    } else if (
      policyDetails.yamlGuardrails &&
      policyDetails.yamlGuardrails.length > 0
    ) {
      // Fallback to YAML guardrails
      return {
        input: yamlGuardrailsToCompositionNodes(
          policyDetails.yamlGuardrails,
          policyDetails.composition,
          "input"
        ),
        output: yamlGuardrailsToCompositionNodes(
          policyDetails.yamlGuardrails,
          policyDetails.composition,
          "output"
        ),
      };
    }

    return {
      input: [] as CompositionNode[],
      output: [] as CompositionNode[],
    };
  }, [policyDetails]);

  // Map database status to UI status (archived -> completed)
  const getUIStatus = (
    dbStatus: string | null | undefined
  ): "draft" | "active" | "completed" => {
    if (!dbStatus) return "draft";
    const statusLower = dbStatus.toLowerCase();
    if (statusLower === "archived") return "completed";
    if (statusLower === "draft" || statusLower === "active") {
      return statusLower as "draft" | "active";
    }
    // Default to draft for deprecated or unknown statuses
    return "draft";
  };

  const [formData, setFormData] = useState({
    name: policyDetails.name || "",
    description: policyDetails.description || "",
    status: getUIStatus(policyDetails.status),
    inputComposition: initialComposition.input,
    outputComposition: initialComposition.output,
  });

  // Update form data when initial composition is ready
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      inputComposition: initialComposition.input,
      outputComposition: initialComposition.output,
    }));
  }, [initialComposition]);

  // Update status when policyDetails changes
  useEffect(() => {
    const mapStatus = (
      dbStatus: string | null | undefined
    ): "draft" | "active" | "completed" => {
      if (!dbStatus) return "draft";
      const statusLower = dbStatus.toLowerCase();
      if (statusLower === "archived") return "completed";
      if (statusLower === "draft" || statusLower === "active") {
        return statusLower as "draft" | "active";
      }
      return "draft";
    };
    setFormData((prev) => ({
      ...prev,
      status: mapStatus(policyDetails.status),
    }));
  }, [policyDetails.status]);

  // Validation state
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    guardrails: false,
  });

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      guardrails:
        formData.inputComposition.length === 0 &&
        formData.outputComposition.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(
        "Please fill in all required fields and add at least one guardrail"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Build guardrail links from composition nodes (same as create)
      const allGuardrailLinks: any[] = [];
      let orderIndex = 0;

      // Process input composition
      for (const node of formData.inputComposition) {
        const guardrail = availableGuardrails.find(
          (g) => g.key === node.guardrailKey
        );
        if (guardrail) {
          allGuardrailLinks.push({
            guardrail_id: guardrail.id,
            phase: "input",
            order_index: orderIndex++,
            params: node.params || {},
            enabled: true,
          });
        }
      }

      // Process output composition
      for (const node of formData.outputComposition) {
        const guardrail = availableGuardrails.find(
          (g) => g.key === node.guardrailKey
        );
        if (guardrail) {
          allGuardrailLinks.push({
            guardrail_id: guardrail.id,
            phase: "output",
            order_index: orderIndex++,
            params: node.params || {},
            enabled: true,
          });
        }
      }

      // Map "completed" to "archived" for backend
      const backendStatus =
        formData.status === "completed" ? "archived" : formData.status;

      // Prepare the request body (same structure as create)
      const requestBody = {
        name: formData.name,
        description: formData.description,
        version: "v1",
        guardrails: allGuardrailLinks,
        composition: {
          input: "allOf",
          output: "allOf",
        },
        status: backendStatus,
        is_active: backendStatus === "active",
      };

      // Call Python API to update policy (same as create, but PUT method)
      let config: any = {
        method: "PUT",
        url: `/v1/policies/${policyId}`,
      };

      // Use JSON for text-based policy
      config.headers = {
        "Content-Type": "application/json",
      };
      config.data = requestBody;

      const response = await authAxios(`/v1/policies/${policyId}`, config);
      const policy = response.data;

      toast.success("Policy updated successfully!");
      router.push(
        `/${tenantSlug}/applications/${applicationId}/control-net/policies`
      );
    } catch (error: any) {
      // Handle axios error response
      let errorMessage = "Failed to update policy";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Use utility function to parse and display user-friendly error message
      const toastErrorMessage = getToastErrorMessage(new Error(errorMessage));
      toast.error(toastErrorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const totalGuardrails =
    formData.inputComposition.length + formData.outputComposition.length;

  // Transform guardrails for composition builder
  const guardrailOptions = availableGuardrails.map((g) => ({
    key: g.key,
    name: g.name || g.key,
    tier: g.tier,
    description: g.description || "",
    default_params: g.defaultParams || {},
  }));

  const isDuplicatePolicyName = (name: string) => {
    return policies.some(
      (policy) =>
        policy.name.toLowerCase() === name.trim().toLowerCase() &&
        policy.id !== policyId
    );
  };

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update policy details and guardrail composition
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSave();
          }
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Policy Information</CardTitle>
            <CardDescription>Basic details about this policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="policy-name">
                Policy Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="policy-name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ ...formData, name });
                  setErrors({
                    ...errors,
                    name: !name.trim() || isDuplicatePolicyName(name),
                  });
                }}
                placeholder="e.g., HIPAA Compliance Policy"
                className={`mt-1 ${
                  errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {isDuplicatePolicyName(formData.name)
                    ? "A policy with this name already exists"
                    : "Policy name is required"}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description)
                    setErrors({ ...errors, description: false });
                }}
                placeholder="Describe the purpose and scope of this policy..."
                rows={3}
                className={`mt-1 ${
                  errors.description
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  Description is required
                </p>
              )}
            </div>

            {/* <div>
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "active" | "completed") => {
                  setFormData({ ...formData, status: value });
                }}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Guardrails Installed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalGuardrails}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Input Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formData.inputComposition.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Output Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formData.outputComposition.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Guards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{availableGuardrails.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Composition Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Guardrail Composition
            </CardTitle>
            <CardDescription>
              Select guardrails for each phase. Our system automatically
              optimizes execution for best performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="input" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">
                  Input
                  {formData.inputComposition.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {formData.inputComposition.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="output">
                  Output
                  {formData.outputComposition.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {formData.outputComposition.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="space-y-4">
                <div className="bg-muted rounded-lg p-2 flex gap-2 items-center">
                  <Info />
                  <p className="text-sm text-muted-foreground">
                    Guards run on user input before sending to the LLM. Use for
                    PII detection, jailbreak prevention, and input validation.
                  </p>
                </div>
                <CompositionBuilder
                  availableGuardrails={guardrailOptions}
                  value={formData.inputComposition}
                  onChange={(nodes) =>
                    setFormData({ ...formData, inputComposition: nodes })
                  }
                  phase="input"
                />
              </TabsContent>

              <TabsContent value="output" className="space-y-4">
                <div className="bg-muted rounded-lg p-2 flex gap-2 items-center">
                  <Info />
                  <p className="text-sm text-muted-foreground">
                    Guards run on LLM output before returning to user. Use for
                    toxicity detection, factuality checks, and output
                    formatting.
                  </p>
                </div>
                <CompositionBuilder
                  availableGuardrails={guardrailOptions}
                  value={formData.outputComposition}
                  onChange={(nodes) =>
                    setFormData({ ...formData, outputComposition: nodes })
                  }
                  phase="output"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className=" border-t pt-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !formData.name.trim() ||
                isDuplicatePolicyName(formData.name) ||
                !formData.description.trim() ||
                totalGuardrails === 0
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Policy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
