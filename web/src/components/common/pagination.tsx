"use client";

import * as React from "react";
import {
  Pagination as PaginationWrapper,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  className?: string;
  variant?: "fixed" | "inline";
}

export default function Pagination({
  page,
  setPage,
  totalPages,
  pageSize,
  setPageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  className,
  variant = "inline",
}: Props) {
  const handlePageChange = (newPage: number) => {
    if (!isLoading && newPage !== page) {
      setPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handlePageSizeChange = (value: string) => {
    if (!isLoading) {
      const newSize = Number(value);
      setPage(1);
      setPageSize(newSize);
      onPageSizeChange?.(newSize);
    }
  };

  const getDisplayedPages = React.useCallback(() => {
    const pages: (number | "...")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <>
      <div className="w-full">
        <PaginationWrapper className="!justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[90px] h-9">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100, 150, 200].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Items per page
            </span>
          </div>

          {/* Pagination navigation */}
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                aria-disabled={page <= 1 || isLoading}
                className={cn(
                  (page <= 1 || isLoading) && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>

            {getDisplayedPages().map((p, i) =>
              p === "..." ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => handlePageChange(Number(p))}
                    isActive={p === page}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                aria-disabled={page >= totalPages || isLoading}
                className={cn(
                  (page >= totalPages || isLoading) &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </PaginationWrapper>
      </div>
    </>
  );
}
