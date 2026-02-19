 "use client";

import React from "react";
import { ChevronDown, Building2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-end border-b bg-card px-6 gap-3 shrink-0",
        className
      )}
    >
      {/* Organization selector */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
          Organization
        </span>
        <button className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
          <Building2 className="h-3.5 w-3.5" />
          <span>CloudScore</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Notifications */}
      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <FileText className="h-4 w-4" />
      </button>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* User avatar */}
      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        BM
      </button>
    </header>
  );
}

