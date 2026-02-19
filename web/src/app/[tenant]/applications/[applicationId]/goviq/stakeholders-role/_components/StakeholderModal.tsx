"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect } from "@/components/common/UserSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClerkUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface Props {
  isOpen: boolean;
  mode: "create" | "edit";
  stakeholder?: any;
  tenantId: string;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isPending: boolean;
}

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
] as const;

// Normalize role value to handle both "admin"/"org:admin" and "member"/"org:member"
const normalizeRole = (role: string): string => {
  if (role === "org:admin" || role === "admin") return "admin";
  if (role === "org:member" || role === "member") return "member";
  return role;
};

export function StakeholderModal({
  isOpen,
  mode,
  stakeholder,
  tenantId,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({
    userName: "",
    role: "",
    email: "",
    department: "",
    responsibilities: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);

    // Fetch user details from the API
    try {
      const { fetchOrganizationMembers } = await import("@/lib/api/users");
      const data = await fetchOrganizationMembers(tenantId);
      if (data && data.length > 0) {
        const user = data.find((u: ClerkUser) => u.id === userId);
        if (user) {
          setFormData((prev) => ({
            ...prev,
            userName: user.name,
            email: user.email,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (mode === "edit" && stakeholder) {
      setFormData({
        userName: stakeholder.userName,
        role: normalizeRole(stakeholder.role || ""),
        email: stakeholder.email || "",
        department: stakeholder.department || "",
        responsibilities: stakeholder.responsibilities || "",
      });
      setSelectedUserId(""); // Edit mode doesn't need user selection
    } else {
      setFormData({
        userName: "",
        role: "",
        email: "",
        department: "",
        responsibilities: "",
      });
      setSelectedUserId("");
    }
    setErrors({});
  }, [mode, stakeholder, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (mode === "create" && !selectedUserId)
      newErrors.user = "Please select a user";
    if (!formData.userName.trim()) newErrors.userName = "Name is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save stakeholder" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]  p-0 gap-0 z-50 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 space-y-1 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {mode === "create" ? "Add Stakeholder" : "Edit Stakeholder"}
          </h3>
        </div>
        <div
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // important, prevents ghost submits
              handleSubmit();
            }
          }}
        >
          <div className="p-6 space-y-4">
            {/* User Selection (Create mode only) */}
            {mode === "create" && (
              <div>
                <UserSelect
                  value={selectedUserId}
                  onChange={handleUserSelect}
                  placeholder="Select a user..."
                  className={`${errors.user ? "border-destructive" : ""} h-9`}
                  error={!!errors.user}
                  label="Select User from Organization"
                  required={true}
                  tenantId={tenantId}
                />
                {errors.user && (
                  <p className="text-sm  text-destructive mt-1">
                    {errors.user}
                  </p>
                )}
              </div>
            )}

            {/* Name (Read-only in create, editable in edit) */}
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium">
                Name *
              </Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userName: e.target.value }))
                }
                placeholder="e.g., John Smith"
                className={`${errors.userName ? "border-destructive" : ""} h-9`}
                disabled={mode === "create"}
              />
              {errors.userName && (
                <p className="text-sm text-red-500 text-destructive">
                  {errors.userName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger
                  id="role"
                  className={`${errors.role ? "border-destructive" : ""} h-9`}
                >
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 text-destructive">
                  {errors.role}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="e.g., john.smith@company.com"
                className="h-9"
                disabled={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                placeholder="e.g., Customer Service"
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities" className="text-sm font-medium">
                Responsibilities
              </Label>
              <Textarea
                id="responsibilities"
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    responsibilities: e.target.value,
                  }))
                }
                placeholder="Describe the stakeholder's responsibilities..."
                rows={3}
              />
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          <div className="p-6 pt-4 border-t">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : mode === "create"
                    ? "Create"
                    : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
