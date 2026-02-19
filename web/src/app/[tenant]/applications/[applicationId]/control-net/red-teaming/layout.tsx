import React, { ReactNode } from "react";
import Page from "./page";
import ComingSoon from "@/components/red-teaming/ComingSoon";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getTenantModels } from "@/lib/queries/provider-models";
import { db, tenants } from "drizzle";
import { eq } from "drizzle-orm";

export default async function layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { tenant: string };
}) {
  const { orgId } = await auth();

  if (!orgId) return notFound();
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, orgId),
  });
  if (!tenant || tenant === null) return notFound();

  const metadata = tenant.metadata as any;

  const models = await getTenantModels(orgId);
  return <Page models={models} isEnabled={metadata.allowRedTeaming} />;
}
