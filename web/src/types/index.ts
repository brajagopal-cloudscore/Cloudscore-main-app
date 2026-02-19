// Core Clerk User Profile (from Clerk auth)
export interface ClerkUserProfile {
  id: string | null;
  clerkId: string;
  email: string;
  name: string;
  username: string;
  role: string;
  tenant: string;
  status: boolean;
}

// Logged-in user profile (legacy - to be refactored)
export interface LoggedInUserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  tenant_name: string;
  is_active: boolean;
  role: string;
  tenant: string;
}

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
}

// Component interface types
export interface componentIf {
  component: string;
  setComponent: (component: string) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  notificationsCount: number;
  setNotificationsCount: (count: number) => void;
  userData: LoggedInUserProfile | null;
  setUserData: (data: LoggedInUserProfile | null) => void;
}

// Notification type
export interface Notification {
  id: string;
  message: string;
  event_type: string;
  read_status: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string;
  tenant: string;
}