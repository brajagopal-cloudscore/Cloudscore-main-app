import { ComplianceFormDataType } from "@/types/compliance";
import { useISO_42001ComplianceTracking } from "../provider";

export const useSubmittion = () => {
  const { get, update } = useISO_42001ComplianceTracking();
  const onSubmit = (label: string, data: ComplianceFormDataType) => {
    update(label, data);
  };

  return { onSubmit };
};
