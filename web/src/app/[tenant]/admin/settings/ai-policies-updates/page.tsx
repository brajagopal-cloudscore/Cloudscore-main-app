"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Info, Search, Loader2, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/common/pagination";
// Removed Navbar import - using static layout instead
import { PolicyDetailsModal } from "@/components/global-ai-policies/PolicyDetailsModal";
import {
  GlobalAiPolicy,
  GlobalAiPolicyResponse,
  GlobalAiPolicyFilters,
} from "@/types/global-ai-policies";
import { fetchGlobalAiPolicies } from "@/lib/api/global-ai-policies";

const AIPolicyUpdate = () => {
  const [policies, setPolicies] = useState<GlobalAiPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<GlobalAiPolicy | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filters, setFilters] = useState<GlobalAiPolicyFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter options (fetched once on mount)
  const [filterOptions, setFilterOptions] = useState<{
    regions: string[];
    countries: string[];
    statuses: string[];
  }>({
    regions: [],
    countries: [],
    statuses: [],
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on search change
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch filter options on mount (all unique values)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch all policies without pagination to get unique filter values
        const result = await fetchGlobalAiPolicies({ pageSize: 10000 });
        const allPolicies = result.data || [];

        const uniqueRegions = Array.from(
          new Set(allPolicies.map((p) => p.region).filter(Boolean))
        ) as string[];
        const uniqueCountries = Array.from(
          new Set(allPolicies.map((p) => p.country).filter(Boolean))
        ) as string[];
        const uniqueStatuses = Array.from(
          new Set(allPolicies.map((p) => p.status).filter(Boolean))
        ) as string[];

        setFilterOptions({
          regions: uniqueRegions.sort(),
          countries: uniqueCountries.sort(),
          statuses: uniqueStatuses.sort(),
        });
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch policies from API with server-side pagination, search, and filters
  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchGlobalAiPolicies({
        page,
        pageSize,
        search: debouncedSearchTerm || undefined,
        region: filters.region || undefined,
        country: filters.country || undefined,
        status: filters.status || undefined,
      });

      setPolicies(result.data || []);
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      }
    } catch (err) {
      setError("Failed to fetch policies");
      console.error("Error fetching policies:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm, filters]);

  // Fetch policies when dependencies change
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.region, filters.country, filters.status]);

  const renderPolicyActions = (item: GlobalAiPolicy) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
            <MoreHorizontal className="h-4 w-4 " />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[152px]">
          <DropdownMenuItem
            onClick={() => setSelectedPolicy(item)}
            className="flex items-center gap-2 text-sm font-normal  cursor-pointer"
          >
            <Info size={15} className=" font-normal" />
            View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getStatusColor = (status: string | null | undefined): string => {
    if (!status) return "bg-muted text-muted-foreground";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("active") || statusLower.includes("enacted")) {
      return "bg-green-500/10 text-green-500";
    } else if (
      statusLower.includes("proposed") ||
      statusLower.includes("draft")
    ) {
      return "bg-yellow-500/10 text-yellow-500";
    } else if (
      statusLower.includes("repealed") ||
      statusLower.includes("expired")
    ) {
      return "bg-red-500/10 text-red-500";
    } else {
      return "bg-blue-500/10 text-blue-500";
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const PolicyTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading policies...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading policies</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }

    if (policies.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="">No policies found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader className="">
          <TableRow className="">
            <TableHead className=" font-medium h-10">
              Policy Name
            </TableHead>
            <TableHead className=" font-medium h-10">
              Country
            </TableHead>
            <TableHead className=" font-medium h-10">
              State/Region
            </TableHead>
            <TableHead className=" font-medium h-10">
              Status
            </TableHead>
            <TableHead className=" font-medium h-10">
              Effective Date
            </TableHead>
            <TableHead className=" font-medium h-10">
              Impact Summary
            </TableHead>
            <TableHead className=" font-medium h-10">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy: GlobalAiPolicy) => (
            <TableRow
              key={policy.id}
              className="h-10"
            >
              {/* Policy Name */}
              <TableCell className="text-sm  font-normal">
                <div className="flex flex-col">
                  <span className="font-medium">{policy.policyName}</span>
                  {policy.shortName && (
                    <span className="text-xs text-muted-foreground">
                      {policy.shortName}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Country */}
              <TableCell className="text-sm  font-normal">
                {policy.country || "N/A"}
              </TableCell>

              {/* State/Region */}
              <TableCell className="text-sm  font-normal">
                <div className="flex flex-col">
                  {policy.state && <span>{policy.state}</span>}
                  {policy.region && (
                    <span className="text-xs text-muted-foreground">
                      {policy.region}
                    </span>
                  )}
                  {!policy.state && !policy.region && "N/A"}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell className="text-sm  font-normal">
                {policy.status ? (
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                ) : (
                  "N/A"
                )}
              </TableCell>

              {/* Effective Date */}
              <TableCell className="text-sm  font-normal">
                {formatDate(policy.effectiveDate)}
              </TableCell>

              {/* Summary */}
              <TableCell className="text-sm  font-normal max-w-[300px]">
                {policy.summary ? (
                  <div className="truncate">
                    {policy.summary.substring(0, 100)}...
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-sm  font-normal">
                {renderPolicyActions(policy)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || filters.region || filters.country || filters.status;

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPage(1);
    setPageSize(newSize);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col p-5">
        <div className="flex w-full justify-between items-center">
          <div className="text-xl font-semibold font-sans  leading-[100%] mt-4">
            Global AI Policies Updates
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex justify-start items-center gap-4 mt-6">
          <div className="relative w-[343px]">
            <Input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative w-[343px]">
            {/* Region Filter */}
            <Select
              value={filters.region || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  region: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent className="w-[200px]">
                <SelectItem value="all">All Regions</SelectItem>
                {filterOptions.regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Country Filter */}
          <div className="relative w-[200px]">
            <Select
              value={filters.country || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  country: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="">
                <SelectValue
                  placeholder="Filter by Country"
                  className=""
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {filterOptions.countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="relative w-[200px]">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {filterOptions.statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-[200px]">
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-muted-foreground "
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {policies.length} of {total} policies
        </div>

        {/* Content */}
        <div className="w-full mt-6">
          <PolicyTable />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              pageSize={pageSize}
              setPageSize={setPageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Policy Detail Modal */}
      <PolicyDetailsModal
        policy={selectedPolicy}
        isOpen={selectedPolicy !== null}
        onClose={() => setSelectedPolicy(null)}
      />
    </>
  );
};

export default AIPolicyUpdate;
