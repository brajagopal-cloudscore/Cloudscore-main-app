import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiskManagement } from "./RiskManagement";
import { TabNavigation } from "./TabNavigation";
import { UseCaseForm } from "./UseCaseForm";
import { useAIRisks } from "@/contexts/AIRisksContext";
import {
  UseCase,
  AddUseCaseWithRisksData,
  ValidationError,
} from "@/types/useCase";
import { useRiskManagement } from "@/hooks/useRiskManagement";

interface UseCaseModalsProps {
  openModal: string;
  editUseCaseData: UseCase;
  addUseCaseData: AddUseCaseWithRisksData;
  errors: ValidationError;
  isEditPending: boolean;
  isCreatePending: boolean;
  tenantId: string;
  applicationId: string;
  onEditClose: () => void;
  onCreateClose: () => void;
  onEditSave: (useCase: UseCase, riskData?: any) => void; // Updated to include risk data
  onCreateSave: Function;
  onEditUseCaseChange: (useCase: UseCase) => void;
  onCreateInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCreateSelectChange: (name: string, value: string) => void;
  setAddUseCaseData: any;
  setErrors: any;
  setOpenModal: any;
}

export const UseCaseModals: React.FC<UseCaseModalsProps> = ({
  openModal,
  editUseCaseData,
  addUseCaseData,
  errors,
  isEditPending,
  isCreatePending,
  tenantId,
  applicationId,
  onEditClose,
  onCreateClose,
  onEditSave,
  onCreateSave,
  onEditUseCaseChange,
  onCreateInputChange,
  onCreateSelectChange,
  setAddUseCaseData,
  setErrors,
  setOpenModal,
}) => {
  const [activeTab, setActiveTab] = useState("usecase");
  const createRiskManagement = useRiskManagement();
  const editRiskManagement = useRiskManagement();

  // Reset tab when modal opens
  useEffect(() => {
    if (openModal === "create use case" || openModal === "edit use case") {
      setActiveTab("usecase");

      if (openModal === "create use case") {
        createRiskManagement.resetRisks();
      }

      if (openModal === "edit use case" && editUseCaseData?.aLinkedRisks) {
        editRiskManagement.initializeEditRisks(editUseCaseData.aLinkedRisks);
      }
    }
  }, [openModal, editUseCaseData]);

  const handleCreateArrayChange = useCallback(
    (name: string, value: string[]) => {
      setAddUseCaseData((prev: any) => ({ ...prev, [name]: value }));
      if (errors[name as keyof ValidationError]) {
        setErrors((prev: any) => ({ ...prev, [name]: "" }));
      }
    },
    [errors, setAddUseCaseData, setErrors]
  );

  // Handle edit modal changes
  const handleEditArrayChange = useCallback(
    (field: keyof UseCase, value: string[]) => {
      if (editUseCaseData) {
        onEditUseCaseChange({
          ...editUseCaseData,
          [field]: value,
        });
      }
    },
    [editUseCaseData, onEditUseCaseChange]
  );

  const handleEditInputChange = useCallback(
    (field: keyof UseCase, value: string) => {
      if (editUseCaseData) {
        onEditUseCaseChange({
          ...editUseCaseData,
          [field]: value,
        });
      }
    },
    [editUseCaseData, onEditUseCaseChange]
  );

  // Validate current tab data and set errors
  const validateCurrentTab = (isCreate: boolean) => {
    const newErrors: ValidationError = {};

    if (activeTab === "usecase") {
      const data = isCreate ? addUseCaseData : editUseCaseData;
      if (!data) return false;

      if (!data.sFunction?.trim()) newErrors.sFunction = "Function is required";
      if (!data.sUseCase?.trim()) newErrors.sUseCase = "Use case is required";
      if (!data.sWhatItDoes?.trim())
        newErrors.sWhatItDoes = "What it does is required";
      if (!data.aKeyInputs?.length)
        newErrors.aKeyInputs = "Key inputs are required";
      if (!data.aPrimaryOutputs?.length)
        newErrors.aPrimaryOutputs = "Primary outputs are required";
      if (!data.aBusinessImpact?.length)
        newErrors.aBusinessImpact = "Business impact is required";
      if (!data.aKPIs?.length) newErrors.aKPIs = "KPIs are required";
    } else if (activeTab === "risks") {
      if (isCreate) {
        const hasRisks =
          createRiskManagement.selectedRiskIds.length > 0 ||
          createRiskManagement.newRisks.length > 0;
        if (!hasRisks) {
          newErrors.risks =
            "At least one risk must be provided (either existing or new)";
        }

        // Validate new risks with field-level errors
        createRiskManagement.newRisks.forEach((risk: any, index: number) => {
          const riskErrors: any = {};
          if (!risk.sRiskName?.trim())
            riskErrors.sRiskName = "Risk name is required";
          if (!risk.sOwner?.trim()) riskErrors.sOwner = "Owner is required";
          if (!risk.dTargetDate)
            riskErrors.dTargetDate = "Target date is required";

          if (Object.keys(riskErrors).length > 0) {
            newErrors[`newRisk_${index}`] = riskErrors;
          }
        });
      } else {
        // Edit mode validation
        const existingRisksCount = editRiskManagement.existingRisks.filter(
          (r) => !editRiskManagement.removedRiskIds.includes(r._id || "")
        ).length;
        const totalRisks =
          existingRisksCount + editRiskManagement.newRisks.length;

        if (totalRisks === 0) {
          newErrors.risks = "At least one risk must be provided";
        }

        // Validate new risks with field-level errors
        editRiskManagement.newRisks.forEach((risk: any, index: number) => {
          const riskErrors: any = {};
          if (!risk.sRiskName?.trim())
            riskErrors.sRiskName = "Risk name is required";
          if (!risk.sOwner?.trim()) riskErrors.sOwner = "Owner is required";
          if (!risk.dTargetDate)
            riskErrors.dTargetDate = "Target date is required";

          if (Object.keys(riskErrors).length > 0) {
            newErrors[`newRisk_${index}`] = riskErrors;
          }
        });

        // Validate updated risks with field-level errors
        editRiskManagement.updatedRisks.forEach((risk: any, index: number) => {
          const riskErrors: any = {};
          if (!risk.sRiskName?.trim())
            riskErrors.sRiskName = "Risk name is required";
          if (!risk.sOwner?.trim()) riskErrors.sOwner = "Owner is required";
          if (!risk.dTargetDate)
            riskErrors.dTargetDate = "Target date is required";

          if (Object.keys(riskErrors).length > 0) {
            newErrors[`updatedRisk_${risk._id || index}`] = riskErrors;
          }
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Clear errors if validation passes
    setErrors({});
    return true;
  };

  // Handle button click based on active tab
  const handleButtonClick = (isCreate: boolean) => {
    if (activeTab === "usecase") {
      // Validate use case tab
      if (validateCurrentTab(isCreate)) {
        // Move to risks tab
        setActiveTab("risks");
      }
    } else if (activeTab === "risks") {
      setActiveTab("transparency-user-information");
    } else if (activeTab === "transparency-user-information") {
      setActiveTab("human-oversight");
    } else if (activeTab === "human-oversight") {
      setActiveTab("bias-and-fairness");
    } else if (activeTab === "bias-and-fairness") {
      setActiveTab("bias-monitoring-and-mitigation");
    } else if (activeTab === "bias-monitoring-and-mitigation") {
      setActiveTab("explainability");
    } else if (activeTab === "explainability") {
      setActiveTab("environmental-impact");
    } else if (activeTab === "environmental-impact") {
      setOpenModal("");
    }
  };

  return (
    <>
      {/* CREATE USE CASE MODAL */}
      <Dialog
        open={openModal === "create use case"}
        onOpenChange={(open) => !open && onCreateClose()}
      >
        <DialogTitle className="sr-only">Create Use Case</DialogTitle>
        <DialogContent className="sm:max-w-[1100px] text-black p-0 gap-0 max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Create Use Case
            </h3>
          </div>

          <UseCaseForm
            data={addUseCaseData}
            errors={errors}
            isEdit={false}
            onInputChange={onCreateInputChange}
            onSelectChange={onCreateSelectChange}
            onArrayChange={handleCreateArrayChange}
          />

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-600"
              onClick={() => handleButtonClick(true)}
            >
              {isCreatePending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Create Use Case</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT USE CASE MODAL */}
      <Dialog
        open={openModal === "edit use case"}
        onOpenChange={(open) => !open && onEditClose()}
      >
        <DialogTitle className="sr-only">Edit Use Case</DialogTitle>
        <DialogContent className="sm:max-w-[1000px] text-black p-0 gap-0 max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Edit Use Case
            </h3>
          </div>

          <UseCaseForm
            data={editUseCaseData}
            errors={errors}
            isEdit={true}
            onInputChange={(e) =>
              handleEditInputChange(
                e.target.name as keyof UseCase,
                e.target.value
              )
            }
            onSelectChange={handleEditInputChange}
            onArrayChange={handleEditArrayChange}
          />

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-600"
              onClick={() => handleButtonClick(false)}
            >
              {isEditPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Edit Use Case</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UseCaseModals;
