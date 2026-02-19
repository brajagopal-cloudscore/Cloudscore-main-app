// src/components/ClerkThemeProvider.tsx
"use client";

import { ClerkProvider as ClerkProviderWrapper } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ReactNode } from "react";
import { shadcn } from "@clerk/themes";

export function ClerkProvider({ children }: { children: ReactNode }) {

  return (
    <ClerkProviderWrapper
      appearance={{
        baseTheme: shadcn,
      }}
    >
      {children}
    </ClerkProviderWrapper>
  );
}
