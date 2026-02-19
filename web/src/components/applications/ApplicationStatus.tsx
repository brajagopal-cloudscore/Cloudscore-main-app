"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { updateStatusApplication } from "@/lib/actions/applications";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
type StatusType = "Not Started" | "In Progress" | "Completed" | "Archived";

export default function ApplicationStatus({
  id,
  defaultStatus,
  tenant,
}: {
  id: string;
  tenant: string;
  defaultStatus: StatusType;
}) {
  console.log(defaultStatus);
  const [status, setStatus] = useState<StatusType>(defaultStatus);
  const [pendingStatus, setPendingStatus] = useState<StatusType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleChange = (value: StatusType) => {
    setPendingStatus(value);
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    if (!pendingStatus) return;

    try {
      setLoading(true);
      await updateStatusApplication(id, tenant, pendingStatus);
      setStatus(pendingStatus); // update selected value after success
      toast.success("Application status updated successfully");
    } catch (err) {
      toast.error("Error updating application status! Please try again later");
    } finally {
      setPendingStatus(null);
      setOpenDialog(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex gap-2 items-center">
        <h2 className="text-sm font-semibold">Development Status:</h2>
        <Select value={status} onValueChange={handleChange}>
          <SelectTrigger className="w-48">
            {/* {status} */}
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="w-48">
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="t">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to{" "}
              <span className="font-semibold">{pendingStatus}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin duration-300" />
              ) : (
                "OK"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
