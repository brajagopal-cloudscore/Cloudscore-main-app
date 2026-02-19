"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import TechnicalDetailsModals from "./Modal";

// Icons
import {
  Info,
  Search,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

// Utils
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AddTechnicalDetail,
  DeleteTechnicalDetail,
  GetAllTechnicalDetails,
  GetTechnicalDetailDetails,
  UpdateTechnicalDetail,
  TechnicalDetail,
} from "@/lib/api/technicalDetails";
import { errorToast, successToast } from "@/lib/utils/toast";
import DynamicDetailsViewModal from "@/components/modal/DynamicDetailsViewModal";

interface TechnicalDetailsPageProps {
  hasTechnicalReadPermission?: boolean;
  hasTechnicalWritePermission?: boolean;
  setComponent?: any;
}

// Constants
const DEFAULT_PAGE_SIZE = 50;
const INITIAL_PAGE = 1;

// Form data interfaces
interface AddTechnicalDetailData {
  sVendor: string;
  sModel: string;
  sHostingLocation: string;
  sModelArchitecture: string;
  sObjectives: string;
  sComputeInfrastructure: string;
  sTrainingDuration: string;
  sModelSize: string;
  sTrainingDataSize: string;
  sInferenceLatency: string;
  sHardwareRequirements: string;
  sSoftware: string;
  sPromptRegistry: string;
}

interface ValidationError {
  sVendor?: string;
  sModel?: string;
  sHostingLocation?: string;
  sModelArchitecture?: string;
  sObjectives?: string;
  sComputeInfrastructure?: string;
  sTrainingDuration?: string;
  sModelSize?: string;
  sTrainingDataSize?: string;
  sInferenceLatency?: string;
  sHardwareRequirements?: string;
  sSoftware?: string;
  sPromptRegistry?: string;
}

const INITIAL_ADD_TECHNICAL_DETAIL_DATA: AddTechnicalDetailData = {
  sVendor: "",
  sModel: "",
  sHostingLocation: "",
  sModelArchitecture: "",
  sObjectives: "",
  sComputeInfrastructure: "",
  sTrainingDuration: "",
  sModelSize: "",
  sTrainingDataSize: "",
  sInferenceLatency: "",
  sHardwareRequirements: "",
  sSoftware: "",
  sPromptRegistry: "",
};

// Field configuration for models info
const createTechnicalDetailFieldConfig = (): any[] => [
  { key: "sVendor", label: "Vendor", type: "text" },
  { key: "sModel", label: "Model", type: "text" },
  { key: "sHostingLocation", label: "Hosting Location", type: "text" },
  { key: "sModelArchitecture", label: "Model Architecture", type: "text" },
  { key: "sObjectives", label: "Objectives", type: "text" },
  {
    key: "sComputeInfrastructure",
    label: "Compute Infrastructure",
    type: "text",
  },
  { key: "sTrainingDuration", label: "Training Duration", type: "text" },
  { key: "sModelSize", label: "Model Size", type: "text" },
  { key: "sTrainingDataSize", label: "Training Data Size", type: "text" },
  { key: "sInferenceLatency", label: "Inference Latency", type: "text" },
  {
    key: "sHardwareRequirements",
    label: "Hardware Requirements",
    type: "text",
  },
  { key: "sSoftware", label: "Software", type: "text" },
];

