/**
 * Integrations API integration
 * 
 * Provides functions to interact with the integrations API for managing third-party integrations
 */

import * as integrationActions from '@/lib/actions/integrations';

export interface Integration {
  id: string;
  tenantId: string;
  name: string;
  category: 'data_platforms' | 'ml_platforms' | 'llm_providers' | 'ai_security' | 'vector_databases' | 'cloud_providers';
  description?: string;
  isEnabled: boolean;
  isCredentialsAdded: boolean;
  configuration: Record<string, any>;
  apiKey?: string;
  logoUrl?: string;
  webhookUrl?: string;
  lastSyncAt?: string;
  syncStatus?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  metadata?: any;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationRequest {
  name: string;
  category: 'data_platforms' | 'ml_platforms' | 'llm_providers' | 'ai_security' | 'vector_databases' | 'cloud_providers';
  description?: string;
  logoUrl?: string;
  configuration?: Record<string, any>;
}

export interface UpdateIntegrationRequest {
  isEnabled?: boolean;
  isCredentialsAdded?: boolean;
  configuration?: Record<string, any>;
  apiKey?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
}

// Fetch integrations for a tenant
export async function fetchIntegrations(tenantSlugOrId: string): Promise<Integration[]> {
  try {
    const result = await integrationActions.getIntegrations(tenantSlugOrId);
    return result.integrations_admin as Integration[] || [];
  } catch (error) {
    console.error('Error fetching integrations:', error);
    throw error;
  }
}

// Create a new integration
export async function createIntegration(tenantSlugOrId: string, data: CreateIntegrationRequest): Promise<Integration> {
  try {
    const result = await integrationActions.createIntegration({
      tenantSlug: tenantSlugOrId,
      ...data,
    });
    const integration = result.integration;
    // Transform database record to Integration interface, ensuring category is properly typed
    if (!integration.category || !['data_platforms', 'ml_platforms', 'llm_providers', 'ai_security', 'vector_databases', 'cloud_providers'].includes(integration.category)) {
      throw new Error('Invalid integration category');
    }
    return {
      id: integration.id,
      tenantId: integration.tenantId,
      name: integration.name,
      category: integration.category as Integration['category'],
      description: integration.description || undefined,
      isEnabled: integration.isEnabled,
      isCredentialsAdded: integration.isCredentialsAdded,
      configuration: (integration.configuration as Record<string, any>) || {},
      apiKey: integration.apiKey || undefined,
      logoUrl: integration.logoUrl || undefined,
      webhookUrl: undefined,
      lastSyncAt: undefined,
      syncStatus: undefined,
      errorMessage: undefined,
      metadata: undefined,
      createdBy: integration.createdBy,
      updatedBy: integration.updatedBy || undefined,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  } catch (error) {
    console.error('Error creating integration:', error);
    throw error;
  }
}

// Update an integration
export async function updateIntegration(tenantSlugOrId: string, id: string, data: UpdateIntegrationRequest): Promise<Integration> {
  try {
    const result = await integrationActions.updateIntegration({
      tenantSlug: tenantSlugOrId,
      id,
      ...data,
    });
    const integration = result.integration;
    // Transform database record to Integration interface, ensuring category is properly typed
    if (!integration.category || !['data_platforms', 'ml_platforms', 'llm_providers', 'ai_security', 'vector_databases', 'cloud_providers'].includes(integration.category)) {
      throw new Error('Invalid integration category');
    }
    return {
      id: integration.id,
      tenantId: integration.tenantId,
      name: integration.name,
      category: integration.category as Integration['category'],
      description: integration.description || undefined,
      isEnabled: integration.isEnabled,
      isCredentialsAdded: integration.isCredentialsAdded,
      configuration: (integration.configuration as Record<string, any>) || {},
      apiKey: integration.apiKey || undefined,
      logoUrl: integration.logoUrl || undefined,
      webhookUrl: undefined,
      lastSyncAt: undefined,
      syncStatus: undefined,
      errorMessage: undefined,
      metadata: undefined,
      createdBy: integration.createdBy,
      updatedBy: integration.updatedBy || undefined,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  } catch (error) {
    console.error('Error updating integration:', error);
    throw error;
  }
}

// Delete an integration
export async function deleteIntegration(tenantSlugOrId: string, id: string): Promise<void> {
  try {
    await integrationActions.deleteIntegration(tenantSlugOrId, id);
  } catch (error) {
    console.error('Error deleting integration:', error);
    throw error;
  }
}

// Toggle integration enabled status
export async function toggleIntegrationStatus(tenantId: string, id: string, isEnabled: boolean): Promise<Integration> {
  return updateIntegration(tenantId, id, { isEnabled });
}

// Add credentials to an integration
export async function addIntegrationCredentials(tenantId: string, id: string, credentials: Record<string, any>): Promise<Integration> {
  return updateIntegration(tenantId, id, {
    configuration: credentials,
    isCredentialsAdded: true,
  });
}

// Remove credentials from an integration
export async function removeIntegrationCredentials(tenantId: string, id: string): Promise<Integration> {
  return updateIntegration(tenantId, id, {
    configuration: {},
    isCredentialsAdded: false,
    isEnabled: false, // Disable when credentials are removed
  });
}
