"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Info,
} from "lucide-react";
import {
  createApplicationModel,
  updateApplicationModel,
  deleteApplicationModel,
} from "@/lib/actions/application-models";
import { ModelInfoModal } from "./ModelInfoModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import DynamicDetailsViewModal from "@/components/modal/DynamicDetailsViewModal";

interface ApplicationModel {
  id: string;
  vendor?: string | null;
  model?: string | null;
  hostingLocation: string;
  modelArchitecture: string;
  objectives: string;
  computeInfrastructure: string;
  trainingDuration: string;
  modelSize: string;
  trainingDataSize: string;
  inferenceLatency: string;
  hardwareRequirements: string;
  software: string;
  promptRegistry?: string | null;
}

interface Props {
  initialModels: ApplicationModel[];
  applicationId: string;
  tenantId: string;
  userId: string;
}

export function ModelsInfoList({
  initialModels,
  applicationId,
  tenantId,
  userId,
}: Props) {
  const [models, setModels] = useState(initialModels);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ApplicationModel | null>(
    null
  );

  const filteredModels = models.filter(
    (m) =>
      m.model?.toLowerCase().includes(search.toLowerCase()) ||
      m.vendor?.toLowerCase().includes(search.toLowerCase()) ||
      m.modelArchitecture.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    startTransition(async () => {
      try {
        const newModel = await createApplicationModel({
          tenantId,
          applicationId,
          ...data,
        });
        setModels((prev) => [newModel as any, ...prev]);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to create model:", error);
        throw error;
      }
    });
  };

  const handleUpdate = async (data: any) => {
    if (!selectedModel) return;

    startTransition(async () => {
      try {
        const updated = await updateApplicationModel(selectedModel.id, data);
        setModels((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
        );
        setIsModalOpen(false);
        setSelectedModel(null);
      } catch (error) {
        console.error("Failed to update model:", error);
        throw error;
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedModel) return;

    startTransition(async () => {
      try {
        await deleteApplicationModel(selectedModel.id);
        setModels((prev) => prev.filter((m) => m.id !== selectedModel.id));
        setIsDeleteModalOpen(false);
        setSelectedModel(null);
      } catch (error) {
        console.error("Failed to delete model:", error);
        throw error;
      }
    });
  };

  const handleViewDetail = (model: ApplicationModel) => {
    setSelectedModel(model);
    setIsDetailsModalOpen(true);
  };

  // Field configuration for models info view
  const createModelFieldConfig = () => [
    { key: "vendor", label: "Vendor", type: "text" as const },
    { key: "model", label: "Model", type: "text" as const },
    {
      key: "hostingLocation",
      label: "Hosting Location",
      type: "text" as const,
    },
    {
      key: "modelArchitecture",
      label: "Model Architecture",
      type: "text" as const,
    },
    { key: "objectives", label: "Objectives", type: "textarea" as const },
    {
      key: "computeInfrastructure",
      label: "Compute Infrastructure",
      type: "textarea" as const,
    },
    {
      key: "trainingDuration",
      label: "Training Duration",
      type: "text" as const,
    },
    { key: "modelSize", label: "Model Size", type: "text" as const },
    {
      key: "trainingDataSize",
      label: "Training Data Size",
      type: "text" as const,
    },
    {
      key: "inferenceLatency",
      label: "Inference Latency",
      type: "text" as const,
    },
    {
      key: "hardwareRequirements",
      label: "Hardware Requirements",
      type: "textarea" as const,
    },
    { key: "software", label: "Software", type: "text" as const },
    { key: "promptRegistry", label: "Prompt Registry", type: "text" as const },
  ];

  // Render table row actions
  const renderActions = (model: ApplicationModel) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => handleViewDetail(model)}>
          <Info className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSelectedModel(model);
            setIsModalOpen(true);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
       
        <DropdownMenuItem
          onClick={() => {
            setSelectedModel(model);
            setIsDeleteModalOpen(true);
          }}
          className="text-red-500 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mx-auto space-y-4">
          <div className="mb-6 flex justify-between items-start">
            <h1 className="text-2xl font-bold mb-2">Models Info</h1>
          </div>
          {/* Search Input */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search"
                name="models-info-search"
                className="rounded-md w-[343px] h-9 pl-10  text-sm font-normal  focus:ring-0 focus:outline-none"
                aria-label="models-info-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
            </div>
            <Button
              onClick={() => {
                setSelectedModel(null);
                setIsModalOpen(true);
              }}
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          {/* Data Table */}
          <div className="w-full py-2">
            <Table>
              <TableHeader>
                <TableRow className="h-10 border-b border-muted">
                  <TableHead>Model</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Objectives
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Model Size
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Hosting Location
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-lg font-medium text-muted-foreground">
                          {search
                            ? "No models info found"
                            : "No models info available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModels.map((model) => (
                    <TableRow
                      key={model.id}
                      className="h-10 border-b  last:border-b-0 "
                    >
                      <TableCell className="font-medium">
                        {model.model || "-"}
                      </TableCell>
                      <TableCell>{model.vendor || "-"}</TableCell>
                      <TableCell className="font-sm font-normal font-sans  max-w-xs">
                        <div className="truncate" title={model.objectives}>
                          {model.objectives}
                        </div>
                      </TableCell>
                      <TableCell className="font-sm font-normal font-sans  max-w-xs">
                        <div className="truncate" title={model.modelSize}>
                          {model.modelSize}
                        </div>
                      </TableCell>
                      <TableCell className="font-sm font-normal font-sans  max-w-xs">
                        <div className="truncate" title={model.hostingLocation}>
                          {model.hostingLocation}
                        </div>
                      </TableCell>
                      <TableCell className="font-sm font-normal font-sans ">
                        {renderActions(model)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Models Info View Modal */}
      <DynamicDetailsViewModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        data={selectedModel}
        title="Models Info"
        fields={createModelFieldConfig()}
      />

      {/* Modals */}
      <ModelInfoModal
        isOpen={isModalOpen}
        mode={selectedModel ? "edit" : "create"}
        model={selectedModel}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedModel(null);
        }}
        onSubmit={selectedModel ? handleUpdate : handleCreate}
        isPending={isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedModel(null);
        }}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Delete Model"
        itemName={
          selectedModel?.model || selectedModel?.modelArchitecture || ""
        }
        itemType="model"
      />
    </>
  );
}
