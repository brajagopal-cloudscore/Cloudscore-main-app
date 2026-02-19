"use client";

import { useParams } from "next/navigation";
import UseCaseModule from "./use-case-module";


interface UseCaseAppProps {
  initialUseCases?: any[];
  applicationId: string;
  tenantId: string;
  userId: string;
}

export default function UseCaseApp({
  initialUseCases = [],
  applicationId,
  tenantId,
  userId,
}: UseCaseAppProps) {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  return (
    <div className="min-h-screen w-full">
      <h1 className="text-3xl font-bold text-foreground mb-6">Use Case</h1>
      <UseCaseModule
        initialUseCases={initialUseCases}
        applicationId={applicationId}
        tenantId={tenantId}
      />
    </div>
  );
}
