/**
 * API functions for application documentation management
 * Uses server actions instead of API routes
 */

import {
  trackAPIStart,
  trackAPIComplete,
  trackAPIWithData,
  trackAPIError,
} from "@/lib/api-tracking";

export type DocumentationSectionType =
  | "application_scope"
  | "technology_details"
  | "data_governance"
  | "information_protection"
  | "record_keeping";

export interface DocumentationField {
  fieldKey: string;
  fieldTitle: string;
  content: string;
  status?: string;
  priority?: string;
  files?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface DocumentationResponse {
  documentation: Array<{
    id: string;
    fieldKey: string;
    fieldTitle: string;
    content: string | null;
    status: string;
    priority: string;
    [key: string]: unknown;
  }>;
}

/**
 * Fetch documentation for a specific application and section
 */
export async function fetchDocumentation(
  tenant: string,
  applicationId: string,
  sectionType: DocumentationSectionType
): Promise<DocumentationResponse> {
  const url = `/api/tenants/${tenant}/applications/${applicationId}/documentation?sectionType=${sectionType}`;

  // Start API tracking
  const trackingId = trackAPIStart("GET", url, {
    includeTenantId: true,
    includeUserId: true,
    trackResponseSize: true,
  });

  try {
    const response = await fetch(url);

    // Track successful response
    trackAPIComplete(trackingId, response.status, response, undefined, {
      trackResponseSize: true,
      includeTenantId: true,
      includeUserId: true,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch documentation");
    }

    return response.json();
  } catch (error) {
    // Track error
    trackAPIError("GET", url, error as Error, {
      includeTenantId: true,
      includeUserId: true,
    });

    // Also mark the tracking as complete with error status
    trackAPIComplete(trackingId, 0, undefined, error, {
      trackResponseSize: true,
      includeTenantId: true,
      includeUserId: true,
    });

    throw error;
  }
}

/**
 * Save documentation for a specific application and section
 */
export async function saveDocumentation(
  tenant: string,
  applicationId: string,
  sectionType: DocumentationSectionType,
  fields: DocumentationField[]
): Promise<void> {
  const url = `/api/tenants/${tenant}/applications/${applicationId}/documentation`;
  const requestBody = {
    sectionType,
    fields,
  };

  // Start API tracking
  const trackingId = trackAPIStart("POST", url, {
    includeTenantId: true,
    includeUserId: true,
    trackRequestSize: true,
    trackResponseSize: true,
  });

  // Track request data size
  trackAPIWithData(trackingId, requestBody, {
    trackRequestSize: true,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Track successful response
    trackAPIComplete(trackingId, response.status, response, undefined, {
      trackResponseSize: true,
      includeTenantId: true,
      includeUserId: true,
    });

    if (!response.ok) {
      throw new Error("Failed to save documentation");
    }
  } catch (error) {
    // Track error
    trackAPIError("POST", url, error as Error, {
      includeTenantId: true,
      includeUserId: true,
    });

    // Also mark the tracking as complete with error status
    trackAPIComplete(trackingId, 0, undefined, error, {
      trackResponseSize: true,
      includeTenantId: true,
      includeUserId: true,
    });

    throw error;
  }
}
