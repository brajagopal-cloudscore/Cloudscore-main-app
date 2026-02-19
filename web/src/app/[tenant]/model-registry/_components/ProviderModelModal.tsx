"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getModelsByProvider } from "@/lib/actions/model-register";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
interface ProviderModel {
  id: string;
  provider: string;
  modelId: string;
  displayName?: string | null;
  family?: string | null;
  modality?: string[] | null;
  contextWindowTokens?: number | null;
  maxOutputTokens?: number | null;
  inputCostPer1K?: string | null;
  outputCostPer1K?: string | null;
  availabilityStatus?: string | null;
  tenantId?: string | null;
  supportsStreaming?: boolean | null;
  supportsJson?: boolean | null;
  currency?: string | null;
  // Database fields
  modelUrl?: string | null;
  purposeUseCase?: string | null;
  riskLevel?: "Low" | "Medium" | "High" | "Critical" | "N/A" | null;
  category?: "llm" | "3rd_party" | "1st_party" | null;
  status?: string | null;
}

interface ModelMetadata {
  id: string;
  provider: string;
  modelId?: string | null; // API identifier (e.g., gpt-4o) - may be null if not set in DB
  displayName: string;
  contextWindow: string | null;
  inputCost: string | null;
  outputCost: string | null;
}

interface Props {
  isOpen: boolean;
  mode: "create" | "edit";
  model?: ProviderModel | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isPending: boolean;
  tenantId?: string;
}

// Provider URL mappings
const providerUrls: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  vertex: "https://vertexai.googleapis.com/v1",
  bedrock: "https://bedrock-runtime.us-east-1.amazonaws.com",
  azure_openai: "https://your-resource.openai.azure.com",
  groq: "https://api.groq.com/openai/v1",
  ollama: "http://localhost:11434/v1",
  huggingface: "",
  custom: "",
};

