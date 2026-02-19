'use client';

import { useAuthFetch } from '@/lib/api/auth-fetch';

interface PromptData {
  prompt: string;
  risk_category: string;
  severity?: number;
}

/**
 * Bulk upload prompts to LanceDB with auto-embedding
 * LanceDB automatically computes embeddings - just send text!
 */
export function useBulkUpload() {
  const authFetch = useAuthFetch();

  return async (prompts: PromptData[]) => {
    
    const response = await authFetch(
      `/v1/router/bulk-upload`,
      {
        method: 'POST',
        body: JSON.stringify({ prompts }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to upload to LanceDB' }));
      throw new Error(errorData.detail || 'Failed to upload to LanceDB');
    }

    return await response.json();
  };
}

/**
 * Get LanceDB statistics
 */
export function useGetLanceDBStats() {
  const authFetch = useAuthFetch();

  return async () => {

    const response = await authFetch(`/v1/router/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to get LanceDB stats');
    }

    return await response.json();
  };
}

/**
 * Sync existing database prompts to LanceDB
 */
export function useSyncToLanceDB() {
  const authFetch = useAuthFetch();

  return async () => {
    const response = await authFetch(
      `/v1/router/sync-to-lancedb`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to sync to LanceDB' }));
      throw new Error(errorData.detail || 'Failed to sync to LanceDB');
    }

    return await response.json();
  };
}
