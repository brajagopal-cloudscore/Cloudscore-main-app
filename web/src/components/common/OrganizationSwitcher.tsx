// src/components/common/OrganizationSwitcher.tsx
"use client";

import {
  OrganizationSwitcher as ClerkOrganizationSwitcher,
  UserButton as ClerkUserButton,
} from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { useState, useEffect } from "react";

export function OrganizationSwitcher() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="px-3 py-2 border rounded-md min-h-10 flex items-center">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <ClerkOrganizationSwitcher
      appearance={{ baseTheme: shadcn }}
      createOrganizationMode="navigation"
      createOrganizationUrl="/admin/client-onboarding"
      organizationProfileMode="navigation"
      organizationProfileUrl="/admin"
      afterCreateOrganizationUrl="/"
      afterSelectOrganizationUrl="/"
    />
  );
}

export function UserButton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex border items-center">
      <ClerkUserButton />
    </div>
  );
}
