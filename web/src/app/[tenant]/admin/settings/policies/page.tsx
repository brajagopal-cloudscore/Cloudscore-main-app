"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import React, { useEffect, useState } from "react";
// Removed Navbar import - using static layout instead
// Removed API imports - using static data instead
// Removed Policy type import - using inline type instead
import { successToast, errorToast } from "@/lib/utils/toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Removed permission check - using static behavior instead
// Removed useSearchStore import - using static behavior instead
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, RotateCw } from "lucide-react";

// Inline Policy interface
interface Policy {
  id: string;
  policy_name: string;
  policy_description: string;
  created_at: string;
  terms_and_conditions: string | null;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
}

interface DataTableProps<TData> {
  data: TData[];
  isListLoading: boolean;
}

const OrganizationPolicies = () => {
  // Removed API calls - using static data instead
  // Removed userProfile - using static behavior instead
  const [open, setOpen] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
  });

  // const {
  //   data: allPolicies,
  //   refetch: refetchAllPolicies,
  //   isLoading,
  //   isFetching
  // } = useQuery({
  //   queryKey: ['allPolicies'],
  //   queryFn: GetPolicies,
  //   select: (policiesResponse: any) => {
  //     if (policiesResponse?.data) {
  //       return policiesResponse?.data;
  //     }
  //     return [];
  //   },
  //   placeholderData: () => [],
  // });

  const allPolicies: any = [
    {
      id: "5de2977c-f2d7-4c17-b54f-5c370cfdc5bc",
      policy_name: "Custom Terms of Services",
      policy_description:
        "Enable this policy to define and enforce custom terms of service for platform usage",
      created_at: "2024-07-02T17:44:17.229106Z",
      terms_and_conditions: "yet to add",
      updated_at: "2025-04-21T15:07:13.844957Z",
      is_active: true,
      is_deleted: false,
    },
    {
      id: "5c9c0fae-4281-40eb-ad2d-6c3edf33d0d3",
      policy_name: "Guest access: (coming soon)",
      policy_description:
        "Enable this policy to allow guest access (coming soon)",
      created_at: "2024-07-02T17:42:44.018843Z",
      terms_and_conditions: null,
      updated_at: "2024-09-01T17:55:48.474650Z",
      is_active: true,
      is_deleted: false,
    },
    {
      id: "bcdad99e-06e0-47c5-a446-2b12ad406484",
      policy_name: "Project Deletion",
      policy_description:
        "Enable this policy to grant users permission to delete workspace data",
      created_at: "2024-07-02T17:43:49.413711Z",
      terms_and_conditions: null,
      updated_at: "2025-06-16T21:50:57.821190Z",
      is_active: true,
      is_deleted: false,
    },
  ];

  // Static behavior for editing policies
  const editPolicy = (data: any) => {
    console.log("Edit policy called with:", data);
    // Simulate success
    successToast(null, "Policy", "updated successfully");
  };
  const isSaving = false;

  // Removed useEffect - no longer needed with static data

  const handleUpdatePolicyStatus = async (policy: Policy) => {
    editPolicy({ id: policy.id, is_active: !policy.is_active });
  };

  const handleEditClick = (policy: Policy) => {
    setCurrentPolicy(policy);
    setFormValues({
      name: policy.policy_name || "",
      description: policy.policy_description || "",
    });
    setOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id === "name" ? "name" : "description"]: value,
    }));
  };

  const handleSaveChanges = () => {
    if (currentPolicy) {
      editPolicy({
        id: currentPolicy.id,
        is_active: currentPolicy.is_active,
        policy_name: formValues.name,
        policy_description: formValues.description,
      });
      setOpen(false);
    }
  };

  // const isLoadingState = isLoading || isFetching;

  function DataTable<TData>({ data, isListLoading }: DataTableProps<TData>) {
    const renderTableBody = () => {
      if (isListLoading) {
        return (
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Loading policies...</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        );
      }

      if (!data.length) {
        return (
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-lg font-medium text-gray-500">
                    No data available
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        );
      }

      return (
        <TableBody className="border-b border-[#E4E4E7] p-0">
          {data.map((policy: any, index: number) => (
            <TableRow key={index} className="p-0">
              <TableCell className="p-0 font-normal leading-5 font-sans text-sm text-[#18181B]">
                {policy.policy_name}
              </TableCell>
              <TableCell className="p-0 font-normal leading-5 font-sans text-sm text-[#18181B]">
                {policy.policy_description.slice(0, 71)}
                {policy.policy_description.length > 71 && "..."}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    style={{
                      width: "36px",
                      height: "20px",
                    }}
                    checked={policy.is_active}
                    onCheckedChange={() => handleUpdatePolicyStatus(policy)}
                    disabled={false}
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                {policy.terms_and_conditions !== null ? (
                  <button
                    onClick={() => handleEditClick(policy)}
                    disabled={false}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#52525B] hover:bg-gray-100 focus:outline-none"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    };

    return (
      <div className="w-[90%]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E4E4E7]">
              <TableHead className="w-[200px] h-[30px] p-0 font-medium leading-5 font-sans text-sm text-[#71717A]">
                Policy
              </TableHead>
              <TableHead className="p-0 font-medium h-[30px] leading-5 font-sans text-sm text-[#71717A]">
                Description
              </TableHead>
              <TableHead className="w-[100px] text-center h-[30px] font-medium leading-5 font-sans text-sm text-[#71717A]">
                Status
              </TableHead>
              <TableHead className="w-[60px] text-center h-[30px] font-medium leading-5 font-sans text-sm text-[#71717A]">
                Edit
              </TableHead>
            </TableRow>
          </TableHeader>
          {renderTableBody()}
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 ">
      <div className="text-xl font-semibold font-sans text-[#18181B] leading-[100%] mb-6">
        Organization Policies
      </div>

      <div className="w-full">
        <DataTable data={allPolicies || []} isListLoading={false} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#18181B]">
              Edit Short Text
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#18181B]"
              >
                Policy Name
              </label>
              <Input
                id="name"
                value={formValues.name}
                onChange={handleInputChange}
                className="text-sm border-[#E4E4E7] text-[#18181B]"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-[#18181B]"
              >
                Description
              </label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={handleInputChange}
                className="text-sm border-[#E4E4E7] text-[#18181B] min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#E4E4E7] text-[#18181B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-black text-white hover:bg-black/90 flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? <RotateCw className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationPolicies;
