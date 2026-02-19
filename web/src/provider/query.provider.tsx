"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import { persistQueryClient } from "@tanstack/react-query-persist-client";

// import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import React, { ReactNode, useEffect, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 15,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  );

  // const [isHydrated, setIsHydrated] = useState(false);

  // useEffect(() => {
  //   const enablePersistence = async () => {
  //     const localStoragePersister = createSyncStoragePersister({
  //       storage: window.localStorage,
  //       key: "react-query",
  //     });

  //     persistQueryClient({
  //       queryClient,
  //       persister: localStoragePersister,
  //       maxAge: 1000 * 60 * 5,
  //     });

  //     setIsHydrated(true);
  //   };

  //   enablePersistence();
  // }, [queryClient]);

  // if (!isHydrated) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
