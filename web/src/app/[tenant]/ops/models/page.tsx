"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function ModelsPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoaded } = useAuth();
  const tenant = params?.tenant as string;

  useEffect(() => {
    // Redirect to download page since this is just a redirect page
    if (isLoaded && tenant) {
      router.replace(`/${tenant}/ops/models/download`);
    }
  }, [router, tenant, isLoaded]);

  return null;
}
