import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Application } from "./ApplicationsList";
import { formatTimestamp } from "@/utils/formatTime";
export default function ApplicationView({
  data,
  onOpenChange,
  isOpen,
}: {
  data: Application | null;
  isOpen: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  if (!data || data === null) return <></>;
  //    status: "Not Started" | "In Progress" | "Completed" | "Archived";
  const { name, description, createdAt, createdBy } = data;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            <span>{name}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4"></div>
        <DialogFooter className="justify-start! ">
          <div className="text-xs flex gap-2 flex-col">
            <div className="flex gap-2 items-center ">
              <span
                className="
                text-muted-foreground"
              >
                Created By
              </span>
              <span className="">{createdBy?.name || "Unknown"}</span>
            </div>
            <div className="flex gap-2 items-center ">
              <span
                className="
                text-muted-foreground"
              >
                Created
              </span>
              <span className="">{formatTimestamp(createdAt)}</span>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
