"use client";

import { useState, useEffect } from "react";
import OpsTabs from "@/components/ops/Tabs";
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
  Download,
  Loader2,
  CheckCircle,
  ExternalLink,
  Edit,
} from "lucide-react";
import { errorToast, successToast } from "@/lib/utils/toast";
import { useTenant } from "@/contexts/TenantContext";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { updateOnnxModel } from "@/actions/onnx-models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRiskCategories } from "@/actions/router-ops";

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  source_url?: string;
  model_path: string;
  labels: string[];
  performance_budget_ms: number;
  accuracy?: number;
  visibility?: string; // "shared" or "tenant"
  storage_url?: string;
}

interface ModelStatus {
  [key: string]: {
    downloaded: boolean;
    downloading: boolean;
    path?: string;
    size_mb?: number;
  };
}

export default function DownloadModelsPage() {
  const { tenant } = useTenant();
  const authFetch = useAuthFetch();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ModelStatus>({});

  // URL download state
  const [downloadUrl, setDownloadUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [family, setFamily] = useState("");
  const [downloadingFromUrl, setDownloadingFromUrl] = useState(false);
  const [riskCategories, setRiskCategories] = useState<
    Array<{ slug: string; name: string; color?: string }>
  >([]);

  // Edit model state
  const [editingModel, setEditingModel] = useState<ModelInfo | null>(null);
  const [editFamily, setEditFamily] = useState("");
  const [editProcessing, setEditProcessing] = useState(false);

  // Auto-fix HuggingFace URLs and extract filename
  const handleUrlChange = (url: string) => {
    let processedUrl = url;

    // Auto-convert HuggingFace blob URLs to resolve URLs
    if (url.includes("huggingface.co") && url.includes("/blob/")) {
      processedUrl = url.replace("/blob/", "/resolve/");
    }

    setDownloadUrl(processedUrl);

    // Auto-extract filename from URL if not provided
    if (processedUrl && !filename) {
      try {
        const urlObj = new URL(processedUrl);
        const pathParts = urlObj.pathname.split("/");
        const lastPart = pathParts[pathParts.length - 1];
        if (
          lastPart.endsWith(".onnx") ||
          lastPart.endsWith(".bin") ||
          lastPart.includes(".")
        ) {
          setFilename(lastPart);
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    }
  };

  useEffect(() => {
    loadModels();
    loadRiskCategories();
  }, []);

  const loadRiskCategories = async () => {
    const categories = await getRiskCategories();
    setRiskCategories(
      categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        color: category.color || undefined,
      }))
    );
  };

  const loadModels = async () => {
    setLoading(true);
    try {
      console.log(
        "[DownloadModelsPage] Loading models for tenant:",
        tenant?.id
      );

      // Use server action instead of API call
      const { getOnnxModels } = await import("@/actions/onnx-models");
      const models = await getOnnxModels(tenant?.id);

      console.log("[DownloadModelsPage] Received models:", models.length);

      // Transform to expected format
      const transformedModels: ModelInfo[] = models.map((model) => ({
        id: model.modelId,
        name: model.name,
        description: model.description || "",
        category:
          Array.isArray(model.family) && model.family.length > 0
            ? model.family.join(", ")
            : model.modelType,
        model_path: model.storageUrl || `models/${model.modelId}.onnx`,
        labels: Array.isArray(model.family)
          ? model.family
          : model.family
            ? [model.family]
            : [],
        performance_budget_ms: parseFloat(model.p50Ms || "100.0"),
        accuracy: model.auroc ? parseFloat(model.auroc) : undefined,
        visibility: model.visibility,
        storage_url: model.storageUrl || undefined,
      }));

      console.log(
        "[DownloadModelsPage] Transformed models:",
        transformedModels.length
      );

      setModels(transformedModels);

      // Build status map from model data (file exists if storageUrl is set)
      const statusMap: ModelStatus = {};
      transformedModels.forEach((model) => {
        const modelFromDb = models.find((m) => m.modelId === model.id);
        const fileSize = modelFromDb?.fileSize
          ? Math.round(modelFromDb.fileSize / 1024 / 1024)
          : 0;
        const isDownloaded = !!modelFromDb?.storageUrl;

        statusMap[model.id] = {
          downloaded: isDownloaded,
          downloading: false,
          path: model.storage_url || undefined,
          size_mb: fileSize,
        };
      });

      setStatus(statusMap);
    } catch (error: any) {
      console.error("Error loading models:", error);
      errorToast(error.message || "Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (modelId: string) => {
    setStatus((prev) => ({
      ...prev,
      [modelId]: { ...prev[modelId], downloading: true },
    }));

    try {
      const response = await authFetch(`/v1/models/download`, {
        method: "POST",
        body: JSON.stringify({
          model_id: modelId,
          tenant_id: tenant?.id,
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail || errorData.message || `HTTP ${response.status}`;
        errorToast(`Failed to download model: ${errorMessage}`);
        setStatus((prev) => ({
          ...prev,
          [modelId]: { ...prev[modelId], downloading: false },
        }));
        return;
      }

      const result = await response.json();

      if (result.status === "downloaded") {
        successToast({}, "Model", "downloaded");
      } else if (result.status === "no_onnx_files") {
        errorToast("No ONNX files found. Model needs conversion.");
      } else if (result.status === "already_downloaded") {
        successToast({}, "Model", "already downloaded");
      } else {
        const errorMsg = result.message || result.error || "Unknown error";
        errorToast(`Download failed: ${errorMsg}`);
      }

      // Reload models from database to get updated status
      await loadModels();
    } catch (error: any) {
      console.error("Error downloading model:", error);
      errorToast(error.message || "Failed to download model");
      setStatus((prev) => ({
        ...prev,
        [modelId]: { ...prev[modelId], downloading: false },
      }));
    }
  };

  const handleDownloadFromUrl = async () => {
    if (!downloadUrl || !filename) {
      errorToast("Please provide both URL and filename");
      return;
    }

    setDownloadingFromUrl(true);
    try {
      const response = await authFetch(`/v1/models/download-from-url`, {
        method: "POST",
        body: JSON.stringify({
          url: downloadUrl,
          filename,
          family: family || undefined,
          tenant_id: tenant?.id,
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail || errorData.message || `HTTP ${response.status}`;
        errorToast(`Failed to download model: ${errorMessage}`);
        return;
      }

      const result = await response.json();

      if (result.status === "success") {
        successToast({}, "Model", "downloaded", `Size: ${result.size_mb}MB`);
        setDownloadUrl("");
        setFilename("");
        setFamily("");
        // Reload models to show the new model in the list
        await loadModels();
        // Refresh risk categories in case a new one was created
        await loadRiskCategories();
      } else {
        // Handle non-success responses
        const errorMsg = result.message || result.error || "Unknown error";
        errorToast(`Download failed: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error("Error downloading from URL:", error);
      const errorMessage = error.message || "Failed to download model";
      errorToast(errorMessage);
    } finally {
      setDownloadingFromUrl(false);
    }
  };

  const handleEditModel = (model: ModelInfo) => {
    setEditingModel(model);
    setEditFamily(model.labels.join(", ") || "");
  };

  const handleSaveEdit = async () => {
    if (!editingModel) return;

    setEditProcessing(true);
    try {
      await updateOnnxModel(editingModel.id, {
        family: editFamily.split(",").map((f) => f.trim()),
      });
      successToast({}, "Model", "updated successfully");
      setEditingModel(null);
      setEditFamily("");
      await loadModels();
    } catch (error: any) {
      console.error("Error updating model:", error);
      errorToast(error.message || "Failed to update model");
    } finally {
      setEditProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Dynamic category colors based on risk categories from database
  const getCategoryColor = (category: string) => {
    const riskCategory = riskCategories.find((rc) => rc.slug === category);
    if (riskCategory?.color) {
      return `bg-${riskCategory.color}-100 text-${riskCategory.color}-800`;
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <>
      {/* <OpsTabs /> */}
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold ">Download Models</h1>
          <p className="text-muted-foreground mt-2">
            Download ONNX models from HuggingFace or any URL
          </p>
        </div>

        {/* URL Download Card */}
        <Card className="">
          <CardHeader>
            <CardTitle>Download from URL</CardTitle>
            <CardDescription>
              Download any ONNX model directly from a URL and link it to a
              guardrail family
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Model URL
                </label>
                <Input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://huggingface.co/Xenova/toxic-bert/resolve/main/onnx/model.onnx"
                  className="w-full focus:outline-none "
                  disabled={downloadingFromUrl}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: HuggingFace, GitHub, S3, GCS
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filename
                </label>
                <Input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="model.onnx (auto-filled)"
                  className="w-full   focus:outline-none"
                  disabled={downloadingFromUrl}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-filled from URL
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Risk Category (Optional)
                </label>
                <Select
                  value={family || undefined}
                  onValueChange={(value) => setFamily(value || "")}
                  disabled={downloadingFromUrl}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a risk category" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskCategories.length > 0 ? (
                      riskCategories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name} ({category.slug})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        No risk categories available. Add categories manually to
                        the database.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Links model to router training category
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownloadFromUrl}
              disabled={downloadingFromUrl || !downloadUrl || !filename}
              className="w-full"
            >
              {downloadingFromUrl ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Model
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {models.length === 0 ? (
          <Card className="bg-yellow-500/10">
            <CardHeader>
              <CardTitle className="text-yellow-500">
                No Models Available
              </CardTitle>
              <CardDescription className="text-yellow-500/70">
                There are currently no ONNX models available. You can download
                models from HuggingFace or any URL using the form above.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{model.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {model.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getCategoryColor(model.category)}>
                      {model.category}
                    </Badge>
                    {model.visibility && (
                      <Badge
                        variant={
                          model.visibility === "shared"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {model.visibility === "shared"
                          ? "🌍 Shared"
                          : "🔒 Private"}
                      </Badge>
                    )}
                    {model.accuracy && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(model.accuracy * 100)}% accurate
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div>
                      <span className="text-muted-foreground">Budget:</span>{" "}
                      {model.performance_budget_ms.toFixed(0)}ms
                    </div>
                    {model.source_url && (
                      <a
                        href={model.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on HuggingFace
                      </a>
                    )}
                  </div>

                  {status[model.id]?.downloading ? (
                    <Button disabled className="w-full">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </Button>
                  ) : status[model.id]?.downloaded ? (
                    <div className="space-y-2">
                      <Button variant="outline" disabled className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Downloaded
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleEditModel(model)}
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Categories
                      </Button>
                      {status[model.id].size_mb && (
                        <p className="text-xs text-muted-foreground text-center">
                          Size: {status[model.id].size_mb}MB
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleDownload(model.id)}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={editingModel !== null}
        onOpenChange={(open) => !open && setEditingModel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Model Categories</DialogTitle>
            <DialogDescription>
              Update the risk categories for this model
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFamily">Risk Categories</Label>
              <Select
                value={editFamily || undefined}
                onValueChange={(value) => setEditFamily(value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk categories" />
                </SelectTrigger>
                <SelectContent>
                  {riskCategories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name} ({category.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select risk category for this model. Used for router training.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingModel(null)}
              disabled={editProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editProcessing}>
              {editProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
