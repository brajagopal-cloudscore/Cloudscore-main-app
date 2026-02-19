/**
 * API Call Tracking Utility for PostHog Analytics
 * 
 * Tracks all HTTP requests (GET, POST, PUT, DELETE, etc.) with detailed metrics
 * including response times, status codes, error rates, and endpoint usage.
 */

import posthog from '@/lib/posthog'

export interface APITrackingData {
  method: string
  url: string
  endpoint: string
  statusCode?: number
  responseTime?: number // Response time in milliseconds (legacy, kept for backward compatibility)
  responseTimeMs?: number // Response time in milliseconds (primary)
  responseTimeSeconds?: number // Response time in seconds (for easier filtering in PostHog)
  requestSize?: number
  responseSize?: number
  errorMessage?: string
  errorType?: string
  tenantId?: string
  userId?: string
  timestamp: string
  userAgent?: string
  referrer?: string
}

export interface APITrackingOptions {
  trackRequestSize?: boolean
  trackResponseSize?: boolean
  trackUserAgent?: boolean
  trackReferrer?: boolean
  includeTenantId?: boolean
  includeUserId?: boolean
  excludeEndpoints?: string[]
  includeEndpoints?: string[]
}

const DEFAULT_OPTIONS: APITrackingOptions = {
  trackRequestSize: true,
  trackResponseSize: true,
  trackUserAgent: true,
  trackReferrer: true,
  includeTenantId: true,
  includeUserId: true,
  excludeEndpoints: [
    '/_next/',
    '/api/health',
    '/api/status',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ],
  includeEndpoints: []
}

/**
 * Extract endpoint from full URL for cleaner tracking
 */
function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin)
    return urlObj.pathname
  } catch {
    // Fallback for relative URLs
    return url.split('?')[0]
  }
}

/**
 * Check if endpoint should be tracked based on include/exclude rules
 */
function shouldTrackEndpoint(endpoint: string, options: APITrackingOptions): boolean {
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
function getRequestSize(data: any): number {
  if (!data) return 0
  
  if (typeof data === 'string') {
    return new Blob([data]).size
  }
  
  if (data instanceof FormData) {
    // FormData size estimation
    let size = 0
    for (const [key, value] of data.entries()) {
      size += key.length
      if (typeof value === 'string') {
        size += value.length
      } else if (value instanceof File) {
        size += value.size
      }
    }
    return size
  }
  
  if (typeof data === 'object') {
    return new Blob([JSON.stringify(data)]).size
  }
  
  return 0
}

/**
 * Get response size in bytes
 */
function getResponseSize(response: Response | any): number {
  if (!response) return 0
  
  // For fetch Response
  if (response.headers && response.headers.get) {
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      return parseInt(contentLength, 10)
    }
  }
  
  // For axios response
  if (response.data) {
    if (typeof response.data === 'string') {
      return new Blob([response.data]).size
    }
    if (typeof response.data === 'object') {
      return new Blob([JSON.stringify(response.data)]).size
    }
  }
  
  return 0
}

/**
 * Track API call start
 */
export function trackAPIStart(
  method: string,
  url: string,
  options: APITrackingOptions = {}
): string {
  const trackingId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const endpoint = extractEndpoint(url)
  
  if (!shouldTrackEndpoint(endpoint, options)) {
    return trackingId
  }
  
  const trackingData: Partial<APITrackingData> = {
    method: method.toUpperCase(),
    url,
    endpoint,
    timestamp: new Date().toISOString(),
  }
  
  if (options.trackUserAgent && typeof window !== 'undefined') {
    trackingData.userAgent = navigator.userAgent
  }
  
  if (options.trackReferrer && typeof window !== 'undefined') {
    trackingData.referrer = document.referrer
  }
  
  // Store tracking data for later completion
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`api_tracking_${trackingId}`, JSON.stringify({
      ...trackingData,
      startTime: Date.now()
    }))
  }
  
  return trackingId
}

/**
 * Track API call completion (success or error)
 */
