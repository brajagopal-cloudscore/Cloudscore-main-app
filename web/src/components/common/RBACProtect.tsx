// src/components/common/RBACProtect.tsx
'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface RBACProtectProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  fallback?: ReactNode;
  requireOrganization?: boolean;
}

export function RBACProtect({
  children,
  permission,
  permissions,
  role,
  roles,
  fallback = null,
  requireOrganization = true,
}: RBACProtectProps) {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  // Check if user is authenticated
  if (!user) {
    return <>{fallback}</>;
  }

  // Check if organization is required and present
  if (requireOrganization && !organization) {
    return <>{fallback}</>;
  }

  // Get user role from organization membership
  const userRole = membership?.role || 'org:member';

  // Check role-based access
  if (role && userRole !== role) {
    return <>{fallback}</>;
  }

  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // For permission-based checks, we would need to fetch permissions from the server
  // This is a simplified client-side check - server-side validation is still required
  if (permission || permissions) {
    // Admin and owner roles have all permissions
    if (['org:admin', 'admin', 'org:owner'].includes(userRole)) {
      return <>{children}</>;
    }

    // For now, we'll show the content if user is a member or higher
    // In a real implementation, you'd want to fetch actual permissions from your API
    if (userRole === 'org:member' || userRole === 'member' && (permission || permissions)) {
      // This is a simplified check - implement proper permission validation
      return <>{children}</>;
    }

    if (userRole === 'org:viewer') {
      // Viewers have limited access
      const viewerPermissions = [
        'org:policies:view',
        'org:guardrails:view',
        'org:endpoints:view',
        'org:models:view',
        'org:analytics:view',
        'org:reports:view',
      ];

      if (permission && !viewerPermissions.includes(permission)) {
        return <>{fallback}</>;
      }

      if (permissions && !permissions.some(p => viewerPermissions.includes(p))) {
        return <>{fallback}</>;
      }
    }
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect role="org:admin" fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function OwnerOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect role="org:owner" fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function MemberOrHigher({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect roles={['org:member', 'org:admin', 'org:owner']} fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function ViewerOrHigher({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect roles={['org:viewer', 'org:member', 'org:admin', 'org:owner']} fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

// Permission-based components
export function CanManagePolicies({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect permissions={['org:policies:create', 'org:policies:edit', 'org:policies:delete']} fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function CanViewPolicies({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect permission="org:policies:view" fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function CanManageUsers({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect permissions={['org:users:invite', 'org:users:manage', 'org:users:remove']} fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function CanManageBilling({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect permission="org:billing:manage" fallback={fallback}>
      {children}
    </RBACProtect>
  );
}

export function CanViewAnalytics({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACProtect permission="org:analytics:view" fallback={fallback}>
      {children}
    </RBACProtect>
  );
}
