"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import { Plus, Upload } from "lucide-react";
import { errorToast } from "@/lib/utils/toast";
import {
  getRouterPrompts,
  getRiskCategories,
  createMissingCentroidsForRiskCategories,
} from "@/actions/router-ops";
import { useQuery } from "@tanstack/react-query";
import RiskCategoriesTab from "./_components/RiskCategoriesTab";
import PromptsTab from "./_components/PromptsTab";
import CreatePromptDialog from "./_components/CreatePromptDialog";
import CreateCentroidDialog from "./_components/CreateCentroidDialog";
import BulkUploadDialog from "@/components/ops/BulkUploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SeedExamplesPage() {
  const { tenant } = useTenant();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get search params
  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageLimit = parseInt(searchParams.get("limit") || "10", 10);

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("families");

  // Fetch risk categories
  const {
    data: riskCategories = [],
    isLoading: riskCategoryLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["riskCategories"],
    queryFn: getRiskCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch prompts with search, pagination, and category filter
  const {
    data: promptsData,
    isLoading: promptsLoading,
    refetch: refetchPrompts,
  } = useQuery({
    queryKey: [
      "prompts",
      tenant?.id,
      searchQuery,
      categoryFilter,
      currentPage,
      pageLimit,
    ],
    queryFn: () =>
      getRouterPrompts(tenant!.id, {
        q: searchQuery,
        category: categoryFilter,
        page: currentPage,
        limit: pageLimit,
      }),
    enabled: !!tenant?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const prompts = promptsData?.data || [];
  const totalPrompts = promptsData?.total || 0;
  const totalPages = promptsData?.totalPages || 1;

  // Dialog states
  const [openPromptDialog, setOpenPromptDialog] = useState(false);
  const [openCentroidDialog, setOpenCentroidDialog] = useState(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);

  // Initialize missing centroids
  useEffect(() => {
    const init = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
        await createMissingCentroidsForRiskCategories(tenant.id);
      } catch (error: any) {
        console.error("Error creating centroids:", error);
        errorToast(error.message || "Failed to initialize centroids");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [tenant?.id]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    params.set("page", "1");

    const queryString = params.toString();
    const pathname = window.location.pathname;

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  // Handle category filter changes
  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "" || category === "all") params.delete("category");
    else {
      params.set("category", category);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleLimitChange = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit.toString());
    params.set("page", "1"); // Reset to page 1 on limit change
    router.push(`?${params.toString()}`);
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("q");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Router Training</h1>
            <p className="text-muted-foreground mt-2">
              Manage centroids and seed prompts for router training.
              <br />
              ⚠️ First create a risk category (centroid), then add prompts with
              matching category.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setOpenCentroidDialog(true)}
              variant="default"
              disabled={loading || riskCategoryLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Risk Category
            </Button>
            <Button
              onClick={() => setOpenPromptDialog(true)}
              disabled={
                riskCategories.length === 0 || loading || riskCategoryLoading
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Prompt
            </Button>
            <Button
              onClick={() => setOpenBulkUploadDialog(true)}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="families">
              Risk Categories ({riskCategories.length})
            </TabsTrigger>
            <TabsTrigger value="prompts">Prompts ({totalPrompts})</TabsTrigger>
          </TabsList>

          <TabsContent value="families">
            <RiskCategoriesTab
              riskCategories={riskCategories}
              loading={riskCategoryLoading}
            />
          </TabsContent>

          <TabsContent value="prompts">
            <PromptsTab
              prompts={prompts}
              loading={promptsLoading}
              tenantId={tenant?.id || ""}
              onDelete={refetchPrompts}
              onTabChange={setSelectedTab}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              categoryFilter={categoryFilter}
              onCategoryFilter={handleCategoryFilter}
              riskCategories={riskCategories}
              currentPage={currentPage}
              totalPages={totalPages}
              pageLimit={pageLimit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onClearFilter={handleClearFilter}
              totalCount={totalPrompts}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreatePromptDialog
        open={openPromptDialog}
        onOpenChange={setOpenPromptDialog}
        riskCategories={riskCategories}
        tenantId={tenant?.id || ""}
        onSuccess={refetchPrompts}
      />

      <CreateCentroidDialog
        open={openCentroidDialog}
        onOpenChange={setOpenCentroidDialog}
        tenantId={tenant?.id || ""}
        onSuccess={refetchCategories}
      />

      <BulkUploadDialog
        open={openBulkUploadDialog}
        onOpenChange={setOpenBulkUploadDialog}
        tenantId={tenant?.id || ""}
        onSuccess={() => {
          refetchCategories();
          refetchPrompts();
        }}
      />
    </>
  );
}
