"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings, TestTube2, Upload, Database, Download } from "lucide-react";

const tabs = [
  { href: "", label: "Overview", icon: Settings },
  { href: "/router-test", label: "Test Prompts", icon: TestTube2 },
  { href: "/router-training", label: "Router Training", icon: Upload },
  { href: "/models/download", label: "Models", icon: Database },
];

export default function OpsTabs() {
  const pathname = usePathname();
  const params = useParams();
  const tenant = params.tenant as string;

  return (
    <div className="border-b sticky top-0 bg-background">
      <div className="px-8 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const href = `/${tenant}/ops${tab.href}`;
            const isActive = pathname === href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-muted-foreground"
                    : "border-transparent text-muted-foreground hover:text-inherit hover:border-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
