/**
 * Simple authenticated fetch helper
 *
 * Wraps fetch with automatic auth headers.
 * No server-side proxy needed - nginx/Load Balancer handles routing.
 *
 * Sends:
 * - Authorization: Clerk JWT (contains user ID in 'sub' claim)
 * - X-Tenant-ID: Clerk org ID (tenant.id stores Clerk org IDs directly)
 *
 * Note: User ID comes from JWT 'sub' claim, not a separate header
 */

import { useAuth } from "@clerk/nextjs";
import { useTenant } from "@/contexts/TenantContext";
import {
  trackAPIStart,
  trackAPIComplete,
  trackAPIWithData,
  trackAPIError,
} from "@/lib/api-tracking";

export function useAuthFetch() {
  const { getToken, userId } = useAuth();
  const { tenant } = useTenant();

  return async function authFetch(url: string, options: RequestInit = {}) {
    const token = await getToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    if (!tenant?.id) {
      throw new Error(
        "No tenant context available. Must be used within tenant routes."
      );
    }

    if (!userId) {
      throw new Error("No user ID available. User must be authenticated.");
    }

    // Start API tracking
    const method = options.method || "GET";
    const trackingId = trackAPIStart(method, url, {
      includeTenantId: true,
      includeUserId: true,
    });

    // Track request data size if present
    if (options.body) {
      trackAPIWithData(trackingId, options.body, {
        trackRequestSize: true,
      });
    }

    // Check if Content-Type is already set in headers
    const hasContentType =
      options.headers &&
      (options.headers as Record<string, string>)["Content-Type"] !== undefined;

    try {
      // // Use environment variable for backend URL (local dev or GCP)
      // const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      // const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

      const response = await fetch(url, {
        ...options,
        headers: {
          // Only set Content-Type if not already set (for FormData, let browser set it)
          ...(hasContentType ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${token}`, // JWT contains userId in 'sub' claim
          "X-Tenant-ID": tenant.id, // Clerk org ID (e.g., org_xxx)
          ...options.headers,
        },
      });

      // Track successful response
      trackAPIComplete(trackingId, response.status, response, undefined, {
        trackResponseSize: true,
        includeTenantId: true,
        includeUserId: true,
      });

      return response;
    } catch (error) {
      console.log(error);
      // Track error response
      trackAPIComplete(trackingId, 0, undefined, error, {
        trackResponseSize: true,
        includeTenantId: true,
        includeUserId: true,
      });

      // Also track as error event
      trackAPIError(method, url, error, {
        includeTenantId: true,
        includeUserId: true,
      });

      throw error;
    }
  };
}
