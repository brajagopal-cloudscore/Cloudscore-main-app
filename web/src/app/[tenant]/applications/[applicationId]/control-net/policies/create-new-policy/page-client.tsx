"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ArrowLeft,
  Save,
  FileCode,
  Shield,
  Loader2,
  Upload,
  FileText,
  Trash2,
  Info,
} from "lucide-react";
import {
  CompositionBuilder,
  type CompositionNode,
} from "@/components/control-net/CompositionBuilder";
import { useAuthAxios } from "@/lib/api/auth-axios";
import { toast } from "react-hot-toast";
import { getToastErrorMessage } from "@/lib/utils/policy-error-parser";
import { Policy } from "@/components/control-net/Polices";
import {
  fetchApplicationPolicies,
  type Policy as APIPolicy,
} from "@/lib/api/policies";
interface Guardrail {
  id: string;
  key: string;
  name: string;
  tier: string;
  description: string;
  defaultParams: Record<string, any>;
}

interface PolicyCreationClientProps {
  tenantSlug: string;
  userId: string;
  availableGuardrails: Guardrail[];
}
import { useTenant } from "@/contexts/TenantContext";
export function PolicyCreationClient({
  tenantSlug,
  userId,
  availableGuardrails,
}: PolicyCreationClientProps) {
  const router = useRouter();
  const authAxios = useAuthAxios();
  const [isSaving, setIsSaving] = useState(false);
  const { tenant } = useTenant();
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    if (tenant) {
      loadPolicies();
    }
    // console.log("tenant", tenant);
  }, [tenant]);

  const paramsFromHook = useParams();
  const applicationId = paramsFromHook.applicationId as string;

  const loadPolicies = useCallback(async () => {
    if (!tenant) return;
    try {
      const data = await fetchApplicationPolicies(tenant.slug, applicationId);
      // Map to component's Policy interface format
      // The server action returns policies with rulesCount and createdAt
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
      alert("Failed to load policies. Please try again.");
    }
  }, [tenant, applicationId]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ai_system_policy_prompt: "",
    uploadedFile: null as File | null,
    inputComposition: [] as CompositionNode[],
    outputComposition: [] as CompositionNode[],
  });

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or TXT file only.");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB.");
        return;
      }
    }
    setFormData((prev) => ({ ...prev, uploadedFile: file }));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Validate file type
      const allowedTypes = ["application/pdf", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or TXT file only.");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, uploadedFile: file }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, uploadedFile: null }));
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
      // Convert compositions to guardrail links format
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

      // Prepare the request body
      const requestBody = {
        name: formData.name,
        description: formData.description,
        guardrails: allGuardrailLinks,
        composition: {
          input: "allOf",
          output: "allOf",
          tool_args: "allOf",
          tool_result: "allOf",
        },
        status: "active",
        is_active: true,
        application_id: applicationId,
      };

      // Prepare request data
      let requestData: any;
      let config: any = {
        method: "POST",
        url: "/v1/policies",
      };

      if (formData.uploadedFile) {
        // Create FormData for file upload
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("description", formData.description);
        formDataObj.append("guardrails", JSON.stringify(allGuardrailLinks));
        (formDataObj.append(
          "composition",
          JSON.stringify({
            input: "allOf",
            output: "allOf",
            tool_args: "allOf",
            tool_result: "allOf",
          })
        ),
          formDataObj.append("status", "active"),
          formDataObj.append("is_active", true.toString()),
          formDataObj.append("use_ai_analysis", true.toString()),
          formDataObj.append(
            "file",
            formData.uploadedFile,
            formData.uploadedFile.name
          ));
        formDataObj.append("application_id", applicationId);

        requestData = formDataObj;
        // Axios will automatically set Content-Type for FormData
      } else {
        // Use JSON for text-based policy
        requestData = requestBody;
        config.headers = {
          "Content-Type": "application/json",
        };
      }

      config.data = requestData;

      // Call Python API to create policy (generates YAML)
      const response = await authAxios("/v1/policies", config);
      const policy = response.data;
      toast.success("Policy created successfully!");
      router.push(
        `/${tenantSlug}/applications/${applicationId}/control-net/policies`
      );
    } catch (error: any) {
      console.error("Failed to create policy:", error);

      // Handle axios error response
      let errorMessage = "Failed to create policy";
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
    default_params: g.defaultParams || {}, // Include default parameters
  }));

  const isDuplicatePolicyName = (name: string) => {
    return policies.some(
      (policy) => policy.name.toLowerCase() === name.trim().toLowerCase()
    );
  };

  return (
    <div className="p-6 space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold ">Create New Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compose guardrails into a comprehensive policy
            </p>
          </div>
        </div>
      </div>

      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSave();
          }
        }}
        className="space-y-4"
      >
        {/* Basic Information */}
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
                className={`mt-1 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                className={`mt-1 ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  Description is required
                </p>
              )}
            </div>

            <div className="text-center mt-4 hidden">
              <div
                className=" rounded-lg p-8  transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                  <div className="text-sm text-muted-foreground mb-2">
                    <span
                      className="text-blue-500 cursor-pointer hover:underline font-medium"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Click to upload
                    </span>{" "}
                    or drag and drop your policy file
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Supported formats: PDF, TXT (max. 10MB)
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {formData.uploadedFile && (
                    <div className="mt-3 p-3 bg-green-500/10  rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-700 font-medium">
                            {formData.uploadedFile.name}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveFile}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-green-500 mt-1">
                        {(formData.uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              <p className="text-3xl font-bold ">{totalGuardrails}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Input Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold ">
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
              <p className="text-3xl font-bold ">
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
              <p className="text-3xl font-bold ">
                {availableGuardrails.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Composition Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
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
                  <Info></Info>

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
                  <Info></Info>

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

        {/* Save Button (sticky bottom) */}
        <div className="border-t pt-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
              className=""
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Policy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
