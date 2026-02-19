// lib/api/applications.ts
// API helper file - wraps server actions for client-side usage
import * as applicationActions from '@/lib/actions/applications';

export interface ApplicationResponse {
  _id: string;
  sProjectName: string;
  sProjectId: string;
  bGovIQ: boolean;
  bControlNet: boolean;
  dCreatedAt: string;
  dUpdatedAt: string;
}

export interface ApplicationsResponse {
  applications: ApplicationResponse[];
  total: number;
}

// Fetch applications from the database via server action
export async function fetchApplications(tenantSlug: string): Promise<ApplicationResponse[]> {
  try {
    const data = await applicationActions.getApplications(tenantSlug);
    // Transform to legacy format for backward compatibility
    return (data.applications || []).map((app) => ({
      _id: app.id,
      sProjectName: app.name,
      sProjectId: `APP_${app.id.split('_')[1] || app.id}`,
      bGovIQ: app.goviqEnabled,
      bControlNet: app.controlnetEnabled,
      dCreatedAt: app.createdAt,
      dUpdatedAt: app.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

// Create application via server action
export async function createApplication(tenantId: string, data: any): Promise<ApplicationResponse> {
  const result = await applicationActions.createApplication({
    tenantId,
    name: data.sProjectName,
    description: data.description,
    goviqEnabled: data.bGovIQ,
    controlnetEnabled: data.bControlNet,
  });

  if (!result.application || !result.success) {
    throw new Error(result.message || 'Failed to create application');
  }

  // Transform to legacy format
  return {
    _id: result.application.id,
    sProjectName: result.application.name,
    sProjectId: `APP_${result.application.id.split('_')[1] || result.application.id}`,
    bGovIQ: result.application.goviqEnabled,
    bControlNet: result.application.controlnetEnabled,
    dCreatedAt: result.application.createdAt,
    dUpdatedAt: result.application.updatedAt,
  };
}

// Update application via server action
export async function updateApplication(tenantId: string, id: string, data: any): Promise<ApplicationResponse> {
  const result = await applicationActions.updateApplication({
    id,
    name: data.sProjectName,
    description: data.description,
    goviqEnabled: data.bGovIQ,
    controlnetEnabled: data.bControlNet,
  });

  // Transform to legacy format
  return {
    _id: result.id,
    sProjectName: result.name,
    sProjectId: `APP_${result.id.split('_')[1] || result.id}`,
    bGovIQ: result.goviqEnabled,
    bControlNet: result.controlnetEnabled,
    dCreatedAt: result.createdAt,
    dUpdatedAt: result.updatedAt,
  };
}

// Delete application via server action
export async function deleteApplication(tenantId: string, id: string): Promise<void> {
  // Note: deleteApplication server action doesn't exist yet, using archive for now
  await applicationActions.archiveApplication(id, tenantId);
}

// Get single application by ID via server action
export async function getApplication(tenantSlug: string, id: string): Promise<ApplicationResponse> {
  try {
    const app = await applicationActions.getApplicationById(tenantSlug, id);
    // Transform to legacy format
    return {
      _id: app.id,
      sProjectName: app.name,
      sProjectId: `APP_${app.id.split('_')[1] || app.id}`,
      bGovIQ: app.goviqEnabled,
      bControlNet: app.controlnetEnabled,
      dCreatedAt: app.createdAt,
      dUpdatedAt: app.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching application:', error);
    throw new Error('Failed to fetch application');
  }
}
