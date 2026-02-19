"use client";

import type React from "react";

import {
  Plus,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  MoreHorizontal,
  Calendar,
  FileText,
  Shield,
  Settings,
  Copy,
  Check,
  Loader2,
  Upload,
  Pencil,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TenantInfo, useTenant } from "@/contexts/TenantContext";
import { useAuth, useUser } from "@clerk/nextjs";
import { errorToast, successToast } from "@/lib/utils/toast";
import { fetchGuardrails, type Guardrail } from "@/lib/api/guardrails";
import {
  deletePolicy,
  getPolicyById,
  fetchApplicationPolicies,
  fetchPolicyDetails,
  type Policy as APIPolicy,
  type TransformedPolicy,
} from "@/lib/api/policies";
import { useAuthAxios } from "@/lib/api/auth-axios";
import { getUserFriendlyErrorMessage } from "@/lib/utils/policy-error-parser";
import PolicyDetailsModal from "./PolicyDetail";

export interface Policy {
  id: string;
  name: string;
  description: string;
  ai_system_policy_prompt: string;
  yaml: string;
  rulesCount: number;
  createdAt: string;
  version: string;
  status?: string;
  isActive?: boolean;
}

export interface PolicyDetails {
  id: string;
  name: string;
  description: string | null;
  version: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  yaml: string | null;
  composition: any;
  yamlGuardrails: any[];
  databaseGuardrails: any[];
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  updatedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

// Backend Policy structure
interface BackendPolicy {
  id: string;
  tenant_id: string;
  name: string;
  version: string;
  slug: string;
  description: string;
  ai_system_policy_prompt: string;
  yaml: string;
  hash: string;
  status: string;
  is_active: boolean;
  metadata: any;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}
import { formatTimestamp } from "@/lib/utils/dateTime";

const fetchPolicies = async (
  tenantSlug: string,
  applicationId: string
): Promise<Policy[]> => {
  try {
    const data = await fetchApplicationPolicies(tenantSlug, applicationId);
    console.log("data 131", data);
    // Transform API response to component Policy type
    // The actual data from getApplicationPolicies has rulesCount and createdAt,
    // but the type annotation says it's APIPolicy[], so we need to map it properly
    return (data as TransformedPolicy[]).map((policy) => ({
      id: policy.id,
      name: policy.name,
      description: policy.description || "",
      status: policy.status,
      isActive: policy.isActive,
      ai_system_policy_prompt: "",
      yaml: policy.yaml || "",
      rulesCount: policy.rulesCount,
      createdAt: policy.createdAt,
      version: policy.version,
    }));
  } catch (error) {
    console.error("Error fetching policies:", error);
    throw error; // Re-throw to be handled by the calling function
  }
};

const createPolicyAPI = async (
  authAxios: (url: string, config?: any) => Promise<any>,
  tenant: TenantInfo,
  data: PolicyFormData,
  applicationId: string
): Promise<BackendPolicy | null> => {
  try {
    // Build guardrails array from form data
    const guardrails = [];
    let orderIndex = 0;

    // Get guardrails data to access default_params
    const guardrailsData = await fetchGuardrails(tenant?.slug);

    // Add input guardrails
    for (const guardrailId of data.inputGuardrails) {
      const guardrail = guardrailsData.find((g) => g.id === guardrailId);
      guardrails.push({
        guardrail_id: guardrailId,
        phase: "input",
        params: guardrail?.default_params || {},
        order_index: orderIndex++,
      });
    }

    // Add output guardrails
    for (const guardrailId of data.outputGuardrails) {
      const guardrail = guardrailsData.find((g) => g.id === guardrailId);
      guardrails.push({
        guardrail_id: guardrailId,
        phase: "output",
        params: guardrail?.default_params || {},
        order_index: orderIndex++,
      });
    }

    // Build composition object
    const composition = {
      input: "allOf",
      output: "allOf",
    };

    // Prepare the request body
    const requestBody = {
      name: data.name,
      description: data.description,
      selected_guardrails: guardrails,
      composition_strategy: composition,
    };

    // Prepare request data
    let requestData: any;
    let config: any = {
      method: "POST",
      url: "/v1/policies/",
    };

    if (data.uploadedFile) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("guardrails", JSON.stringify(guardrails));
      formData.append("composition", JSON.stringify(composition));
      formData.append("status", "active");
      formData.append("is_active", true.toString());
      // Note: composition_strategy not supported by current file upload endpoint
      formData.append("file", data.uploadedFile);

      requestData = formData;
      // Axios will automatically set Content-Type for FormData
    } else {
      // Use JSON for text-based policy
      requestData = requestBody;
      config.headers = {
        "Content-Type": "application/json",
      };
    }

    config.data = { ...requestData, applicationId };

    // Use authAxios which adds authentication headers automatically
    // nginx routes /v1/ to controlnet backend
    // Security: tenant_id, created_by, updated_by are ALL derived from authenticated context on backend
    // - tenant_id: from X-Tenant-ID header (validated against user's membership)
    // - user_id: from JWT 'sub' claim (Clerk user ID)
    const response = await authAxios("/v1/policies/", config);
    const result = response.data;
    return result;
  } catch (error) {
    console.error("Error creating policy:", error);
    throw error; // Re-throw to be handled by the calling function
  }
};

