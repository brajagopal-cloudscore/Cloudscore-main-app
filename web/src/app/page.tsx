import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db, tenants } from "@db";
import { eq } from "drizzle-orm";

import { ServerErrorPage } from "@/components/error/CustomErrorPage";

export default async function Page() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  if (!orgId) {
    redirect("/admin/client-onboarding");
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, orgId),
  });

  if (!tenant) {
    return notFound();
  }

  redirect(`/${tenant.slug}/applications`);
}
