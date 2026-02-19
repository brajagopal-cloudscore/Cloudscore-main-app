import { ComplianceFormDataType } from "@/types/compliance";
import { useEUComplianceTracking } from "../provider";

export const useSubmittion = () => {
  const { get, update } = useEUComplianceTracking();
  const onSubmit = (label: string, data: ComplianceFormDataType) => {
    update(label, data);
  };

  return { onSubmit };
};
