// src/lib/rbac.ts
import { auth } from '@clerk/nextjs/server';
import { requireActiveTenantId, hasPermission, hasRole, hasAnyPermission, hasAnyRole, PERMISSIONS, ROLES } from '@db';
import { NextResponse } from 'next/server';

export interface RBACContext {
  tenantId: string;
  userId: string;
  userRole: string;
  permissions: string[];
  isAdmin: boolean;
}

/**
 * Get RBAC context for the current user
 */
export async function getRBACContext(): Promise<RBACContext> {
  return await requireActiveTenantId();
}

/**
 * Guard function that requires authentication and organization context
 */
export async function requireAuth(): Promise<RBACContext> {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  if (!orgId) {
    throw new Error('Organization context required');
  }
  
  return await getRBACContext();
}

/**
 * Guard function that requires specific permission
 */
export async function requirePermission(permission: string): Promise<RBACContext> {
  const context = await requireAuth();
  
  if (!hasPermission(context, permission)) {
    throw new Error(`Permission '${permission}' required`);
  }
  
  return context;
}

/**
 * Guard function that requires any of the specified permissions
 */
export async function requireAnyPermission(permissions: string[]): Promise<RBACContext> {
  const context = await requireAuth();
  
  if (!hasAnyPermission(context, permissions)) {
    throw new Error(`One of the following permissions required: ${permissions.join(', ')}`);
  }
  
  return context;
}

/**
 * Guard function that requires all of the specified permissions
 */
export async function requireAllPermissions(permissions: string[]): Promise<RBACContext> {
  const context = await requireAuth();
  
  const missingPermissions = permissions.filter(permission => !hasPermission(context, permission));
  
  if (missingPermissions.length > 0) {
    throw new Error(`Missing required permissions: ${missingPermissions.join(', ')}`);
  }
  
  return context;
}

/**
 * Guard function that requires specific role
 */
export async function requireRole(role: string): Promise<RBACContext> {
  const context = await requireAuth();
  
  if (!hasRole(context, role)) {
    throw new Error(`Role '${role}' required`);
  }
  
  return context;
}

/**
 * Guard function that requires any of the specified roles
 */
export async function requireAnyRole(roles: string[]): Promise<RBACContext> {
  const context = await requireAuth();
  
  if (!hasAnyRole(context, roles)) {
    throw new Error(`One of the following roles required: ${roles.join(', ')}`);
  }
  
  return context;
}

/**
 * Guard function that requires admin role
 */
export async function requireAdmin(): Promise<RBACContext> {
  return await requireAnyRole([ROLES.ADMIN, ROLES.OWNER, ROLES.ORG_ADMIN]);
}

/**
 * Guard function that requires owner role
 */
export async function requireOwner(): Promise<RBACContext> {
  return await requireRole(ROLES.OWNER);
}

/**
 * Create a Next.js response for unauthorized access
 */
export function unauthorizedResponse(message: string = 'Unauthorized access'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Create a Next.js response for authentication required
 */
export function authenticationRequiredResponse(message: string = 'Authentication required'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Higher-order function to wrap API route handlers with RBAC checks
 */
export function withRBAC<T extends any[]>(
  handler: (context: RBACContext, ...args: T) => Promise<Response>,
  permission?: string,
  permissions?: string[],
  role?: string,
  roles?: string[]
) {
  return async (...args: T): Promise<Response> => {
    try {
      let context: RBACContext;
      
      if (role) {
        context = await requireRole(role);
      } else if (roles) {
        context = await requireAnyRole(roles);
      } else if (permission) {
        context = await requirePermission(permission);
      } else if (permissions) {
        context = await requireAnyPermission(permissions);
      } else {
        context = await requireAuth();
      }
      
      return await handler(context, ...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized access';
      
      if (message.includes('Authentication required')) {
        return authenticationRequiredResponse(message);
      }
      
      return unauthorizedResponse(message);
    }
  };
}

/**
 * Permission-based API route decorators
 */
export const withPermission = (permission: string) => 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, permission);

export const withAnyPermission = (permissions: string[]) => 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, undefined, permissions);

export const withAllPermissions = (permissions: string[]) => 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, undefined, permissions);

export const withRole = (role: string) => 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, undefined, undefined, role);

export const withAnyRole = (roles: string[]) => 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, undefined, undefined, undefined, roles);

export const withAdmin = 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, undefined, undefined, undefined, [ROLES.ADMIN, ROLES.ORG_ADMIN, ROLES.OWNER]);

export const withOwner = 
  <T extends any[]>(handler: (context: RBACContext, ...args: T) => Promise<Response>) =>
    withRBAC(handler, undefined, undefined, ROLES.OWNER);

/**
 * Server Action RBAC guards
 */
export async function guardServerAction<T>(
  action: () => Promise<T>,
  permission?: string,
  permissions?: string[],
  role?: string,
  roles?: string[]
): Promise<T> {
  try {
    let context: RBACContext;
    
    if (role) {
      context = await requireRole(role);
    } else if (roles) {
      context = await requireAnyRole(roles);
    } else if (permission) {
      context = await requirePermission(permission);
    } else if (permissions) {
      context = await requireAnyPermission(permissions);
    } else {
      context = await requireAuth();
    }
    
    return await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized access';
    throw new Error(message);
  }
}
