/**
 * Axios-based authenticated request helper for Clerk integration
 *
 * Wraps axios with automatic auth headers for Clerk JWT tokens.
 * Handles FormData properly for file uploads.
 *
 * Sends:
 * - Authorization: Clerk JWT (contains user ID in 'sub' claim)
 * - X-Tenant-ID: Clerk org ID (tenant.id stores Clerk org IDs directly)
 *
 * Note: User ID comes from JWT 'sub' claim, not a separate header
 *
 * @example
 * ```typescript
 * const authAxios = useAuthAxios()
 *
 * // JSON request
 * const response = await authAxios('/v1/policies', {
 *   method: 'POST',
 *   data: { name: 'Test Policy' }
 * })
 *
 * // FormData request (file upload)
 * const formData = new FormData()
 * formData.append('name', 'Test Policy')
 * formData.append('file', file)
 *
 * const response = await authAxios('/v1/policies', {
 *   method: 'POST',
 *   data: formData
 * })
 * ```
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuth } from "@clerk/nextjs";
import { useTenant } from "@/contexts/TenantContext";
import {
  trackAPIStart,
  trackAPIComplete,
  trackAPIWithData,
  trackAPIError,
} from "@/lib/api-tracking";

export function useAuthAxios() {
  const { getToken, userId } = useAuth();
  const { tenant } = useTenant();

  return async function authAxios<T = any>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
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
    const method = config.method || "GET";
    const trackingId = trackAPIStart(method, url, {
      includeTenantId: true,
      includeUserId: true,
    });

    // Track request data size if present
    if (config.data) {
      trackAPIWithData(trackingId, config.data, {
        trackRequestSize: true,
      });
    }

    // Create axios instance for this request
    const axiosInstance: AxiosInstance = axios.create({
      baseURL: "", // Use relative URLs
      ...config,
    });

    // Set up request interceptor to add auth headers
    axiosInstance.interceptors.request.use(
      (reqConfig) => {
        // Don't override Content-Type for FormData - let axios handle it
        reqConfig.headers.set("Authorization", `Bearer ${token}`);
        reqConfig.headers.set("X-Tenant-ID", tenant.id);

        // Only set Content-Type if it's not FormData and not already set
        if (
          !(reqConfig.data instanceof FormData) &&
          !reqConfig.headers.get("Content-Type")
        ) {
          reqConfig.headers.set("Content-Type", "application/json");
        }

        return reqConfig;
      },
      (error) => {
        // Track request error
        trackAPIError(method, url, error, {
          includeTenantId: true,
          includeUserId: true,
        });
        return Promise.reject(error);
      }
    );

    // Set up response interceptor for error handling and tracking
    axiosInstance.interceptors.response.use(
      (response) => {
        // Track successful response
        trackAPIComplete(trackingId, response.status, response, undefined, {
          trackResponseSize: true,
          includeTenantId: true,
          includeUserId: true,
        });
        return response;
      },
      (error) => {
        // Track error response
        const statusCode = error.response?.status || 0;
        trackAPIComplete(trackingId, statusCode, error.response, error, {
          trackResponseSize: true,
          includeTenantId: true,
          includeUserId: true,
        });

        // Also track as error event
        trackAPIError(method, url, error, {
          includeTenantId: true,
          includeUserId: true,
        });

        // Log error for debugging
        console.error("Axios request failed:", error);
        return Promise.reject(error);
      }
    );

    return axiosInstance.request<T>({
      url,
      ...config,
    });
  };
}

/**
 * Alternative hook that returns a pre-configured axios instance
 * Useful for multiple requests with the same auth context
 */
export function useAuthAxiosInstance() {
  const { getToken, userId } = useAuth();
  const { tenant } = useTenant();

  const createInstance = async (): Promise<AxiosInstance> => {
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

    const instance = axios.create({
      baseURL: "", // Use relative URLs
    });

    // Set up request interceptor to add auth headers and tracking
    instance.interceptors.request.use(
      (config) => {
        // Don't override Content-Type for FormData - let axios handle it
        config.headers.set("Authorization", `Bearer ${token}`);
        config.headers.set("X-Tenant-ID", tenant.id);

        // Only set Content-Type if it's not FormData and not already set
        if (
          !(config.data instanceof FormData) &&
          !config.headers.get("Content-Type")
        ) {
          config.headers.set("Content-Type", "application/json");
        }

        // Start API tracking for this request
        const method = config.method || "GET";
        const url = config.url || "";
        const trackingId = trackAPIStart(method, url, {
          includeTenantId: true,
          includeUserId: true,
        });

        // Store tracking ID in config for response interceptor
        (config as any).metadata = { ...(config as any).metadata, trackingId };

        // Track request data size if present
        if (config.data) {
          trackAPIWithData(trackingId, config.data, {
            trackRequestSize: true,
          });
        }

        return config;
      },
      (error) => {
        // Track request error
        trackAPIError(
          error.config?.method || "UNKNOWN",
          error.config?.url || "",
          error,
          {
            includeTenantId: true,
            includeUserId: true,
          }
        );
        return Promise.reject(error);
      }
    );

    // Set up response interceptor for error handling and tracking
    instance.interceptors.response.use(
      (response) => {
        // Track successful response
        const trackingId = (response.config as any).metadata?.trackingId;
        if (trackingId) {
          trackAPIComplete(trackingId, response.status, response, undefined, {
            trackResponseSize: true,
            includeTenantId: true,
            includeUserId: true,
          });
        }
        return response;
      },
      (error) => {
        // Track error response
        const trackingId = (error.config as any)?.metadata?.trackingId;
        if (trackingId) {
          const statusCode = error.response?.status || 0;
          trackAPIComplete(trackingId, statusCode, error.response, error, {
            trackResponseSize: true,
            includeTenantId: true,
            includeUserId: true,
          });
        }

        // Also track as error event
        trackAPIError(
          error.config?.method || "UNKNOWN",
          error.config?.url || "",
          error,
          {
            includeTenantId: true,
            includeUserId: true,
          }
        );

        // Log error for debugging
        console.error("Axios request failed:", error);
        return Promise.reject(error);
      }
    );

    return instance;
  };

  return { createInstance };
}
