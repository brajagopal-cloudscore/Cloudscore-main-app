import React, { useEffect, useState, type JSX } from 'react';
import SearchBox from './search-box';
import { Checkbox } from '../ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import ListLoadingSkeleton from './list-loading-skeleton';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { Label } from '../ui/label';
import { Switch } from '@nextui-org/react';

type Item<TData> = { id: string; name: string } & Partial<TData>;
interface Props<TData extends {}> {
  isLoading?: boolean;
  items: Array<Item<TData>>;
  selectedItems: any;
  onSelectedItemsChange: (items: Array<Item<TData>>) => void;
  searchPlaceholder?: string;
  label?: (item: Item<TData>) => JSX.Element;
  children?: React.ReactNode;
  hideSearch?: boolean;
  hideSelectedItems?: boolean;
  fetchNextPage?: () => void;
  onSearchQueryUpdate?: (query: string) => void;
  searchMode?: 'client' | 'server';
  listHeight?: number;
  // Applies only if search mode is 'client
  limitRecords?: number;
  handleSearchMatching?: (item: Item<TData>, query: string) => boolean;
  handleFilterApplied?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleFilterReset?: (filterName: string) => void;
  filterName?: string;
  onClose?: () => void;
  isButtonsAvailable?: boolean;
  errorMessage?: string;
  isClearFilterAvailable?: boolean;
  hasNextPage?: boolean;
  isFetching?: boolean;
  isClearFilterDisabled?: boolean;
  buttonDisabled?: boolean;
}

