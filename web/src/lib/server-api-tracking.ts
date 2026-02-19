/**
 * Server-Side API Tracking Utility for Next.js API Routes
 * 
 * Tracks server-side API requests with PostHog analytics.
 * Designed specifically for Next.js App Router API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

export interface ServerAPITrackingData {
  method: string
  url: string
  endpoint: string
  statusCode: number
  responseTime: number // Response time in milliseconds (legacy, kept for backward compatibility)
  responseTimeMs?: number // Response time in milliseconds (primary)
  responseTimeSeconds?: number // Response time in seconds (for easier filtering in PostHog)
  requestSize?: number
  responseSize?: number
  errorMessage?: string
  errorType?: string
  userId?: string
  tenantId?: string
  userAgent?: string
  ipAddress?: string
  timestamp: string
  routeParams?: Record<string, string>
  queryParams?: Record<string, string>
}

export interface ServerAPITrackingOptions {
  trackRequestSize?: boolean
  trackResponseSize?: boolean
  trackUserAgent?: boolean
  trackIPAddress?: boolean
  includeUserId?: boolean
  includeTenantId?: boolean
  excludeEndpoints?: string[]
  includeEndpoints?: string[]
}

const DEFAULT_OPTIONS: ServerAPITrackingOptions = {
  trackRequestSize: true,
  trackResponseSize: true,
  trackUserAgent: true,
  trackIPAddress: true,
  includeUserId: true,
  includeTenantId: true,
  excludeEndpoints: [
    '/api/health',
    '/api/status',
    '/api/webhooks/clerk', // Webhook endpoints might be noisy
  ],
  includeEndpoints: []
}

/**
 * Extract endpoint from URL for cleaner tracking
 */
function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch {
    return url.split('?')[0]
  }
}

/**
 * Extract route parameters from URL path
 */
function extractRouteParams(url: string): Record<string, string> {
  const urlObj = new URL(url)
  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
  const params: Record<string, string> = {}
  
  // Extract dynamic segments (those with [param] in the file structure)
  pathSegments.forEach((segment, index) => {
    // Common dynamic segments in your API structure
    if (segment.match(/^[a-f0-9-]{36}$/)) { // UUID pattern
      if (index === 2) params.tenant = segment
      else if (index === 4) params.applicationId = segment
      else if (index === 6) params.riskId = segment
      else if (index === 4) params.id = segment
    }
  })
  
  return params
}

/**
 * Extract query parameters
 */
function extractQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url)
    const params: Record<string, string> = {}
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  } catch {
    return {}
  }
}

/**
 * Check if endpoint should be tracked
 */
function shouldTrackEndpoint(endpoint: string, options: ServerAPITrackingOptions): boolean {
  const { excludeEndpoints = [], includeEndpoints = [] } = options
  
  // If includeEndpoints is specified, only track those
  if (includeEndpoints.length > 0) {
    return includeEndpoints.some(pattern => endpoint.includes(pattern))
  }
  
  // Otherwise, exclude specified patterns
  return !excludeEndpoints.some(pattern => endpoint.includes(pattern))
}

/**
 * Get request size in bytes
 */
async function getRequestSize(request: NextRequest): Promise<number> {
  try {
    const body = await request.text()
    return new Blob([body]).size
  } catch {
    return 0
  }
}

/**
 * Get response size in bytes
 */
function getResponseSize(response: NextResponse): number {
  try {
    const body = response.body
    if (body) {
      // For NextResponse, we can't easily get the size without cloning
      // This is an approximation
      return 0 // We'll track this differently
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return undefined
}

/**
 * Track server-side API call
 */
export async function trackServerAPICall(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  error?: Error,
  options: ServerAPITrackingOptions = {}
): Promise<void> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    const endpoint = extractEndpoint(request.url)
    
    if (!shouldTrackEndpoint(endpoint, mergedOptions)) {
      return
    }

    const endTime = Date.now()
    const responseTimeMs = endTime - startTime
    
    const trackingData: ServerAPITrackingData = {
      method: request.method,
      url: request.url,
      endpoint,
      statusCode: response.status,
      responseTime: responseTimeMs, // Legacy property
      responseTimeMs: responseTimeMs, // Primary property for PostHog visibility
      responseTimeSeconds: Math.round(responseTimeMs / 10) / 100, // Rounded to 2 decimal places for easier filtering
      timestamp: new Date().toISOString(),
      routeParams: extractRouteParams(request.url),
      queryParams: extractQueryParams(request.url),
    }

    // Add request size
    if (mergedOptions.trackRequestSize) {
      trackingData.requestSize = await getRequestSize(request)
    }

    // Add response size
    if (mergedOptions.trackResponseSize) {
      trackingData.responseSize = getResponseSize(response)
    }

    // Add user agent
    if (mergedOptions.trackUserAgent) {
      trackingData.userAgent = request.headers.get('user-agent') || undefined
    }

    // Add IP address
    if (mergedOptions.trackIPAddress) {
      trackingData.ipAddress = getClientIP(request)
    }

    // Add user context
    if (mergedOptions.includeUserId || mergedOptions.includeTenantId) {
      try {
        const { userId, orgId } = await auth()
        if (mergedOptions.includeUserId && userId) {
          trackingData.userId = userId
        }
        if (mergedOptions.includeTenantId && orgId) {
          trackingData.tenantId = orgId
        }
      } catch (error) {
        // Auth might not be available in all contexts
        console.warn('Could not get auth context for API tracking:', error)
      }
    }

    // Add error information
    if (error) {
      trackingData.errorMessage = error.message
      trackingData.errorType = error.name || 'UnknownError'
    }

    // Send to PostHog (server-side)
    await sendToPostHog('server_api_call', trackingData)

  } catch (trackingError) {
    console.warn('Failed to track server API call:', trackingError)
  }
}

