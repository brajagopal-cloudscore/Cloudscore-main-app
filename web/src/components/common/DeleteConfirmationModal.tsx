"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  itemName: string;
  itemType: string;
  operation?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  itemName,
  itemType,
  operation,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className=" items-center gap-2 inline-flex text-lg font-semibold leading-none tracking-tight">
            <span className="flex p-2.5 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </span>
            <span>{title}</span>
          </DialogTitle>

          <DialogDescription className="pt-2">
            Are you sure you want to {operation || "delete "}{" "}
            <strong>{itemName}</strong>?
            {!operation || title.toLowerCase().includes("permanently")
              ? `This ${itemType} will be permanently removed. This action cannot be undone. All data associated with this ${itemType} cannot be restored.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className=""
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={operation === "archive" ? "default" : "destructive"}
          >
            {isLoading
              ? operation === "archive"
                ? "Archiving..."
                : "Deleting..."
              : operation === "archive" ? "Archive" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
