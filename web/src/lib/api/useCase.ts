import axios from 'axios';
import config from '../../config/config';
import { AddUseCaseWithRisksData, AIRisk, ProjectRisk, UseCase } from '@/types/useCase';

export interface GetAllUseCasesParams {
  iProjectId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetUseCaseDetailsParams {
  iProjectId: string;
  iUseCaseId: string;
}

export interface DeleteUseCaseParams {
  iProjectId: string;
  iUseCaseId: string;
}

export interface GetAllUseCasesRes {
  status: string;
  message: string;
  result: {
    aData: UseCase[];
    nCount: number;
    nTotal: number;
    nTotalPages: number;
    nCurrentPage: number;
    oGroupedByFunction: Record<string, UseCase[]>;
    oFilters: {
      search: string;
      function: string;
      agentPattern: string;
      sortBy: string;
      sortOrder: string;
    };
  };
}

export interface UpdateUseCaseReq extends Partial<Omit<AddUseCaseWithRisksData, 'aExistingRiskIds' | 'aNewRisks'>> {
  iUseCaseId: string;
}

export interface UseCaseDetailsRes {
  status: string;
  message: string;
  result: {
    useCase: UseCase;
    relatedUseCases: UseCase[];
  };
}

export interface GetProjectRisksParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: string;
  likelihood?: string;
  riskLevel?: string;
  owner?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetProjectRisksRes {
  status: string;
  message: string;
  result: {
    aData: ProjectRisk[];
    nCount: number;
    nTotal: number;
    nTotalPages: number;
    nCurrentPage: number;
  };
}

export interface GetAIRisksParams {
  search?: string;
  limit?: number;
  page?: number;
}

// Get all use cases with filtering, pagination, and search
export const GetAllUseCases = async (params: GetAllUseCasesParams) => {
  const { 
    page = 1, 
    limit = 10, 
    search,
    iProjectId
  } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/use-case/list/${iProjectId}/v1`);
  endpoint.searchParams.set('page', page.toString());
  endpoint.searchParams.set('limit', limit.toString());
  
  if (search) endpoint.searchParams.set('search', search);

  try {
    const response = await axios.get(endpoint.href);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Get Use Case details by ID
export const GetUseCaseDetails = async (params : GetUseCaseDetailsParams): Promise<UseCaseDetailsRes> => {
  const { iProjectId, iUseCaseId } = params;
  try {
    const response = await axios.get(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/use-case/${iProjectId}/${iUseCaseId}/v1`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Add new Use Case with Risks
export const AddUseCaseWithRisks = async (useCaseData: AddUseCaseWithRisksData) => {
  try {
    const response = await axios.post(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/add/use-case-with-risks/${useCaseData.iProjectId}/v1`,
      useCaseData
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Update Use Case (only use case fields, not risks)
export const UpdateUseCase = async (useCaseData: UpdateUseCaseReq) => {
  const { iUseCaseId, ...updateData } = useCaseData;
  
  try {
    const response = await axios.put(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/update/use-case/${useCaseData.iProjectId}/${iUseCaseId}/v1`,
      updateData
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const UpdateUseCaseWithRisks = async (data: {
  iUseCaseId: string;
  iProjectId: string;
  sFunction: string;
  sUseCase: string;
  sWhatItDoes: string;
  aAgentPatterns?: string[];
  aKeyInputs: string[];
  aPrimaryOutputs: string[];
  aBusinessImpact: string[];
  aKPIs: string[];
  aExistingRiskIds?: string[];
  aNewRisks?: any[];
  aUpdatedRisks?: any[];
  aRemovedRiskIds?: string[];
}) => {
  const { iUseCaseId, iProjectId } = data;

  try {
    const response = await axios.put(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/update/use-case-with-risks/${iProjectId}/${iUseCaseId}/v1`, data);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Delete Use Case
export const DeleteUseCase = async (params: DeleteUseCaseParams) => {
  const { iProjectId, iUseCaseId } = params;
  try {
    const response = await axios.delete(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/delete/use-case/${iProjectId}/${iUseCaseId}/v1`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const GetAIRisksForDropdown = async (params: GetAIRisksParams) => {
  const { 
  search = '', 
  limit = 20, 
  page = 1
  } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/ai-risks/dropdown/v1`);
  
  if (search) endpoint.searchParams.set('search', search);
  if (page) endpoint.searchParams.set('page', page.toString());
  if (limit) endpoint.searchParams.set('limit', limit.toString());

  try {
    const response = await axios.get(endpoint.href);
    return response?.data;
  } catch (error) {
    throw error;
  }
};
