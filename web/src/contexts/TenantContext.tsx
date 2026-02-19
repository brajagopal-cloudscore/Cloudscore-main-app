// src/contexts/TenantContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";

export interface TenantInfo {
  slug: string;
  id: string;
  name: string;
  plan: string;
  govIQEnabled: boolean;
  controlnetEnabled: boolean;
  metadata: any;
}

interface PolicyStatus {
  euAiAct: boolean;
  iso42001: boolean;
  allActivePolicies: string[];
}

interface TenantContextType {
  tenant: TenantInfo | null;
  isLoading: boolean;
  error: string | null;
  activePolicy: string[];
  policyStatus: PolicyStatus;
  update: (policies: string[]) => void;
  refreshPolicyStatus: () => Promise<void>;
  isEUEnabled: boolean;
  applicationPolicy: PolicyPack[] | undefined;
  refreshApplicationPolicyStatus: Function;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
interface TenantProviderProps {
  children: React.ReactNode;
  tenantData: TenantInfo;
}
interface PolicyPack {
  icon: string | null;
  name: string;
  type: string | null;
  id: string;
  color: string | null;
  metadata: unknown;
  description: string | null;
  isActive: boolean;
  tenantId: string | null;
  category: string | null;
  tags: string[] | null;
  country: string | null;
  projectsCompliant: number;
  totalProjects: number;
  state: string | null;
  parentPolicyId: string | null;
  disable: boolean;
}

export function TenantProvider({ children, tenantData }: TenantProviderProps) {
  const [tenant] = useState<TenantInfo | null>(tenantData);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const { applicationId } = useParams();
  const [activePolicy, setActivePolicy] = useState<string[]>([]);
  const [policyStatus, setPolicyStatus] = useState<PolicyStatus>({
    euAiAct: false,
    iso42001: false,
    allActivePolicies: [],
  });
  const { data: applicationPolicy, refetch: refreshApplicationPolicyStatus } =
    useQuery({
      queryKey: ["isEUEnabled"],
      queryFn: async () => {
        if (!tenant || !applicationId || Array.isArray(applicationId)) {
          throw new Error("Tenant or applicationId is missing");
        }
        const { fetchApplicationCompliancePolicies } = await import(
          "@/lib/api/compliance-policies"
        );
        const policies = await fetchApplicationCompliancePolicies(
          tenant.slug,
          applicationId
        );
        return policies as PolicyPack[];
      },
      enabled: !!tenant && !!applicationId && !Array.isArray(applicationId),
    });

  const isEUEnabled = useMemo(() => {
    if (!applicationPolicy) return false;
    return (
      applicationPolicy.find(
        (ele) => ele.name === "EU AI Act (Regulation 2024/1689)"
      )?.isActive || false
    );
  }, [applicationPolicy]);
  const update = (policies: string[]) => setActivePolicy(policies);

  const refreshPolicyStatus = async () => {
    try {
      const { fetchActivePolicies } = await import("@/lib/api/policy-center");
      const active = await fetchActivePolicies();
      const activePolicy = active.map(
        (ele: any) => ele.parentPolicyId as string
      );

      setPolicyStatus({
        euAiAct:
          activePolicy.find(
            (ele) => ele === "2ff845fe-410e-4e14-b7ce-07711b269d6a"
          ) !== undefined,
        iso42001:
          activePolicy.find(
            (ele) => ele === "dfa263a6-b5aa-4d61-9628-739dae438883"
          ) !== undefined,
        allActivePolicies: activePolicy,
      });
      setActivePolicy(activePolicy);
      console.log({
        euAiAct:
          activePolicy.find(
            (ele) => ele === "2ff845fe-410e-4e14-b7ce-07711b269d6a"
          ) !== undefined,
        iso42001:
          activePolicy.find(
            (ele) => ele === "dfa263a6-b5aa-4d61-9628-739dae438883"
          ) !== undefined,
        allActivePolicies: activePolicy,
      });
    } catch (error) {
      console.error("Error fetching policy status:", error);
    }
  };

  // Fetch policy status on mount
  useEffect(() => {
    refreshPolicyStatus();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        error,
        activePolicy,
        policyStatus,
        update,
        applicationPolicy,
        refreshPolicyStatus,
        refreshApplicationPolicyStatus,
        isEUEnabled,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
