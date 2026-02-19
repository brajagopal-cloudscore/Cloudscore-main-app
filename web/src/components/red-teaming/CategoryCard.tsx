import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight } from "lucide-react";
import {} from "@nextui-org/react";
import { CardContent } from "../_ui/card";
import { Checkbox } from "../ui/checkbox";

interface CategoryCardProps {
  name: string;
  description: string;
  promptCount: number;
  icon: React.ReactNode;
  onClick: () => void;
  id: string;
  active: string | null;
}

export const CategoryCard = ({
  name,
  description,
  promptCount,
  icon,
  id,
  active,
  onClick,
}: CategoryCardProps) => {
  const isActive = id === active;
  return (
    <Card onClick={onClick} className="relative">
      <Checkbox className=" absolute top-5 right-5" checked={isActive} />
      <CardHeader className="">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {promptCount.toLocaleString()} prompts
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
};
