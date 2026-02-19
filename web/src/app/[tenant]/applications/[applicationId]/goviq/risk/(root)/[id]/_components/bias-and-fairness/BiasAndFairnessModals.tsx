"use client";

import type React from "react";
import { Loader } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
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

interface BiasCheck {
  _id: string;
  sCheckId: string;
  sModel: string;
  sDescription: string;
  sStatus: string;
  dCreatedAt?: string;
  dUpdatedAt?: string;
}

interface AddBiasCheckData {
  sCheckId: string;
  sModel: string;
  sDescription: string;
  sStatus: string;
}

interface ValidationError {
  sCheckId?: string;
  sModel?: string;
  sDescription?: string;
  sStatus?: string;
}

interface BiasAndFairnessModalsProps {
  // Modal state
  openModal: string;

  // Data
  editBiasData: BiasCheck | null;
  addBiasData: AddBiasCheckData;
  errors: ValidationError;

  // Loading states
  isEditPending: boolean;
  isCreatePending: boolean;

  // Event handlers
  onEditClose: () => void;
  onCreateClose: () => void;
  onEditSave: (biasCheck: BiasCheck) => void;
  onCreateSave: () => void;
  onEditBiasChange: (biasCheck: BiasCheck) => void;
  onCreateInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCreateSelectChange: (field: keyof AddBiasCheckData, value: string) => void;
}

export const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
];

const BiasAndFairnessModals: React.FC<BiasAndFairnessModalsProps> = ({
  // Modal state
  openModal,

  // Data
  editBiasData,
  addBiasData,
  errors,

  // Loading states
  isEditPending,
  isCreatePending,

  // Event handlers
  onEditClose,
  onCreateClose,
  onEditSave,
  onCreateSave,
  onEditBiasChange,
  onCreateInputChange,
  onCreateSelectChange,
}) => {
  const handleEditInputChange = (field: keyof BiasCheck, value: string) => {
    if (editBiasData) {
      onEditBiasChange({
        ...editBiasData,
        [field]: value,
      });
    }
  };

  return (
    <>
      {/* Edit Bias Check Modal */}
      <Dialog
        open={openModal === "edit bias"}
        onOpenChange={(open) => !open && onEditClose()}
      >
        <DialogTitle className="sr-only">
          Edit Bias and Fairness Check
        </DialogTitle>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 z-50">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Edit Bias and Fairness Check
            </h3>
          </div>

          {editBiasData && (
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-check-id"
                    className="text-sm font-medium"
                  >
                    Check ID*
                  </Label>
                  <Input
                    id="edit-check-id"
                    className={`${errors?.sCheckId ? "border-destructive" : ""} h-9`}
                    value={editBiasData?.sCheckId || ""}
                    onChange={(e) =>
                      handleEditInputChange("sCheckId", e.target.value)
                    }
                    placeholder="Enter check ID"
                  />
                  {errors?.sCheckId && (
                    <p className="text-sm  text-destructive">
                      {errors?.sCheckId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model" className="text-sm font-medium">
                    Model*
                  </Label>
                  <Input
                    id="edit-model"
                    className={`${errors?.sModel ? "border-destructive" : ""} h-9`}
                    value={editBiasData?.sModel || ""}
                    onChange={(e) =>
                      handleEditInputChange("sModel", e.target.value)
                    }
                    placeholder="Enter model name"
                  />
                  {errors?.sModel && (
                    <p className="text-sm  text-destructive">
                      {errors?.sModel}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-description"
                    className="text-sm font-medium"
                  >
                    Description*
                  </Label>
                  <Textarea
                    id="edit-description"
                    className={`${errors?.sDescription ? "border-destructive" : ""} min-h-[100px]`}
                    value={editBiasData?.sDescription || ""}
                    onChange={(e) =>
                      handleEditInputChange("sDescription", e.target.value)
                    }
                    placeholder="Enter description"
                  />
                  {errors?.sDescription && (
                    <p className="text-sm  text-destructive">
                      {errors?.sDescription}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status*
                  </Label>
                  <Select
                    value={editBiasData?.sStatus || ""}
                    onValueChange={(value) =>
                      handleEditInputChange("sStatus", value)
                    }
                  >
                    <SelectTrigger
                      className={`${errors?.sStatus ? "border-destructive" : ""} h-9`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors?.sStatus && (
                    <p className="text-sm  text-destructive">
                      {errors?.sStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onEditClose}>
              Cancel
            </Button>
            <Button
  
              variant="secondary"
              disabled={isEditPending}
              onClick={() => editBiasData && onEditSave(editBiasData)}
            >
              {isEditPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Bias Check Modal */}
      <Dialog
        open={openModal === "create bias"}
        onOpenChange={(open) => !open && onCreateClose()}
      >
        <DialogTitle className="sr-only">
          Create Bias and Fairness Check
        </DialogTitle>
        <DialogContent className="sm:max-w-[600px] text-black p-0 gap-0">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Create Bias and Fairness Check
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="check-id" className="text-sm font-medium">
                  Check ID*
                </Label>
                <Input
                  id="check-id"
                  className={`${errors?.sCheckId ? " focus-visible: border-destructive" : ""} h-9`}
                  value={addBiasData?.sCheckId}
                  name="sCheckId"
                  onChange={onCreateInputChange}
                  placeholder="Enter check ID"
                />
                {errors?.sCheckId && (
                  <p className="text-sm  text-destructive">
                    {errors?.sCheckId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium">
                  Model*
                </Label>
                <Input
                  id="model"
                  className={`${errors?.sModel ? " focus-visible: border-destructive" : ""} h-9`}
                  value={addBiasData?.sModel}
                  name="sModel"
                  onChange={onCreateInputChange}
                  placeholder="Enter model name"
                />
                {errors?.sModel && (
                  <p className="text-sm  text-destructive">{errors?.sModel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description*
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter description"
                  className={`${errors?.sDescription ? " focus-visible: border-destructive" : ""} min-h-[100px]`}
                  value={addBiasData?.sDescription}
                  name="sDescription"
                  onChange={onCreateInputChange}
                />
                {errors?.sDescription && (
                  <p className="text-sm  text-destructive">
                    {errors?.sDescription}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status*
                </Label>
                <Select
                  value={addBiasData?.sStatus}
                  onValueChange={(value) =>
                    onCreateSelectChange("sStatus", value)
                  }
                >
                  <SelectTrigger
                    className={`${errors?.sStatus ? " focus-visible: border-destructive" : ""} h-9`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors?.sStatus && (
                  <p className="text-sm  text-destructive">{errors?.sStatus}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={isCreatePending}
              onClick={onCreateSave}
            >
              {isCreatePending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BiasAndFairnessModals;
