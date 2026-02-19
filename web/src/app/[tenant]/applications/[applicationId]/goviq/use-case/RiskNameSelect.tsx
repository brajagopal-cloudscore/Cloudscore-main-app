import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { AIRisk } from '@/types/useCase';
import { useAIRisks } from '@/contexts/AIRisksContext';

interface RiskNameSelectShadcnProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  // Legacy props for backward compatibility
  options?: AIRisk[];
  isLoading?: boolean;
  className?: string;
}

export const RiskNameSelectShadcn: React.FC<RiskNameSelectShadcnProps> = ({
  value,
  onChange,
  placeholder = "Select risk name...",
  error,
  disabled = false,
  options = [],
  isLoading: legacyIsLoading = false,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Try to use context, fall back to legacy props if context not available
  let contextData: ReturnType<typeof useAIRisks> | null = useAIRisks();

  // Determine data source
  const usingContext = contextData !== null;

  // Data management
  const aiRisks = usingContext ? contextData.aiRisks : options;
  const isLoading = usingContext ? contextData.isLoading : legacyIsLoading;
  const isFetching = usingContext ? contextData.isFetching : false;
  const hasNextPage = usingContext ? contextData.hasNextPage : false;
  const fetchNextPage = usingContext ? contextData.fetchNextPage : () => { };
  const setEnabled = usingContext ? contextData.setEnabled : () => { };
  const setContextSearch = usingContext ? contextData.setSearchQuery : () => { };

  // Enable context queries when dropdown opens
  useEffect(() => {
    if (usingContext) {
      setEnabled(open);
    }
  }, [open, usingContext, setEnabled]);

  // Sync search between local and context
  useEffect(() => {
    if (usingContext && open) {
      setContextSearch(searchValue);
    }
  }, [searchValue, usingContext, open, setContextSearch]);

  // Set up infinite scroll observer
  useEffect(() => {
    if (!scrollAreaRef.current || !usingContext || !hasNextPage || isFetching) return;

    const scrollArea = scrollAreaRef.current;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isNearBottom && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetching, fetchNextPage, usingContext]);

  // Filter risks based on search
  const filteredRisks = React.useMemo(() => {
    if (usingContext) {
      // Context handles server-side filtering
      return aiRisks;
    } else {
      // Client-side filtering for legacy mode
      if (!searchValue) return options;
      return options.filter(risk =>
        risk.sRiskName.toLowerCase().includes(searchValue.toLowerCase()) ||
        risk.sDescription?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  }, [aiRisks, options, searchValue, usingContext]);

  const handleSelect = (selectedRiskName: string) => {
    const selectedRisk = aiRisks.find(risk => risk.sRiskName === selectedRiskName);
    if (selectedRisk) {
      onChange(selectedRisk.sRiskName);
      setOpen(false);
      setSearchValue("");
      if (usingContext) {
        setContextSearch("");
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
      if (usingContext) {
        setContextSearch("");
      }
    }
  };

  // Get display value
  const displayValue = value || placeholder;
  const selectedRisk = aiRisks.find(risk => risk.sRiskName === value);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <span className={cn(
            "truncate",
            !value && "text-muted-foreground"
          )}>
            {selectedRisk ? selectedRisk.sRiskName : displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search risks..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <CommandList className="max-h-[300px]">
            <CommandEmpty>
              {isLoading || isFetching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? "Loading..." : "Searching..."}
                  </span>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No risks found.
                </div>
              )}
            </CommandEmpty>

            <CommandGroup>
              <div ref={scrollAreaRef} className="max-h-[250px] overflow-y-auto">
                {filteredRisks.map((risk) => (
                  <CommandItem
                    key={risk._id}
                    value={risk.sRiskName}
                    onSelect={() => handleSelect(risk.sRiskName)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === risk.sRiskName ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {risk.sRiskName}
                        </div>
                        {risk.sDescription && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {risk.sDescription.length > 80
                              ? `${risk.sDescription.substring(0, 80)}...`
                              : risk.sDescription
                            }
                          </div>
                        )}
                        {risk.eSeverity && risk.eLikelihood && (
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded">
                              {risk.eSeverity}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                              {risk.eLikelihood}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}

                {/* Loading more indicator for infinite scroll */}
                {usingContext && isFetching && filteredRisks.length > 0 && (
                  <div className="flex items-center justify-center py-3 border-t">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading more...
                    </span>
                  </div>
                )}

                {/* Scroll indicator */}
                {usingContext && hasNextPage && !isFetching && filteredRisks.length > 0 && (
                  <div className="text-center py-2 text-xs text-muted-foreground border-t">
                    Scroll down for more results
                  </div>
                )}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
