import React from "react";
import RisksModule from "../_components/risks-module";
import { getUseCases } from "@/lib/queries/use-cases";

import { redirect } from "next/navigation";
interface PageProps {
  params: {
    tenant: string;
    applicationId: string;
  };
}

export default async function page({ params }: PageProps) {
  const { tenant, applicationId } = await params;

  const useCases = await getUseCases(applicationId);

  if (useCases.length === 0) {
    redirect(`/${tenant}/applications/${applicationId}/goviq/risk/missing`);
  }

  return (
    <>
      <RisksModule
        applicationId={applicationId}
        tenantId={useCases[0].tenantId}
        useCaseId={useCases[0].id}
      ></RisksModule>
    </>
  );
}
