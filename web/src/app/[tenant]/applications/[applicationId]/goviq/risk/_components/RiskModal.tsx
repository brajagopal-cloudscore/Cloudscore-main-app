"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { UserSelect } from "@/components/common/UserSelect";

interface Risk {
  id: string;
  riskName: string;
  owner: string;
  description: string | null;
  severity: "Minor" | "Moderate" | "Major" | "Catastrophic";
  likelihood: "Rare" | "Unlikely" | "Possible" | "Likely";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  mitigationStatus:
    | "Not Started"
    | "In Progress"
    | "Requires Review"
    | "Completed";
  mitigationPlan: string | null;
  targetDate: string | null;
  lastReviewDate: string | null;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  controlOwner: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  updatedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface RiskListItem {
  id: string;
  riskName: string;
  description?: string | null;
  severity?: string | null;
  likelihood?: string | null;
  category?: string[] | null;
}

interface Props {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  risk?: Partial<Risk> | null;
  onClose: () => void;
  onSubmit?: (
    data: Partial<Risk> & {
      riskName: string;
      owner: string;
      controlOwner?: string | null;
      severity: Risk["severity"];
      likelihood: Risk["likelihood"];
      riskLevel: Risk["riskLevel"];
      mitigationStatus: Risk["mitigationStatus"];
    }
  ) => Promise<void>;
  isPending: boolean;
  tenantId: string;
  riskListItems?: RiskListItem[];
  enableRiskFromDB?: boolean;
  onToggleRiskFromDB?: () => void;
  onRiskItemSelect?: (riskItem: RiskListItem) => void;
  isLoadingRiskList?: boolean;
}

const SEVERITY_OPTIONS = ["Minor", "Moderate", "Major", "Catastrophic"];
const LIKELIHOOD_OPTIONS = ["Rare", "Unlikely", "Possible", "Likely"];
const RISK_LEVEL_OPTIONS = ["Low", "Medium", "High"];
const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Requires Review",
  "Completed",
];

// Calculate risk level based on severity and likelihood
const calculateRiskLevel = (
  severity: string | null | undefined,
  likelihood: string | null | undefined
): "Low" | "Medium" | "High" => {
  const severityMap: Record<string, number> = {
    Minor: 1,
    Moderate: 2,
    Major: 3,
    Catastrophic: 4,
  };

  const likelihoodMap: Record<string, number> = {
    Rare: 1,
    Unlikely: 2,
    Possible: 3,
    Likely: 4,
  };

  const severityValue = severity ? severityMap[severity] || 1 : 1;
  const likelihoodValue = likelihood ? likelihoodMap[likelihood] || 1 : 1;
  const score = severityValue * likelihoodValue;

  if (score <= 4) return "Low";
  if (score <= 8) return "Medium";
  return "High";
};

