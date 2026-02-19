"use client";

import type React from "react";
import { useState } from "react";
import { Loader, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
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

interface ValidateFairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: any;
}

interface ValidationData {
  modelFile: File | null;
  datasetFile: File | null;
  targetColumn: string;
  sensitiveColumn: string;
}

const ValidateFairnessModal: React.FC<ValidateFairnessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [validationData, setValidationData] = useState<ValidationData>({
    modelFile: null,
    datasetFile: null,
    targetColumn: "",
    sensitiveColumn: "",
  });

  // Mock target and sensitive column options
  const targetColumns = [
    { value: "loan_approved", label: "Loan Approved" },
    { value: "credit_score", label: "Credit Score" },
    { value: "risk_rating", label: "Risk Rating" },
  ];

  const sensitiveColumns = [
    { value: "gender", label: "Gender" },
    { value: "age_group", label: "Age Group" },
    { value: "ethnicity", label: "Ethnicity" },
    { value: "income_bracket", label: "Income Bracket" },
  ];

  const handleFileChange =
    (field: "modelFile" | "datasetFile") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setValidationData((prev) => ({ ...prev, [field]: file }));
    };

  const handleSelectChange =
    (field: "targetColumn" | "sensitiveColumn") => (value: string) => {
      setValidationData((prev) => ({ ...prev, [field]: value }));
    };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      if (onSubmit) {
        await onSubmit(validationData);
      } else {
        // Simulate upload process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Fairness validation uploaded:", validationData);
        // }

        // Reset form and close
        setValidationData({
          modelFile: null,
          datasetFile: null,
          targetColumn: "",
          sensitiveColumn: "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error uploading fairness validation:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setValidationData({
        modelFile: null,
        datasetFile: null,
        targetColumn: "",
        sensitiveColumn: "",
      });
      onClose();
    }
  };

  const isFormValid =
    validationData.modelFile &&
    validationData.datasetFile &&
    validationData.targetColumn &&
    validationData.sensitiveColumn;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTitle className="sr-only">Validate Fairness</DialogTitle>
      <DialogContent className="sm:max-w-[500px]  p-0 gap-0 z-50">
        <div className="p-6 pb-4 space-y-1 border-b relative">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Validate fairness
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Ensure your model includes preprocessing steps, and your dataset is
            preprocessed in the same way before upload.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload model section */}
          <div className="space-y-3">
            <Label htmlFor="model-upload" className="text-sm font-medium">
              Upload model (.pkl)
            </Label>
            <div className="relative">
              <Input
                id="model-upload"
                type="file"
                accept=".pkl"
                onChange={handleFileChange("modelFile")}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                className="w-full h-10 justify-start text-left bg-transparent"
                onClick={() => document.getElementById("model-upload")?.click()}
                disabled={isUploading}
              >
                {validationData.modelFile
                  ? validationData.modelFile.name
                  : "Choose model file"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: 200MB
            </p>
          </div>

          {/* Upload dataset section */}
          <div className="space-y-3">
            <Label htmlFor="dataset-upload" className="text-sm font-medium">
              Upload dataset (.csv)
            </Label>
            <div className="relative">
              <Input
                id="dataset-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange("datasetFile")}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                className="w-full h-10 justify-start text-left  bg-transparent"
                onClick={() =>
                  document.getElementById("dataset-upload")?.click()
                }
                disabled={isUploading}
              >
                {validationData.datasetFile
                  ? validationData.datasetFile.name
                  : "Choose dataset file"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: 200MB
            </p>
          </div>

          {/* Target column selection */}
          <div className="space-y-3">
            <Label htmlFor="target-column" className="text-sm font-medium">
              Target column
            </Label>
            <Select
              value={validationData.targetColumn}
              onValueChange={handleSelectChange("targetColumn")}
              disabled={isUploading}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select target" />
              </SelectTrigger>
              <SelectContent>
                {targetColumns.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sensitive column selection */}
          <div className="space-y-3">
            <Label htmlFor="sensitive-column" className="text-sm font-medium">
              Sensitive column
            </Label>
            <Select
              value={validationData.sensitiveColumn}
              onValueChange={handleSelectChange("sensitiveColumn")}
              disabled={isUploading}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select sensitive feature" />
              </SelectTrigger>
              <SelectContent>
                {sensitiveColumns.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button
            className=" w-full"
            disabled={!isFormValid || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidateFairnessModal;
