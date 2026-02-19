export const QUERY_KEYS = {
  useCases: (params?: { page?: number; pageSize?: number; search?: string, iProjectId: string }) => 
    ['useCases', params] as const,
  aiRisks: ['aiRisks'] as const,
  aiRisksInfinite: (search?: string) => 
    ['aiRisksInfinite', search] as const,
  useCaseDetails: (id: string) => 
    ['useCaseDetails', id] as const,
};

export interface UseCase {
  _id: string;
  sFunction: string;
  sUseCase: string;
  sWhatItDoes: string;
  aAgentPatterns?: string[];
  aKeyInputs: string[];
  aPrimaryOutputs: string[];
  aBusinessImpact: string[];
  aKPIs: string[];
  aLinkedRisks: Array<{
    _id: string;
    sRiskName: string;
    sOwner: string;
    eSeverity: 'Minor' | 'Major' | 'Catastrophic' | 'Moderate';
    eLikelihood: 'Unlikely' | 'Possible' | 'Likely' | "Rare";
    eMitigationStatus: 'Not Started' | 'In Progress' | 'Requires Review' | 'Completed';
    eRiskLevel: 'Low' | 'Medium' | 'High';
    dTargetDate: string;
    dLastRiskReviewDate?: string;
    aCategory?: string[];
    sMitigationPlan: string;
}>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRisk {
  _id: string;
  sRiskName: string;
  sDescription?: string;
  sOwner: string;
  eSeverity: 'Minor' | 'Major' | 'Catastrophic' | 'Moderate';
  eLikelihood: 'Unlikely' | 'Possible' | 'Likely' | "Rare";
  eMitigationStatus: 'Not Started' | 'In Progress' | 'Requires Review' | 'Completed';
  eRiskLevel: 'Low' | 'Medium' | 'High';
  dTargetDate: string;
  dLastRiskReviewDate?: string;
  aCategory?: string[];
  sMitigationPlan: string;
  mitigationAttachments?: any;
}

export interface AIRisk {
  _id: string;
  sRiskName: string;
  sOwner: string;
  sDescription?: string;
  eSeverity: 'Minor' | 'Major' | 'Catastrophic' | 'Moderate';
  eMitigationStatus?: string;
  eLikelihood: string;
  aCategory: string[];
  eRiskLevel: string;
  dTargetDate: string;
  dLastRiskReviewDate?: string;
}

export interface AddUseCaseWithRisksData {
  sFunction: string;
  sUseCase: string;
  sWhatItDoes: string;
  aAgentPatterns?: string[];
  aKeyInputs: string[];
  aPrimaryOutputs: string[];
  aBusinessImpact: string[];
  aKPIs: string[];
  aExistingRiskIds: string[];
  aNewRisks: Array<Partial<ProjectRisk>>;
  aUpdatedRisks?: Array<Partial<ProjectRisk>>;
  aRemovedRiskIds?: string[];
  iProjectId: string;
}

export interface ValidationError {
  // Use Case fields
  sFunction?: string;
  sUseCase?: string;
  sWhatItDoes?: string;
  aAgentPatterns?: string;
  aKeyInputs?: string;
  aPrimaryOutputs?: string;
  aBusinessImpact?: string;
  aKPIs?: string;
  
  // General risk error
  risks?: string;
  
  // Field-level risk errors - dynamic keys
  // For new risks: newRisk_0, newRisk_1, etc.
  // For updated risks: updatedRisk_{riskId}
  [key: string]: string | RiskFieldErrors | undefined;
}

// Individual risk field errors
export interface RiskFieldErrors {
  sRiskName?: string;
  sOwner?: string;
  dTargetDate?: string;
  sDescription?: string;
  sCategory?: string;
  eProbability?: string;
  eImpact?: string;
  eMitigation?: string;
}

// Helper function to get risk field errors
export const getRiskFieldError = (
  errors: ValidationError, 
  riskKey: string, 
  fieldName: keyof RiskFieldErrors
): string | undefined => {
  const riskErrors = errors[riskKey] as RiskFieldErrors;
  return riskErrors?.[fieldName];
};

// Helper function to check if a risk has any field errors
export const hasRiskFieldErrors = (
  errors: ValidationError, 
  riskKey: string
): boolean => {
  const riskErrors = errors[riskKey] as RiskFieldErrors;
  return riskErrors && Object.keys(riskErrors).length > 0;
};
