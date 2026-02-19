"use client";

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
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";

interface Props {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  prev: number | null;
  next: number | null;
}

export const Pagination = ({
  page,
  limit,
  total,
  totalPage,
  prev,
  next,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const updateParams = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, String(value));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };
  const goToPage = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-between w-full items-center my-4">
      {/* Showing X-Y out of Z */}

      <div className="flex gap-2 items-center mr-4">
        <span className="text-muted-foreground text-xs w-[80px]">
          Item per Page
        </span>
        <Select
          value={String(limit || 10) || "10"}
          onValueChange={(v) => updateParams("limit", v)}
        >
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">
        <span className="text-nowrap">
          Showing {start}-{end} out of {total}
        </span>
      </div>

      {/* Pagination Wrapper */}
      <PaginationWrapper>
        <PaginationContent className="ml-auto">
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={clsx("cursor-pointer", {
                "pointer-events-none opacity-40": !prev,
              })}
              onClick={() => prev && goToPage(prev)}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {[...Array(totalPage)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === 1 ||
              pageNumber === totalPage ||
              Math.abs(pageNumber - page) <= 1
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={() => goToPage(pageNumber)}
                    isActive={pageNumber === page}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            }

            if (pageNumber === page - 2 || pageNumber === page + 2) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return null;
          })}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              className={clsx("cursor-pointer", {
                "pointer-events-none opacity-40": !next,
              })}
              onClick={() => next && goToPage(next)}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationWrapper>
    </div>
  );
};
