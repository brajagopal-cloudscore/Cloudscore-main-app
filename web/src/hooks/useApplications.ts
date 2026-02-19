import { useState, useEffect, useCallback } from 'react';
import { projectStorage } from '@/lib/utils/localStorage';
import { fetchApplications, createApplication, updateApplication, deleteApplication } from '@/lib/api/applications';

// Simplified Project interface for applications
export interface Application {
  _id: string;
  sProjectName: string;
  sProjectId: string;
  bGovIQ: boolean;
  bControlNet: boolean;
  dCreatedAt: string;
  dUpdatedAt: string;
}

export interface CreateApplicationData {
  sProjectName: string;
  bGovIQ: boolean;
  bControlNet: boolean;
}

export interface UpdateApplicationData {
  sProjectName?: string;
  bGovIQ?: boolean;
  bControlNet?: boolean;
}

export interface ValidationError {
  sProjectName?: string;
  modules?: string; // Field for module validation
}

export interface ProjectsQueryParams {
  page: number;
  page_size: number;
  search?: string;
  status?: string;
}

export interface ProjectsResponse {
  projects: Application[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Hook for querying projects
export function useProjectsQuery(params: ProjectsQueryParams) {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);

      let applications: Application[] = [];
        const allProjects = projectStorage.getProjects();
        applications = allProjects.map(project => ({
          _id: project._id,
          sProjectName: project.sProjectName,
          sProjectId: project.sProjectId,
          bGovIQ: project.bGovIQ || false,
          bControlNet: project.bControlNet || false,
          dCreatedAt: project.dCreatedAt,
          dUpdatedAt: project.dUpdatedAt,
        }));

      // Apply search filter
      let filteredProjects = applications;
      if (params.search && params.search.trim()) {
        filteredProjects = applications.filter(app =>
          app.sProjectName.toLowerCase().includes(params.search?.toLowerCase() || '')
        );
      }

      // Apply status filter (for now, we'll show all as active)
      if (params.status === 'active') {
        // All applications are considered active in this simplified version
        filteredProjects = filteredProjects;
      }

      // Calculate pagination
      const totalCount = filteredProjects.length;
      const totalPages = Math.ceil(totalCount / params.page_size);
      const startIndex = (params.page - 1) * params.page_size;
      const endIndex = startIndex + params.page_size;
      const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

      const response: ProjectsResponse = {
        projects: paginatedProjects,
        totalCount,
        totalPages,
        currentPage: params.page,
      };

      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [params.page, params.page_size, params.search, params.status]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const refetch = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

// Hook for project details
export function useProjectDetailsQuery(projectId: string | null) {
  const [data, setData] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const project = projectStorage.getProjectById(projectId);
      if (project) {
        const application: Application = {
          _id: project._id,
          sProjectName: project.sProjectName,
          sProjectId: project.sProjectId,
          bGovIQ: project.bGovIQ || false,
          bControlNet: project.bControlNet || false,
          dCreatedAt: project.dCreatedAt,
          dUpdatedAt: project.dUpdatedAt,
        };
        setData(application);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project details');
      console.error('Error fetching project details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    data,
    isLoading,
    error,
  };
}

// Hook for creating projects
export function useCreateProjectMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(async (data: CreateApplicationData): Promise<Application> => {
    try {
      setIsPending(true);
      setError(null);

      // Validate that at least one module is selected
      if (!data.bGovIQ && !data.bControlNet) {
        throw new Error('At least one module must be selected');
      }


        // Fallback to localStorage
        const projectData = {
          sProjectName: data.sProjectName,
          sDescription: '', // Empty for simplified version
          eStatus: 'Not Started', // Default status
          sBusinessInitiatives: '', // Empty for simplified version
          sDeliveryMethods: '', // Empty for simplified version
          sEndUserAccessRights: '', // Empty for simplified version
          sMonitoringSchedule: '', // Empty for simplified version
          bGovIQ: data.bGovIQ,
          bControlNet: data.bControlNet,
        };

        const createdProject = projectStorage.addProject(projectData);
        if (!createdProject) {
          throw new Error('Failed to create project');
        }

        // Convert to Application format
        const application: Application = {
          _id: createdProject._id,
          sProjectName: createdProject.sProjectName,
          sProjectId: createdProject.sProjectId,
          bGovIQ: createdProject.bGovIQ || false,
          bControlNet: createdProject.bControlNet || false,
          dCreatedAt: createdProject.dCreatedAt,
          dUpdatedAt: createdProject.dUpdatedAt,
        };

        return application;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
    error,
  };
}

// Hook for updating projects
export function useUpdateProjectMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(async ({ 
    oProjectData, 
    iProjectId 
  }: { 
    oProjectData: UpdateApplicationData; 
    iProjectId: string; 
  }): Promise<Application> => {
    try {
      setIsPending(true);
      setError(null);

  
        // Fallback to localStorage
        const existingProject = projectStorage.getProjectById(iProjectId);
        if (!existingProject) {
          throw new Error('Project not found');
        }

        // Check if project name already exists (excluding current project)
        if (oProjectData.sProjectName && oProjectData.sProjectName.trim()) {
          const existingProjects = projectStorage.getProjects();
          const nameExists = existingProjects.some(project => 
            project._id !== iProjectId && 
            project.sProjectName.toLowerCase() === oProjectData?.sProjectName?.toLowerCase()
          );

          if (nameExists) {
            throw new Error('Project name already exists');
          }
        }

        // Validate that at least one module is selected
        const updatedGovIQ = oProjectData.bGovIQ !== undefined ? oProjectData.bGovIQ : existingProject.bGovIQ;
        const updatedControlNet = oProjectData.bControlNet !== undefined ? oProjectData.bControlNet : existingProject.bControlNet;

        if (!updatedGovIQ && !updatedControlNet) {
          throw new Error('At least one module must be selected');
        }

        // Update the project
        const updatedProject = projectStorage.updateProject(iProjectId, oProjectData);
        if (!updatedProject) {
          throw new Error('Failed to update project');
        }

        // Convert to Application format
        const application: Application = {
          _id: updatedProject._id,
          sProjectName: updatedProject.sProjectName,
          sProjectId: updatedProject.sProjectId,
          bGovIQ: updatedProject.bGovIQ || false,
          bControlNet: updatedProject.bControlNet || false,
          dCreatedAt: updatedProject.dCreatedAt,
          dUpdatedAt: updatedProject.dUpdatedAt,
        };

        return application;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
    error,
  };
}

// Hook for deleting projects
export function useDeleteProjectMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(async (projectId: string): Promise<void> => {
    try {
      setIsPending(true);
      setError(null);

      const success = projectStorage.deleteProject(projectId);
      if (!success) {
        throw new Error('Failed to delete project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
    error,
  };
}
