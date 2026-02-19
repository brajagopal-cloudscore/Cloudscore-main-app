"use client";

import { useState, useEffect, useTransition, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { getRisksByApplication } from "@/lib/actions/risks";
import { createRisk, updateRisk, deleteRisk } from "@/lib/actions/risks";
import { RiskModal } from "./RiskModal";
import DynamicDetailsViewModal, {
  createFieldConfig,
} from "@/components/modal/DynamicDetailsViewModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { getFormattedDateString } from "@/lib/utils/helpers";
import { getUserNamesFromIds } from "@/lib/utils/userUtils";
import { successToast, errorToast } from "@/lib/utils/toast";
import { usePathname, useRouter } from "next/navigation";

interface RiskListItem {
  id: string;
  riskName: string;
  description?: string | null;
  severity?: string | null;
  likelihood?: string | null;
  createdAt?: string | null;
  category?: string[] | null;
}

interface Risk {
  id: string;
  riskName: string;
  owner: string;
  description: string | null;
  severity: "Minor" | "Moderate" | "Major" | "Catastrophic";
  likelihood: "Rare" | "Unlikely" | "Possible" | "Likely";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  mitigationStatus:
    | "Not Started"
    | "In Progress"
    | "Requires Review"
    | "Completed";
  mitigationPlan: string | null;
  targetDate: string | null;
  lastReviewDate: string | null;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  controlOwner: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  updatedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface RisksModuleProps {
  applicationId: string;
  tenantId: string;
  useCaseId?: string;
}

const getRiskLevelStyle = (level: string) => {
  switch (level) {
    case "Low":
      return "bg-green-500/10 text-green-500 ";
    case "Medium":
      return "bg-yellow-500/10 text-yellow-500";
    case "High":
      return "bg-red-500/10 text-red-500 ";
    default:
      return "bg-gray-500/10 text-gray-500 ";
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Not Started":
      return "bg-muted text-muted-foreground";
    case "In Progress":
      return "bg-blue-500/10 text-blue-500";
    case "Requires Review":
      return "bg-orange-500/10 text-orange-500";
    case "Completed":
      return "bg-green-500/10 text-green-500 ";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function RisksModule({
  applicationId,
  tenantId,
  useCaseId,
}: RisksModuleProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [riskListItems, setRiskListItems] = useState<RiskListItem[]>([]);
  const [isLoadingRiskList, setIsLoadingRiskList] = useState(false);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [enableRiskFromDB, setEnableRiskFromDB] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const fetchRisk = async () => {
    try {
      setIsLoadingRisk(true);
      const risk = await getRisksByApplication(
        tenantId,
        applicationId,
        useCaseId
      );
      setRisks(risk);
    } catch (err) {
    } finally {
      setIsLoadingRisk(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  // Track previous high risk state to prevent infinite loops
  const previousHighRiskRef = useRef<boolean | null>(null);

  useEffect(() => {
    const hasHighRisk = risks.some((risk) => risk.riskLevel === "High");
    // Only call onHighRiskChange if the value actually changed
    if (previousHighRiskRef.current !== hasHighRisk) {
      previousHighRiskRef.current = hasHighRisk;
      // onHighRiskChange(hasHighRisk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risks]);

  // Fetch risk list when component mounts
  useEffect(() => {
    if (enableRiskFromDB) {
      const loadRiskList = async () => {
        setIsLoadingRiskList(true);
        try {
          const { getRiskListItems } = await import("@/lib/actions/risks");
          const riskListItemsData = await getRiskListItems();
          setRiskListItems(riskListItemsData || []);
        } catch (error) {
          console.error("Error loading risk list:", error);
        } finally {
          setIsLoadingRiskList(false);
        }
      };

      loadRiskList();
    }
  }, [enableRiskFromDB]);

  // Fetch user names when risks change
  useEffect(() => {
    const fetchUserNames = async () => {
      const allUserIds: string[] = [];

      // Collect all unique user IDs
      risks.forEach((risk) => {
        if (risk.owner) allUserIds.push(risk.owner);
        if (risk.controlOwner) allUserIds.push(risk.controlOwner);
        if (risk.createdBy) allUserIds.push(risk.createdBy);
        if (risk.updatedBy) allUserIds.push(risk.updatedBy);
      });

      const uniqueUserIds = [...new Set(allUserIds)];

      if (uniqueUserIds.length > 0) {
        const names = await getUserNamesFromIds(uniqueUserIds, tenantId);
        setUserNames(names);
      }
    };

    if (risks.length > 0) {
      fetchUserNames();
    }
  }, [risks, tenantId]);

  // Filter risks based on search
  const filteredRisks = risks.filter((risk) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      risk.riskName.toLowerCase().includes(searchLower) ||
      risk.description?.toLowerCase().includes(searchLower) ||
      risk.owner.toLowerCase().includes(searchLower) ||
      userNames[risk.owner]?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = async (
    data: Partial<Risk> & {
      riskName: string;
      owner: string;
      controlOwner?: string | null;
      severity: Risk["severity"];
      likelihood: Risk["likelihood"];
      riskLevel: Risk["riskLevel"];
      mitigationStatus: Risk["mitigationStatus"];
    }
  ) => {
    startTransition(async () => {
      try {
        const riskData = {
          tenantId,
          applicationId,
          useCaseId,
          riskName: data.riskName,
          description: data.description ?? "",
          owner: data.owner,
          controlOwner: data.controlOwner || null,
          severity: data.severity,
          likelihood: data.likelihood,
          riskLevel: data.riskLevel,
          mitigationStatus: data.mitigationStatus,
          mitigationPlan: data.mitigationPlan,
          targetDate: data.targetDate,
          categories: data.categories || [],
        };
        // @ts-ignore
        const newRisk = await createRisk(riskData);
        const normalizedRisk = {
          ...newRisk,
          description: newRisk.description ?? undefined,
          mitigationPlan: newRisk.mitigationPlan ?? undefined,
          targetDate: newRisk.targetDate ?? undefined,
          lastReviewDate: newRisk.lastReviewDate ?? undefined,
          controlOwner: newRisk.controlOwner ?? null,
          riskLevel: newRisk.riskLevel,
        };
        setRisks((prev) => [normalizedRisk as Risk, ...prev]);
        setIsCreateModalOpen(false);
        successToast("", "", "", "Risk created successfully");
        await fetchRisk();
      } catch (error) {
        errorToast("Failed to create risk");
      }
    });
  };

  const handleUpdate = async (
    data: Partial<Risk> & {
      riskName: string;
      owner: string;
      controlOwner?: string | null;
      severity: Risk["severity"];
      likelihood: Risk["likelihood"];
      riskLevel: Risk["riskLevel"];
      mitigationStatus: Risk["mitigationStatus"];
    }
  ) => {
    if (!selectedRisk) return;

    startTransition(async () => {
      try {
        const riskData = {
          id: selectedRisk.id,
          tenantId,
          applicationId,
          useCaseId,
          riskName: data.riskName,
          description: data.description,
          owner: data.owner,
          controlOwner: data.controlOwner || selectedRisk?.controlOwner || null,
          severity: data.severity,
          likelihood: data.likelihood,
          riskLevel: data.riskLevel,
          mitigationStatus: data.mitigationStatus,
          mitigationPlan: data.mitigationPlan,
          targetDate: data.targetDate,
          categories: data.categories || [],
        };
        // @ts-ignore
        const updated = await updateRisk(riskData);
        const normalizedRisk = {
          ...updated,
          description: updated.description ?? undefined,
          mitigationPlan: updated.mitigationPlan ?? undefined,
          targetDate: updated.targetDate ?? undefined,
          lastReviewDate: updated.lastReviewDate ?? undefined,
          controlOwner: updated.controlOwner ?? null,
          riskLevel: updated.riskLevel,
        };
        setRisks((prev) =>
          prev.map((risk) =>
            risk.id === updated.id ? (normalizedRisk as Risk) : risk
          )
        );
        setIsEditModalOpen(false);
        setSelectedRisk(null);
        successToast("", "", "", "Risk updated successfully");
        await fetchRisk();
      } catch (error) {
        errorToast("Failed to update risk");
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedRisk) return;

    startTransition(async () => {
      try {
        await deleteRisk(selectedRisk.id);
        setRisks((prev) => prev.filter((risk) => risk.id !== selectedRisk.id));
        setIsDeleteModalOpen(false);
        setSelectedRisk(null);
        successToast("", "", "", "Risk deleted successfully");
        await fetchRisk();
      } catch (error) {
        errorToast("Failed to delete risk");
      }
    });
  };

  const handleRiskItemSelect = (riskItem: RiskListItem) => {
    // This will be handled in RiskModal
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-foreground mb-6">Risk</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Create Risk
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-[343px]">
        <Input
          type="search"
          placeholder="Search risks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk Name</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Likelihood</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Control Owner</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingRisk && filteredRisks.length === 0 && (
            <>
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  Loading Risk...
                </TableCell>
              </TableRow>
            </>
          )}
          {!isLoadingRisk && filteredRisks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-12 text-muted-foreground"
              >
                {search
                  ? "No risks found"
                  : "No risks yet. Create one to get started!"}
              </TableCell>
            </TableRow>
          ) : (
            filteredRisks.map((risk) => (
              <TableRow key={risk.id} className="">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2 bg-text-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {risk.riskName}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full border  px-2.5 py-0.5 text-xs font-semibold ${getRiskLevelStyle(risk.riskLevel)}`}
                  >
                    {risk.riskLevel}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/10 text-orange-500"
                  >
                    {risk.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-500"
                  >
                    {risk.likelihood}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(risk.mitigationStatus)}`}
                  >
                    {risk.mitigationStatus}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {userNames[risk.owner] || risk.owner}
                </TableCell>
                <TableCell className="text-sm">
                  {risk.controlOwner
                    ? userNames[risk.controlOwner] || risk.controlOwner
                    : "—"}
                </TableCell>
                <TableCell className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(`${pathname}/${risk.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRisk(risk);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRisk(risk);
                          setIsDeleteModalOpen(true);
                        }}
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

      {/* Modals */}
      <RiskModal
        isOpen={isCreateModalOpen}
        mode="create"
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isPending={isPending}
        tenantId={tenantId}
        riskListItems={riskListItems}
        enableRiskFromDB={enableRiskFromDB}
        onToggleRiskFromDB={() => setEnableRiskFromDB(!enableRiskFromDB)}
        onRiskItemSelect={handleRiskItemSelect}
        isLoadingRiskList={isLoadingRiskList}
      />

      <DynamicDetailsViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRisk(null);
        }}
        data={
          selectedRisk
            ? {
                ...selectedRisk,
                userNames, // Pass userNames mapping to modal
              }
            : null
        }
        title="Risk Details"
        fields={createFieldConfig.risk()}
      />

      <RiskModal
        isOpen={isEditModalOpen}
        mode="edit"
        risk={selectedRisk}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRisk(null);
        }}
        onSubmit={handleUpdate}
        isPending={isPending}
        tenantId={tenantId}
        riskListItems={riskListItems}
        enableRiskFromDB={false}
        isLoadingRiskList={isLoadingRiskList}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRisk(null);
        }}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Are you sure you want to delete this risk?"
        itemName={selectedRisk?.riskName || ""}
        itemType="risk"
      />
    </div>
  );
}
