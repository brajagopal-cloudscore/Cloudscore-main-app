import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Copy, Flag } from "lucide-react";
import toast from "react-hot-toast";

interface PromptDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: {
    id: string;
    title: string;
    fullText: string;
    category: string;
    tags: string[];
    successRate: number;
    difficulty: string;
    expectedOutcome: string;
    metadata: {
      created: string;
      usageCount: number;
      avgResponseTime: string;
    };
  } | null;
  onTest: (id: string) => void;
}

export const PromptDetailModal = ({
  open,
  onOpenChange,
  prompt,
  onTest,
}: PromptDetailModalProps) => {
  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.fullText);
    toast("Prompt text has been copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{prompt.title}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{prompt.category}</Badge>
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground">
                Prompt Text
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground font-mono">
                {prompt.fullText}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground">
                Expected Outcome
              </h4>
              <p className="text-sm text-muted-foreground">
                {prompt.expectedOutcome}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">
                  Success Rate
                </h4>
                <p className="text-2xl font-bold text-primary">
                  {prompt.successRate}%
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">
                  Difficulty
                </h4>
                <Badge className="text-sm">{prompt.difficulty}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">
                  Usage Count
                </h4>
                <p className="text-sm text-muted-foreground">
                  {prompt.metadata.usageCount.toLocaleString()} tests
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">
                  Avg Response Time
                </h4>
                <p className="text-sm text-muted-foreground">
                  {prompt.metadata.avgResponseTime}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
          <Button onClick={() => onTest(prompt.id)}>
            <Play className="h-4 w-4 mr-2" />
            Test Against Active Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
