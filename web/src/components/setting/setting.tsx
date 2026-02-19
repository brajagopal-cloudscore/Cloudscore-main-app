"use client";
import { type FC, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import Pagination from "@/components/common/pagination";

// Icons
import { IoShareSocial } from "react-icons/io5";
import { MoreHorizontal, Search, Loader2, Pencil, Trash2 } from "lucide-react";

// API & Utilities
import { useDebounce } from "@/hooks/useDebounce";
import { successToast, errorToast } from "@/lib/utils/toast";
import { useTenant } from "@/contexts/TenantContext";
// Types
interface Member {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  permissions: string;
}

interface PolicyPack {
  icon: string | null;
  name: string;
  type: string | null;
  id: string;
  color: string | null;
  metadata: unknown;
  description: string | null;
  isActive: boolean;
  tenantId: string | null;
  category: string | null;
  tags: string[] | null;
  country: string | null;
  projectsCompliant: number;
  totalProjects: number;
  state: string | null;
  parentPolicyId: string | null;
  disable: boolean;
}

interface SettingsProps {
  hasWorkspaceDetailsReadPermission: boolean;
  hasWorkspaceDetailsWritePermission: boolean;
  workspaceDetails: {
    created_by?: {
      username?: string;
    };
  };
}

// Constants
const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_DELAY = 1000;

// Utility Functions
const formatPermissionText = (permission: string): string => {
  return permission === "readonly"
    ? "View"
    : permission.charAt(0).toUpperCase() + permission.slice(1);
};

const isWorkspaceCreator = (
  userName: string,
  workspaceDetails: any
): boolean => {
  return (
    workspaceDetails?.created_by?.username?.toLowerCase() ===
    userName.toLowerCase()
  );
};

const canShowMemberActions = (
  member: Member,
  userProfile: any,
  workspaceDetails: any,
  hasWritePermission: boolean
): boolean => {
  return (
    hasWritePermission &&
    member.user_email !== userProfile?.email &&
    member.user_role !== "Admin" &&
    !isWorkspaceCreator(member.user_name, workspaceDetails)
  );
};

// Components
const SearchInput: FC<{ value: string; onChange: (value: string) => void }> = ({
  value,
  onChange,
}) => (
  <div className="relative">
    <Input
      type="search"
      placeholder="Search"
      className="rounded-md w-[343px] h-[36px] pl-10 border-[#E4E4E7] text-sm font-normal text-[#71717A] focus:border-[#18181B] focus:ring-0 focus:outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <Search
      size={16}
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    />
  </div>
);

const ShareButton: FC<{
  onClick: () => void;
  isLoading: boolean;
  hasWritePermission: boolean;
}> = ({ onClick, isLoading, hasWritePermission }) => {
  if (!hasWritePermission) return null;

  return (
    <Button
      onClick={onClick}
      className="bg-[#18181B] text-white hover:bg-black/90 rounded-md px-3 py-2 flex items-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IoShareSocial className="h-4 w-4" />
      )}
      <span className="text-sm font-sans leading-normal font-medium">
        Share Application
      </span>
    </Button>
  );
};

