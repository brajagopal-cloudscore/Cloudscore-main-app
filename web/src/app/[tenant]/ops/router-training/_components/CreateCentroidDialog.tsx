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
import { Loader2 } from "lucide-react";
import { createOrUpdateRouterCentroid } from "@/actions/router-ops";
import { successToast, errorToast } from "@/lib/utils/toast";

interface CreateCentroidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
}

export default function CreateCentroidDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess,
}: CreateCentroidDialogProps) {
  const [newFamily, setNewFamily] = useState("");
  const [newThreshold, setNewThreshold] = useState("0.3");
  const [processing, setProcessing] = useState(false);

  const handleCreate = async () => {
    if (!newFamily.trim()) {
      errorToast("Please enter a family name");
      return;
    }
    if (!tenantId) return;

    setProcessing(true);
    try {
      await createOrUpdateRouterCentroid(tenantId, {
        family: newFamily,
        threshold: newThreshold,
      });
      successToast("", "Risk Category", "created successfully");
      onOpenChange(false);
      setNewFamily("");
      setNewThreshold("0.3");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating centroid:", error);
      errorToast(error.message || "Failed to create centroid");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary!">
            Create Risk Category / Centroid
          </DialogTitle>
          <DialogDescription>
            Create a new risk category for router training
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">Risk Category (slug)</Label>
            <Input
              id="familyName"
              placeholder="e.g., toxicity, pii, jailbreak, self-harm"
              value={newFamily}
              onChange={(e) => setNewFamily(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be used to automatically map to guardrail categories and
              should match risk_categories.slug
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Similarity Threshold</Label>
            <Input
              id="threshold"
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="0.3"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Cosine similarity threshold (0.0-1.0). Default: 0.3
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
