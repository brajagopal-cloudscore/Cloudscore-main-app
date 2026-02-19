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
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import {
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
} from "@/lib/actions/stakeholders";
import { StakeholderModal } from "./StakeholderModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import DynamicDetailsViewModal, {
  createFieldConfig,
} from "@/components/modal/DynamicDetailsViewModal";

interface Stakeholder {
  id: string;
  userName: string;
  role: string;
  email?: string | null;
  department?: string | null;
  responsibilities?: string | null;
}

interface ClerkUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface Props {
  initialStakeholders: Stakeholder[];
  applicationId: string;
  tenantId: string;
  userId: string;
}

export function StakeholdersList({
  initialStakeholders,
  applicationId,
  tenantId,
  userId,
}: Props) {
  const [stakeholders, setStakeholders] = useState(initialStakeholders);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] =
    useState<Stakeholder | null>(null);

  const filteredStakeholders = stakeholders.filter(
    (s) =>
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    startTransition(async () => {
      try {
        const newStakeholder = await createStakeholder({
          tenantId,
          applicationId,
          ...data,
        });
        setStakeholders((prev) => [newStakeholder as any, ...prev]);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to create stakeholder:", error);
        throw error;
      }
    });
  };

  const handleUpdate = async (data: any) => {
    if (!selectedStakeholder) return;

    startTransition(async () => {
      try {
        const updated = await updateStakeholder(selectedStakeholder.id, data);
        setStakeholders((prev) =>
          prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
        );
        setIsModalOpen(false);
        setSelectedStakeholder(null);
      } catch (error) {
        console.error("Failed to update stakeholder:", error);
        throw error;
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedStakeholder) return;

    startTransition(async () => {
      try {
        await deleteStakeholder(selectedStakeholder.id);
        setStakeholders((prev) =>
          prev.filter((s) => s.id !== selectedStakeholder.id)
        );
        setIsDeleteModalOpen(false);
        setSelectedStakeholder(null);
      } catch (error) {
        console.error("Failed to delete stakeholder:", error);
        throw error;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold ">Stakeholders</h1>
          <p className="text-muted-foreground">
            Manage stakeholders in this application
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedStakeholder(null);
            setIsModalOpen(true);
          }}
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stakeholder
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-[343px]">
        <Input
          type="search"
          placeholder="Search stakeholders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-9"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Table */}
      <div className="">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Responsibilities</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStakeholders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  {search
                    ? "No stakeholders found"
                    : "No stakeholders yet. Add one to get started!"}
                </TableCell>
              </TableRow>
            ) : (
              filteredStakeholders.map((stakeholder) => (
                <TableRow
                  key={stakeholder.id}
                  className=" border-b last:border-b-0"
                >
                  <TableCell className="font-medium">
                    {stakeholder.userName}
                  </TableCell>
                  <TableCell>{stakeholder.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stakeholder.email || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stakeholder.department || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {stakeholder.responsibilities || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStakeholder(stakeholder);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStakeholder(stakeholder);
                            setIsModalOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStakeholder(stakeholder);
                            setIsDeleteModalOpen(true);
                          }}
                          className=""
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <StakeholderModal
        isOpen={isModalOpen}
        mode={selectedStakeholder ? "edit" : "create"}
        stakeholder={selectedStakeholder}
        tenantId={tenantId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStakeholder(null);
        }}
        onSubmit={selectedStakeholder ? handleUpdate : handleCreate}
        isPending={isPending}
      />

      <DynamicDetailsViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStakeholder(null);
        }}
        data={selectedStakeholder}
        title="Stakeholder Details"
        fields={createFieldConfig.stakeholder()}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStakeholder(null);
        }}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Delete Stakeholder"
        itemName={selectedStakeholder?.userName || ""}
        itemType="stakeholder"
      />
    </div>
  );
}
