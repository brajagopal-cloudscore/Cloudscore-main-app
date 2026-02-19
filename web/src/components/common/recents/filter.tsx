"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  isLoading: boolean;
  isFetching: boolean;
  refetch: Function;
  limit: number;
}

export const FilterSection = ({
  isLoading,
  isFetching,
  refetch,
  limit,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const disabled = isLoading || isFetching;

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const initialShow = searchParams.get("show") || "all";
  const [show, setShow] = useState(initialShow);

  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") params.delete(key);
    else params.set(key, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateQueryParam("search", search.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleShowChange = (value: string) => {
    setShow(value);
    updateQueryParam("show", value);
  };

  return (
    <div className="flex items-center justify-between gap-4 w-full mt-4">
      <div className="flex items-center gap-2 w-full">
        <Input
          placeholder="Search endpoints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=" text-xs w-[250px]"
          disabled={disabled}
        />

        {/* Filter Dropdown */}
        <Select
          value={show}
          onValueChange={handleShowChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="allowed">Allowed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={disabled}
          onClick={() => refetch()}
        >
          <RefreshCcw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
