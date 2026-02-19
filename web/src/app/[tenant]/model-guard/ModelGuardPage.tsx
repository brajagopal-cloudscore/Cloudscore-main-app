"use client";

import React, { useState } from "react";
import {
  Shield,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { useTenant } from "@/contexts/TenantContext";
import { scanModel, ScanResponse } from "@/lib/api/model-guard";
import ScanResults from "./ScanResults";

// Use the ScanResponse type from the API module
type ScanResult = ScanResponse;

interface ModelGuardPageProps {
  tenant: string;
}

export default function ModelGuardPage({ tenant }: ModelGuardPageProps) {
  const [modelUrl, setModelUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();
  const { tenant: tenantContext } = useTenant();

  const handleScan = async () => {
    if (!modelUrl.trim()) {
      setError("Please enter a model URL");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // For testing, we'll use a direct fetch with the correct tenant/user IDs
      const response = await fetch("/modelguard/scan/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": "org_33Rq6hGmoYcE9FbsueNNLL8Fpd4",
          "X-User-ID": "user_33UwOCoxp9ADqk0SiE6KF0RAKM0",
        },
        body: JSON.stringify({
          uri: modelUrl.trim(),
          scan_options: {
            force_rescan: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      // If we have findings, try to fetch detailed findings
      if (result.findings_count > 0) {
        try {
          const detailedResponse = await fetch(
            `/modelguard/reports/${result.scan_id}`,
            {
              method: "GET",
              headers: {
                "X-Tenant-ID": "org_33Rq6hGmoYcE9FbsueNNLL8Fpd4",
                "X-User-ID": "user_33UwOCoxp9ADqk0SiE6KF0RAKM0",
              },
            }
          );

          if (detailedResponse.ok) {
            const detailedResult = await detailedResponse.json();
            // Merge detailed findings into the result
            result.findings = detailedResult.findings || [];
            result.metadata = detailedResult.metadata || {};
          }
        } catch (detailError) {
          console.warn("Could not fetch detailed findings:", detailError);
          // Continue with summary only
        }
      }

      setScanResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during scanning"
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setModelUrl("");
    setScanResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      case "info":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "pending_review":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Model Guard</h1>
              <p className="text-gray-600">
                Scan and validate ML models for security vulnerabilities
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Scan Model
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="modelUrl"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Model URL
                  </label>
                  <input
                    type="url"
                    id="modelUrl"
                    value={modelUrl}
                    onChange={(e) => setModelUrl(e.target.value)}
                    placeholder="Enter model URL (HuggingFace, S3, HTTP, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isScanning}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleScan}
                    disabled={isScanning || !modelUrl.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Scan Model
                      </>
                    )}
                  </button>

                  {scanResult && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Supported Formats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Supported Formats
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-800 font-medium">ONNX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-800 font-medium">PyTorch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-800 font-medium">Keras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-800 font-medium">
                      SafeTensors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-800 font-medium">
                      TensorFlow
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-800 font-medium">TFLite</span>
                  </div>
                </div>
              </div>

              {/* URL Examples */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  URL Examples
                </h3>
                <div className="space-y-2 text-xs text-gray-800">
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="font-mono text-gray-900">
                      https://huggingface.co/hf-internal-testing/tiny-random-bert/resolve/main/model.safetensors
                    </div>
                    <div className="text-gray-600 text-xs">
                      SafeTensors (Test Model)
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="font-mono text-gray-900">
                      hf://microsoft/DialoGPT-medium/pytorch_model.bin
                    </div>
                    <div className="text-gray-600 text-xs">HuggingFace Hub</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="font-mono text-gray-900">
                      s3://my-bucket/models/model.onnx
                    </div>
                    <div className="text-gray-600 text-xs">AWS S3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="text-sm font-medium text-red-800">
                    Scan Error
                  </h3>
                </div>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {scanResult && <ScanResults result={scanResult} />}

            {!scanResult && !error && !isScanning && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Scan
                </h3>
                <p className="text-gray-600">
                  Enter a model URL to begin security scanning. Model Guard will
                  analyze your model for vulnerabilities, security risks, and
                  compliance issues.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