const SelectionList = <TData extends {}>({
  searchPlaceholder,
  isLoading = false,
  items,
  selectedItems,
  onSelectedItemsChange,
  label,
  children,
  hideSearch = false,
  hideSelectedItems = false,
  fetchNextPage,
  onSearchQueryUpdate,
  searchMode = 'client',
  listHeight = 300,
  limitRecords,
  handleSearchMatching,
  handleFilterApplied,
  handleFilterReset,
  filterName,
  onClose,
  isButtonsAvailable = false,
  errorMessage,
  isClearFilterAvailable = false,
  hasNextPage,
  isFetching,
  isClearFilterDisabled = false,
  buttonDisabled = false,
}: Props<TData>) => {
  const [infiniteScrollRef, setInfiniteScrollRef] = useState<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllRecords, setShowAllRecords] = useState(false);

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

  const onSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    onSearchQueryUpdate?.(query);
  };

  const onCheckedChange = (item: Item<TData>, checked: CheckedState) => {
    if (checked === false) {
      const updatedItems = selectedItems.filter((i: any) => i.id !== item.id);
      onSelectedItemsChange(updatedItems);
    } else {
      const updatedItems = [...selectedItems];
      updatedItems.push(item);
      onSelectedItemsChange(updatedItems);
    }
  };

  const selectOnEnter = () => {
    const item = items.filter(
      (item) =>
        handleSearchMatching?.(item, searchQuery.toLowerCase()) ??
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (item?.length === 1) {
      const isSelected = selectedItemsId.includes(item[0]?.id);
      if (!isSelected) {
        onCheckedChange(item[0], true);
      }
    }
  };

  const allFilteredItemsSelected = [
    ...items.slice(0, showAllRecords ? undefined : limitRecords || undefined),
  ].every((item: any) =>
    selectedItems.some((selectedItem: any) => selectedItem.id === item.id)
  );

  const handleSelectAllChange = (checked: CheckedState) => {
    if (checked === true) {
      const newSelectedItems = [
        ...selectedItems,
        ...[
          ...items.slice(
            0,
            showAllRecords ? undefined : limitRecords || undefined
          ),
        ].filter(
          (item) =>
            !selectedItems.some((selectedItem: any) => selectedItem.id === item.id)
        ),
      ];
      onSelectedItemsChange(newSelectedItems);
    } else {
      const remainingItems = selectedItems.filter(
        (item: any) =>
          ![
            ...items.slice(
              0,
              showAllRecords ? undefined : limitRecords || undefined
            ),
          ].some((filteredItem) => filteredItem.id === item.id)
      );
      onSelectedItemsChange(remainingItems);
    }
  };

  const removeSelectedItem = (item: Item<TData>) => {
    const updatedItems = selectedItems.filter((i: any) => i.id !== item.id);
    onSelectedItemsChange(updatedItems);
  };

  const selectedItemsId = selectedItems.map((i: any) => i.id);

  return (
    <div>
      <div className="flex flex-col gap-1 justify-start">
        {hideSearch === false && (
          <SearchBox
            disabled={isLoading || buttonDisabled}
            placeholder={searchPlaceholder || ''}
            searchQuery={searchQuery}
            setSearchQuery={onSearchQueryChange}
            isLoading={isLoading}
            onEnter={selectOnEnter}
          />
        )}
        {selectedItems.length > 0 && !hideSelectedItems && (
          <div className="flex flex-wrap gap-1 mb-2 max-h-[200px] overflow-y-auto">
            {selectedItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-1 border border-[#E4E4E7] rounded-md px-[12px] py-[4px] min-w-0"
              >
                <button
                  onClick={() => removeSelectedItem(item)}
                  className="text-[#71717A] hover:text-gray-700 shrink-0"
                  disabled={buttonDisabled}
                >
                  <X size={12} />
                </button>
                <span className="text-xs leading-[16px] font-sans font-semibold text-[#71717A] truncate min-w-0">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="relative flex flex-col mt-1 gap-2">
          {children}
          <div
            className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: `${listHeight}px` }}
          >
            {searchMode !== 'client' && !isLoading && items.length > 0 && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#71717A] min-w-0">
                <Checkbox
                  id="select-all"
                  checked={allFilteredItemsSelected}
                  onCheckedChange={(checked) => handleSelectAllChange(checked)}
                  disabled={buttonDisabled}
                  className="shrink-0" // Added shrink-0
                />
                <label htmlFor="select-all" className="truncate min-w-0">Select all</label>
              </div>
            )}
            {isLoading && items.length === 0 ? (
              <ListLoadingSkeleton />
            ) : items.length === 0 || errorMessage ? (
              <div className="flex justify-center mt-4 py-8">
                <p>{'No records available'}</p>
              </div>
            ) : (
              [
                ...items.slice(
                  0,
                  showAllRecords ? undefined : limitRecords || undefined
                ),
              ]
                .filter((item) =>
                  searchMode === 'client'
                    ? handleSearchMatching?.(item, searchQuery.toLowerCase()) ??
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((item) => (
                  <div className="flex gap-2 items-center text-sm font-medium text-[#71717A] min-w-0" key={item.id}>
                    <Checkbox
                      id={item.id}
                      checked={selectedItemsId.includes(item?.id)}
                      onCheckedChange={(e) => onCheckedChange(item, e)}
                      disabled={buttonDisabled}
                      className="shrink-0"
                    />
                    {label ? (
                      <div className="min-w-0 flex-1">
                        {label(item)}
                      </div>
                    ) : (
                      <label htmlFor={item.id} className="truncate min-w-0 flex-1 cursor-pointer" title={item.name}>
                        {item.name}
                      </label>
                    )}
                  </div>
                ))
            )}

            {isLoading && items.length > 0 && (
              <div className="py-2">
                <ListLoadingSkeleton />
              </div>
            )}

            {hasNextPage && !isFetching && (
              <div
                ref={setInfiniteScrollRef}
                className="w-full h-10 flex justify-center py-2"
              >
              </div>
            )}
          </div>
        </div>
        {isClearFilterAvailable ? (
          <Button
            size='sm'
            variant='link'
            className="flex-1 text-sm font-medium text-[#DC2626]"
            disabled={isClearFilterDisabled}
            onClick={() => {
              handleFilterReset?.(filterName || '');
              onClose?.();
            }}
          >
            Clear All Filters
          </Button>
        ) : null}
        {isButtonsAvailable ? (<div className="flex gap-2 w-full">
          <Button
            size='sm'
            className="flex-1"
            onClick={(e) => {
              handleFilterApplied?.(e);
              onClose?.();
            }}
          >
            Apply
          </Button>
          <Button
            size='sm'
            className="flex-1"
            variant='destructive'
            onClick={() => {
              handleFilterReset?.(filterName || '');
              onClose?.();
            }}
          >
            Reset
          </Button>
        </div>
        ) : null}
      </div>
      {limitRecords && items.length > limitRecords &&
        (showAllRecords ? (
          <Button
            variant="link"
            className="w-fit p-0 text-blue-600"
            onClick={() => setShowAllRecords(false)}
          >
            See less
          </Button>
        ) : (
          <Button
            variant="link"
            className="w-fit p-0 text-blue-600"
            onClick={() => setShowAllRecords(true)}
          >
            See {items.length - (limitRecords || 0)} more
          </Button>
        ))}
    </div>
  );
};

export default SelectionList;
