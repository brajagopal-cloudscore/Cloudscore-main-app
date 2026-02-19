"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Info,
  XCircle,
  AlertTriangle,
  Database,
  FileText,
  Download,
} from "lucide-react";
import { getModelScanResultsByUrl } from "@/lib/actions/model-scans";
import { getProviderModelById } from "@/lib/actions/provider-models";

interface SecurityFinding {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  evidence?: Record<string, any>;
  scanner: string;
  location?: string;
  created_at: string;
}

interface ScanResult {
  scan_id: string;
  artifact_id?: string;
  status: string;
  format?: string | null;
  findings_count: number;
  critical_count?: number;
  high_count?: number;
  medium_count?: number;
  low_count?: number;
  info_count?: number;
  approval_status?: string;
  blocked_reason?: string | null;
  registry_synced?: boolean;
  scan_duration_ms?: number;
  created_at?: string;
  completed_at?: string | null;
  cached?: boolean;
  findings?: SecurityFinding[];
  metadata?: {
    model_name?: string;
    model_size?: number;
    scan_duration?: number;
    engine_version?: string | null;
    detected_format?: string | null;
    approval_status?: string;
  };
  finished_at?: string | null;
}

interface ProviderModel {
  id: string;
  tenantId: string | null;
  provider: string;
  modelId: string;
  displayName: string | null;
  modelUrl: string | null;
  purposeUseCase: string | null;
  riskLevel: string | null;
  category: string | null;
  availabilityStatus: string | null;
  family: string | null;
  modality: string[] | null;
  contextWindowTokens: number | null;
  maxOutputTokens: number | null;
  supportsStreaming: boolean | null;
  supportsJson: boolean | null;
  inputCostPer1K: string | null;
  outputCostPer1K: string | null;
  currency: string | null;
  pricingMetadata: any;
  deprecationDate: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ModelReportPage() {
  const params = useParams();
  const router = useRouter();
  const [model, setModel] = useState<ProviderModel | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modelId = params.modelId as string;
  const tenant = params.tenant as string;

  console.log("=== MODEL REPORT PAGE DEBUG ===");
  console.log("Params:", params);
  console.log("Model ID:", modelId);
  console.log("Tenant:", tenant);

  useEffect(() => {
    console.log("=== USEEFFECT DEBUG START ===");
    console.log(
      "useEffect triggered with modelId:",
      modelId,
      "tenant:",
      tenant
    );

    const fetchModelData = async () => {
      try {
        console.log("fetchModelData started");
        setIsLoading(true);
        console.log("isLoading set to true");

        // Fetch the actual model data from the database
        console.log("Fetching model data for ID:", modelId);
        const modelData = await getProviderModelById(modelId);

        if (!modelData) {
          console.log("No model found for ID:", modelId);
          setError("Model not found");
          return;
        }

        console.log("Model data fetched:", modelData);
        setModel(modelData);
        console.log("Model state set");

        // Fetch scan results using the actual model URL
        if (modelData.modelUrl) {
          console.log("Model has URL, fetching scan results...");
          console.log(
            "Calling getModelScanResultsByUrl with:",
            modelData.modelUrl,
            "org_33Rq6hGmoYcE9FbsueNNLL8Fpd4"
          );
          const results = await getModelScanResultsByUrl(
            modelData.modelUrl,
            "org_33Rq6hGmoYcE9FbsueNNLL8Fpd4"
          );
          console.log("Scan results received:", results);
          setScanResult(results);
          console.log("Scan result state set");
        } else {
          console.log("No model URL, skipping scan results fetch");
        }
      } catch (err) {
        console.error("Error fetching model data:", err);
        console.error("Error details:", err);
        setError("Failed to load model data");
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
        console.log("=== USEEFFECT DEBUG END ===");
      }
    };

    if (modelId) {
      console.log("ModelId exists, calling fetchModelData");
      fetchModelData();
    } else {
      console.log("No modelId, skipping fetchModelData");
    }
  }, [modelId, tenant]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "info":
        return <Info className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "info":
        return "text-muted-foreground  ";
      default:
        return "text-muted-foreground  ";
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending_review":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending_review":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-muted-foreground  ";
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  console.log("=== RENDER DEBUG ===");
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("model:", model);
  console.log("scanResult:", scanResult);

  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="p-6">
        <div className="">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold ">Loading Model Report...</h1>
            </div>
          </div>
          <div className=" rounded-lg shadow-sm border  p-8 text-center">
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium  mb-2">Loading Scan Results</h3>
            <p className="text-muted-foreground">
              Fetching model data and security scan results...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state");
    return (
      <div className="p-6">
        <div className="">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold ">Error Loading Report</h1>
            </div>
          </div>
          <div className=" p-6">
            <div className="flex items-center gap-2 mb-2 rounded-full bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering main content");
  return (
    <div className="p-6">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground border "
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold ">
              {model?.displayName || model?.modelId || "Model Report"}
            </h1>
            <p className="text-muted-foreground">
              Security scan results and model information
            </p>
          </div>
        </div>

        {/* Model Information */}
        {model && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Model Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Provider
                  </p>
                  <p className="text-sm ">{model.provider}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs border-none! bg-blue-500/10 text-blue-500"
                  >
                    {model.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Model ID
                  </p>
                  <p className="text-sm  font-mono">{model.modelId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs bg-muted text-muted-foreground"
                  >
                    {model.availabilityStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Risk Level
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs bg-yellow-500/10 text-yello5-800"
                  >
                    {model.riskLevel}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Purpose
                  </p>
                  <p className="text-sm ">{model.purposeUseCase}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Model URL
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm  font-mono break-all">
                      {model.modelUrl}
                    </p>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan Results */}
        {!scanResult ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium  mb-2">
                No Scan Results Found
              </h3>
              <p className="text-muted-foreground">
                This model has not been scanned yet. Use Model Guard to scan the
                model for security vulnerabilities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Scan Summary */}
            <div className=" rounded-lg shadow-sm border  p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold ">Scan Results</h2>
                <div className="flex items-center gap-2">
                  {scanResult.cached && (
                    <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                      Cached Result
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(scanResult.scan_duration_ms || 0)}
                  </span>
                </div>
              </div>

              {/* Approval Status */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getApprovalStatusColor(scanResult.approval_status || "pending_review")}`}
                >
                  {getApprovalStatusIcon(
                    scanResult.approval_status || "pending_review"
                  )}
                  <span className="font-medium capitalize">
                    {(scanResult.approval_status || "pending_review").replace(
                      "_",
                      " "
                    )}
                  </span>
                </div>
                {scanResult.blocked_reason && (
                  <p className="text-sm text-red-500 mt-2">
                    {scanResult.blocked_reason}
                  </p>
                )}
              </div>

              {/* Model Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Format
                    </span>
                  </div>
                  <p className="text-lg font-semibold  capitalize">
                    {scanResult.format || "Unknown"}
                  </p>
                </div>

                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Findings
                    </span>
                  </div>
                  <p className="text-lg font-semibold ">
                    {scanResult.findings_count}
                  </p>
                </div>

                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Scanned
                    </span>
                  </div>
                  <p className="text-sm ">
                    {new Date(
                      scanResult.created_at || new Date()
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Severity Breakdown */}
              {scanResult.findings_count > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Security Findings
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      {
                        severity: "critical",
                        count: scanResult.critical_count || 0,
                      },
                      { severity: "high", count: scanResult.high_count || 0 },
                      {
                        severity: "medium",
                        count: scanResult.medium_count || 0,
                      },
                      { severity: "low", count: scanResult.low_count || 0 },
                      { severity: "info", count: scanResult.info_count || 0 },
                    ].map(({ severity, count }) => (
                      <div key={severity} className="text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}
                        >
                          {getSeverityIcon(severity)}
                          {count}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {severity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registry Sync Status */}
              {scanResult.registry_synced && (
                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span>Model synced to ControlNet registry</span>
                </div>
              )}
            </div>

            {/* Detailed Findings */}
            {scanResult.findings_count > 0 && (
              <div className=" rounded-lg shadow-sm border  p-6">
                <h3 className="text-lg font-semibold  mb-4">
                  Security Findings
                </h3>

                {scanResult.findings && scanResult.findings.length > 0 ? (
                  <div className="space-y-4">
                    {scanResult.findings.map((finding, index) => (
                      <div
                        key={finding.id || index}
                        className="border  rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getSeverityIcon(finding.severity)}
                            <div className="flex-1">
                              <h4 className="font-medium  mb-1">
                                {finding.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {finding.description}
                              </p>

                              {finding.recommendation && (
                                <div className="mt-3 p-3 bg-blue-500/10 rounded border">
                                  <p className="text-sm font-medium text-blue-500 mb-1">
                                    Recommendation:
                                  </p>
                                  <p className="text-sm text-blue-500">
                                    {finding.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}
                          >
                            {finding.severity}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>Scanner: {finding.scanner}</span>
                          <span>
                            {new Date(finding.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Scan completed with{" "}
                      <strong>{scanResult.findings_count}</strong> findings
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Detailed findings are available in the exported reports
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Model Information */}
            <div className=" rounded-lg shadow-sm border  p-6">
              <h3 className="text-lg font-semibold  mb-4">Model Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Format
                  </p>
                  <p className="text-sm  capitalize">
                    {scanResult.format || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Scan Duration
                  </p>
                  <p className="text-sm ">
                    {formatDuration(scanResult.scan_duration_ms || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Scan ID
                  </p>
                  <p className="text-sm  font-mono">{scanResult.scan_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Artifact ID
                  </p>
                  <p className="text-sm  font-mono">{scanResult.artifact_id}</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className=" rounded-lg shadow-sm border  p-6">
              <h3 className="text-lg font-semibold  mb-4">Export Results</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Mock export functionality
                    const dataStr = JSON.stringify(scanResult, null, 2);
                    const dataBlob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `model-guard-scan-${scanResult.scan_id}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500"
                >
                  <Download className="h-4 w-4" />
                  Download JSON Report
                </button>
                {/* <button 
                  onClick={() => {
                    // Mock SARIF export
                    alert('SARIF export functionality would be implemented here');
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-muted-foreground rounded-lg hover:"
                >
                  <FileText className="h-4 w-4" />
                  Download SARIF Report
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
