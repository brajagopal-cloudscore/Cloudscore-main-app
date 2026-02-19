"use client";
import React, { ReactNode } from "react";
import {
  Key,
  Activity,
  Settings,
  FolderOpen,
  Database,
  Search,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { FaQuestion } from "react-icons/fa";
import { useTenant } from "@/contexts/TenantContext";

interface NavItemProps {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  isActive?: boolean;
  className?: string;
  target?: string;
}

const NavItem = (props: NavItemProps) => {
  const { href, children, icon, isActive, className, target } = props;
  return (
    <Link
      target={target}
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? " bg-muted" : "text-muted-foreground hover:text-inherit"
      } ${className}`}
    >
      {icon}
      {children}
    </Link>
  );
};

export default function Sidebar({ isAdminUser }: { isAdminUser: boolean }) {
  const pathname = usePathname();
  const { tenant } = useParams();
  const { isSignedIn, isLoaded } = useAuth();

  const { tenant: tenantInfo } = useTenant();
  // Show loading state to prevent layout shift
  if (!isLoaded) {
    return (
      <div className="flex w-64 flex-col  border-r  shadow-sm">
        <div className="flex-1 space-y-1 p-4">
          <div className="animate-pulse">
            <Skeleton className="h-4  rounded w-3/4 mb-2"></Skeleton>
            <Skeleton className="h-4  rounded w-1/2 mb-2"></Skeleton>
            <Skeleton className="h-4  rounded w-2/3 mb-2"></Skeleton>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === `/${tenant}`) {
      return pathname === `/${tenant}` || pathname === `/${tenant}/`;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex w-64 flex-col  border-r shadow-sm">
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {/* New Feature Pages - At the Top */}
        <div className="space-y-1">
          <NavItem
            href={`/${tenant}/applications`}
            icon={<FolderOpen className="h-4 w-4" />}
            isActive={isActive(`/${tenant}/applications`)}
          >
            Applications
          </NavItem>
          <NavItem
            href={`/${tenant}/model-registry`}
            icon={<Database className="h-4 w-4" />}
            isActive={isActive(`/${tenant}/model-registry`)}
          >
            Model Registry
          </NavItem>
          {tenantInfo?.govIQEnabled && (
            <>
              <NavItem
                href={`/${tenant}/ai-catalog`}
                icon={<Search className="h-4 w-4" />}
                isActive={isActive(`/${tenant}/ai-catalog`)}
              >
                AI Catalog
              </NavItem>
              <NavItem
                href={`/${tenant}/reports`}
                icon={<FileText className="h-4 w-4" />}
                isActive={isActive(`/${tenant}/reports`)}
              >
                Reports
              </NavItem>
            </>
          )}
          <NavItem
            href={`/${tenant}/ai-console`}
            icon={<AlertTriangle className="h-4 w-4" />}
            isActive={isActive(`/${tenant}/ai-console`)}
          >
            AI Usage Console
          </NavItem>
        </div>
        {isAdminUser ? (
          <>
            <NavItem
              href={`/${tenant}/ops`}
              icon={<Settings className="h-4 w-4" />}
              isActive={isActive(`/${tenant}/ops`)}
            >
              Operations
            </NavItem>
          </>
        ) : (
          <></>
        )}
        <NavItem
          href={`/${tenant}/api-keys`}
          icon={<Key className="h-4 w-4" />}
          isActive={isActive(`/${tenant}/api-keys`)}
        >
          API Keys
        </NavItem>
        <NavItem
          href={`/${tenant}/observability`}
          icon={<Activity className="h-4 w-4" />}
          isActive={isActive(`/${tenant}/observability`)}
        >
          Observability
        </NavItem>
      </nav>
      <nav className=" mt-auto p-4 pb-6">
        <NavItem
          target="__blank__"
          href={`https://docs.kentron.ai/`}
          icon={<FaQuestion />}
          isActive={false}
        >
          Docs
        </NavItem>
      </nav>
    </div>
  );
}
