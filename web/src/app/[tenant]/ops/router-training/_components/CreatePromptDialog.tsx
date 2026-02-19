import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createRouterPrompt } from "@/actions/router-ops";
import { successToast, errorToast } from "@/lib/utils/toast";

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riskCategories: any[];
  tenantId: string;
  onSuccess: () => void;
}

export default function CreatePromptDialog({
  open,
  onOpenChange,
  riskCategories,
  tenantId,
  onSuccess,
}: CreatePromptDialogProps) {
  const [newPrompt, setNewPrompt] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleCreate = async () => {
    if (!newPrompt.trim()) {
      errorToast("Please enter a prompt");
      return;
    }
    if (!selectedFamily) {
      errorToast("Please select a risk category");
      return;
    }
    if (!tenantId) return;

    setProcessing(true);
    try {
      await createRouterPrompt(tenantId, {
        prompt: newPrompt,
        category: selectedFamily,
      });
      successToast("", "Prompt", "created successfully");
      onOpenChange(false);
      setNewPrompt("");
      setSelectedFamily("");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating prompt:", error);
      errorToast(error.message || "Failed to create prompt");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Add Seed Prompt</DialogTitle>
          <DialogDescription>
            Add a new prompt example for router training
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your seed prompt..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="family">Risk Category</Label>
            <Select value={selectedFamily} onValueChange={setSelectedFamily}>
              <SelectTrigger>
                <SelectValue placeholder="Select a risk category" />
              </SelectTrigger>
              <SelectContent>
                {riskCategories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name} ({category.slug})
                  </SelectItem>
                ))}
                {riskCategories.length === 0 && (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No risk categories available. Download a model with a risk category to
                    create one.
                  </div>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select an existing risk category. Categories are created when you download
              models.
              {riskCategories.length === 0 && (
                <span className="text-red-500 font-medium block mt-1">
                  ⚠️ No categories available. Please download a model with a risk category
                  first.
                </span>
              )}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
