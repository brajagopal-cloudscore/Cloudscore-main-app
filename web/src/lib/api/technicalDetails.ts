import instanceAxios from '@/axios/instanceAxios';
import config from '../../config/config';

export interface TechnicalDetail {
  _id: string;
  sVendor?: string;
  sModel?: string;
  sHostingLocation: string;
  sModelArchitecture: string;
  sObjectives: string;
  sComputeInfrastructure: string;
  sTrainingDuration: string;
  sModelSize: string;
  sTrainingDataSize: string;
  sInferenceLatency: string;
  sHardwareRequirements: string;
  sPromptRegistry?: string;
  sSoftware: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllTechnicalDetailsParams {
  page: number;
  page_size: number;
  search?: string;
}

export interface GetAllTechnicalDetailsRes {
  technicalDetails: TechnicalDetail[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

export interface AddTechnicalDetailReq {
  sVendor?: string;
  sModel?: string;
  sHostingLocation: string;
  sModelArchitecture: string;
  sObjectives: string;
  sComputeInfrastructure: string;
  sTrainingDuration: string;
  sModelSize: string;
  sTrainingDataSize: string;
  sInferenceLatency: string;
  sHardwareRequirements: string;
  sSoftware: string;
  sPromptRegistry: string;
}

export interface UpdateTechnicalDetailReq extends AddTechnicalDetailReq {
  TechDetailsId: string;
}

// Get all technical details with filtering, pagination, and search
export const GetAllTechnicalDetails = async (params: GetAllTechnicalDetailsParams) => {
  const { page, page_size, search } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/technical-details/list/v1`);
  endpoint.searchParams.set('page', page.toString());
  endpoint.searchParams.set('limit', page_size.toString());
  
  if (search) endpoint.searchParams.set('search', search);

  try {
    const response = await instanceAxios.get(endpoint.href);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Get technical detail by ID
export const GetTechnicalDetailDetails = async (TechDetailsId: string) => {
  try {
    const response = await instanceAxios.get(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/technical-detail/${TechDetailsId}/v1`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Add new technical detail
export const AddTechnicalDetail = async (technicalDetailData: AddTechnicalDetailReq) => {
  try {
    const response = await instanceAxios.post(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/add/technical-details/v1`,
      technicalDetailData
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Update technical detail
export const UpdateTechnicalDetail = async (technicalDetailData: UpdateTechnicalDetailReq) => {
  try {
    const response = await instanceAxios.put(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/update/technical-details/${technicalDetailData.TechDetailsId}/v1`,
      technicalDetailData
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Delete technical detail
export const DeleteTechnicalDetail = async (TechDetailsId: string) => {
  try {
    const response = await instanceAxios.delete(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/delete/technical-details/${TechDetailsId}/v1`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Export all technical details
export const ExportAllTechnicalDetails = async (params: GetAllTechnicalDetailsParams) => {
  const { page, page_size, search } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/technical-details/export/v1`);
  endpoint.searchParams.set('page', page.toString());
  endpoint.searchParams.set('limit', page_size.toString());
  
  if (search) endpoint.searchParams.set('search', search);

  try {
    const response = await instanceAxios.get(endpoint.href, {
      responseType: 'blob'
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
