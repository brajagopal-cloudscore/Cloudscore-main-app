"use client";

import { useContext, createContext, ReactNode, useMemo } from "react";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  RecentEndpointsPaginatedResponse,
  RequestStatsGraphResponse,
  getTenantGraphStats,
  getTenantRecentEndpoints,
} from "@/lib/actions/recent";
import { getObservabilityStats } from "@/lib/queries/observability";
import { ObservabilityStats } from "@/lib/queries/observability";

interface TenantLogsInterface {
  logs: RecentEndpointsPaginatedResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const TenantLogsContext = createContext<TenantLogsInterface | null>(null);

export function TenantLogsStore({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { orgId } = useAuth();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const show = searchParams.get("show") || "all";
  const search = searchParams.get("search") || "";

  const filters = useMemo(
    () => ({
      page,
      limit,
      show,
      search,
    }),
    [page, limit, show, search]
  );

  const query = useQuery({
    queryKey: ["tenant-logs", orgId, filters],
    queryFn: async () => {
      if (!orgId) return;
      return await getTenantRecentEndpoints({
        tenantId: orgId,
        ...filters,
      });
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <TenantLogsContext.Provider
      value={{
        logs: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        refetch: query.refetch,
      }}
    >
      {children}
    </TenantLogsContext.Provider>
  );
}

export const useTenantLogs = () => {
  const context = useContext(TenantLogsContext);
  if (!context)
    throw new Error("useTenantLogs must be used inside TenantLogsStore");
  return context;
};

interface TenantStatsInterface {
  data: ObservabilityStats | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const TenantStatsContext = createContext<TenantStatsInterface | null>(null);

export function TenantStatsStore({ children }: { children: ReactNode }) {
  const { orgId } = useAuth();

  const { isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ["tenant-stats", orgId],
    queryFn: async () => {
      if (!orgId) return;
      return await getObservabilityStats({ tenantId: orgId });
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <TenantStatsContext.Provider
      value={{
        data,
        isLoading,
        isFetching,
        refetch,
      }}
    >
      {children}
    </TenantStatsContext.Provider>
  );
}

export const useTenantStats = () => {
  const context = useContext(TenantStatsContext);
  if (!context)
    throw new Error("useTenantStats must be used inside TenantStatsStore");
  return context;
};

interface TenantGraphInterface {
  data: RequestStatsGraphResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const TenantGraphContext = createContext<TenantGraphInterface | null>(null);
export function TenantGraphStore({ children }: { children: ReactNode }) {
  const { orgId } = useAuth();
  const { isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ["tenant-stats-graph", orgId],
    queryFn: async () => {
      if (!orgId) return;
      return await getTenantGraphStats({
        tenantId: orgId,
      });
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
  });

  return (
    <TenantGraphContext.Provider
      value={{
        data,
        isLoading,
        isFetching,
        refetch,
      }}
    >
      {children}
    </TenantGraphContext.Provider>
  );
}

export const useTenantGraph = () => {
  const context = useContext(TenantGraphContext);
  if (!context)
    throw new Error("useTenantGraph must be used inside TenantGraphStore");
  return context;
};
