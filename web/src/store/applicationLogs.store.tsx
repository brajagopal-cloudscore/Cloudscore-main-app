"use client";

import { useContext, createContext, ReactNode, useMemo } from "react";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  RecentEndpointsPaginatedResponse,
  RequestStatsGraphResponse,
  getApplicationRecentEndpoints,
  getApplicationGraphStats,
} from "@/lib/actions/recent";

import { ControlnetStats, getControlnetStats } from "@/lib/actions/controlnet";
interface ApplicationLogsInterface {
  logs: RecentEndpointsPaginatedResponse;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const ApplicationLogsContext = createContext<ApplicationLogsInterface | null>(
  null
);

export function ApplicationLogsStore({ children }: { children: ReactNode }) {
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
  const { applicationId } = useParams();

  const query = useQuery({
    queryKey: ["application-logs", orgId, filters],
    queryFn: async () => {
      if (!orgId || !applicationId) return null;
      return await getApplicationRecentEndpoints({
        tenantId: orgId,
        applicationId: applicationId.toString(),
        ...filters,
      });
    },
    enabled: !!orgId && !!applicationId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
  });

  return (
    <ApplicationLogsContext.Provider
      value={{
        // @ts-ignore
        logs: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        refetch: query.refetch,
      }}
    >
      {children}
    </ApplicationLogsContext.Provider>
  );
}

export const useApplicationLogs = () => {
  const context = useContext(ApplicationLogsContext);
  if (!context)
    throw new Error(
      "useApplicationLogs must be used inside ApplicationLogsStore"
    );
  return context;
};

interface ApplicationStatsInterface {
  data: ControlnetStats | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const ApplicationStatsContext = createContext<ApplicationStatsInterface | null>(
  null
);

export function ApplicationStatsStore({ children }: { children: ReactNode }) {
  const { orgId } = useAuth();
  const { applicationId } = useParams();
  const { isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ["application-stats", orgId, applicationId],
    queryFn: async () => {
      if (!orgId || !applicationId) return;
      return await getControlnetStats({
        applicationId: applicationId.toString(),
        tenantId: orgId,
      });
    },
    enabled: !!orgId && !!applicationId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
  });

  return (
    <ApplicationStatsContext.Provider
      value={{
        data,
        isLoading,
        isFetching,
        refetch,
      }}
    >
      {children}
    </ApplicationStatsContext.Provider>
  );
}

export const useApplicationStats = () => {
  const context = useContext(ApplicationStatsContext);
  if (!context)
    throw new Error(
      "useApplicationStats must be used inside ApplicationStatsStore"
    );
  return context;
};

interface ApplicationGraphInterface {
  data: RequestStatsGraphResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const ApplicationGraphContext = createContext<ApplicationGraphInterface | null>(
  null
);
export function ApplicationGraphStore({ children }: { children: ReactNode }) {
  const { orgId } = useAuth();
  const { applicationId } = useParams();
  const { isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ["application-stats-graph", orgId, applicationId],
    queryFn: async () => {
      if (!orgId || !applicationId) return;
      return await getApplicationGraphStats({
        applicationId: applicationId.toString(),
        tenantId: orgId,
      });
    },
    enabled: !!orgId && !!applicationId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
  });

  return (
    <ApplicationGraphContext.Provider
      value={{
        data,
        isLoading,
        isFetching,
        refetch,
      }}
    >
      {children}
    </ApplicationGraphContext.Provider>
  );
}

export const useApplicationGraph = () => {
  const context = useContext(ApplicationGraphContext);
  if (!context)
    throw new Error(
      "useApplicationGraph must be used inside ApplicationGraphStore"
    );
  return context;
};
