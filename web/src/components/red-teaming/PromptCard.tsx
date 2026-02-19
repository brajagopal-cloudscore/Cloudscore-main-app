import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Play } from "lucide-react";

interface PromptCardProps {
  id: string;
  title: string;
  preview: string;
  category: string;
  tags: string[];
  successRate: number;
  difficulty: "low" | "medium" | "high";
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onTest: (id: string) => void;
  onPreview: (id: string) => void;
}

export const PromptCard = ({
  id,
  title,
  preview,
  category,
  tags,
  successRate,
  difficulty,
  selected,
  onToggleSelect,
  onTest,
  onPreview,
}: PromptCardProps) => {
  const difficultyColors = {
    low: "success",
    medium: "secondary",
    high: "destructive",
  } as const;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(id)}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-foreground truncate">{title}</h4>
            <Badge
            /* @ts-ignore */
              variant={difficultyColors[difficulty]}
              className="shrink-0 text-xs"
            >
              {difficulty}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {preview}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                {successRate}% success
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onTest(id)}
                className="h-8 px-3"
              >
                <Play className="h-3 w-3 mr-1" />
                Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