export function RiskModal({
  isOpen,
  mode,
  risk,
  onClose,
  onSubmit,
  isPending,
  tenantId,
  riskListItems = [],
  enableRiskFromDB = true,
  onToggleRiskFromDB,
  onRiskItemSelect,
  isLoadingRiskList = false,
}: Props) {
  const [formData, setFormData] = useState<Partial<Risk>>({
    riskName: "",
    owner: "",
    controlOwner: "",
    description: "",
    severity: undefined,
    likelihood: undefined,
    riskLevel: undefined,
    mitigationStatus: undefined,
    targetDate: "",
    mitigationPlan: "",
    categories: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const title = isViewMode
    ? "View Risk"
    : isEditMode
      ? "Edit Risk"
      : "Create Risk";
  const saveButtonText = isEditMode ? "Save" : "Create";
  const loadingText = isEditMode ? "Saving..." : "Creating...";

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && risk) {
      setFormData({
        riskName: risk.riskName || "",
        owner: risk.owner || "",
        controlOwner: risk.controlOwner || "",
        description: risk.description || "",
        severity: risk.severity,
        likelihood: risk.likelihood,
        riskLevel: risk.riskLevel,
        mitigationStatus: risk.mitigationStatus,
        targetDate: risk.targetDate
          ? new Date(risk.targetDate).toISOString().split("T")[0]
          : "",
        mitigationPlan: risk.mitigationPlan || "",
        categories: risk.categories || [],
      });
    } else if (mode === "create") {
      setFormData({
        riskName: "",
        owner: "",
        controlOwner: "",
        description: "",
        severity: undefined,
        likelihood: undefined,
        riskLevel: undefined,
        mitigationStatus: undefined,
        targetDate: "",
        mitigationPlan: "",
        categories: [],
      });
    }
    setErrors({});
  }, [mode, risk, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.riskName?.trim()) {
      newErrors.riskName = "Risk name is required";
    }
    if (!formData.owner?.trim()) {
      newErrors.owner = "Owner is required";
    }
    if (!formData.severity) {
      newErrors.severity = "Severity is required";
    }
    if (!formData.likelihood) {
      newErrors.likelihood = "Likelihood is required";
    }
    if (!formData.riskLevel) {
      newErrors.riskLevel = "Risk level is required";
    }
    if (!formData.mitigationStatus) {
      newErrors.mitigationStatus = "Status is required";
    }
    if (!formData.targetDate?.trim()) {
      newErrors.targetDate = "Review date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isViewMode || !onSubmit) return;

    if (!validate()) return;

    try {
      await onSubmit(
        formData as Partial<Risk> & {
          riskName: string;
          owner: string;
          controlOwner?: string | null;
          severity: Risk["severity"];
          likelihood: Risk["likelihood"];
          riskLevel: Risk["riskLevel"];
          mitigationStatus: Risk["mitigationStatus"];
        }
      );
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save risk" });
    }
  };

  const handleRiskItemSelect = (value: string) => {
    const selectedRisk = riskListItems.find((risk) => risk.riskName === value);
    if (selectedRisk && onRiskItemSelect) {
      onRiskItemSelect(selectedRisk);
      const calculatedRiskLevel = calculateRiskLevel(
        selectedRisk.severity,
        selectedRisk.likelihood
      );

      const severityValue: Risk["severity"] | undefined =
        selectedRisk.severity &&
        ["Minor", "Moderate", "Major", "Catastrophic"].includes(
          selectedRisk.severity
        )
          ? (selectedRisk.severity as Risk["severity"])
          : undefined;
      const likelihoodValue: Risk["likelihood"] | undefined =
        selectedRisk.likelihood &&
        ["Rare", "Unlikely", "Possible", "Likely"].includes(
          selectedRisk.likelihood
        )
          ? (selectedRisk.likelihood as Risk["likelihood"])
          : undefined;

      setFormData((prev) => ({
        ...prev,
        riskName: selectedRisk.riskName,
        description: selectedRisk.description || "",
        severity: severityValue,
        likelihood: likelihoodValue,
        riskLevel: calculatedRiskLevel,
        categories: selectedRisk.category || [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, riskName: value }));
    }
  };

  const isFieldDisabled: boolean =
    !isEditMode &&
    enableRiskFromDB &&
    !!formData.riskName &&
    riskListItems.some((item) => item.riskName === formData.riskName);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <DialogContent className="sm:max-w-[600px]  p-0 gap-0 z-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 space-y-1 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h3>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Risk Name Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="riskName"
                className="text-sm font-medium text-muted-foreground"
              >
                Risk Name*
              </Label>
              {mode === "create" && (
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="riskSwitch"
                    className="text-xs text-muted-foreground"
                  >
                    From DB
                  </Label>
                  <Switch
                    id="riskSwitch"
                    checked={enableRiskFromDB}
                    onCheckedChange={onToggleRiskFromDB}
                  />
                </div>
              )}
            </div>

            {enableRiskFromDB && mode === "create" ? (
              <Select
                value={formData.riskName}
                onValueChange={handleRiskItemSelect}
                disabled={isLoadingRiskList || isViewMode}
              >
                <SelectTrigger
                  className={`h-14! ${errors.riskName ? "border-red-500 focus-visible:border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={
                      isLoadingRiskList
                        ? "Loading risks..."
                        : "Select risk from database"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {riskListItems.map((riskItem) => (
                    <SelectItem key={riskItem.id} value={riskItem.riskName}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{riskItem.riskName}</span>
                        {riskItem.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-xs">
                            {riskItem.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="riskName"
                placeholder="Enter risk name manually"
                className={`h-9 ${errors.riskName ? "border-red-500 focus-visible:border-red-500" : ""}`}
                value={formData.riskName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, riskName: e.target.value }))
                }
                disabled={isViewMode}
              />
            )}
            {errors.riskName && (
              <p className="text-sm text-red-500">{errors.riskName}</p>
            )}
          </div>

          {/* Owner and Control Owner Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <UserSelect
                value={formData.owner || ""}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, owner: value }))
                }
                placeholder="Select risk owner"
                className={errors.owner ? "border-red-500" : ""}
                error={!!errors.owner}
                label="Owner"
                required={true}
                tenantId={tenantId}
                disabled={isViewMode}
              />
              {errors.owner && (
                <p className="text-sm text-red-500">{errors.owner}</p>
              )}
            </div>
            <div className="space-y-2">
              <UserSelect
                value={formData.controlOwner || ""}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    controlOwner: value || null,
                  }))
                }
                placeholder="Select control owner"
                className=""
                error={false}
                label="Control Owner"
                required={false}
                tenantId={tenantId}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the risk in detail..."
              rows={3}
              disabled={isViewMode}
            />
          </div>

          {/* Severity and Likelihood */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="severity"
                className="text-sm font-medium text-muted-foreground"
              >
                Severity*
              </Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    severity: value as Risk["severity"],
                  }))
                }
                disabled={isViewMode}
              >
                <SelectTrigger
                  className={`h-9 ${errors.severity ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severity && (
                <p className="text-sm text-red-500">{errors.severity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="likelihood"
                className="text-sm font-medium text-muted-foreground"
              >
                Likelihood*
              </Label>
              <Select
                value={formData.likelihood}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    likelihood: value as Risk["likelihood"],
                  }))
                }
                disabled={isViewMode}
              >
                <SelectTrigger
                  className={`h-9 ${errors.likelihood ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select likelihood" />
                </SelectTrigger>
                <SelectContent>
                  {LIKELIHOOD_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.likelihood && (
                <p className="text-sm text-red-500">{errors.likelihood}</p>
              )}
            </div>
          </div>

          {/* Risk Level and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="riskLevel"
                className="text-sm font-medium text-muted-foreground"
              >
                Risk Level*
              </Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    riskLevel: value as Risk["riskLevel"],
                  }))
                }
                disabled={isViewMode}
              >
                <SelectTrigger
                  className={`h-9 ${errors.riskLevel ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.riskLevel && (
                <p className="text-sm text-red-500">{errors.riskLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="mitigationStatus"
                className="text-sm font-medium text-muted-foreground"
              >
                Status*
              </Label>
              <Select
                value={formData.mitigationStatus}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    mitigationStatus: value as Risk["mitigationStatus"],
                  }))
                }
                disabled={isViewMode}
              >
                <SelectTrigger
                  className={`h-9 ${errors.mitigationStatus ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mitigationStatus && (
                <p className="text-sm text-red-500">
                  {errors.mitigationStatus}
                </p>
              )}
            </div>
          </div>

          {/* Review Date */}
          <div className="space-y-2">
            <Label
              htmlFor="targetDate"
              className="text-sm font-medium text-muted-foreground"
            >
              Review Date*
            </Label>
            <Input
              id="targetDate"
              type="date"
              className={`h-9 ${errors.targetDate ? "border-red-500 focus-visible:border-red-500" : ""}`}
              value={formData.targetDate ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, targetDate: e.target.value }))
              }
              disabled={isViewMode}
            />
            {errors.targetDate && (
              <p className="text-sm text-red-500">{errors.targetDate}</p>
            )}
          </div>

          {/* Mitigation Plan */}
          <div className="space-y-2">
            <Label
              htmlFor="mitigationPlan"
              className="text-sm font-medium text-muted-foreground"
            >
              Mitigation Plan
            </Label>
            <Textarea
              id="mitigationPlan"
              value={formData.mitigationPlan ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  mitigationPlan: e.target.value,
                }))
              }
              placeholder="Describe the mitigation strategy..."
              rows={3}
              disabled={isViewMode}
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button disabled={isPending} onClick={handleSubmit}>
              {isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {loadingText}
                </>
              ) : (
                saveButtonText
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
