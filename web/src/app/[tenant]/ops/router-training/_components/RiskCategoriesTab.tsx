import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";

interface RiskCategoriesTabProps {
  riskCategories: any[];
  loading: boolean;
}

export default function RiskCategoriesTab({
  riskCategories,
  loading,
}: RiskCategoriesTabProps) {
  if (loading) {
    return (
      <>
        {" "}
        <div className="space-y-4">
          <Card className="w-full">
            <CardHeader className="">
              <CardTitle className="space-y-2">
                <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
                <Skeleton className="h-3 bg-muted  w-48"></Skeleton>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="">
              <CardTitle className="space-y-2">
                <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
                <Skeleton className="h-3 bg-muted  w-48"></Skeleton>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="">
              <CardTitle className="space-y-2">
                <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
                <Skeleton className="h-3 bg-muted  w-48"></Skeleton>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-[650px]"></Skeleton>
              <Skeleton className="h-3 bg-muted  w-96"></Skeleton>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (riskCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            No risk categories configured
          </CardTitle>
          <CardDescription>
            Download a model with a risk category to create one automatically.
            Categories like "jailbreak", "toxicity", "pii" will be created when
            you download models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => window.open("/ops/models/download", "_blank")}
            variant="default"
          >
            Go to Model Download
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {riskCategories.map((category) => {
        return (
          <Card key={category.slug}>
            <CardHeader>
              <CardTitle className="">
                {category.name}
              </CardTitle>
              <CardDescription>{category.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              {category.description ||
                `Risk category for ${category.name} detection`}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
