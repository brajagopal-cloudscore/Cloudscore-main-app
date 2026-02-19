"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Globe, Award, Plus, ExternalLink } from "lucide-react";
import { MarketplaceBrowser } from "@/components/control-net/MarketplaceBrowser";
import { installMarketplaceGuardrail } from "./actions";
import { getGuardrailIcon } from "@/lib/utils/guardrailIcons";

interface Guardrail {
  id: string;
  key: string;
  name: string | null;
  packName: string | null;
  functionName: string | null;
  description: string | null;
  tier: string;
  performanceBudgetMs: string | null;
  infrastructure: string;
  isEnabled: boolean;
  isGlobal: boolean;
  isCertified: boolean;
  avgLatencyMs: string | null;
  accuracyScore: string | null;
  defaultParams: any;
  createdAt: string | null;
  enableInstall: boolean | null;
  metadata: any;
}

interface GuardrailsPageClientProps {
  tenantSlug: string;
  userId: string;
  tenantGuardrails: Guardrail[];
  marketplaceGuardrails: Guardrail[];
}

const COLOR = [
  "bg-emerald-500/10 text-emerald-500",
  "bg-amber-500/10 text-amber-500",
  "bg-rose-500/10 text-rose-500",
  "bg-red-500/10 text-red-500",
];

export function GuardrailsPageClient({
  tenantSlug,
  userId,
  tenantGuardrails,
  marketplaceGuardrails,
}: GuardrailsPageClientProps) {
  const handleInstallGuardrail = async (guardrailId: string) => {
    await installMarketplaceGuardrail({
      tenantSlug,
      userId,
      sourceGuardrailId: guardrailId,
    });
  };
  console.log(tenantGuardrails);
  const installedKeys = new Set(tenantGuardrails.map((g) => g.key));
  const installedMarketplaceIds = marketplaceGuardrails
    .filter((mg) => installedKeys.has(mg.key))
    .map((mg) => mg.id);

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold ">Guardrails</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Install pre-built guardrails from the marketplace or view your
            installed guardrails
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Installed Guardrails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold ">{tenantGuardrails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available in Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold ">
              {marketplaceGuardrails.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custom Guards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold ">
              {tenantGuardrails.filter((g) => g.packName === "custom").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Certified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold ">
              {tenantGuardrails.filter((g) => g.isCertified).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="my-guardrails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-guardrails">
            <Shield className="w-4 h-4 mr-2" />
            App Guardrails ({tenantGuardrails.length})
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Globe className="w-4 h-4 mr-2" />
            Marketplace ({marketplaceGuardrails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-guardrails" className="space-y-4">
          {tenantGuardrails.length === 0 ? (
            <Card className="border-transparent! bg-transparent!">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No guardrails installed
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Install guardrails from the marketplace to start building
                  policies
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenantGuardrails.map((guardrail) => {
                const IconComponent = getGuardrailIcon(guardrail.key);
                return (
                  <Card
                    key={guardrail.id}
                    className="flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className=" py-0!">
                      <CardTitle className="text-lg flex flex-col ">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 " />
                          {guardrail.name || guardrail.key}
                          {guardrail.isGlobal && (
                            <Globe className="w-4 h-4 text-blue-500" />
                          )}
                          {guardrail.isCertified && (
                            <Award className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap items-center">
                        <Badge className="bg-muted text-muted-foreground capitalize">
                          {guardrail.packName === "pii"
                            ? "PII"
                            : guardrail.packName}
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

                    <CardContent className="flex-1 gap-2 flex flex-col py-0! my-0!">
                      <CardDescription className="text-sm text-muted-foreground mb-4!">
                        {guardrail.description}
                      </CardDescription>

                      <div className="flex items-center justify-between  mt-auto text-muted-foreground">
                        <a
                          href={"https://docs.kentron.ai/introduction"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className=" hover:underline cursor-pointer  text-xs   flex gap-1 items-center"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Docs</span>
                        </a>

                        {guardrail.performanceBudgetMs &&
                          guardrail.performanceBudgetMs !== null && (
                            <div className=" ">
                              <div className="flex justify-between text-xs items-center gap-1">
                                <Clock size={10}></Clock>
                                <span className="">
                                  {guardrail.performanceBudgetMs.toString()} ms
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace">
          <MarketplaceBrowser
            guardrails={marketplaceGuardrails.map((g) => ({
              id: g.id,
              key: g.key,
              metadata: g.metadata,
              name: g.name || g.key,
              description: g.description || "",
              tier: g.tier,
              category: g.packName || "uncategorized",
              isGlobal: g.isGlobal,
              isCertified: g.isCertified,
              avgLatencyMs: g.avgLatencyMs ? parseFloat(g.avgLatencyMs) : null,
              accuracyScore: g.accuracyScore
                ? parseFloat(g.accuracyScore)
                : null,
              infrastructure: g.infrastructure,
              enableInstall: g.enableInstall,
            }))}
            onInstall={handleInstallGuardrail}
            installedIds={installedMarketplaceIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
