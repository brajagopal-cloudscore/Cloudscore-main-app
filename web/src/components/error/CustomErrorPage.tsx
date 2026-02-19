"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { FaDiscord } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  FolderX,
  AlertTriangle,
  Wifi,
  Lock,
  Server,
  FileX,
  UserX,
  Shield,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
  CardContent,
} from "../ui/card";

// Icon mapping for different error types
const errorIcons = {
  "not-found": FolderX,
  unauthorized: Lock,
  forbidden: Shield,
  network: Wifi,
  server: Server,
  timeout: Clock,
  "file-not-found": FileX,
  "user-not-found": UserX,
  "access-denied": UserX,
  general: AlertTriangle,
  error: XCircle,
};

// Color mapping for different error types
const errorColors = {
  "not-found": { bg: "bg-red-500/10", text: "text-red-500" },
  unauthorized: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  forbidden: { bg: "bg-orange-500/10", text: "text-orange-500" },
  network: { bg: "bg-blue-500/10", text: "text-blue-500" },
  server: { bg: "bg-purple-500/10", text: "text-purple-500" },
  timeout: { bg: "bg-gray-500/10", text: "text-gray-500" },
  "file-not-found": { bg: "bg-red-500/10", text: "text-red-500" },
  "user-not-found": { bg: "bg-indigo-500/10", text: "text-indigo-500" },
  "access-denied": { bg: "bg-orange-500/10", text: "text-orange-500" },
  general: { bg: "bg-red-500/10", text: "text-red-500" },
  error: { bg: "bg-red-500/10", text: "text-red-500" },
};

interface CustomErrorPageProps {
  type?: keyof typeof errorIcons;
  title: string;
  message: string;
  buttonText?: string;
  redirectPath?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
}

/**
 * Helper function to extract tenant slug from pathname.
 *
 * @param pathname - The current pathname
 * @returns The tenant slug if found, otherwise null
 */
const extractTenantFromPath = (pathname: string): string | null => {
  const parts = pathname.split("/").filter(Boolean);
  // Check if first part is not a known non-tenant route
  if (
    parts.length > 0 &&
    ![
      "api",
      "admin",
      "sign-in",
      "sign-up",
      "network-error",
      "unauthorized",
      "tenant-not-found",
      "not-found",
      "test-error",
    ].includes(parts[0])
  ) {
    return parts[0];
  }
  return null;
};

const CustomErrorPage: React.FC<CustomErrorPageProps> = ({
  type = "error",
  title,
  message,
  buttonText = "Go Back",
  redirectPath = "/",
  onButtonClick,
  showButton = true,
}) => {
  const IconComponent = errorIcons[type] || errorIcons.error;
  const colors = errorColors[type] || errorColors.error;
  const pathname = usePathname();

  // Extract tenant slug from pathname (works in all contexts, including ErrorBoundary)
  const tenantSlug = pathname ? extractTenantFromPath(pathname) : null;

  /**
   * Constructs the full redirect path with tenant prefix if available.
   *
   * @param path - The base redirect path
   * @returns The full path with tenant prefix if tenant is available
   */
  const buildRedirectPath = (path: string): string => {
    // Ensure path starts with /
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // If tenant is available and path doesn't already include tenant, prefix it
    if (tenantSlug && !path.startsWith(`/${tenantSlug}`)) {
      return `/${tenantSlug}${cleanPath}`;
    }

    // If no tenant or path already includes tenant, return as-is
    return cleanPath;
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      const finalPath = buildRedirectPath(redirectPath);
      window.location.href = finalPath;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-sm">
      <Card className="w-full max-w-lg  bg-card p-8 space-y-6 rounded-lg shadow-md">
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          <div className={`p-3 ${colors.bg} rounded-full`}>
            <IconComponent className={`h-10 w-10 ${colors.text}`} />
          </div>
          <CardTitle className="text-2xl font-bold ">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {showButton && (
            <Button
              className="w-full"
              variant={"outline"}
              onClick={handleButtonClick}
            >
              {buttonText}
            </Button>
          )}
          <Button
            className="w-full bg-[#5865F2] hover:bg-[#505ef6] text-[#FFFFFF]"
            variant={"default"}
            onClick={() =>
              (window.location.href = "https://discord.gg/3RB9NCe6mz")
            }
          >
            <FaDiscord></FaDiscord>
            <span>Report this on Discord</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomErrorPage;

// Example usage components below:

// 404 Not Found
export const NotFoundPage = () => (
  <CustomErrorPage
    type="not-found"
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    buttonText="Go to Applications List"
    redirectPath="/applications"
  />
);

// 403 Forbidden
export const ForbiddenPage = () => (
  <CustomErrorPage
    type="forbidden"
    title="Access Denied"
    message="You don't have permission to access this resource."
    buttonText="Go to Applications List"
    redirectPath="/applications"
  />
);

// Server Error
export const ServerErrorPage = () => (
  <CustomErrorPage
    type="server"
    title="Server Error"
    message="Something went wrong on our end. We're working to fix it."
    buttonText="Go to Applications List"
    redirectPath="/applications"
  />
);

// Workspace Not Found (your original component recreated)
export const TenantNotFoundPage = () => (
  <CustomErrorPage
    type="not-found"
    title="Tenant Not Found"
    message="The tenant you're looking for doesn't exist or you don't have access to it."
    buttonText="Go to Applications List"
    redirectPath="/applications"
  />
);
