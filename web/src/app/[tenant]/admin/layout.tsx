import React from "react";

import Feedback from "@/components/admin/feedback";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgRole } = await auth();

  // if (orgRole !== "org:admin") notFound();
  return (
    <>
      <div className="">
        <Feedback></Feedback>

        {children}
      </div>
    </>
  );
}