const deletePolicyAPI = async (
  tenantSlug: string,
  id: string
): Promise<boolean> => {
  try {
    const { deletePolicy } = await import("@/lib/api/policies");
    await deletePolicy(tenantSlug, id);
    return true;
  } catch (error) {
    console.error("Error deleting policy:", error);
    return false;
  }
};

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  policyName: string;
  isDeleting?: boolean;
}> = ({ isOpen, onClose, onConfirm, policyName, isDeleting = false }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <Trash2 className="w-5 h-5" />
            Delete Policy
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete this policy? This action cannot be
            undone.
          </p>
          <div className=" p-3 rounded-md">
            <p className="text-sm font-medium ">
              Policy: <span className="text-blue-600">{policyName}</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Policy
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
      let className = "";

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
        <h4 className="text-sm font-medium ">YAML Configuration</h4>
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
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
        <pre className="text-xs leading-relaxed">{formatYAML(yaml)}</pre>
      </div>
    </div>
  );
};

// Policy Creation Form Data Interface
interface PolicyFormData {
  // Step 1: Policy Information
  name: string;
  description: string;
  ai_system_policy_prompt: string;
  uploadedFile: File | null;

  // Step 2: Guardrails
  inputGuardrails: string[];
  outputGuardrails: string[];

  // Step 3: Composition
  inputComposition: "allOf" | "anyOf" | "custom";
  outputComposition: "allOf" | "anyOf" | "custom";
  customInputExpression: string;
  customOutputExpression: string;
}

