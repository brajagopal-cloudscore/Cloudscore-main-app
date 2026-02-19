import axios from 'axios';
import config from '../../config/config';

export interface GetAllVendors {
  page: number;
  page_size: number;
  search?: string;
}

export interface GetAllModels {
  page: number;
  page_size: number;
  search?: string;
}

export interface GetAllModelsRes {
  projects: any[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

export interface AddModelReq {
  sVendor: string;
  sModel: string;
}``

export interface UpdateModelReq extends AddModelReq {
  iModelId: string;
}

export const GetAllVendors = async () => {
  // const { page, page_size, search } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/vendor/list/v1`);
  // endpoint.searchParams.set('page', page.toString());
  // endpoint.searchParams.set('limit', page_size.toString());
  
  // if (search) endpoint.searchParams.set('search', search);

  try {
    const response = await axios.get(endpoint.href);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Get all projects with filtering, pagination, and search
export const GetAllModels = async (params: GetAllModels) => {
  const { page, page_size, search } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/models/list/v1`);
  endpoint.searchParams.set('page', page.toString());
  endpoint.searchParams.set('limit', page_size.toString());
  
  if (search) endpoint.searchParams.set('search', search);

  try {
    const response = await axios.get(endpoint.href);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Get model details by ID
export const GetModelDetails = async (iModelId: string) => {
  try {
    const response = await axios.get(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/model/${iModelId}/v1`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Add new model
export const AddModel = async (projectData: AddModelReq) => {
  try {
    const response = await axios.post(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/add/model/v1`,
      projectData
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Update model
export const UpdateModel = async (projectData: UpdateModelReq) => {
  try {
    const response = await axios.put(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/update/model/${projectData.iModelId}/v1`,
      projectData
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Delete model
export const DeleteModel = async (iModelId: string) => {
  try {
    const response = await axios.delete(
      `${config.NEXT_PUBLIC_BASE_URL_AI}/user/delete/model/${iModelId}/v1`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

// Export all projects
export const ExportAllModels = async (params: GetAllModels) => {
  const { page, page_size, search } = params;
  
  const endpoint = new URL(`${config.NEXT_PUBLIC_BASE_URL_AI}/user/model/export/v1`);
  endpoint.searchParams.set('page', page.toString());
  endpoint.searchParams.set('limit', page_size.toString());
  
  if (search) endpoint.searchParams.set('search', search);

  try {
    const response = await axios.get(endpoint.href, {
      responseType: 'blob'
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