const ActionDropdown: FC<{
  member: Member;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}> = ({ isOpen, onOpenChange, onEdit, onDelete, isDeleting }) => (
  <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4 text-default-400" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="bg-white border w-[120px] border-[#E4E4E7] rounded-md shadow-md"
    >
      <DropdownMenuItem className="flex items-center  text-sm">
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </DropdownMenuItem>
      <Separator />
      <DropdownMenuItem
        className="flex items-center text-red-500 text-sm"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </>
        )}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const TableContent: FC<{
  members: Member[];
  userProfile: any;
  workspaceDetails: any;
  hasWritePermission: boolean;
  openDropdownId: string | null;
  onDropdownOpenChange: (open: boolean, memberId: string) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  isDeleting: boolean;
  isLoading: boolean;
}> = ({
  members,
  userProfile,
  workspaceDetails,
  hasWritePermission,
  openDropdownId,
  onDropdownOpenChange,
  onEditMember,
  onDeleteMember,
  isDeleting,
  isLoading,
}) => {
  const colSpan = hasWritePermission ? 4 : 3;

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center py-12">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
            <span>Loading...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (!members?.length) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center py-12">
          <p className="text-lg font-medium text-gray-500">No data available</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {members.map((member) => {
        const showActions = canShowMemberActions(
          member,
          userProfile,
          workspaceDetails,
          hasWritePermission
        );

        return (
          <TableRow
            key={member.id}
            className="h-10 border-b border-[#E4E4E7] last:border-b-0 hover:bg-gray-50"
          >
            <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
              {member.user_name}
            </TableCell>
            <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
              {formatPermissionText(member.permissions)}
            </TableCell>
            <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
              {member.user_email}
            </TableCell>
            {hasWritePermission && (
              <TableCell>
                {showActions && (
                  <ActionDropdown
                    member={member}
                    isOpen={openDropdownId === member.id}
                    onOpenChange={(open) =>
                      onDropdownOpenChange(open, member.id)
                    }
                    onEdit={() => onEditMember(member)}
                    onDelete={() => onDeleteMember(member.id)}
                    isDeleting={isDeleting}
                  />
                )}
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </>
  );
};

// Main Component
const Settings: FC<SettingsProps> = ({
  hasWorkspaceDetailsReadPermission,
  hasWorkspaceDetailsWritePermission,
  workspaceDetails,
}) => {
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const [selectedPolicies, setSelectedPolicies] = useState<PolicyPack[]>([]);
  const { refreshApplicationPolicyStatus, applicationPolicy: policiesData } =
    useTenant();

  useEffect(() => {
    if (policiesData) {
      // Display only these three specific policies by name
      const allowedPolicyNames = [
        "EU AI Act (Regulation 2024/1689)",
        "ISO/IEC 42001",
        "NIST AI Risk Management Framework",
      ];
      const filteredPolicies = policiesData.filter((p) =>
        allowedPolicyNames.includes(p.name)
      );
      setSelectedPolicies(filteredPolicies);
    }
  }, [policiesData]);

  const { tenant, applicationId } = useParams();

  const handleTogglePolicyStatus = async (policyId: string) => {
    const policy = selectedPolicies.find((p) => p.id === policyId);
    if (!policy) return;

    // Validate params are strings
    if (
      !tenant ||
      !applicationId ||
      Array.isArray(tenant) ||
      Array.isArray(applicationId)
    ) {
      errorToast("Invalid tenant or application ID");
      return;
    }

    if (!policy.parentPolicyId) {
      errorToast("Policy ID is missing");
      return;
    }

    const isCurrentlyActive = policy.isActive;
    const newActiveState = !isCurrentlyActive;

    // Optimistically update UI
    setSelectedPolicies((prevPolicies) =>
      prevPolicies.map((p) =>
        p.id === policyId ? { ...p, isActive: newActiveState } : p
      )
    );

    try {
      // Update in database
      const { updateApplicationCompliancePolicy } = await import(
        "@/lib/api/compliance-policies"
      );
      const result = await updateApplicationCompliancePolicy(
        tenant,
        applicationId,
        policy.parentPolicyId,
        newActiveState
      );

      if (!result.success) {
        // Revert on error
        setSelectedPolicies((prevPolicies) =>
          prevPolicies.map((p) =>
            p.id === policyId ? { ...p, isActive: isCurrentlyActive } : p
          )
        );
        errorToast("Failed to update policy status");
        return;
      }
      refreshApplicationPolicyStatus();
      successToast(
        `Policy ${newActiveState ? "enabled" : "disabled"} successfully`,
        "Policy",
        "updated"
      );
    } catch (error) {
      // Revert on error
      setSelectedPolicies((prevPolicies) =>
        prevPolicies.map((p) =>
          p.id === policyId ? { ...p, isActive: isCurrentlyActive } : p
        )
      );
      errorToast("Error updating policy status");
    }
  };

  const renderPolicyCard = (policy: PolicyPack) => {
    const compliancePercentage = Math.round(
      (policy.projectsCompliant / policy.totalProjects) * 100
    );

    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardContent className="min-h-32">
          <div className="flex items-start justify-between  ">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`w-8 h-8 rounded-full ${policy.color} flex items-center justify-center  text-sm font-semibold shrink-0`}
              >
                {policy.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold  text-sm leading-tight mb-1 line-clamp-2">
                  {policy.name}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-2">
                  {policy.description}
                </p>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-muted text-muted-foreground"
                  >
                    {policy.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 border text-muted-foreground"
                  >
                    {policy.country}
                    {policy.state ? `, ${policy.state}` : ""}
                  </Badge>
                  {policy.type && (
                    <Badge
                      className={cn(
                        "text-xs px-2 py-0.5 font-medium border",
                        policy.type === "Mandatory"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-500 "
                      )}
                    >
                      {policy.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-between pt-2 border-t mt-auto">
            <span className="text-xs font-medium text-muted-foreground">
              Policy Status
            </span>
            <Switch
              checked={policy.isActive}
              onCheckedChange={() => handleTogglePolicyStatus(policy.id)}
              disabled={!hasWorkspaceDetailsWritePermission}
              className=""
            />
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Early return if no read permission
  if (!hasWorkspaceDetailsReadPermission) return null;

  return (
    <div className="w-full space-y-6">
      {/* Policy Management Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold  mb-2">Policy Management</h2>
          <p className="text-muted-foreground text-sm">
            Control which compliance frameworks are enforced across your app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPolicies.map(renderPolicyCard)}
        </div>
      </div>
    </div>
  );
};

export default Settings;
