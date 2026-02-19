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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { linkPromptToCentroid } from "@/actions/router-ops";
import { successToast, errorToast } from "@/lib/utils/toast";

interface LinkPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: any[];
  centroids: any[];
  tenantId: string;
  onSuccess: () => void;
}

export default function LinkPromptDialog({
  open,
  onOpenChange,
  prompts,
  centroids,
  tenantId,
  onSuccess,
}: LinkPromptDialogProps) {
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [selectedCentroidId, setSelectedCentroidId] = useState("");
  const [linkWeight, setLinkWeight] = useState("1.0");
  const [processing, setProcessing] = useState(false);

  const handleLink = async () => {
    if (!selectedPromptId || !selectedCentroidId) {
      errorToast("Please select both prompt and centroid");
      return;
    }
    if (!tenantId) return;

    setProcessing(true);
    try {
      await linkPromptToCentroid(tenantId, {
        promptId: selectedPromptId,
        centroidId: selectedCentroidId,
        weight: linkWeight,
      });
      successToast("", "Link", "created successfully");
      onOpenChange(false);
      setSelectedPromptId("");
      setSelectedCentroidId("");
      setLinkWeight("1.0");
      onSuccess();
    } catch (error: any) {
      console.error("Error linking prompt:", error);
      errorToast(error.message || "Failed to link prompt");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Prompt to Family</DialogTitle>
          <DialogDescription>
            Associate a prompt with a family centroid for training
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkPrompt">Select Prompt</Label>
            <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    {prompt.prompt.substring(0, 50)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkCentroid">Select Family</Label>
            <Select value={selectedCentroidId} onValueChange={setSelectedCentroidId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a family" />
              </SelectTrigger>
              <SelectContent>
                {centroids.map((centroid) => (
                  <SelectItem key={centroid.id} value={centroid.id}>
                    {centroid.family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkWeight">Weight</Label>
            <Input
              id="linkWeight"
              type="number"
              step="0.1"
              min="0"
              placeholder="1.0"
              value={linkWeight}
              onChange={(e) => setLinkWeight(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Contribution weight for this prompt in centroid calculation
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
          <Button onClick={handleLink} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              "Link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
