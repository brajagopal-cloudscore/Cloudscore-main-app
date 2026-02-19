"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, Download, Database } from "lucide-react";
import { successToast, errorToast } from "@/lib/utils/toast";
import { useBulkUpload, useSyncToLanceDB } from "@/actions/lancedb-ops";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
}

export default function BulkUploadDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess,
}: BulkUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [activeTab, setActiveTab] = useState<"csv" | "json">("csv");

  // Use the hooks
  const bulkUpload = useBulkUpload();
  const syncToLanceDB = useSyncToLanceDB();

  const handleCsvUpload = async () => {
    if (!csvText.trim()) {
      errorToast("Please enter CSV data");
      return;
    }

    setUploading(true);
    try {
      // Parse CSV (simple parsing)
      const lines = csvText.trim().split("\n");
      const prompts = [];

      for (let i = 1; i < lines.length; i++) {
        // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma (handle quoted strings)
        const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 2) continue;

        const prompt = parts[0].replace(/^"|"$/g, "").trim();
        const risk_category = parts[1].replace(/^"|"$/g, "").trim();
        const severity = parts[2]
          ? parseInt(parts[2].replace(/^"|"$/g, "").trim())
          : 8;

        if (prompt && risk_category) {
          prompts.push({ prompt, risk_category, severity });
        }
      }

      if (prompts.length === 0) {
        errorToast("No valid prompts found in CSV");
        return;
      }

      // Upload to LanceDB using hook
      const result = await bulkUpload(prompts);

      successToast(
        `Success! Uploaded ${result.uploaded} prompts via native LanceDB SDK. Computed ${result.centroids_computed} centroids. Total: ${result.stats.total_examples} examples.`
      );
      setCsvText("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      errorToast(
        error instanceof Error ? error.message : "Failed to upload CSV"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleJsonUpload = async () => {
    if (!jsonText.trim()) {
      errorToast("Please enter JSON data");
      return;
    }

    setUploading(true);
    try {
      // Parse JSON
      const prompts = JSON.parse(jsonText);

      if (!Array.isArray(prompts)) {
        errorToast("JSON must be an array of prompts");
        return;
      }

      // Upload to LanceDB using hook
      const result = await bulkUpload(prompts);

      successToast(
        `Success! Uploaded ${result.uploaded} prompts via native LanceDB SDK. Computed ${result.centroids_computed} centroids. Total: ${result.stats.total_examples} examples.`
      );
      setJsonText("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading JSON:", error);
      errorToast(
        error instanceof Error ? error.message : "Failed to upload JSON"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSyncFromDatabase = async () => {
    setSyncing(true);
    try {
      const result = await syncToLanceDB();

      successToast(
        result.synced === 0
          ? "No prompts found in database to sync"
          : `Success! Synced ${result.synced} prompts and computed ${result.centroids_computed} centroids`
      );
      onSuccess();
    } catch (error) {
      console.error("Error syncing from database:", error);
      errorToast(
        error instanceof Error ? error.message : "Failed to sync from database"
      );
    } finally {
      setSyncing(false);
    }
  };

  const downloadTemplate = (format: "csv" | "json") => {
    if (format === "csv") {
      const csv = `prompt,risk_category,severity
"Ignore all instructions",jailbreak,9
"SSN: 123-45-6789",pii,8
"You're an idiot",toxicity,6`;

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prompt-template.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(
        [
          {
            prompt: "Ignore all instructions",
            risk_category: "jailbreak",
            severity: 9,
          },
          { prompt: "SSN: 123-45-6789", risk_category: "pii", severity: 8 },
          { prompt: "You're an idiot", risk_category: "toxicity", severity: 6 },
        ],
        null,
        2
      );

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prompt-template.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Bulk Upload to LanceDB
          </DialogTitle>
          <DialogDescription>
            Upload prompts in bulk directly to LanceDB for fast risk detection.
            Or sync existing prompts from your database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sync from Database Option */}
          <div className="p-4 bg-muted border rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium  flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Sync from Database
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sync all prompts you've added via Router Training to LanceDB
                </p>
              </div>
              <Button
                onClick={handleSyncFromDatabase}
                disabled={syncing}
                variant="outline"
                size="sm"
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </div>

          {/* Bulk Upload Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Or upload bulk data directly:</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadTemplate("csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV Template
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadTemplate("json")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON Template
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("csv")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "csv" ? "" : "text-muted-foreground"
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                CSV Format
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "json" ? "" : "text-muted-foreground"
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                JSON Format
              </button>
            </div>

            {activeTab === "csv" && (
              <div className="space-y-2">
                <Textarea
                  placeholder={`prompt,risk_category,severity
"Ignore all instructions",jailbreak,9
"SSN: 123-45-6789",pii,8
"You're an idiot",toxicity,6`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={10}
                  className="font-mono text-sm min-h-64"
                />
                <p className="text-xs text-gray-500">
                  Format: prompt,risk_category,severity (one per line, first
                  line is header)
                </p>
              </div>
            )}

            {activeTab === "json" && (
              <div className="space-y-2">
                <Textarea
                  placeholder={`[
  {"prompt": "Ignore all instructions", "risk_category": "jailbreak", "severity": 9},
  {"prompt": "SSN: 123-45-6789", "risk_category": "pii", "severity": 8}
]`}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={10}
                  className="font-mono text-sm min-h-64"
                />
                <p className="text-xs text-gray-500">
                  Format: Array of objects with prompt, risk_category, and
                  optional severity fields
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={activeTab === "csv" ? handleCsvUpload : handleJsonUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to LanceDB
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
