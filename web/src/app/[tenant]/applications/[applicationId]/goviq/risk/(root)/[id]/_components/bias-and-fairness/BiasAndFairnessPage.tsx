"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Custom Components
import Pagination from "@/components/common/pagination";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import ValidateFairnessModal from "./ValidateFairnessModal";

// Icons
import {
  Info,
  Search,
  MoreHorizontal,
  Plus,
  Trash2,
  Shield,
} from "lucide-react";

// Utils
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import DynamicDetailsViewModal from "@/components/modal/DynamicDetailsViewModal";

interface BiasAndFairnessPageProps {
  hasBiasReadPermission?: boolean;
  hasBiasWritePermission?: boolean;
  setComponent?: any;
}

// Constants
const DEFAULT_PAGE_SIZE = 50;
const INITIAL_PAGE = 1;

// Form data interfaces - matching the image fields
interface FairnessValidationData {
  modelFile: File | null;
  datasetFile: File | null;
  targetColumn: string;
  sensitiveColumn: string;
}

interface ValidationError {
  modelFile?: string;
  datasetFile?: string;
  targetColumn?: string;
  sensitiveColumn?: string;
}

interface FairnessCheck {
  _id: string;
  sCheckId: string;
  sModel: string;
  sStatus: string;
  dCreatedAt?: string;
  dUpdatedAt?: string;
}

const INITIAL_VALIDATION_DATA: FairnessValidationData = {
  modelFile: null,
  datasetFile: null,
  targetColumn: "",
  sensitiveColumn: "",
};

// Dummy API functions
const GetAllFairnessChecks = async ({
  page,
  page_size,
  search,
}: {
  page: number;
  page_size: number;
  search: string;
}) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockData: FairnessCheck[] = [
    {
      _id: "1",
      sCheckId: "FC001",
      sModel: "Credit Scoring Model v2.1",
      sStatus: "Completed",
      dCreatedAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "2",
      sCheckId: "FC002",
      sModel: "Hiring Algorithm v1.5",
      sStatus: "In Progress",
      dCreatedAt: "2024-01-14T14:20:00Z",
    },
    {
      _id: "3",
      sCheckId: "FC003",
      sModel: "Loan Approval System",
      sStatus: "Pending",
      dCreatedAt: "2024-01-13T09:15:00Z",
    },
  ];

  // Filter by search if provided
  const filteredData = search
    ? mockData.filter(
        (item) =>
          item.sCheckId.toLowerCase().includes(search.toLowerCase()) ||
          item.sModel.toLowerCase().includes(search.toLowerCase())
      )
    : mockData;

  // Simulate pagination
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + page_size;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    result: {
      aData: paginatedData,
      nCount: paginatedData.length,
      nTotal: filteredData.length,
    },
  };
};

const GetFairnessCheckDetails = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockDetail = {
    _id: id,
    sCheckId: "FC001",
    sModel: "Credit Scoring Model v2.1",
    sStatus: "Completed",
    dCreatedAt: "2024-01-15T10:30:00Z",
    dUpdatedAt: "2024-01-16T15:45:00Z",
  };

  return { result: mockDetail };
};

const DeleteFairnessCheck = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log("Deleting fairness check:", id);
  return { message: "Fairness check deleted successfully" };
};

// Toast functions (dummy implementations)
const successToast = (response: any, title: string, description: string) => {
  console.log(
    "Success:",
    response.message || "Operation completed successfully"
  );
};

const errorToast = (error: any) => {
  console.error("Error:", error.message || "An error occurred");
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "in progress":
      return "bg-blue-500/10 text-blue-500";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
    case "failed":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
};

// Field configuration for fairness checks
const createFairnessCheckFieldConfig = (): any[] => [
  { key: "sCheckId", label: "Check ID", type: "text" },
  { key: "sModel", label: "Model", type: "text" },
  { key: "sStatus", label: "Status", type: "text" },
];

