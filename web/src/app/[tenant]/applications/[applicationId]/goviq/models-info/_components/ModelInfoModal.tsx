"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Upload, X, File, ExternalLink } from "lucide-react";
import { getModelsByProvider } from "@/lib/actions/model-register";

interface Props {
  isOpen: boolean;
  mode: "create" | "edit";
  model?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isPending: boolean;
}

// Integration options data with links
const SOFTWARE_INTEGRATIONS = [
  { value: "github", label: "GitHub", link: "https://github.com" },
  { value: "gitlab", label: "GitLab", link: "https://gitlab.com" },
  {
    value: "azure-devops",
    label: "Azure DevOps",
    link: "https://dev.azure.com",
  },
  { value: "jenkins", label: "Jenkins", link: "https://www.jenkins.io" },
  { value: "docker-hub", label: "Docker Hub", link: "https://hub.docker.com" },
  { value: "kubernetes", label: "Kubernetes", link: "https://kubernetes.io" },
  { value: "terraform", label: "Terraform", link: "https://www.terraform.io" },
  {
    value: "aws-codecommit",
    label: "AWS CodeCommit",
    link: "https://aws.amazon.com/codecommit/",
  },
  {
    value: "gcp-source-repos",
    label: "Google Cloud Source Repositories",
    link: "https://cloud.google.com/source-repositories",
  },
  { value: "bitbucket", label: "Bitbucket", link: "https://bitbucket.org" },
  {
    value: "jfrog-artifactory",
    label: "JFrog Artifactory",
    link: "https://jfrog.com/artifactory/",
  },
  {
    value: "nexus-repository",
    label: "Nexus Repository",
    link: "https://www.sonatype.com/products/nexus-repository",
  },
  { value: "custom", label: "Custom/Other", link: null },
];

const HOSTING_INTEGRATIONS = [
  { value: "aws", label: "AWS", link: "https://aws.amazon.com" },
  {
    value: "azure-foundry",
    label: "Azure Foundry",
    link: "https://azure.microsoft.com",
  },
  {
    value: "gcp",
    label: "Google Cloud Platform (GCP)",
    link: "https://cloud.google.com",
  },
  {
    value: "azure",
    label: "Microsoft Azure",
    link: "https://azure.microsoft.com",
  },
  { value: "databricks", label: "Databricks", link: "https://databricks.com" },
  { value: "ibm-cloud", label: "IBM Cloud", link: "https://www.ibm.com/cloud" },
  {
    value: "oracle-cloud",
    label: "Oracle Cloud",
    link: "https://www.oracle.com/cloud/",
  },
  {
    value: "digitalocean",
    label: "DigitalOcean",
    link: "https://www.digitalocean.com",
  },
  { value: "linode", label: "Linode", link: "https://www.linode.com" },
  { value: "vultr", label: "Vultr", link: "https://www.vultr.com" },
  {
    value: "alibaba-cloud",
    label: "Alibaba Cloud",
    link: "https://www.alibabacloud.com",
  },
  { value: "on-premises", label: "On-Premises", link: null },
  { value: "hybrid-cloud", label: "Hybrid Cloud", link: null },
  { value: "edge-computing", label: "Edge Computing", link: null },
  { value: "custom", label: "Custom/Other", link: null },
];

const PROMPT_REGISTRY_INTEGRATIONS = [
  { value: "mlflow", label: "MLflow", link: "https://mlflow.org" },
  { value: "wandb", label: "Weights & Biases", link: "https://wandb.ai" },
  { value: "neptune", label: "Neptune", link: "https://neptune.ai" },
  { value: "dvc", label: "DVC", link: "https://dvc.org" },
  { value: "clearml", label: "ClearML", link: "https://clear.ml" },
  { value: "kubeflow", label: "Kubeflow", link: "https://www.kubeflow.org" },
  {
    value: "airflow",
    label: "Apache Airflow",
    link: "https://airflow.apache.org",
  },
  { value: "prefect", label: "Prefect", link: "https://www.prefect.io" },
  { value: "custom-registry", label: "Custom Registry", link: null },
  {
    value: "huggingface",
    label: "HuggingFace Hub",
    link: "https://huggingface.co",
  },
  { value: "github", label: "GitHub", link: "https://github.com" },
  {
    value: "azure-ml",
    label: "Azure ML",
    link: "https://azure.microsoft.com/en-us/products/machine-learning/",
  },
  { value: "custom", label: "Custom/Other", link: null },
];