export function trackAPIComplete(
  trackingId: string,
  statusCode: number,
  response?: any,
  error?: any,
  options: APITrackingOptions = {}
): void {
  if (!trackingId || typeof window === 'undefined') return
  
  const storedData = sessionStorage.getItem(`api_tracking_${trackingId}`)
  if (!storedData) return
  
  try {
    const trackingData = JSON.parse(storedData)
    const endTime = Date.now()
    const startTime = trackingData.startTime || endTime
    
    const responseTimeMs = endTime - startTime
    
    const completeData: APITrackingData = {
      ...trackingData,
      statusCode,
      responseTime: responseTimeMs,
      responseTimeMs: responseTimeMs, // Additional property for better PostHog visibility
      responseTimeSeconds: Math.round(responseTimeMs / 10) / 100, // Rounded to 2 decimal places
      timestamp: new Date().toISOString(),
    }
    
    // Add response size
    if (options.trackResponseSize && response) {
      completeData.responseSize = getResponseSize(response)
    }
    
    // Add error information
    if (error) {
      completeData.errorMessage = error.message || error.toString()
      completeData.errorType = error.name || 'UnknownError'
    }
    
    // Add user context if available
    if (options.includeUserId && typeof window !== 'undefined') {
      // Try to get user ID from various sources
      const userId = getUserIdFromContext()
      if (userId) completeData.userId = userId
    }
    
    if (options.includeTenantId && typeof window !== 'undefined') {
      const tenantId = getTenantIdFromContext()
      if (tenantId) completeData.tenantId = tenantId
    }
    
    // Send to PostHog
    posthog.capture('api_call', completeData)
    
    // Clean up
    sessionStorage.removeItem(`api_tracking_${trackingId}`)
    
  } catch (error) {
    console.warn('Failed to track API call:', error)
    sessionStorage.removeItem(`api_tracking_${trackingId}`)
  }
}

/**
 * Track API call with request data size
 */
export function trackAPIWithData(
  trackingId: string,
  requestData: any,
  options: APITrackingOptions = {}
): void {
  if (!trackingId || typeof window === 'undefined') return
  
  const storedData = sessionStorage.getItem(`api_tracking_${trackingId}`)
  if (!storedData) return
  
  try {
    const trackingData = JSON.parse(storedData)
    
    if (options.trackRequestSize) {
      trackingData.requestSize = getRequestSize(requestData)
    }
    
    sessionStorage.setItem(`api_tracking_${trackingId}`, JSON.stringify(trackingData))
  } catch (error) {
    console.warn('Failed to update API tracking data:', error)
  }
}

/**
 * Get user ID from various context sources
 */
function getUserIdFromContext(): string | undefined {
  // Try to get from Clerk context
  if (typeof window !== 'undefined') {
    // Check if Clerk is available
    const clerkUser = (window as any).__clerk_user
    if (clerkUser?.id) return clerkUser.id
    
    // Check localStorage for user ID
    const storedUserId = localStorage.getItem('userId') || 
                        localStorage.getItem('clerk_user_id') ||
                        sessionStorage.getItem('userId')
    if (storedUserId) return storedUserId
  }
  
  return undefined
}

/**
 * Get tenant ID from various context sources
 */
function getTenantIdFromContext(): string | undefined {
  if (typeof window !== 'undefined') {
    // Check localStorage for tenant ID
    const storedTenantId = localStorage.getItem('tenantId') || 
                          localStorage.getItem('clerk_org_id') ||
                          sessionStorage.getItem('tenantId')
    if (storedTenantId) return storedTenantId
    
    // Try to extract from URL
    const pathParts = window.location.pathname.split('/')
    if (pathParts[1] && pathParts[1] !== 'api') {
      return pathParts[1]
    }
  }
  
  return undefined
}

/**
 * Track API error specifically
 */
export function trackAPIError(
  method: string,
  url: string,
  error: any,
  options: APITrackingOptions = {}
): void {
  const endpoint = extractEndpoint(url)
  
  if (!shouldTrackEndpoint(endpoint, options)) {
    return
  }
  
  const errorData: APITrackingData = {
    method: method.toUpperCase(),
    url,
    endpoint,
    errorMessage: error.message || error.toString(),
    errorType: error.name || 'UnknownError',
    statusCode: error.status || error.response?.status || 0,
    responseTime: 0, // Legacy property - errors don't have reliable timing
    responseTimeMs: 0, // Errors don't have reliable timing
    responseTimeSeconds: 0, // Errors don't have reliable timing
    timestamp: new Date().toISOString(),
  }
  
  if (options.includeUserId) {
    const userId = getUserIdFromContext()
    if (userId) errorData.userId = userId
  }
  
  if (options.includeTenantId) {
    const tenantId = getTenantIdFromContext()
    if (tenantId) errorData.tenantId = tenantId
  }
  
  posthog.capture('api_error', errorData)
}

/**
 * Get API analytics summary (for debugging)
 */
export function getAPIAnalyticsSummary(): {
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