/**
 * Track server-side API error specifically
 */
export async function trackServerAPIError(
  request: NextRequest,
  error: Error,
  options: ServerAPITrackingOptions = {}
): Promise<void> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    const endpoint = extractEndpoint(request.url)
    
    if (!shouldTrackEndpoint(endpoint, mergedOptions)) {
      return
    }

    const errorData: ServerAPITrackingData = {
      method: request.method,
      url: request.url,
      endpoint,
      statusCode: 500, // Default for unhandled errors
      responseTime: 0, // Legacy property
      responseTimeMs: 0, // Errors don't have reliable timing
      responseTimeSeconds: 0, // Errors don't have reliable timing
      errorMessage: error.message,
      errorType: error.name || 'UnknownError',
      timestamp: new Date().toISOString(),
      routeParams: extractRouteParams(request.url),
      queryParams: extractQueryParams(request.url),
    }

    // Add user agent
    if (mergedOptions.trackUserAgent) {
      errorData.userAgent = request.headers.get('user-agent') || undefined
    }

    // Add IP address
    if (mergedOptions.trackIPAddress) {
      errorData.ipAddress = getClientIP(request)
    }

    // Add user context
    if (mergedOptions.includeUserId || mergedOptions.includeTenantId) {
      try {
        const { userId, orgId } = await auth()
        if (mergedOptions.includeUserId && userId) {
          errorData.userId = userId
        }
        if (mergedOptions.includeTenantId && orgId) {
          errorData.tenantId = orgId
        }
      } catch (authError) {
        console.warn('Could not get auth context for API error tracking:', authError)
      }
    }

    // Send to PostHog
    await sendToPostHog('server_api_error', errorData)

  } catch (trackingError) {
    console.warn('Failed to track server API error:', trackingError)
  }
}

/**
 * Send data to PostHog (server-side)
 */
async function sendToPostHog(eventName: string, data: any): Promise<void> {
  try {
    // For server-side PostHog, we need to use the Node.js SDK
    // This is a simplified version - you might want to use @posthog/node
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
    
    if (!posthogKey) {
      console.warn('PostHog key not configured for server-side tracking')
      return
    }

    // Simple fetch to PostHog API
    await fetch(`${posthogHost}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: posthogKey,
        event: eventName,
        properties: {
          ...data,
          $lib: 'nextjs-server',
          $lib_version: '1.0.0',
        },
        timestamp: new Date().toISOString(),
        distinct_id: data.userId || 'anonymous',
      }),
    })
  } catch (error) {
    console.warn('Failed to send data to PostHog:', error)
  }
}

/**
 * Create a tracked API route handler wrapper
 */
export function withAPITracking<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: ServerAPITrackingOptions = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse | undefined
    let error: Error | undefined

    try {
      response = await handler(...args)
      return response
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      // Track the API call
      try {
        const request = args[0] as NextRequest
        if (request && response) {
          await trackServerAPICall(request, response, startTime, error, options)
        }
      } catch (trackingError) {
        console.warn('Failed to track API call:', trackingError)
      }
    }
  }
}

/**
 * Get API analytics summary (for debugging)
 */
export function getServerAPIAnalyticsSummary(): {
  totalCalls: number
  errorRate: number
  avgResponseTime: number
  topEndpoints: Array<{ endpoint: string; count: number }>
} {
  // This would typically query PostHog's API or use their analytics features
  // For now, return a placeholder
  return {
    totalCalls: 0,
    errorRate: 0,
    avgResponseTime: 0,
    topEndpoints: []
  }
}