// Create Policy Modal Component
const CreatePolicyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PolicyFormData) => void;
  disabled?: boolean;
}> = ({ isOpen, onClose, onSave, disabled = false }) => {
  const { tenant } = useTenant();
  const { user: clerkUser } = useUser();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [isLoadingGuardrails, setIsLoadingGuardrails] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);

  const [formData, setFormData] = useState<PolicyFormData>({
    name: "",
    description: "",
    ai_system_policy_prompt: "",
    uploadedFile: null,
    inputGuardrails: [],
    outputGuardrails: [],
    inputComposition: "allOf",
    outputComposition: "allOf",
    customInputExpression: "",
    customOutputExpression: "",
  });

  // Load guardrails when modal opens
  useEffect(() => {
    if (isOpen && tenant?.slug) {
      loadGuardrails();
    }
  }, [isOpen, tenant?.slug]);

  const loadGuardrails = async () => {
    if (!tenant?.slug) return;

    setIsLoadingGuardrails(true);
    try {
      const data = await fetchGuardrails(tenant.slug);
      setGuardrails(data);
    } catch (error) {
      console.error("Error loading guardrails:", error);
    } finally {
      setIsLoadingGuardrails(false);
    }
  };

  const handleInputChange = (field: keyof PolicyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or TXT file only.");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB.");
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
        alert("Please upload a PDF or TXT file only.");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, uploadedFile: file }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, uploadedFile: null }));
  };

  const handleGuardrailToggle = (
    guardrailId: string,
    phase: "input" | "output"
  ) => {
    const field = phase === "input" ? "inputGuardrails" : "outputGuardrails";
    const currentList = formData[field];

    if (currentList.includes(guardrailId)) {
      setFormData((prev) => ({
        ...prev,
        [field]: currentList.filter((id) => id !== guardrailId),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...currentList, guardrailId],
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const hasNameAndDescription = Boolean(
      formData.name.trim() && formData.description.trim()
    );
    const hasPolicyContent =
      Boolean(formData.ai_system_policy_prompt.trim()) ||
      Boolean(formData.uploadedFile !== null);

    return hasNameAndDescription && hasPolicyContent;
  };

  const validateStep2 = (): boolean => {
    return (
      formData.inputGuardrails.length > 0 &&
      formData.outputGuardrails.length > 0
    );
  };

  const validateStep3 = (): boolean => {
    const inputValid =
      formData.inputComposition !== "custom" ||
      formData.customInputExpression.trim() !== "";
    const outputValid =
      formData.outputComposition !== "custom" ||
      formData.customOutputExpression.trim() !== "";
    return inputValid && outputValid;
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!canProceedToNext()) {
      alert("Please complete all required fields");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        ai_system_policy_prompt: "",
        uploadedFile: null,
        inputGuardrails: [],
        outputGuardrails: [],
        inputComposition: "allOf",
        outputComposition: "allOf",
        customInputExpression: "",
        customOutputExpression: "",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error saving policy:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white text-black flex flex-col">
        <DialogHeader className="space-y-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-black">
            Create New Policy
          </DialogTitle>
          <div className="text-muted-foreground text-sm space-y-1">
            <p>
              Policy is code of conduct or guidelines for an AI Application.
            </p>
            <p>
              Entering a policy generates atomized rules. The atomized rules are
              used for customized red teaming and policy violation guardrails.
            </p>
          </div>
        </DialogHeader>

        <Tabs
          value={currentStep.toString()}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="1"
              className="flex items-center gap-2"
              onClick={() => setCurrentStep(1)}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                  currentStep >= 1
                    ? "bg-black text-white"
                    : "bg-gray-200 text-muted-foreground"
                }`}
              >
                1
              </span>
              Policy Information
            </TabsTrigger>
            <TabsTrigger
              value="2"
              className="flex items-center gap-2"
              onClick={() => {
                if (validateStep1()) {
                  setCurrentStep(2);
                }
              }}
              disabled={!validateStep1()}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                  currentStep >= 2
                    ? "bg-black text-white"
                    : validateStep1()
                      ? "bg-gray-200 text-muted-foreground"
                      : "bg-gray-100 text-muted-foreground"
                }`}
              >
                2
              </span>
              Compose Guardrails
            </TabsTrigger>
            <TabsTrigger
              value="3"
              className="flex items-center gap-2"
              onClick={() => {
                if (validateStep1() && validateStep2()) {
                  setCurrentStep(3);
                }
              }}
              disabled={!validateStep1() || !validateStep2()}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                  currentStep >= 3
                    ? "bg-black text-white"
                    : validateStep1() && validateStep2()
                      ? "bg-gray-200 text-muted-foreground"
                      : "bg-gray-100 text-muted-foreground"
                }`}
              >
                3
              </span>
              Composition Logic
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="1" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="policy-name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="policy-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter policy name"
                />
                {!formData.name.trim() && (
                  <p className="text-xs text-red-500">
                    Policy name is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy-name" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="policy-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter policy description"
                  maxLength={255}
                />
                {!formData.description.trim() && (
                  <p className="text-xs text-red-500">
                    Policy description is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="policy-prompt"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  AI System Policy Prompt{" "}
                  <span className="text-red-500">*</span>
                  <Info
                    size={16}
                    className="text-muted-foreground cursor-help"
                  />
                </Label>

                <Textarea
                  id="policy-prompt"
                  value={formData.ai_system_policy_prompt}
                  onChange={(e) =>
                    handleInputChange("ai_system_policy_prompt", e.target.value)
                  }
                  className="focus:ring-2 focus:ring-black focus:border-black min-h-[200px]"
                  placeholder="Enter your policy prompt here..."
                />

                <div className="text-center">
                  <div className="text-muted-foreground mb-4">OR</div>

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                      <div className="text-sm text-muted-foreground mb-2">
                        <span
                          className="text-blue-600 cursor-pointer hover:underline font-medium"
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
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                {formData.uploadedFile.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {(formData.uploadedFile.size / 1024 / 1024).toFixed(
                              2
                            )}{" "}
                            MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    variant="link"
                    className=" p-0 h-auto hover:underline"
                  >
                    Try Sample
                  </Button>
                </div>

                {!formData.ai_system_policy_prompt.trim() &&
                  !formData.uploadedFile && (
                    <p className="text-xs text-red-500">
                      Either policy prompt text or file upload is required
                    </p>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="2" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Phase */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium  mb-2">
                      Input Phase <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select guardrails to apply to incoming messages
                    </p>
                  </div>

                  {isLoadingGuardrails ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading guardrails...</span>
                    </div>
                  ) : guardrails.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No guardrails available
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {guardrails.map((guardrail) => (
                          <Button
                            key={guardrail.id}
                            variant={
                              formData.inputGuardrails.includes(guardrail.id)
                                ? "default"
                                : "outline"
                            }
                            className={`justify-start h-auto p-3 text-left ${
                              formData.inputGuardrails.includes(guardrail.id)
                                ? "bg-black text-white hover:bg-gray-800"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              handleGuardrailToggle(guardrail.id, "input")
                            }
                          >
                            <div className="flex flex-col items-start w-full">
                              <div className="font-medium text-sm">
                                {guardrail.key}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {guardrail.description}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Phase */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-black mb-2">
                      Output Phase <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select guardrails to apply to outgoing responses
                    </p>
                  </div>

                  {isLoadingGuardrails ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading guardrails...</span>
                    </div>
                  ) : guardrails.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No guardrails available
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {guardrails.map((guardrail) => (
                          <Button
                            key={guardrail.id}
                            variant={
                              formData.outputGuardrails.includes(guardrail.id)
                                ? "default"
                                : "outline"
                            }
                            className={`justify-start h-auto p-3 text-left ${
                              formData.outputGuardrails.includes(guardrail.id)
                                ? "bg-black text-white hover:bg-gray-800"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              handleGuardrailToggle(guardrail.id, "output")
                            }
                          >
                            <div className="flex flex-col items-start w-full">
                              <div className="font-medium text-sm">
                                {guardrail.key}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {guardrail.description}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(formData.inputGuardrails.length === 0 ||
                formData.outputGuardrails.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500">
                    Please select at least one guardrail for both input and
                    output phases
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="3" className="space-y-6 mt-6">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-black mb-2">
                    Composition Logic
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configure how guardrails are combined for each phase
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Input Composition */}
                  <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Input Phase
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        How should input guardrails be combined?
                      </p>
                    </div>

                    <RadioGroup
                      value={formData.inputComposition}
                      onValueChange={(value) =>
                        handleInputChange("inputComposition", value)
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="allOf" id="input-allOf" />
                        <Label
                          htmlFor="input-allOf"
                          className="text-sm font-medium cursor-pointer"
                        >
                          All must pass (allOf)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anyOf" id="input-anyOf" />
                        <Label
                          htmlFor="input-anyOf"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Any can pass (anyOf)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="input-custom" />
                        <Label
                          htmlFor="input-custom"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Custom expression
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.inputComposition === "custom" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Custom Expression
                        </Label>
                        <Input
                          placeholder="e.g., allOf(guard1, guard2) or anyOf(guard1, guard2)"
                          value={formData.customInputExpression}
                          onChange={(e) =>
                            handleInputChange(
                              "customInputExpression",
                              e.target.value
                            )
                          }
                          className="font-mono text-sm"
                        />
                        {formData.inputComposition === "custom" &&
                          !formData.customInputExpression.trim() && (
                            <p className="text-xs text-red-500">
                              Custom expression is required
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Output Composition */}
                  <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Output Phase
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        How should output guardrails be combined?
                      </p>
                    </div>

                    <RadioGroup
                      value={formData.outputComposition}
                      onValueChange={(value) =>
                        handleInputChange("outputComposition", value)
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="allOf" id="output-allOf" />
                        <Label
                          htmlFor="output-allOf"
                          className="text-sm font-medium cursor-pointer"
                        >
                          All must pass (allOf)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anyOf" id="output-anyOf" />
                        <Label
                          htmlFor="output-anyOf"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Any can pass (anyOf)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="output-custom" />
                        <Label
                          htmlFor="output-custom"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Custom expression
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.outputComposition === "custom" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Custom Expression
                        </Label>
                        <Input
                          placeholder="e.g., allOf(guard1, guard2) or anyOf(guard1, guard2)"
                          value={formData.customOutputExpression}
                          onChange={(e) =>
                            handleInputChange(
                              "customOutputExpression",
                              e.target.value
                            )
                          }
                          className="font-mono text-sm"
                        />
                        {formData.outputComposition === "custom" &&
                          !formData.customOutputExpression.trim() && (
                            <p className="text-xs text-red-500">
                              Custom expression is required
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSaving}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-gray-800"
              disabled={isSaving}
            >
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={!canProceedToNext() || isSaving}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={!canProceedToNext() || isSaving || disabled}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Policy"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Policies Tab Component
const PoliciesTab = () => {
  const router = useRouter();
  const { tenant } = useTenant();
  const paramsFromHook = useParams();
  const applicationId = paramsFromHook.applicationId as string;
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const authAxios = useAuthAxios();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<APIPolicy | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPolicyDetailsModal, setShowPolicyDetailsModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [policy, setPolicy] = useState<PolicyDetails | null>(null);

  useEffect(() => {
    if (tenant) {
      loadPolicies();
    }
  }, [tenant]);

  const loadPolicies = async () => {
    if (!tenant) return;

    setIsLoading(true);
    try {
      const data = await fetchPolicies(tenant.id, applicationId);
      setPolicies(data);
    } catch (error) {
      console.error("Error loading policies:", error);
      // Show user-friendly error message
      alert("Failed to load policies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePolicy = async (data: PolicyFormData) => {
    if (!tenant || !clerkUser) return;

    try {
      // Security: Fail-fast if user context not loaded
      // Backend will use auth.local_user_id from X-User-ID header (sent by authFetch)
      if (!clerkUser?.id) {
        alert("User context not loaded. Please refresh the page.");
        return;
      }

      const created = await createPolicyAPI(
        authAxios,
        tenant,
        data,
        applicationId
      );

      if (created) {
        await loadPolicies();
        successToast("", "", "", "Policy created successfully!");
      } else {
        throw new Error("Failed to create policy");
      }
    } catch (error) {
      console.error("Error saving policy:", error);

      // Use utility function to parse and display user-friendly error message
      const errorMessage = getUserFriendlyErrorMessage(
        error instanceof Error ? error : new Error(String(error))
      );
      alert(errorMessage);
    }
  };

  const loadPolicyDetails = async (policyId: string) => {
    if (!policyId || !tenant?.slug) return;

    try {
      const policyData = (await fetchPolicyDetails(
        tenant.slug,
        policyId
      )) as PolicyDetails;
      setPolicy(policyData);
      setShowPolicyDetailsModal(true);
    } catch (err) {
      errorToast("Failed to load policy details");
    }
  };

  const handleViewPolicy = async (policyId: string) => {
    setOpenDropdownId(null);
    loadPolicyDetails(policyId);
  };

  const handleDeletePolicy = (policyId: string, policyName: string) => {
    setPolicyToDelete({ id: policyId, name: policyName });
    setShowDeleteDialog(true);
    setOpenDropdownId(null);
  };

  const confirmDeletePolicy = async () => {
    if (!tenant || !policyToDelete) return;

    setIsDeleting(true);
    try {
      await deletePolicy(tenant.slug, policyToDelete.id);
      await loadPolicies();
      successToast("", "", "", "Policy deleted successfully!");
      setShowDeleteDialog(false);
      setPolicyToDelete(null);
    } catch (error) {
      console.error("Error deleting policy:", error);
      alert("Failed to delete policy");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeletePolicy = () => {
    setShowDeleteDialog(false);
    setPolicyToDelete(null);
  };

  const handleDropdownOpenChange = (open: boolean, policyId: string) => {
    if (open) {
      setOpenDropdownId(policyId);
    } else {
      setOpenDropdownId(null);
    }
  };

  const handleDropdownAction = (action: () => void, policyId: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDropdownOpenChange(false, policyId);
      setTimeout(() => {
        action();
      }, 50);
    };
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    const statusLower = status?.toLowerCase() || "draft";

    if (statusLower === "active" && isActive) {
      return <Badge className="bg-green-500/10 text-green-500 ">Active</Badge>;
    } else if (statusLower === "draft") {
      return <Badge className="bg-yellow-500/10 text-yellow-500 ">Draft</Badge>;
    } else if (statusLower === "archived") {
      return <Badge className="bg-blue-500/10 text-blue-500">Completed</Badge>;
    } else if (statusLower === "deprecated") {
      return (
        <Badge className="bg-orange-500/10 text-orange-500 ">Deprecated</Badge>
      );
    } else {
      return (
        <Badge className="bg-muted text-muted-foreground">
          {status || "Unknown"}
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading policies...</span>
          </div>
        </div>
      </>
    );
  }
  console.log("policies 1380", policies);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold ">Policies</h1>
          <p className="text-muted-foreground mt-2">
            Policy is code of conduct or guidelines for an AI Application.
          </p>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            <li>
              • Add a policy to setup customized red teaming against the policy.
            </li>
            <li>
              • Setup for Guardrails for a policy to monitor policy violations
              in real time.
            </li>
          </ul>
        </div>
        <Button
          onClick={() =>
            router.push(
              `/${tenant?.slug}/applications/${applicationId}/control-net/policies/create-new-policy`
            )
          }
        >
          <Plus size={16} />
          Create New Policy
        </Button>
      </div>

      <div className=" rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead className="font-semibold ">Name</TableHead>
              <TableHead className="font-semibold ">Description</TableHead>
              {/* <TableHead className="font-semibold ">
                Version
              </TableHead> */}
              {/* <TableHead className="font-semibold ">Status</TableHead> */}
              <TableHead className="font-semibold ">Created</TableHead>
              <TableHead className="font-semibold  w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <p>
                      No policies created. Create your first policy to enable
                      Red Teaming.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy: Policy) => (
                <TableRow key={policy.id} className="">
                  <TableCell className="font-medium">
                    <button
                      className="flex items-center gap-2  hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => router.push("policies/" + policy.id)}
                    >
                      <FileText className="h-4 w-4" />
                      {policy.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {policy.description || "No description"}
                  </TableCell>
                  {/* <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {(policy as any).version || "v1"}
                    </Badge>
                  </TableCell> */}
                  {/* <TableCell>
                    {getStatusBadge(
                      (policy as any).status,
                      (policy as any).isActive
                    )}
                  </TableCell> */}
                  <TableCell className="text-muted-foreground text-sm">
                    {formatTimestamp(policy.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu
                      open={openDropdownId === policy.id}
                      onOpenChange={(open) =>
                        handleDropdownOpenChange(open, policy.id)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={() => router.push("policies/" + policy.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("policies/" + policy.id + "/edit")
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={handleDropdownAction(
                            () => handleDeletePolicy(policy.id, policy.name),
                            policy.id
                          )}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
        <span>Page 1 of 1</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-muted-foreground bg-transparent"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-muted-foreground bg-transparent"
          >
            Next
          </Button>
        </div>
      </div>

      <CreatePolicyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSavePolicy}
        disabled={!clerkUser}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDeletePolicy}
        onConfirm={confirmDeletePolicy}
        policyName={policyToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PoliciesTab;
