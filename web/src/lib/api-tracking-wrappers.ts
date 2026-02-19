/**
 * API Route Tracking Wrapper
 * 
 * Provides easy-to-use wrappers for adding tracking to Next.js API routes
 * without modifying existing route handlers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackServerAPICall, trackServerAPIError, ServerAPITrackingOptions } from './server-api-tracking'

/**
 * Track GET requests
 */
export function trackGET(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined | undefined
    let error: Error | undefined

    try {
      response = await handler(request, context)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      
      // Track error
      await trackServerAPIError(request, error, options)
      throw err
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(request, response, startTime, error, options)
      }
    }
  }
}

/**
 * Track POST requests
 */
export function trackPOST(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined
    let error: Error | undefined

    try {
      response = await handler(request, context)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      
      // Track error
      await trackServerAPIError(request, error, options)
      throw err
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(request, response, startTime, error, options)
      }
    }
  }
}

/**
 * Track PUT requests
 */
export function trackPUT(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined
    let error: Error | undefined

    try {
      response = await handler(request, context)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      
      // Track error
      await trackServerAPIError(request, error, options)
      throw err
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(request, response, startTime, error, options)
      }
    }
  }
}

/**
 * Track DELETE requests
 */
export function trackDELETE(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined
    let error: Error | undefined

    try {
      response = await handler(request, context)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      
      // Track error
      await trackServerAPIError(request, error, options)
      throw err
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(request, response, startTime, error, options)
      }
    }
  }
}

/**
 * Track PATCH requests
 */
export function trackPATCH(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined
    let error: Error | undefined

    try {
      response = await handler(request, context)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      
      // Track error
      await trackServerAPIError(request, error, options)
      throw err
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(request, response, startTime, error, options)
      }
    }
  }
}

/**
 * Universal tracker that works with any HTTP method
 */
export function trackAPI(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined
    let error: Error | undefined

    try {
      response = await handler(request, context)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      
      // Track error
      await trackServerAPIError(request, error, options)
      throw err
    } finally {
      // Track the API call
      if (response) {
        await trackServerAPICall(request, response, startTime, error, options)
      }
    }
  }
}

/**
 * Create tracked handlers for all HTTP methods
 */
export function createTrackedHandlers(
  handlers: {
    GET?: (request: NextRequest, context?: any) => Promise<NextResponse>
    POST?: (request: NextRequest, context?: any) => Promise<NextResponse>
    PUT?: (request: NextRequest, context?: any) => Promise<NextResponse>
    DELETE?: (request: NextRequest, context?: any) => Promise<NextResponse>
    PATCH?: (request: NextRequest, context?: any) => Promise<NextResponse>
  },
  options: ServerAPITrackingOptions = {}
) {
  const trackedHandlers: any = {}

  if (handlers.GET) {
    trackedHandlers.GET = trackGET(handlers.GET, options)
  }
  if (handlers.POST) {
    trackedHandlers.POST = trackPOST(handlers.POST, options)
  }
  if (handlers.PUT) {
    trackedHandlers.PUT = trackPUT(handlers.PUT, options)
  }
  if (handlers.DELETE) {
    trackedHandlers.DELETE = trackDELETE(handlers.DELETE, options)
  }
  if (handlers.PATCH) {
    trackedHandlers.PATCH = trackPATCH(handlers.PATCH, options)
  }

  return trackedHandlers
}

/**
 * Default tracking options for different types of endpoints
 */
export const TRACKING_OPTIONS = {
  // Standard API endpoints
  DEFAULT: {
    trackRequestSize: true,
    trackResponseSize: true,
    trackUserAgent: true,
    trackIPAddress: true,
    includeUserId: true,
    includeTenantId: true,
  },
  
  // Webhook endpoints (less verbose)
  WEBHOOK: {
    trackRequestSize: false,
    trackResponseSize: false,
    trackUserAgent: false,
    trackIPAddress: true,
    includeUserId: false,
    includeTenantId: false,
  },
  
  // Health check endpoints (minimal)
  HEALTH: {
    trackRequestSize: false,
    trackResponseSize: false,
    trackUserAgent: false,
    trackIPAddress: false,
    includeUserId: false,
    includeTenantId: false,
  },
  
  // High-frequency endpoints (optimized)
  HIGH_FREQUENCY: {
    trackRequestSize: false,
    trackResponseSize: false,
    trackUserAgent: true,
    trackIPAddress: false,
    includeUserId: true,
    includeTenantId: true,
  }
} as const
