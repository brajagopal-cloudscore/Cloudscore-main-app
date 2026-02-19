"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { tenant, applicationId } = useParams();

  return (
    <div className="h-[500px] w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl shadow p-8 text-center space-y-4">
        <div className="flex justify-center">
          <FolderPlus className="h-24 w-24 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-semibold">Add Use Case to Assign Risk</h1>

        <p className="text-sm text-muted-foreground">
          To begin assigning risk details, {`you’ll`} need to create a use case
          first. This helps organize and categorize all risks effectively.
        </p>

        <Button
          onClick={() =>
            router.push(
              `/${tenant}/applications/${applicationId}/goviq/use-case`
            )
          }
          className="mt-2"
        >
          Go to Use Case Page
        </Button>
      </div>
    </div>
  );
}
