import React from "react";
import Feedback from "@/components/admin/feedback";
import { currentUser } from "@clerk/nextjs/server";
import OpsTabs from "@/components/ops/Tabs";
import { notFound } from "next/navigation";
export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (email && !email.endsWith("@kentron.ai")) {
    notFound();
  }
  return (
    <>
      <div className="relative">
        <OpsTabs></OpsTabs>
        {children}
      </div>
      <Feedback />
    </>
  );
}
