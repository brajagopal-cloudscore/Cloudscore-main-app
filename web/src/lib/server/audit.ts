import { db, auditEvents } from '@db';
import { headers, cookies } from 'next/headers';

type AuditContext = {
  ip_address?: string | null;
  user_agent?: string | null;
  ua?: string | null;
  referer?: string | null;
  session_id?: string | null;
  location?: {
    type?: string | null;
    url?: string | null;
    domain?: string | null;
  } | null;
  [key: string]: unknown;
  context?: any;
};

type CreateAuditEventParams = {
  tenantId: string;
  actorUserId: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  context?: AuditContext | null;
  message?: string | null;
  statusType?: string | null;
  result?: string | null;
};

/**
 * Extracts request context information from headers and cookies.
 * This includes IP address, user agent, referer, session ID, and location.
 */
async function extractRequestContext(): Promise<AuditContext> {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();

    // Extract IP Address (check multiple headers for proxied requests)
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      headersList.get('cf-connecting-ip') ||
      headersList.get('x-client-ip') ||
      null;

    // Extract User Agent
    const userAgent = headersList.get('user-agent') || null;

    // Extract Referer
    const referer = headersList.get('referer') || headersList.get('referrer') || null;

    // Extract Session ID (check common session cookie names, including Clerk)
    const sessionId =
      cookieStore.get('__session')?.value ||
      cookieStore.get('__clerk_db_jwt')?.value ||
      cookieStore.get('__clerk_js')?.value ||
      cookieStore.get('session')?.value ||
      cookieStore.get('sessionId')?.value ||
      cookieStore.get('session_id')?.value ||
      headersList.get('x-session-id') ||
      headersList.get('x-clerk-session-id') ||
      null;

    // Extract URL and Domain from headers
    const host = headersList.get('host') || null;
    const protocol = headersList.get('x-forwarded-proto') || headersList.get('x-forwarded-protocol') || 'https';
    
    // Try to get pathname from various header sources
    const pathname =
      headersList.get('x-pathname') ||
      headersList.get('x-invoke-path') ||
      headersList.get('x-url') ||
      headersList.get('referer')?.replace(/^https?:\/\/[^/]+/, '') || // Extract path from referer
      null;
    
    let url: string | null = null;
    let domain: string | null = null;

    if (host) {
      domain = host.split(':')[0]; // Remove port if present
      
      // Build full URL if we have pathname
      if (pathname) {
        // Ensure pathname starts with /
        const cleanPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
        url = `${protocol}://${host}${cleanPathname}`;
      } else {
        // Just domain without path
        url = `${protocol}://${host}`;
      }
    }

    // Build location object
    const location = url || domain ? {
      type: pathname ? 'page' : 'domain',
      url: url,
      domain: domain,
    } : null;

    return {
      ip_address: ipAddress,
      user_agent: userAgent,
      ua: userAgent,
      referer: referer,
      session_id: sessionId,
      location: location,
    };
  } catch (error) {
    // If we can't access headers (e.g., not in a request context), return empty context
    // This prevents errors when called outside of request handlers
    return {};
  }
}

/**
 * Creates an audit event in the database.
 * Automatically extracts and stores request context information including:
 * - User Agent (UA)
 * - Referer
 * - IP Address
 * - Session ID
 * - Location (type, URL, domain)
 * 
 * @param params - Parameters for creating the audit event
 * @param params.tenantId - The tenant ID
 * @param params.actorUserId - The user ID who performed the action
 * @param params.action - The action that was performed
 * @param params.targetType - Optional type of the target entity
 * @param params.targetId - Optional ID of the target entity
 * @param params.metadata - Additional metadata to store
 * @param params.ipAddress - IP address of the actor (overrides auto-detected)
 * @param params.userAgent - User agent string (overrides auto-detected)
 * @param params.context - Additional context information (merged with auto-detected context)
 * @param params.message - Message describing the action (stored in metadata)
 * @param params.statusType - Status type of the action (stored in metadata)
 * @param params.result - Result of the action (stored in metadata)
 */
export async function createAuditEvent(params: CreateAuditEventParams): Promise<void> {
  const {
    tenantId,
    actorUserId,
    action,
    targetType = null,
    targetId = null,
    metadata = {},
    ipAddress = null,
    userAgent = null,
    context = null,
    message = null,
    statusType = null,
    result = null,
  } = params;

  // Automatically extract request context
  const requestContext = await extractRequestContext();

  // Build comprehensive context object, merging provided context with auto-detected context
  // Provided context takes precedence
  const auditContext: AuditContext = {
    ...requestContext,
    ...context,
  };

  // Build comprehensive metadata object - store context fields in metadata.context
  const fullMetadata: Record<string, unknown> = {
    ...metadata,
    ...(message !== null && { message }),
    ...(statusType !== null && { status_type: statusType }),
    ...(result !== null && { result }),
    // Store context fields in metadata.context (will be excluded from "Data" field display)
    context: {
      ...(auditContext.ip_address !== null && { ip_address: auditContext.ip_address }),
      ...(auditContext.user_agent !== null && { user_agent: auditContext.user_agent }),
      ...(auditContext.ua !== null && { ua: auditContext.ua }),
      ...(auditContext.referer !== null && { referer: auditContext.referer }),
      ...(auditContext.session_id !== null && { session_id: auditContext.session_id }),
      ...(auditContext.location !== null && { location: auditContext.location }),
    },
  };

  // Use extracted or provided values for direct columns
  const finalIpAddress = ipAddress || auditContext.ip_address || null;
  const finalUserAgent = userAgent || auditContext.user_agent || auditContext.ua || null;

  await db.insert(auditEvents).values({
    tenantId,
    actorUserId,
    action,
    targetType,
    targetId,
    metadata: fullMetadata,
    ipAddress: finalIpAddress,
    userAgent: finalUserAgent,
  });
}