// Main Component
const ModelsInfoDetailsPage: React.FC<TechnicalDetailsPageProps> = ({
  hasTechnicalReadPermission = true,
  hasTechnicalWritePermission = true,
  setComponent,
}) => {
  const router = useRouter();

  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(INITIAL_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Modal states
  const [openModal, setOpenModal] = useState("");
  const [deleteTechnicalDetailModal, setDeleteTechnicalDetailModal] =
    useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Data states
  const [selectedDetail, setSelectedDetail] = useState<TechnicalDetail | null>(
    null
  );
  const [editTechnicalDetailData, setEditTechnicalDetailData] =
    useState<TechnicalDetail | null>(null);
  const [addTechnicalDetailData, setAddTechnicalDetailData] =
    useState<AddTechnicalDetailData>(INITIAL_ADD_TECHNICAL_DETAIL_DATA);
  const [technicalDetailToDelete, setTechnicalDetailToDelete] = useState<
    string | null
  >(null);
  const [errors, setErrors] = useState<ValidationError>({
    sVendor: "",
    sModel: "",
    sHostingLocation: "",
    sModelArchitecture: "",
    sObjectives: "",
    sComputeInfrastructure: "",
    sTrainingDuration: "",
    sModelSize: "",
    sTrainingDataSize: "",
    sInferenceLatency: "",
    sHardwareRequirements: "",
    sSoftware: "",
    sPromptRegistry: "",
  });

  const debouncedSearch = useDebounce(search, 500);

  // API calls
  const {
    data,
    isLoading,
    refetch: refetchTechnicalDetails,
  } = useQuery({
    queryKey: ["TechnicalDetails", page, pageSize, debouncedSearch],
    queryFn: () =>
      GetAllTechnicalDetails({
        page,
        page_size: pageSize,
        search: debouncedSearch,
      }),
    select: (data) => {
      return {
        technicalDetails: data?.result?.aData || [],
        totalCount: data?.result?.nCount || 0,
        total: data?.result?.nTotal || 0,
        totalPages: Math.ceil((data?.result?.nTotal || 0) / pageSize),
      };
    },
    placeholderData: {
      technicalDetails: [],
      totalCount: 0,
      total: 0,
      totalPages: 1,
    },
  });

  const { mutate: createTechnicalDetail, isPending: isCreatePending } =
    useMutation({
      mutationKey: ["AddTechnicalDetail"],
      mutationFn: AddTechnicalDetail,
      onSuccess: (response) => {
        successToast(response, "", "");
        refetchTechnicalDetails();
      },
      onError: (error) => {
        errorToast(error);
      },
    });

  const { mutate: updateTechnicalDetail, isPending: isUpdatePending } =
    useMutation({
      mutationKey: ["UpdateTechnicalDetail"],
      mutationFn: UpdateTechnicalDetail,
      onSuccess: (response) => {
        successToast(response, "", "");
        refetchTechnicalDetails();
      },
      onError: (error) => {
        errorToast(error);
      },
    });

  const { mutate: deleteTechnicalDetail, isPending: isDeletePending } =
    useMutation({
      mutationKey: ["DeleteTechnicalDetail"],
      mutationFn: DeleteTechnicalDetail,
      onSuccess: (response) => {
        successToast(response, "", "");
        refetchTechnicalDetails();
      },
      onError: (error) => {
        errorToast(error);
      },
    });

  // Get technical detail details mutation
  const { mutate: getTechnicalDetailDetails, isPending: isGetDetailsPending } =
    useMutation({
      mutationKey: ["GetTechnicalDetailDetails"],
      mutationFn: GetTechnicalDetailDetails,
      onSuccess: (response) => {
        setSelectedDetail(response?.result || null);
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

  // Validation
  const validateTechnicalDetailData = (
    data: AddTechnicalDetailData
  ): ValidationError => {
    const newErrors: ValidationError = {};

    if (!data.sHostingLocation.trim())
      newErrors.sHostingLocation = "Hosting location is required";
    if (!data.sModelArchitecture.trim())
      newErrors.sModelArchitecture = "Model architecture is required";
    if (!data.sObjectives.trim())
      newErrors.sObjectives = "Objectives are required";
    if (!data.sComputeInfrastructure.trim())
      newErrors.sComputeInfrastructure = "Compute infrastructure is required";
    if (!data.sTrainingDuration.trim())
      newErrors.sTrainingDuration = "Training duration is required";
    if (!data.sModelSize.trim())
      newErrors.sModelSize = "Model size is required";
    if (!data.sTrainingDataSize.trim())
      newErrors.sTrainingDataSize = "Training data size is required";
    if (!data.sInferenceLatency.trim())
      newErrors.sInferenceLatency = "Inference latency is required";
    if (!data.sHardwareRequirements.trim())
      newErrors.sHardwareRequirements = "Hardware requirements are required";
    if (!data.sSoftware.trim())
      newErrors.sSoftware = "Software details are required";

    return newErrors;
  };

  // Modal handlers
  const handleOpenModal = useCallback((modalType: string) => {
    setOpenModal(modalType);
    setErrors({});
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal("");
    setErrors({});
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteTechnicalDetailModal(false);
    setTechnicalDetailToDelete(null);
  }, []);

  // CRUD Event Handlers
  const handleViewDetail = useCallback(
    (detail: TechnicalDetail) => {
      getTechnicalDetailDetails(detail._id);
    },
    [getTechnicalDetailDetails]
  );

  const handleEditDetail = useCallback(
    (detail: TechnicalDetail) => {
      setEditTechnicalDetailData(detail);
      handleOpenModal("edit technical detail");
    },
    [handleOpenModal]
  );

  const handleDeleteDetail = useCallback((detail: TechnicalDetail) => {
    setTechnicalDetailToDelete(detail._id);
    setDeleteTechnicalDetailModal(true);
  }, []);

  // Create technical detail handlers
  const handleCreateInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setAddTechnicalDetailData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when user starts typing
      if (errors[name as keyof ValidationError]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleCreateSave = useCallback(async () => {
    const validationErrors = validateTechnicalDetailData(
      addTechnicalDetailData
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createTechnicalDetail(addTechnicalDetailData);
      setAddTechnicalDetailData(INITIAL_ADD_TECHNICAL_DETAIL_DATA);
      handleCloseModal();
    } catch (error) {
      console.error("Error creating technical detail:", error);
    }
  }, [addTechnicalDetailData, createTechnicalDetail, handleCloseModal]);

  const handleCreateClose = useCallback(() => {
    setAddTechnicalDetailData(INITIAL_ADD_TECHNICAL_DETAIL_DATA);
    handleCloseModal();
  }, [handleCloseModal]);

  // Edit technical detail handlers
  const handleEditTechnicalDetailChange = useCallback(
    (detail: TechnicalDetail) => {
      setEditTechnicalDetailData(detail);
    },
    []
  );

  const handleEditSave = useCallback(
    async (detail: TechnicalDetail) => {
      const validationErrors = validateTechnicalDetailData({
        sVendor: detail.sVendor || "",
        sModel: detail.sModel || "",
        sHostingLocation: detail.sHostingLocation,
        sModelArchitecture: detail.sModelArchitecture,
        sObjectives: detail.sObjectives,
        sComputeInfrastructure: detail.sComputeInfrastructure,
        sTrainingDuration: detail.sTrainingDuration,
        sModelSize: detail.sModelSize,
        sTrainingDataSize: detail.sTrainingDataSize,
        sInferenceLatency: detail.sInferenceLatency,
        sHardwareRequirements: detail.sHardwareRequirements,
        sSoftware: detail.sSoftware,
        sPromptRegistry: detail.sPromptRegistry || "",
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      try {
        await updateTechnicalDetail({
          TechDetailsId: detail._id,
          ...detail,
          sPromptRegistry: detail.sPromptRegistry || "",
        });
        setEditTechnicalDetailData(null);
        handleCloseModal();
      } catch (error) {
        console.error("Error updating technical detail:", error);
      }
    },
    [updateTechnicalDetail, handleCloseModal, validateTechnicalDetailData]
  );

  const handleEditClose = useCallback(() => {
    setEditTechnicalDetailData(null);
    handleCloseModal();
  }, [handleCloseModal]);

  // Delete technical detail handlers
  const handleDeleteConfirm = useCallback(async () => {
    if (!technicalDetailToDelete) return;

    try {
      await deleteTechnicalDetail(technicalDetailToDelete);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting technical detail:", error);
    }
  }, [deleteTechnicalDetail, handleCloseDeleteModal, technicalDetailToDelete]);

  // Render table row actions
  const renderActions = useCallback(
    (detail: TechnicalDetail) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            disabled={!hasTechnicalReadPermission || isGetDetailsPending}
            onClick={() => handleViewDetail(detail)}
          >
            <Info className="mr-2 h-4 w-4" />
            {isGetDetailsPending ? "Loading..." : "View"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasTechnicalWritePermission}
            onClick={() => handleEditDetail(detail)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <div className="border-t border-gray-200 my-1"></div>
          <DropdownMenuItem
            disabled={!hasTechnicalWritePermission}
            onClick={() => handleDeleteDetail(detail)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [
      hasTechnicalReadPermission,
      hasTechnicalWritePermission,
      handleViewDetail,
      handleEditDetail,
      handleDeleteDetail,
      isGetDetailsPending,
    ]
  );

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Loading models info...</span>
        </div>
      </div>
    );
  }

  // Render loading state
  const renderLoadingState = () => (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>Loading models info...</span>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render empty state
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-12">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-lg font-medium text-gray-500">
            {search ? "No models info found" : "No models info available"}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render table rows
  const renderTableRows = () => {
    if (isLoading) return renderLoadingState();
    if (!data?.technicalDetails?.length) return renderEmptyState();

    return data?.technicalDetails?.map((detail: TechnicalDetail) => (
      <TableRow
        key={detail._id}
        className="h-10 border-b border-[#E4E4E7] last:border-b-0 hover:bg-gray-50"
      >
        <TableCell className="font-sm font-normal font-sans text-[#18181B] max-w-xs">
          <div className="truncate" title={detail.sModelArchitecture}>
            {detail.sModelArchitecture}
          </div>
        </TableCell>
        <TableCell className="font-sm font-normal font-sans text-[#18181B] max-w-xs">
          <div className="truncate" title={detail.sObjectives}>
            {detail.sObjectives}
          </div>
        </TableCell>
        <TableCell className="font-sm font-normal font-sans text-[#18181B] max-w-xs">
          <div className="truncate" title={detail.sModelSize}>
            {detail.sModelSize}
          </div>
        </TableCell>

        <TableCell className="font-sm font-normal font-sans text-[#18181B] max-w-xs">
          <div className="truncate" title={detail.sHostingLocation}>
            {detail.sHostingLocation}
          </div>
        </TableCell>

        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
          {renderActions(detail)}
        </TableCell>
      </TableRow>
    ));
  };

  // Get technical detail to delete name for modal
  const technicalDetailToDeleteData = technicalDetailToDelete
    ? data?.technicalDetails?.find(
        (d: TechnicalDetail) => d._id === technicalDetailToDelete
      )
    : null;

  return (
    <div className="m-4">
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mx-auto space-y-4">
          <div className="mb-6 flex justify-between items-start">
            <h1 className="text-2xl font-bold  mb-2">
              Models Info
            </h1>
          </div>
          {/* Search Input */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search"
                name="models-info-search"
                className="rounded-md w-[343px] h-9 pl-10 border-[#E4E4E7] text-sm font-normal text-[#71717A] focus:border-[#18181B] focus:ring-0 focus:outline-none"
                aria-label="models-info-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            {hasTechnicalWritePermission && (
              <Button
                onClick={() => handleOpenModal("create technical detail")}
                className="h-9 px-4 bg-black text-white hover:bg-black/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            )}
          </div>

          {/* Data Table */}
          <div className="w-full py-2">
            <Table>
              <TableHeader>
                <TableRow className="h-10 border-b border-[#E4E4E7]">
                  <TableHead className="text-[#71717A] font-medium">
                    Model Architecture
                  </TableHead>
                  <TableHead className="text-[#71717A] font-medium">
                    Objectives
                  </TableHead>
                  <TableHead className="text-[#71717A] font-medium">
                    Model Size
                  </TableHead>
                  <TableHead className="text-[#71717A] font-medium">
                    Hosting Location
                  </TableHead>
                  <TableHead className="text-[#71717A] font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderTableRows()}</TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data?.technicalDetails?.length > 0 && (
            <div className="sticky bottom-0 bg-white py-2 pt-4 border-t border-[#E4E4E7] z-50">
              <Pagination
                className="ml-64 pl-[15px]"
                pageSize={pageSize}
                setPageSize={setPageSize}
                page={page}
                setPage={setPage}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                totalPages={data?.totalPages || 0}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Models Info Modal */}
      <DynamicDetailsViewModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        data={selectedDetail}
        title="Models Info"
        fields={createTechnicalDetailFieldConfig()}
      />

      {/* Technical Detail CRUD Modals */}
      <TechnicalDetailsModals
        // Modal state
        openModal={openModal}
        // Data
        editTechnicalDetailData={editTechnicalDetailData}
        addTechnicalDetailData={addTechnicalDetailData}
        errors={errors}
        // Loading states
        isEditPending={isUpdatePending}
        isCreatePending={isCreatePending}
        // Event handlers
        onEditClose={handleEditClose}
        onCreateClose={handleCreateClose}
        onEditSave={handleEditSave}
        onCreateSave={handleCreateSave}
        onEditTechnicalDetailChange={handleEditTechnicalDetailChange}
        onCreateInputChange={handleCreateInputChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTechnicalDetailModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletePending}
        title="Are you sure you want to delete this technical detail?"
        itemName={technicalDetailToDeleteData?.sModelArchitecture}
        itemType="technical detail"
      />
    </div>
  );
};

export default ModelsInfoDetailsPage;
