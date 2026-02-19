import React, { useState, useEffect, type JSX } from 'react';
import SearchBox from './search-box';
import ListLoadingSkeleton from './list-loading-skeleton';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useDebounce } from '@/hooks/useDebounce';
import { User } from 'lucide-react';

type Item = { id: string; name: string; type?: string };
interface Props<TData extends {}> {
  isLoading?: boolean;
  isFetching?: boolean;
  items: Array<Item & TData>;
  selectedValue: string | undefined;
  onSelectionChange: (value: string) => void;
  searchPlaceholder?: string;
  label?: (item: Item & TData) => JSX.Element;
  children?: React.ReactNode;
  hideSearch?: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  onSearchQueryUpdate?: (query: string) => void;
  searchMode?: 'client' | 'server';
  listHeight?: number;
  isRemovePadding?: boolean;
  buttonDisabled?: boolean;
}

const SingleSelectionList = <TData extends {}>({
  searchPlaceholder,
  isLoading = false,
  isFetching = false,
  items,
  selectedValue,
  onSelectionChange,
  label,
  children,
  hideSearch = false,
  fetchNextPage,
  hasNextPage,
  onSearchQueryUpdate,
  searchMode = 'client',
  listHeight = 310,
  isRemovePadding = false,
  buttonDisabled = false,
}: Props<TData>) => {
  const [infiniteScrollRef, setInfiniteScrollRef] =
    React.useState<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!infiniteScrollRef || !fetchNextPage || !hasNextPage || isFetching) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 0.1,
      }
    );
  
    if (infiniteScrollRef) {
      observer.observe(infiniteScrollRef);
    }
  
    return () => {
      observer.disconnect();
    };
  }, [infiniteScrollRef, fetchNextPage, hasNextPage, isFetching]);

  useEffect(() => {
    if (searchMode === 'server') {
      onSearchQueryUpdate?.(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearchQueryUpdate, searchMode]);

  const onSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredItems = searchMode === 'client' 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <div className="flex flex-col gap-3 mt-2">
      {hideSearch === false && (
        <div className="px-0.5">
          <SearchBox
            disabled={isLoading}
            placeholder={searchPlaceholder || ''}
            searchQuery={searchQuery}
            setSearchQuery={onSearchQueryChange}
            isLoading={isLoading}
          />
        </div>
      )}
      <div className="relative flex flex-col">
        {children}
        <div 
          className="flex flex-col bg-white rounded-md overflow-y-auto"
          style={{ maxHeight: `${listHeight}px` }}
        >
          {isLoading && items.length === 0 ? (
            <div className="py-3 px-2">
              <ListLoadingSkeleton />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex justify-center items-center py-8 text-[#71717A]">
              <p className="text-sm">No records available.</p>
            </div>
          ) : (
            <RadioGroup
              value={selectedValue}
              onValueChange={(value) => {
                !buttonDisabled && onSelectionChange(value);
              }}
              className="flex flex-col text-[#18181B] accent-black"
            >
              {filteredItems.map((option) => (
                <div key={option.id} className="hover:bg-[#F9FAFB] transition-colors duration-150">
                  <div className={`flex items-center ${isRemovePadding ? 'py-[1px]' : 'px-3 py-[1px]'}`}>
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="accent-black mr-3 h-4 w-4"
                      disabled={buttonDisabled}
                    />
                    <div className="flex-1 min-w-0 text-[14px] font-sans font-normal text-[#71717A] leading-normal cursor-pointer">
                      {label ? (
                        label(option)
                      ) : (
                        <label htmlFor={option.id} className="flex items-center gap-1">
                          {option.name} {option.type === "personal" && <User size={14} className="text-[#71717A]" />}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {hasNextPage && (
            <div 
              ref={setInfiniteScrollRef} 
              className="w-full h-10 flex justify-center py-2"
            >
              {isFetching && <ListLoadingSkeleton />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleSelectionList;
