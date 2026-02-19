// contexts/AIRisksContext.tsx
import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { AIRisk, QUERY_KEYS } from '@/types/useCase';
import { GetAIRisksForDropdown } from '@/lib/api/useCase';

interface AIRiskResponse {
  status: string;
  message: string;
  result: {
    data: AIRisk[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

interface AIRisksContextType {
  // Data
  aiRisks: AIRisk[];
  totalCount: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearchQuery: string;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  error: Error | null;

  // Actions
  fetchNextPage: () => void;
  refetch: () => void;

  // Control
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const AIRisksContext = createContext<AIRisksContextType | undefined>(undefined);

interface AIRisksProviderProps {
  children: React.ReactNode;
  pageSize?: number;
}

export const AIRisksProvider: React.FC<AIRisksProviderProps> = ({
  children,
  pageSize = 20
}) => {
  const queryClient = useQueryClient();
  const isFirstMount = useRef(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [enabled, setEnabled] = React.useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery<AIRiskResponse>({
    queryKey: QUERY_KEYS.aiRisksInfinite(debouncedSearchQuery),
    queryFn: ({ pageParam }: any) => {
      return GetAIRisksForDropdown({
        search: debouncedSearchQuery,
        page: pageParam,
        limit: pageSize
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: AIRiskResponse) => {
      if (!lastPage?.result?.data || lastPage.result.data.length === 0) {
        return undefined;
      }

      const { pagination } = lastPage.result;

      if (pagination.hasNextPage) {
        const nextPage = pagination.page + 1;
        return nextPage;
      }

      return undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Invalidate queries when search changes (but not on first mount)
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (enabled) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aiRisksInfinite()
      });
    }
  }, [debouncedSearchQuery, enabled, queryClient]);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetching && enabled) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, enabled, fetchNextPage]);

  // Flatten all pages into a single array
  const aiRisks = data?.pages
    ?.flatMap((page) => page?.result?.data || [])
    ?.filter(Boolean) || [];

  // Get total count from the first page
  const totalCount = data?.pages?.[0]?.result?.pagination?.totalCount || 0;

  const contextValue: AIRisksContextType = {
    aiRisks,
    totalCount,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isLoading,
    isFetching,
    hasNextPage,
    error,
    fetchNextPage: handleFetchNextPage,
    refetch,
    enabled,
    setEnabled
  };

  return (
    <AIRisksContext.Provider value={contextValue}>
      {children}
    </AIRisksContext.Provider>
  );
};

export const useAIRisks = () => {
  const context = useContext(AIRisksContext);
  if (context === undefined) {
    throw new Error('useAIRisks must be used within an AIRisksProvider');
  }
  return context;
};
