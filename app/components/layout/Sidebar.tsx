"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Star,
  BarChart2,
  Shield,
  Settings,
  ChevronDown,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className={cn("h-4 w-4", isActive && "text-primary")}>{icon}</span>
      {label}
    </Link>
  );
}

interface CollapsibleNavProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleNav({ icon, label, children, defaultOpen = false }: CollapsibleNavProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <span className="h-4 w-4">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-200",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SubNavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 pl-7 py-1.5 rounded-lg text-sm transition-colors",
        isActive
          ? "text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="flex h-full w-52 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <Cloud className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-foreground leading-tight">
            CLOUD
          </span>
          <span className="text-xs font-bold tracking-widest text-foreground leading-tight">
            SCORE
          </span>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Executive Summary"
          isActive={isActive("/dashboard")}
        />
        <NavItem
          href="/recommendations"
          icon={<Star className="h-4 w-4" />}
          label="Recommendations"
          isActive={isActive("/recommendations")}
        />
        <CollapsibleNav
          icon={<BarChart2 className="h-4 w-4" />}
          label="Insights"
          defaultOpen={pathname.startsWith("/insights")}
        >
          <SubNavItem href="/insights/cost" label="Cost Analysis" />
          <SubNavItem href="/insights/usage" label="Usage Trends" />
          <SubNavItem href="/insights/forecast" label="Forecasting" />
        </CollapsibleNav>
        <CollapsibleNav
          icon={<Shield className="h-4 w-4" />}
          label="Governance"
          defaultOpen={pathname.startsWith("/governance")}
        >
          <SubNavItem href="/governance/policies" label="Policies" />
          <SubNavItem href="/governance/budgets" label="Budgets" />
          <SubNavItem href="/governance/tags" label="Tag Management" />
        </CollapsibleNav>
        <CollapsibleNav
          icon={<Settings className="h-4 w-4" />}
          label="System"
          defaultOpen={pathname.startsWith("/system")}
        >
          <SubNavItem href="/system/integrations" label="Integrations" />
          <SubNavItem href="/system/users" label="Users" />
          <SubNavItem href="/system/settings" label="Settings" />
        </CollapsibleNav>
      </nav>
    </aside>
  );
}

