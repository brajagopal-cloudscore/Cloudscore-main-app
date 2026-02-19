import { useUser } from "@clerk/nextjs";

export function useUserRole() {
  const { user } = useUser();

  // Get role from organization membership (preferred) or roleName
  const orgRole = user?.organizationMemberships?.[0]?.role;
  const roleName = user?.organizationMemberships?.[0]?.roleName;
  const role = orgRole || roleName || null;

  const isAdmin = () => {
    if (!user) return false;
    
    // Check Clerk organization roles (primary check)
    if (orgRole && ['org:admin', 'admin', 'org:owner'].includes(orgRole)) {
      return true;
    }
    
    // Check roleName as fallback
    if (roleName && ['Admin'].includes(roleName)) {
      return true;
    }
    
    // Legacy support for metadata-based roles (if publicMetadata.role exists)
    const metadataRole = user?.publicMetadata?.role;
    if (metadataRole) {
      const adminRoles = ['org:owner', 'org:admin', 'admin'];
      return adminRoles.includes(String(metadataRole).toLowerCase());
    }
    
    return false;
  };

  const hasRole = (requiredRole: string) => {
    return role === requiredRole || roleName === requiredRole;
  };

  return {
    role: role as string,
    roleName: roleName as string,
    orgRole: orgRole as string,
    isAdmin: isAdmin(),
    hasRole,
    isLoading: !user,
  };
}
