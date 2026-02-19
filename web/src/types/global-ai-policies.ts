/**
 * TypeScript types for Global AI Policies
 */

export interface GlobalAiPolicy {
  id: string;
  policyName: string;
  shortName?: string | null;
  region?: string | null;
  effectiveDate?: string | null;
  lastUpdated?: string | null;
  status?: string | null;
  country?: string | null;
  state?: string | null;
  legalStatus?: string | null;
  timeline?: string | null;
  sources?: string | null;
  summary?: string | null;
  whoIsAffected?: string | null;
  howTheyAreAffected?: string | null;
  impact?: string | null;
  complianceRequirements?: string | null;
  enforcementDetails?: string | null;
}

export interface GlobalAiPolicyFilters {
  region?: string;
  country?: string;
  status?: string;
}

export interface GlobalAiPolicyResponse {
  success: boolean;
  data: GlobalAiPolicy[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface GlobalAiPolicyDetailResponse {
  success: boolean;
  data: GlobalAiPolicy;
  error?: string;
}

export interface PolicyStatus {
  value: string;
  label: string;
  color: string;
}

export interface PolicyRegion {
  value: string;
  label: string;
}

export interface PolicyCountry {
  value: string;
  label: string;
}
