import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { deleteRouterPrompt, deleteRouterPrompts } from "@/actions/router-ops";
import { successToast, errorToast } from "@/lib/utils/toast";

interface PromptsTabProps {
  prompts: any[];
  loading: boolean;
  tenantId: string;
  onDelete: () => void;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  categoryFilter: string;
  onCategoryFilter: (category: string) => void;
  riskCategories: any[];
  currentPage: number;
  totalPages: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onClearFilter: () => void;
  totalCount: number;
}

export default function PromptsTab({
  prompts,
  loading,
  tenantId,
  onDelete,
  onTabChange,
  searchQuery,
  onSearch,
  categoryFilter,
  onCategoryFilter,
  riskCategories,
  currentPage,
  totalPages,
  pageLimit,
  onPageChange,
  onLimitChange,
  onClearFilter,
  totalCount,
}: PromptsTabProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Generate page numbers with ellipsis for smart pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near start: 1, 2, 3, 4, ..., last
        pages.push(2, 3, 4);
        pages.push("ellipsis-end");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1, ..., n-3, n-2, n-1, n
        pages.push("ellipsis-start");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In middle: 1, ..., current-1, current, current+1, ..., last
        pages.push("ellipsis-start");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("ellipsis-end");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const togglePromptSelection = useCallback((id: string) => {
    setSelectedPrompts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const promptIds = prompts.map((p) => p.id as string);
        setSelectedPrompts(promptIds);
      } else {
        setSelectedPrompts([]);
      }
    },
    [prompts]
  );

  const handleDeletePrompts = useCallback(async () => {
    if (!tenantId) return;
    try {
      setIsDeleting(true);
      await deleteRouterPrompts(tenantId, selectedPrompts);
      setSelectedPrompts([]);
      successToast("", "Prompts", "deleted successfully");
      onTabChange("prompts");
      onDelete();
    } catch (error: any) {
      console.error("Error deleting prompts:", error);
      errorToast(error.message || "Failed to delete prompts");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedPrompts, tenantId, onDelete, onTabChange]);

  const handleDeleteSinglePrompt = async (promptId: string) => {
    if (!tenantId) return;
    try {
      setIsDeleting(true);
      await deleteRouterPrompt(tenantId, promptId);
      successToast("", "Prompt", "deleted successfully");
      onTabChange("prompts");
      onDelete();
    } catch (error: any) {
      console.error("Error deleting prompt:", error);
      errorToast(error.message || "Failed to delete prompt");
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy to clipboard function
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      successToast("", "Prompt", "copied to clipboard");
    } catch (error) {
      errorToast("Failed to copy to clipboard");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleClearFilters = () => {
    setLocalSearchQuery("");
    onClearFilter();
  };

  const hasActiveFilters = searchQuery || categoryFilter;

  if (prompts.length === 0 && !searchQuery && !categoryFilter && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No prompts uploaded yet. Add your first prompt.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-2 ">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {riskCategories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button
          type="button"
          variant="outline"
          onClick={handleClearFilters}
          className="gap-2"
          disabled={!hasActiveFilters}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant="secondary" className="gap-1">
              Category:{" "}
              {riskCategories.find((c) => c.slug === categoryFilter)?.name ||
                categoryFilter}
            </Badge>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedPrompts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedPrompts.length === prompts.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedPrompts.length} selected
                </span>
              </div>
              <Button
                onClick={handleDeletePrompts}
                variant="destructive"
                className="gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {hasActiveFilters && !loading && (
        <div className="text-sm text-muted-foreground">
          Found {totalCount} result{totalCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Prompts List */}
      {loading ? (
        <>
          <Card className="w-full">
            <CardHeader className="">
              <CardTitle className="space-y-2">
                <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
                <Skeleton className="h-3 bg-muted  w-48"></Skeleton>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="">
              <CardTitle className="space-y-2">
                <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
                <Skeleton className="h-3 bg-muted  w-48"></Skeleton>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
            </CardContent>
          </Card>
        </>
      ) : prompts.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground">
            No prompts found matching your filters.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="relative">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{prompt.category}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleCopyToClipboard(prompt.prompt)}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteSinglePrompt(prompt.id)}
                    disabled={isDeleting}
                    title="Delete prompt"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="">{prompt.prompt}</CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Smart Pagination with Ellipsis */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={pageLimit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page navigation with numbers and ellipsis */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers with ellipsis */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (typeof page === "string") {
                  // Ellipsis
                  return (
                    <Button
                      key={`${page}-${index}`}
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9"
                      disabled
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  );
                }

                // Page number button
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "secondary" : "outline"}
                    size="icon"
                    className="w-9 h-9"
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
