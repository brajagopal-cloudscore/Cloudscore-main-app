// Define interfaces locally to avoid circular dependency
interface Project {
  _id: string;
  sProjectName: string;
  sProjectId: string;
  sDescription: string;
  eStatus: string;
  sEndUserAccessRights: string;
  sMonitoringSchedule: string;
  sBusinessInitiatives: string;
  sDeliveryMethods: string;
  bGovIQ: any;
  bControlNet: any;
  dCreatedAt: string;
  dUpdatedAt: string;
}

interface AddProjectData {
  _id?: string;
  sProjectName: string;
  sDescription: string;
  eStatus: string;
  sBusinessInitiatives: string;
  sDeliveryMethods: string;
  sEndUserAccessRights: string;
  sMonitoringSchedule: string;
  bGovIQ: any;
  bControlNet: any;
}

const STORAGE_KEYS = {
  PROJECTS: 'projects_data',
  PROJECTS_META: 'projects_meta',
  SELECTED_PROJECT: 'selected_project',
  PROJECT_FILTERS: 'project_filters',
  PROJECT_PAGINATION: 'project_pagination'
};

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Generic localStorage wrapper with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  }
};

// Project-specific localStorage functions
export const projectStorage = {
  // Get all projects from localStorage
  getProjects: (): Project[] => {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse projects from localStorage', error);
      return [];
    }
  },

  // Save projects to localStorage
  saveProjects: (projects: Project[]): boolean => {
    try {
      const data = JSON.stringify(projects);
      return safeLocalStorage.setItem(STORAGE_KEYS.PROJECTS, data);
    } catch (error) {
      console.warn('Failed to save projects to localStorage', error);
      return false;
    }
  },

  // Add a new project
  addProject: (projectData: AddProjectData): Project | null => {
    try {
      const projects = projectStorage.getProjects();
      const newProject: Project = {
        _id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sProjectId: `PROJ_${Date.now()}`,
        ...projectData,
        dCreatedAt: new Date().toISOString(),
        dUpdatedAt: new Date().toISOString()
      };
      
      projects.unshift(newProject); // Add to beginning
      
      if (projectStorage.saveProjects(projects)) {
        return newProject;
      }
      return null;
    } catch (error) {
      console.warn('Failed to add project', error);
      return null;
    }
  },

  // Update an existing project
  updateProject: (projectId: string, updatedData: Partial<Project>): Project | null => {
    try {
      const projects = projectStorage.getProjects();
      const projectIndex = projects.findIndex(p => p._id === projectId);
      
      if (projectIndex === -1) return null;
      
      projects[projectIndex] = {
        ...projects[projectIndex],
        ...updatedData,
        dUpdatedAt: new Date().toISOString()
      };
      
      if (projectStorage.saveProjects(projects)) {
        return projects[projectIndex];
      }
      return null;
    } catch (error) {
      console.warn('Failed to update project', error);
      return null;
    }
  },

  // Delete a project
  deleteProject: (projectId: string): boolean => {
    try {
      const projects = projectStorage.getProjects();
      const filteredProjects = projects.filter(p => p._id !== projectId);
      return projectStorage.saveProjects(filteredProjects);
    } catch (error) {
      console.warn('Failed to delete project', error);
      return false;
    }
  },

  // Get project by ID
  getProjectById: (projectId: string): Project | null => {
    const projects = projectStorage.getProjects();
    return projects.find(p => p._id === projectId) || null;
  },

  // Search projects
  searchProjects: (searchTerm: string, status?: string): Project[] => {
    const projects = projectStorage.getProjects();
    return projects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.sProjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.sDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !status || status === 'active' || project.eStatus === status;
      
      return matchesSearch && matchesStatus;
    });
  },

  // Get paginated projects
  getPaginatedProjects: (page: number, pageSize: number, searchTerm?: string, status?: string) => {
    const allProjects = projectStorage.searchProjects(searchTerm || '', status);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      projects: allProjects.slice(startIndex, endIndex),
      totalCount: allProjects.length,
      totalPages: Math.ceil(allProjects.length / pageSize),
      currentPage: page,
      pageSize
    };
  },

  // Selected project management
  setSelectedProject: (project: Project): boolean => {
    try {
      const data = JSON.stringify(project);
      return safeLocalStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT, data);
    } catch (error) {
      console.warn('Failed to save selected project', error);
      return false;
    }
  },

  getSelectedProject: (): Project | null => {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse selected project', error);
      return null;
    }
  },

  // Filters and pagination state
  saveFilters: (filters: { search: string; status: string }): boolean => {
    try {
      const data = JSON.stringify(filters);
      return safeLocalStorage.setItem(STORAGE_KEYS.PROJECT_FILTERS, data);
    } catch (error) {
      console.warn('Failed to save filters', error);
      return false;
    }
  },

  getFilters: (): { search: string; status: string } => {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.PROJECT_FILTERS);
    if (!data) return { search: '', status: 'active' };
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse filters', error);
      return { search: '', status: 'active' };
    }
  },

  savePagination: (pagination: { page: number; pageSize: number }): boolean => {
    try {
      const data = JSON.stringify(pagination);
      return safeLocalStorage.setItem(STORAGE_KEYS.PROJECT_PAGINATION, data);
    } catch (error) {
      console.warn('Failed to save pagination', error);
      return false;
    }
  },

  getPagination: (): { page: number; pageSize: number } => {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.PROJECT_PAGINATION);
    if (!data) return { page: 1, pageSize: 50 };
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse pagination', error);
      return { page: 1, pageSize: 50 };
    }
  },

  // Clear all project data
  clearAll: (): boolean => {
    let success = true;
    success = success && safeLocalStorage.removeItem(STORAGE_KEYS.PROJECTS);
    success = success && safeLocalStorage.removeItem(STORAGE_KEYS.PROJECTS_META);
    success = success && safeLocalStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
    success = success && safeLocalStorage.removeItem(STORAGE_KEYS.PROJECT_FILTERS);
    success = success && safeLocalStorage.removeItem(STORAGE_KEYS.PROJECT_PAGINATION);
    return success;
  }
};
