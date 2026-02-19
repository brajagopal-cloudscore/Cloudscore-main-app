// lib/api/reports.ts

import * as reportActions from '@/lib/actions/reports';

/**
 * Fetch summary metrics for reports
 */
export async function fetchSummaryMetrics(tenantSlug: string) {
  try {
    const result = await reportActions.getSummaryMetrics(tenantSlug);
    return result.data;
  } catch (error) {
    console.error('Error fetching summary metrics:', error);
    throw error;
  }
}

/**
 * Fetch use cases by risk classification
 */
export async function fetchUseCasesByRisk(tenantSlug: string) {
  try {
    const result = await reportActions.getUseCasesByRisk(tenantSlug);
    return result.data;
  } catch (error) {
    console.error('Error fetching use cases by risk:', error);
    throw error;
  }
}