// Provider options matching model-registry
const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "vertex", label: "Google (Vertex AI)" },
  { value: "bedrock", label: "AWS (Bedrock)", disabled: true },
  { value: "azure_openai", label: "Azure OpenAI", disabled: true },
  { value: "groq", label: "Groq", disabled: true },
  { value: "ollama", label: "Ollama", disabled: true },
  { value: "huggingface", label: "Hugging Face" },
  { value: "custom", label: "Custom", disabled: true },
];

export function ModelInfoModal({
  isOpen,
  mode,
  model,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const [formData, setFormData] = useState({
    vendor: "",
    model: "",
    hostingLocation: "",
    modelArchitecture: "",
    objectives: "",
    computeInfrastructure: "",
    trainingDuration: "",
    modelSize: "",
    trainingDataSize: "",
    inferenceLatency: "",
    hardwareRequirements: "",
    software: "",
    promptRegistry: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Additional state for enhanced functionality
  const [selectedVendorModels, setSelectedVendorModels] = useState<
    Array<{ id: string; displayName: string }>
  >([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [architectureFiles, setArchitectureFiles] = useState<File[]>([]);
  const [softwareCustom, setSoftwareCustom] = useState("");
  const [promptRegistryCustom, setPromptRegistryCustom] = useState("");
  const [softwareIsCustom, setSoftwareIsCustom] = useState(false);
  const [promptRegistryIsCustom, setPromptRegistryIsCustom] = useState(false);

  // Load models when vendor selection changes
  useEffect(() => {
    const loadModels = async () => {
      if (formData.vendor && formData.vendor !== "huggingface") {
        setLoadingModels(true);
        try {
          const res = await getModelsByProvider(formData.vendor);
          if (res.status && res.models) {
            setSelectedVendorModels(
              res.models.map((model: any) => ({
                id: model.id,
                displayName: model.displayName,
              }))
            );
          } else {
            setSelectedVendorModels([]);
          }
        } catch (error) {
          console.error("Error loading models:", error);
          setSelectedVendorModels([]);
        } finally {
          setLoadingModels(false);
        }
      } else {
        setSelectedVendorModels([]);
      }
    };

    loadModels();
  }, [formData.vendor]);

  useEffect(() => {
    if (mode === "edit" && model) {
      setFormData({
        vendor: model.vendor || "",
        model: model.model || "",
        hostingLocation: model.hostingLocation,
        modelArchitecture: model.modelArchitecture,
        objectives: model.objectives,
        computeInfrastructure: model.computeInfrastructure,
        trainingDuration: model.trainingDuration,
        modelSize: model.modelSize,
        trainingDataSize: model.trainingDataSize,
        inferenceLatency: model.inferenceLatency,
        hardwareRequirements: model.hardwareRequirements,
        software: model.software,
        promptRegistry: model.promptRegistry || "",
      });
    } else {
      setFormData({
        vendor: "",
        model: "",
        hostingLocation: "",
        modelArchitecture: "",
        objectives: "",
        computeInfrastructure: "",
        trainingDuration: "",
        modelSize: "",
        trainingDataSize: "",
        inferenceLatency: "",
        hardwareRequirements: "",
        software: "",
        promptRegistry: "",
      });
    }
    setErrors({});
    setArchitectureFiles([]);
    setSoftwareCustom("");
    setPromptRegistryCustom("");
    setSoftwareIsCustom(false);
    setPromptRegistryIsCustom(false);
  }, [mode, model, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hostingLocation.trim())
      newErrors.hostingLocation = "Hosting location is required";
    if (!formData.objectives.trim())
      newErrors.objectives = "Objectives are required";
    if (!formData.computeInfrastructure.trim())
      newErrors.computeInfrastructure = "Compute infrastructure is required";
    if (!formData.trainingDuration.trim())
      newErrors.trainingDuration = "Training duration is required";
    if (!formData.modelSize.trim())
      newErrors.modelSize = "Model size is required";
    if (!formData.trainingDataSize.trim())
      newErrors.trainingDataSize = "Training data size is required";
    if (!formData.inferenceLatency.trim())
      newErrors.inferenceLatency = "Inference latency is required";
    if (!formData.hardwareRequirements.trim())
      newErrors.hardwareRequirements = "Hardware requirements are required";
    if (!formData.software.trim())
      newErrors.software = "Software details are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save model" });
    }
  };

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchitectureFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setArchitectureFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Integration handlers
  const handleIntegrationChange = (field: string, value: string) => {
    if (value === "custom") {
      if (field === "software") setSoftwareIsCustom(true);
      if (field === "promptRegistry") setPromptRegistryIsCustom(true);
      return;
    }

    // Reset custom states when selecting predefined options
    if (field === "software") {
      setSoftwareIsCustom(false);
      setSoftwareCustom("");
    }
    if (field === "promptRegistry") {
      setPromptRegistryIsCustom(false);
      setPromptRegistryCustom("");
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomIntegrationSubmit = (
    field: string,
    customValue: string
  ) => {
    if (!customValue.trim()) return;

    setFormData((prev) => ({ ...prev, [field]: customValue }));

    // Clear custom input and reset custom state
    if (field === "software") {
      setSoftwareCustom("");
      setSoftwareIsCustom(false);
    }
    if (field === "promptRegistry") {
      setPromptRegistryCustom("");
      setPromptRegistryIsCustom(false);
    }
  };

  const renderIntegrationSelect = (
    value: string,
    onValueChange: (value: string) => void,
    options: Array<{ value: string; label: string; link: string | null }>,
    placeholder: string,
    hasError: boolean,
    customValue: string,
    onCustomChange: (value: string) => void,
    onCustomSubmit: () => void,
    fieldName: string,
    isCustomSelected: boolean
  ) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Select
            value={isCustomSelected ? "custom" : value}
            onValueChange={onValueChange}
          >
            <SelectTrigger
              className={`w-full ${hasError ? " focus-visible: border-destructive" : ""} h-9 flex-1`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-full">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="py-3"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedOption?.link && !isCustomSelected && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(selectedOption.link!, "_blank")}
              className="px-3"
              title={`Visit ${selectedOption.label} website`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isCustomSelected && (
          <div className="flex gap-2">
            <Input
              placeholder={`Enter custom ${fieldName.toLowerCase()}`}
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onCustomSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCustomSubmit}
              disabled={!customValue.trim()}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 z-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {mode === "create"
              ? "Create Technical Detail"
              : "Edit Technical Detail"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pb-4 space-y-1 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {mode === "create"
              ? "Create Technical Detail"
              : "Edit Technical Detail"}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="vendor"
                className="text-sm font-medium text-muted-foreground "
              >
                Vendor (Optional)
              </Label>
              <Select
                value={formData.vendor}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, vendor: value, model: "" }))
                }
              >
                <SelectTrigger
                  className={`${errors.vendor ? "border-destructive" : ""} h-9`}
                >
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((provider) => (
                    <SelectItem
                      key={provider.value}
                      value={provider.value}
                      disabled={provider.disabled}
                    >
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor && (
                <p className="text-sm  text-destructive">{errors.vendor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="model"
                className="text-sm font-medium text-muted-foreground"
              >
                Model (Optional)
              </Label>
              <Select
                value={formData.model}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, model: value }))
                }
                disabled={!formData.vendor}
              >
                <SelectTrigger
                  className={`${errors.model ? "border-destructive" : ""} h-9`}
                >
                  <SelectValue
                    placeholder={
                      !formData.vendor
                        ? "Select vendor first"
                        : selectedVendorModels.length === 0
                          ? "No models available"
                          : "Select a model"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {loadingModels ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      Loading models...
                    </div>
                  ) : selectedVendorModels.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      No models available
                    </div>
                  ) : (
                    selectedVendorModels.map((model) => (
                      <SelectItem key={model.id} value={model.displayName}>
                        {model.displayName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="text-sm  text-destructive">{errors.model}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="hosting-location"
              className="text-sm font-medium text-muted-foreground"
            >
              Hosting Location*
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.hostingLocation}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, hostingLocation: value }))
                }
              >
                <SelectTrigger
                  className={`${errors.hostingLocation ? " focus-visible: border-destructive" : ""} h-9 flex-1`}
                >
                  <SelectValue
                    placeholder="Select hosting location"
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {HOSTING_INTEGRATIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-3"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {HOSTING_INTEGRATIONS.find(
                (opt) => opt.value === formData.hostingLocation
              )?.link && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const selectedOption = HOSTING_INTEGRATIONS.find(
                      (opt) => opt.value === formData.hostingLocation
                    );
                    if (selectedOption?.link) {
                      window.open(selectedOption.link, "_blank");
                    }
                  }}
                  className="px-3"
                  title="Visit website"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            {errors.hostingLocation && (
              <p className="text-sm  text-destructive">
                {errors.hostingLocation}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="model-architecture"
              className="text-sm font-medium text-muted-foreground"
            >
              Model Architecture* (Upload Files)
            </Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="model-architecture"
                  multiple
                  accept=".pdf,.json,.yaml,.yml,.png,.jpg,.jpeg,.svg,.txt,.md,.xml,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("model-architecture")?.click()
                  }
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Architecture Files
                </Button>
              </div>
              {architectureFiles.length > 0 && (
                <div className="space-y-2">
                  {architectureFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.modelArchitecture && (
              <p className="text-sm  text-destructive">
                {errors.modelArchitecture}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="objectives"
              className="text-sm font-medium text-muted-foreground"
            >
              Objectives*
            </Label>
            <Textarea
              id="objectives"
              className={`${errors.objectives ? "border-destructive" : ""} min-h-20`}
              value={formData.objectives}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, objectives: e.target.value }))
              }
              placeholder="Enter objectives"
            />
            {errors.objectives && (
              <p className="text-sm  text-destructive">{errors.objectives}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="compute-infrastructure"
              className="text-sm font-medium text-muted-foreground"
            >
              Compute Infrastructure*
            </Label>
            <Textarea
              id="compute-infrastructure"
              className={`${errors.computeInfrastructure ? "border-destructive" : ""} min-h-20`}
              value={formData.computeInfrastructure}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  computeInfrastructure: e.target.value,
                }))
              }
              placeholder="Enter compute infrastructure"
            />
            {errors.computeInfrastructure && (
              <p className="text-sm  text-destructive">
                {errors.computeInfrastructure}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="training-duration"
              className="text-sm font-medium text-muted-foreground"
            >
              Training Duration*
            </Label>
            <Input
              id="training-duration"
              className={errors.trainingDuration ? "border-destructive" : ""}
              value={formData.trainingDuration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trainingDuration: e.target.value,
                }))
              }
              placeholder="Enter training duration"
            />
            {errors.trainingDuration && (
              <p className="text-sm  text-destructive">
                {errors.trainingDuration}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="model-size"
              className="text-sm font-medium text-muted-foreground"
            >
              Model Size*
            </Label>
            <Input
              id="model-size"
              className={errors.modelSize ? "border-destructive" : ""}
              value={formData.modelSize}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, modelSize: e.target.value }))
              }
              placeholder="Enter model size"
            />
            {errors.modelSize && (
              <p className="text-sm  text-destructive">{errors.modelSize}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="training-data-size"
              className="text-sm font-medium text-muted-foreground"
            >
              Training Data Size*
            </Label>
            <Input
              id="training-data-size"
              className={errors.trainingDataSize ? "border-destructive" : ""}
              value={formData.trainingDataSize}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trainingDataSize: e.target.value,
                }))
              }
              placeholder="Enter training data size"
            />
            {errors.trainingDataSize && (
              <p className="text-sm  text-destructive">
                {errors.trainingDataSize}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="inference-latency"
              className="text-sm font-medium text-muted-foreground"
            >
              Inference Latency*
            </Label>
            <Input
              id="inference-latency"
              className={errors.inferenceLatency ? "border-destructive" : ""}
              value={formData.inferenceLatency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  inferenceLatency: e.target.value,
                }))
              }
              placeholder="Enter inference latency"
            />
            {errors.inferenceLatency && (
              <p className="text-sm  text-destructive">
                {errors.inferenceLatency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="hardware-requirements"
              className="text-sm font-medium text-muted-foreground"
            >
              Hardware Requirements*
            </Label>
            <Textarea
              id="hardware-requirements"
              className={`${errors.hardwareRequirements ? "border-destructive" : ""} min-h-20`}
              value={formData.hardwareRequirements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hardwareRequirements: e.target.value,
                }))
              }
              placeholder="Enter hardware requirements"
            />
            {errors.hardwareRequirements && (
              <p className="text-sm text-destructive">
                {errors.hardwareRequirements}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="software"
              className="text-sm font-medium text-muted-foreground"
            >
              Dev Application Location*
            </Label>
            {renderIntegrationSelect(
              formData.software,
              (value) => handleIntegrationChange("software", value),
              SOFTWARE_INTEGRATIONS,
              "Select software integration",
              !!errors.software,
              softwareCustom,
              setSoftwareCustom,
              () => handleCustomIntegrationSubmit("software", softwareCustom),
              "software",
              softwareIsCustom
            )}
            {errors.software && (
              <p className="text-sm  text-destructive">{errors.software}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="prompt-registry"
              className="text-sm font-medium text-muted-foreground"
            >
              Prompt Registry*
            </Label>
            {renderIntegrationSelect(
              formData.promptRegistry,
              (value) => handleIntegrationChange("promptRegistry", value),
              PROMPT_REGISTRY_INTEGRATIONS,
              "Select prompt registry",
              !!errors.promptRegistry,
              promptRegistryCustom,
              setPromptRegistryCustom,
              () =>
                handleCustomIntegrationSubmit(
                  "promptRegistry",
                  promptRegistryCustom
                ),
              "prompt registry",
              promptRegistryIsCustom
            )}
            {errors.promptRegistry && (
              <p className="text-sm  text-destructive">
                {errors.promptRegistry}
              </p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSubmit}>
            {isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : mode === "create" ? (
              "Create"
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