// Main Component
const BiasAndFairnessPage: React.FC<BiasAndFairnessPageProps> = ({
  hasBiasReadPermission = true,
  hasBiasWritePermission = true,
  setComponent,
}) => {
  const router = useRouter();

  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(INITIAL_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Modal states
  const [deleteFairnessModal, setDeleteFairnessModal] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isValidateFairnessModalOpen, setIsValidateFairnessModalOpen] =
    useState(false);

  // Data states
  const [selectedFairnessCheck, setSelectedFairnessCheck] =
    useState<FairnessCheck | null>(null);
  const [fairnessToDelete, setFairnessToDelete] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  // API calls
  const {
    data,
    isLoading,
    refetch: refetchFairnessChecks,
  } = useQuery({
    queryKey: ["FairnessChecks", page, pageSize, debouncedSearch],
    queryFn: () =>
      GetAllFairnessChecks({
        page,
        page_size: pageSize,
        search: debouncedSearch,
      }),
    select: (data) => {
      return {
        fairnessChecks: data?.result?.aData || [],
        totalCount: data?.result?.nCount || 0,
        total: data?.result?.nTotal || 0,
        totalPages: Math.ceil((data?.result?.nTotal || 0) / pageSize),
      };
    },
  });

  const { mutate: deleteFairnessCheck, isPending: isDeletePending } =
    useMutation({
      mutationKey: ["DeleteFairnessCheck"],
      mutationFn: DeleteFairnessCheck,
      onSuccess: (response) => {
        successToast(response, "", "");
        refetchFairnessChecks();
      },
      onError: (error) => {
        errorToast(error);
      },
    });

  // Get fairness check details mutation
  const { mutate: getFairnessCheckDetails, isPending: isGetDetailsPending } =
    useMutation({
      mutationKey: ["GetFairnessCheckDetails"],
      mutationFn: GetFairnessCheckDetails,
      onSuccess: (response) => {
        setSelectedFairnessCheck(response?.result || null);
        setIsDetailsModalOpen(true);
      },
      onError: (error) => {
        errorToast(error);
      },
    });

  // Reset to first page when search changes
  useEffect(() => {
    setPage(INITIAL_PAGE);
  }, [debouncedSearch]);

  // Modal handlers
  const handleCloseDeleteModal = useCallback(() => {
    setDeleteFairnessModal(false);
    setFairnessToDelete(null);
  }, []);

  // CRUD Event Handlers
  const handleViewFairnessCheck = useCallback(
    (fairnessCheck: FairnessCheck) => {
      getFairnessCheckDetails(fairnessCheck._id);
    },
    [getFairnessCheckDetails]
  );

  const handleDeleteFairnessCheck = useCallback(
    (fairnessCheck: FairnessCheck) => {
      setFairnessToDelete(fairnessCheck._id);
      setDeleteFairnessModal(true);
    },
    []
  );

  // Delete fairness check handlers
  const handleDeleteConfirm = useCallback(async () => {
    if (!fairnessToDelete) return;

    try {
      await deleteFairnessCheck(fairnessToDelete);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting fairness check:", error);
    }
  }, [deleteFairnessCheck, handleCloseDeleteModal, fairnessToDelete]);

  // Validate Fairness handlers
  const handleValidateFairness = useCallback(() => {
    setIsValidateFairnessModalOpen(true);
  }, []);

  const handleValidateFairnessClose = useCallback(() => {
    setIsValidateFairnessModalOpen(false);
  }, []);

  const handleValidateFairnessSubmit = useCallback(
    async (validationData: FairnessValidationData) => {
      // This would be called from the ValidateFairnessModal
      console.log("Submitting fairness validation:", validationData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh the list after successful validation
      refetchFairnessChecks();
      setIsValidateFairnessModalOpen(false);
    },
    [refetchFairnessChecks]
  );

  // Render table row actions
  const renderActions = useCallback(
    (fairnessCheck: FairnessCheck) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 gap-2">
          <DropdownMenuItem
            disabled={!hasBiasReadPermission || isGetDetailsPending}
            onClick={() => handleViewFairnessCheck(fairnessCheck)}
          >
            <Info className="mr-2 h-4 w-4" />
            {isGetDetailsPending ? "Loading..." : "View"}
          </DropdownMenuItem>
          <div className="border-t"></div>
          <DropdownMenuItem
            disabled={!hasBiasWritePermission}
            onClick={() => handleDeleteFairnessCheck(fairnessCheck)}
            className="text-red-500 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-500  stroke-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [
      hasBiasReadPermission,
      hasBiasWritePermission,
      handleViewFairnessCheck,
      handleDeleteFairnessCheck,
      isGetDetailsPending,
    ]
  );

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted"></div>
          <span>Loading bias and fairness checks...</span>
        </div>
      </div>
    );
  }

  // Render loading state
  const renderLoadingState = () => (
    <TableRow>
      <TableCell colSpan={4} className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted"></div>
          <span>Loading bias and fairness checks...</span>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render empty state
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={4} className="text-center py-12">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-lg font-medium text-muted-foreground">
            {search
              ? "No fairness checks found"
              : "No fairness checks available"}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render table rows
  const renderTableRows = () => {
    if (isLoading) return renderLoadingState();
    if (!data?.fairnessChecks?.length) return renderEmptyState();

    return data?.fairnessChecks?.map((fairnessCheck: FairnessCheck) => (
      <TableRow key={fairnessCheck._id} className="h-10">
        <TableCell className="font-sm font-normal font-sans ">
          {fairnessCheck.sCheckId}
        </TableCell>
        <TableCell className="font-sm font-normal font-sans  max-w-md">
          <div className="truncate" title={fairnessCheck.sModel}>
            {fairnessCheck.sModel}
          </div>
        </TableCell>
        <TableCell className="font-sm font-normal font-sans ">
          <StatusBadge status={fairnessCheck.sStatus} />
        </TableCell>
        <TableCell className="font-sm font-normal font-sans ">
          {renderActions(fairnessCheck)}
        </TableCell>
      </TableRow>
    ));
  };

  // Get fairness check to delete name for modal
  const fairnessToDeleteData = fairnessToDelete
    ? data?.fairnessChecks?.find(
        (f: FairnessCheck) => f._id === fairnessToDelete
      )
    : null;

  return (
    <div className="m-4">
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mx-auto space-y-4">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold  mb-2">Bias & fairness</h1>
              <p className="text-sm text-muted-foreground">
                This data shows bias and fairness assessment metrics for your
                models
              </p>
            </div>
          </div>

          {/* Fairness checks section */}
          <div>
            {/* Search Input */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search"
                  name="fairness-search"
                  className="rounded-md w-[343px] h-9 pl-10  text-sm font-normal focus:ring-0 focus:outline-none"
                  aria-label="fairness-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
              </div>
              {hasBiasWritePermission && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleValidateFairness}
                    className="items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Validate fairness
                  </Button>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="w-full py-2">
              <Table>
                <TableHeader>
                  <TableRow className="">
                    <TableHead className="text-muted-foreground font-medium">
                      Check ID
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Model
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {/* {data && data?.fairnessChecks?.length > 0 && (
              <div className="sticky bottom-0 bg-white py-2 pt-4 border-t border-[#E4E4E7] z-50">
                <Pagination
                  className="ml-[256px] pl-[15px]"
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  page={page}
                  setPage={setPage}
                  nextPage={page < (data?.totalPages || 0) ? page + 1 : null}
                  prevPage={page > 1 ? page - 1 : null}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  totalPages={data?.totalPages || 0}
                  isLoading={isLoading}
                />
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Fairness Check Details Modal */}
      <DynamicDetailsViewModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        data={selectedFairnessCheck}
        title="Bias and Fairness Check Details"
        fields={createFairnessCheckFieldConfig()}
      />

      {/* Validate Fairness Modal - matches image exactly */}
      <ValidateFairnessModal
        isOpen={isValidateFairnessModalOpen}
        onClose={handleValidateFairnessClose}
        onSubmit={handleValidateFairnessSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteFairnessModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletePending}
        title="Are you sure you want to delete this fairness check?"
        itemName={fairnessToDeleteData?.sCheckId || ""}
        itemType="fairness check"
      />
    </div>
  );
};

export default BiasAndFairnessPage;