export function ProviderModelModal({
  isOpen,
  mode,
  model,
  onClose,
  onSubmit,
  isPending,
  tenantId,
}: Props) {
  const [formData, setFormData] = useState({
    provider: "openai",
    displayName: "",
    family: "",
    modelUrl: providerUrls["openai"] || "", // Auto-filled from provider
    // Hidden fields for submission (use defaults)
    modality: "text",
    contextWindowTokens: "",
    maxOutputTokens: "",
    supportsStreaming: true,
    supportsJson: true,
    inputCostPer1K: "",
    outputCostPer1K: "",
    currency: "USD",
    availabilityStatus: "available",
    isGlobal: true,
    purpose: "",
    riskLevel: "N/A",
    category: "llm",
    status: "active",
  });

  const [availableModels, setAvailableModels] = useState<ModelMetadata[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load models when provider changes (only in create mode)
  useEffect(() => {
    const loadModels = async () => {
      if (
        mode === "create" &&
        formData.provider &&
        formData.provider !== "huggingface" &&
        isOpen
      ) {
        setLoadingModels(true);
        try {
          const res = await getModelsByProvider(formData.provider);
          if (res.status && res.models) {
            setAvailableModels(res.models);
            // Restore selection if family matches a model
            if (formData.family && !selectedModelId) {
              const matchingModel = res.models.find(
                (m) => (m.modelId && m.modelId === formData.family) || 
                       (m.displayName && m.displayName === formData.family)
              );
              if (matchingModel) {
                setSelectedModelId(matchingModel.id);
              }
            }
            if (res.models.length === 0) {
              console.log(
                `No pre-configured models found for ${formData.provider}`
              );
            }
          } else {
            setAvailableModels([]);
          }
        } catch (error) {
          console.error("Error loading models:", error);
          setAvailableModels([]);
        } finally {
          setLoadingModels(false);
        }
      } else {
        setAvailableModels([]);
      }
    };

    loadModels();
  }, [formData.provider, mode, isOpen]);

  // Reset form when modal opens/closes or model changes
  useEffect(() => {
    if (mode === "edit" && model) {
      setFormData({
        provider: model.provider || "openai",
        displayName: model.displayName || "",
        family: model.family || model.modelId || "",
        modelUrl: model.modelUrl || providerUrls[model.provider || "openai"] || "",
        // Hidden fields for submission
        modality: (model.modality && model.modality[0]) || "text",
        contextWindowTokens: model.contextWindowTokens?.toString() || "",
        maxOutputTokens: model.maxOutputTokens?.toString() || "",
        supportsStreaming: model.supportsStreaming ?? true,
        supportsJson: model.supportsJson ?? true,
        inputCostPer1K: model.inputCostPer1K || "",
        outputCostPer1K: model.outputCostPer1K || "",
        currency: model.currency || "USD",
        availabilityStatus: model.availabilityStatus || "available",
        isGlobal: !model.tenantId,
        purpose: model.purposeUseCase || "",
        riskLevel: model.riskLevel || "N/A",
        category: model.category || "llm",
        status: model.status || "active",
      });
    } else {
      const defaultProvider = "openai";
      setFormData({
        provider: defaultProvider,
        displayName: "",
        family: "",
        modelUrl: providerUrls[defaultProvider] || "",
        // Hidden fields for submission
        modality: "text",
        contextWindowTokens: "",
        maxOutputTokens: "",
        supportsStreaming: true,
        supportsJson: true,
        inputCostPer1K: "",
        outputCostPer1K: "",
        currency: "USD",
        availabilityStatus: "available",
        isGlobal: true,
        purpose: "",
        riskLevel: "N/A",
        category: "llm",
        status: "active",
      });
    }
    setErrors({});
    setSelectedModelId("");
  }, [mode, model, isOpen]);

  const handleModelSelect = (value: string) => {
    if (!value) {
      setSelectedModelId("");
      setFormData((prev) => ({ ...prev, family: "", displayName: "" }));
      return;
    }

    setSelectedModelId(value);
    const model = availableModels.find((m) => m.id === value);
    if (model) {
      // modelId = API identifier (e.g., "gpt-4o"), displayName = human readable
      const modelName = model.modelId || model.displayName;
      setFormData((prev) => ({
        ...prev,
        family: modelName,
        displayName: model.displayName || modelName,
      }));
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.provider) {
      newErrors.provider = "Provider is required";
    }
    if (!formData.modelUrl?.trim()) {
      newErrors.modelUrl = "Model URL is required";
    }
    if (!formData.family?.trim()) {
      newErrors.family = "Model name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // Prepare data for submission - modelId is the API identifier (e.g., "gpt-4o")
      const submitData = {
        provider: formData.provider,
        modelId: formData.family.trim(), // This is the API model identifier
        modelUrl: formData.modelUrl.trim(),
        tenantId: formData.isGlobal ? null : tenantId,
      };

      // Add dummy data for hugging face, use form data for other providers
      if (formData.provider === "huggingface") {
        // For Hugging Face: Use dummy data for all fields except provider, modelId, modelUrl, and tenantId
        Object.assign(submitData, {
          displayName: formData.displayName || formData.family || "Hugging Face Model",
          family: formData.family || "huggingface",
          modality: ["text"],
          contextWindowTokens: 2048,
          maxOutputTokens: 512,
          supportsStreaming: true,
          supportsJson: false,
          inputCostPer1K: "0.00",
          outputCostPer1K: "0.00",
          currency: "USD",
          availabilityStatus: "available",
          purposeUseCase: "General purpose model from Hugging Face",
          riskLevel: "Medium" as "Low" | "Medium" | "High" | "Critical" | "N/A",
          category: "3rd_party" as "llm" | "3rd_party" | "1st_party",
        });
      } else {
        // For all other providers: Use form data
        Object.assign(submitData, {
          displayName: formData.displayName || undefined,
          family: formData.family || undefined,
          modality: formData.modality ? [formData.modality] : ["text"],
          contextWindowTokens: formData.contextWindowTokens
            ? parseInt(formData.contextWindowTokens)
            : undefined,
          maxOutputTokens: formData.maxOutputTokens
            ? parseInt(formData.maxOutputTokens)
            : undefined,
          supportsStreaming: formData.supportsStreaming,
          supportsJson: formData.supportsJson,
          inputCostPer1K: formData.inputCostPer1K || undefined,
          outputCostPer1K: formData.outputCostPer1K || undefined,
          currency: formData.currency,
          availabilityStatus: formData.availabilityStatus,
          purposeUseCase: formData.purpose || undefined,
          riskLevel: formData.riskLevel as
            | "Low"
            | "Medium"
            | "High"
            | "Critical"
            | "N/A",
          category: formData.category as "llm" | "3rd_party" | "1st_party",
        });
      }

      await onSubmit(submitData);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save model" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {mode === "create" ? "Add Model" : "Edit Model"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add an approved AI model to your organization's catalog
          </DialogDescription>
        </DialogHeader>
        {/* id="model-submit" */}
        <div
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        >
          <div className="space-y-6 py-4">
            {/* Provider and Model URL */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-sm font-medium">
                  Provider *
                </Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => {
                    const autoUrl = providerUrls[value] || "";
                    setFormData((prev) => ({ 
                      ...prev, 
                      provider: value,
                      modelUrl: autoUrl,
                      displayName: "",
                      family: "",
                    }));
                    setSelectedModelId("");
                    setAvailableModels([]);
                  }}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger
                    className={errors.provider ? "border-destructive" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="vertex">Google (Vertex AI)</SelectItem>
                    <SelectItem value="bedrock" disabled>
                      AWS (Bedrock)
                    </SelectItem>
                    <SelectItem value="azure_openai" disabled>
                      Azure OpenAI
                    </SelectItem>
                    <SelectItem value="groq" disabled>
                      Groq
                    </SelectItem>
                    <SelectItem value="ollama" disabled>
                      Ollama
                    </SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                    <SelectItem value="custom" disabled>
                      Custom
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.provider && (
                  <p className="text-xs text-destructive mt-1">{errors.provider}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelUrl" className="text-sm font-medium">
                  Model URL (Provider Endpoint) *
                </Label>
                <Input
                  id="modelUrl"
                  value={formData.modelUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      modelUrl: e.target.value,
                    }))
                  }
                  placeholder="https://api.openai.com/v1"
                  className={cn(
                    errors.modelUrl ? "border-destructive" : "",
                    providerUrls[formData.provider] ? "bg-muted" : ""
                  )}
                  disabled={!!providerUrls[formData.provider]}
                />
                {errors.modelUrl && (
                  <p className="text-xs text-destructive mt-1">{errors.modelUrl}</p>
                )}
              </div>
            </div>

            {formData.provider === "huggingface" ? (
              <>
                {/* For Hugging Face, Model Name is the identifier */}
                <div className="space-y-2">
                  <Label htmlFor="family" className="text-sm font-medium">
                    Model Name (used in API requests) *
                  </Label>
                  <Input
                    id="family"
                    value={formData.family}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        family: e.target.value,
                      }))
                    }
                    placeholder="e.g., meta-llama/Llama-3.1-8B-Instruct"
                    className={cn(
                      "font-mono text-sm",
                      errors.family ? "border-destructive" : ""
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the exact model identifier you'll use in your API requests
                  </p>
                  {errors.family && (
                    <p className="text-xs text-destructive mt-1">{errors.family}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Model Selection - Show for non-HF providers in create mode */}
                  {formData.provider !== "huggingface" && mode === "create" && (
                    <div className="space-y-2">
                      <Label htmlFor="modelSelect" className="text-sm font-medium">
                        Model Name *
                      </Label>
                      <Select
                        value={selectedModelId}
                        onValueChange={handleModelSelect}
                        disabled={loadingModels}
                      >
                        <SelectTrigger
                          id="modelSelect"
                          className={errors.family ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder={loadingModels ? "Loading models..." : "Select model"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              {loadingModels ? "Loading..." : "No models available"}
                            </div>
                          ) : (
                            availableModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.displayName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.family && (
                        <p className="text-xs text-destructive">{errors.family}</p>
                      )}
                    </div>
                  )}
                  {formData.provider !== "huggingface" && mode === "edit" && (
                    <div className="space-y-4">
                      <Label
                        htmlFor="modelSelect"
                        className="flex items-center gap-2"
                      >
                        <span>Model Name</span>
                      </Label>
                      <Input
                        disabled
                        value={formData.family}
                        placeholder="Select model"
                      />
                    </div>
                  )}
                  {/* Conditional rendering based on provider */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="displayName"
                      className="text-sm font-medium"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="Enter the display name for Model"
                    />
                  </div>
                </div>

              </>
            )}

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              id="model-submit"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : mode === "create"
                  ? "Add"
                  : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
