"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Search,
  Globe,
  Award,
  Zap,
  CheckCircle,
  Plus,
  Landmark,
  Link,
  ExternalLink,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { getGuardrailIcon } from "@/lib/utils/guardrailIcons";

interface MarketplaceGuardrail {
  id: string;
  key: string;
  name: string;
  description: string;
  tier: string;
  category: string;
  isGlobal: boolean;
  isCertified: boolean;
  avgLatencyMs: number | null;
  accuracyScore: number | null;
  infrastructure: string;
  enableInstall: boolean | null;
  metadata: any;
}

interface MarketplaceBrowserProps {
  guardrails: MarketplaceGuardrail[];
  onInstall: (guardrailId: string) => Promise<void>;
  installedIds?: string[];
}

const COLOR = [
  "bg-emerald-500/10 text-emerald-500",
  "bg-amber-500/10 text-amber-500",
  "bg-rose-500/10 text-rose-500",
  "bg-red-500/10 text-red-500",
];

const CATEGORY_COLORS: Record<string, string> = {
  privacy: "bg-purple-500/10 text-purple-500",
  safety: "bg-red-500/10 text-red-500",
  security: "bg-orange-500/10 text-orange-500",
  factuality: "bg-blue-500/10 text-blue-500",
  business: "bg-green-500/10 text-green-500",
  formatting: "bg-cyan-500/10 text-cyan-500",
  code: "bg-indigo-500/10 text-indigo-500",
};

const TIER_COLORS: Record<string, string> = {
  T0: "bg-emerald-100 text-emerald-800",
  T1: "bg-amber-100 text-amber-800",
  T2: "bg-rose-100 text-rose-800",
};

export function MarketplaceBrowser({
  guardrails,
  onInstall,
  installedIds = [],
}: MarketplaceBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [installingId, setInstallingId] = useState<string | null>(null);

  const categories = Array.from(new Set(guardrails.map((g) => g.category)));
  const tiers = Array.from(new Set(guardrails.map((g) => g.tier)));

  const filteredGuardrails = guardrails.filter((g) => {
    const matchesSearch =
      (g.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (g.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (g.key?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || g.category === filterCategory;
    const matchesTier = filterTier === "all" || g.tier === filterTier;
    const matchesType =
      filterType === "all" ||
      (filterType === "global" && g.isGlobal) ||
      (filterType === "certified" && g.isCertified);

    return matchesSearch && matchesCategory && matchesTier && matchesType;
  });

  const handleInstall = async (guardrailId: string) => {
    setInstallingId(guardrailId);
    try {
      await onInstall(guardrailId);
    } catch (error) {
      console.error("Failed to install guardrail:", error);
      alert("Failed to install guardrail");
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Guardrail Marketplace
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and install pre-built guardrails for your policies
          </p>
        </div>
        <Badge
          variant={"secondary"}
          className="text-sm bg-transparent! text-muted-foreground"
        >
          {filteredGuardrails.length} available
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search guardrails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="capitalize">
            <SelectValue placeholder="Category" className="capitalize" />
          </SelectTrigger>
          <SelectContent className="">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {tiers.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 ">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          All
        </Button>
        <Button
          variant={filterType === "global" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("global")}
          className="flex items-center gap-1"
        >
          <Globe className="w-3 h-3" />
          Global
        </Button>
        <Button
          variant={filterType === "certified" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("certified")}
          className="flex items-center gap-1"
        >
          <Award className="w-3 h-3" />
          Certified
        </Button>
      </div>

      {/* Guardrail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuardrails
          .sort(
            (a, b) =>
              (b.enableInstall === true ? 1 : 0) -
              (a.enableInstall === true ? 1 : 0)
          )
          .map((guardrail) => {
            const isInstalled = installedIds.includes(guardrail.id);
            const IconComponent = getGuardrailIcon(guardrail.key);

            return (
              <Card
                key={guardrail.id}
                className="relative hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 " />
                          {guardrail.name}
                          {guardrail.isGlobal && (
                            <Globe className="w-4 h-4 text-blue-500" />
                          )}
                          {guardrail.isCertified && (
                            <Award className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <a
                            href={"https://docs.kentron.ai/introduction"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex gap-1 items-center"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap ">
                    <Badge
                      className={
                        `${CATEGORY_COLORS[guardrail.category] ?? "bg-muted text-muted-foreground"} capitalize` ||
                        "bg-muted text-muted-foreground capitalize"
                      }
                    >
                      {guardrail.category.toLowerCase() === "pii"
                        ? "PII"
                        : guardrail.category}
                    </Badge>

                    {guardrail.metadata?.compliance?.map(
                      (compliance: any, idx: number) => (
                        <Badge
                          key={idx}
                          className={`${COLOR[idx % COLOR.length]}  capitalize`}
                        >
                          {compliance.name}
                        </Badge>
                      )
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2 flex-col">
                    {/* <p className="text-muted-foreground text-xs">
                      {guardrail.description}
                    </p> */}
                    {/* {guardrail.avgLatencyMs && (
                      <div className="space-y-2 text-xs flex justify-between items-center">
                        <span className="text-muted-foreground flex gap-1 items-center">
                          <Clock className="w-3 h-3 stroke-1" />
                          Avg Latency
                        </span>
                        <span className="font-mono text-xs pl-2">
                          {guardrail.avgLatencyMs.toFixed(1)} ms
                        </span>
                      </div>
                    )} */}
                    {/* <div className=" grid grid-cols-1 gap-6 place-items-center justify-between"> */}
                    {/* <div className="space-y-2 text-xs hidden">
                        <span className="text-muted-foreground flex gap-1 items-center">
                          <Landmark className="w-3 h-3"></Landmark>
                          Infrastructure
                        </span>
                        <span className="text-xs capitalize pl-2">
                          {guardrail.infrastructure}
                        </span>
                      </div> */}
                    {/* </div> */}
                  </div>
                  {guardrail.accuracyScore && (
                    <>
                      {/* <span className="text-muted-foreground text-xs flex justify-between mt-2 items-center">
                        <div className="flex gap-1  items-center">
                          <ShieldCheck className="w-3 h-3"></ShieldCheck>
                          Accuracy Rate{" "}
                        </div>
                        <span>
                          {`${(guardrail.accuracyScore * 100).toFixed(1)} %`}
                        </span>
                      </span>
                      <div className="bg-muted-foreground rounded-md overflow-hidden w-full mt-2 h-1">
                        <div
                          className="bg-primary h-full"
                          style={{
                            width: `${(guardrail.accuracyScore * 100).toFixed(1)}%`,
                          }}
                        ></div>
                      </div> */}
                    </>
                    // <div className="flex items-center justify-between">
                    //   <span>Accuracy:</span>
                    //   <span className="font-mono">
                    //     {(
                    //   </span>
                    // </div>
                  )}
                  {isInstalled ? (
                    <Button className="w-full" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Installed
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleInstall(guardrail.id)}
                      disabled={
                        guardrail.enableInstall === null ||
                        !guardrail.enableInstall
                      }
                    >
                      {installingId === guardrail.id ? (
                        "Installing..."
                      ) : (
                        <>
                          {guardrail.enableInstall === null ||
                          !guardrail.enableInstall ? (
                            <>Coming Soon</>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Install
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>

                {/* <CardFooter>
                </CardFooter> */}
              </Card>
            );
          })}
      </div>

      {filteredGuardrails.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium  mb-2">No guardrails found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
