import { LoggedInUserProfile } from "../../types";

export const checkUserWritePermissions = (
  role: any,
): boolean => {
  return role === 'Admin'
};

export const checkUserPermissions = (user: any): boolean => {
  return ['Admin'].includes(user?.organizationMemberships?.[0]?.roleName);
};

export const checkWorkspacePermissions = (
  workspace: any,
  userProfile: LoggedInUserProfile,
): boolean => {
  const userId = userProfile?.id;
  const role = userProfile?.role;
  const isOwner = workspace?.created_by?.id === userId;
  const canManage = workspace?.workspacePermission  === 'manage';

  if (['globaladmin', 'admin'].includes(role)) {
    return true;
  }

  if (['auditor', 'member'].includes(role)) {
    return canManage || isOwner;
  }

  return false;
};

export const hasWorkspacePermissions = (
  workspace: any,
  userProfile: LoggedInUserProfile,
  checkWrite: boolean = false
): boolean => {
  const userId = userProfile?.id;
  const role = userProfile?.role;
  const isOwner = workspace?.created_by?.id === userId;
  const canManage = workspace?.workspace_permissions === 'manage';
  const canRead = workspace?.workspace_permissions === 'readonly' || canManage;

  if (['globaladmin', 'admin'].includes(role)) {
    return true;
  }

  if (['auditor', 'member'].includes(role)) {
    return isOwner || (checkWrite ? canManage : canRead);
  }

  return false;
};

export const checkSaveSearchListPermissions = (
  workspace: any,
  userProfile: LoggedInUserProfile
): boolean => {
  const role = userProfile?.role;
  const workspace_permissions = workspace?.workspace_permissions;

  if (['globaladmin', 'admin', 'auditor'].includes(role)) {
    return true;
  }

  if (role === 'member') {
    return workspace_permissions === 'manage';
  }

  return false;
};


export const checkSaveSearchEditPermissions = (
  userProfile: LoggedInUserProfile,
  workspace: any,
  hasSaveCreatePermission: boolean,
  savedSearch?: any
): boolean => {
  const userId = userProfile?.id;
  const role = userProfile?.role;
  const isOwner = workspace?.created_by?.id === userId;
  const canManage = workspace?.workspace_permissions === 'manage';
  const isSearchOwner = savedSearch?.created_by?.id === userId;

  if (['globaladmin', 'admin'].includes(role)) {
    return true;
  }

  if (['auditor', 'member'].includes(role)) {
    if (hasSaveCreatePermission) {
      return isOwner || canManage;
    }
    return isOwner || isSearchOwner || canManage;
  }

  return false;
};
