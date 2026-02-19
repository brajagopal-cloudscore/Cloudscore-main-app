"use client";

import { useState } from "react";
import { Search, Shield, Zap, Bug, Lock, Database, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryCard } from "@/components/red-teaming/CategoryCard";
import { Dashboard } from "@/components/red-teaming/Dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { ActivateDialog } from "@/components/common/FeatureActivation";

const Page = ({ models, isEnabled }: { models: any[]; isEnabled: boolean }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "playground">(
    "dashboard"
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data
  const categories = [
    {
      id: "toxicity",
      name: "Toxicity & Hate Speech",
      description: "Test detection of offensive, hateful, and toxic content",
      promptCount: 125000,
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "pii",
      name: "PII & Sensitive Data",
      description: "Verify protection against personal information leaks",
      promptCount: 89000,
      icon: <Lock className="h-5 w-5" />,
    },
    {
      id: "jailbreak",
      name: "Jailbreak Attempts",
      description: "Challenge guardrails with sophisticated bypass techniques",
      promptCount: 156000,
      icon: <Bug className="h-5 w-5" />,
    },
    {
      id: "injection",
      name: "Prompt Injection",
      description: "Test resistance to prompt manipulation attacks",
      promptCount: 92000,
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: "data-exfil",
      name: "Data Exfiltration",
      description: "Evaluate protection against unauthorized data extraction",
      promptCount: 67000,
      icon: <Database className="h-5 w-5" />,
    },
    {
      id: "political",
      name: "Political & Controversial",
      description: "Test handling of sensitive political and social topics",
      promptCount: 43000,
      icon: <Globe className="h-5 w-5" />,
    },
  ];
  const [selectedModel, setModel] = useState<any>(null);

  return (
    <>
      <ActivateDialog isOpen={!isEnabled}></ActivateDialog>
      <div className="bg-background">
        <div className=" mx-auto ">
          {/* Header */}
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Red Teaming
              </h1>
              <p className="text-muted-foreground text-lg">
                Test your AI guardrails with millions of pre-built adversarial
                prompts
              </p>
            </div>
          </header>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "dashboard" | "playground")}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="playground">Playground</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <Dashboard />
            </TabsContent>

            <TabsContent value="playground" className="mt-6 space-y-6">
              {/* Search Bar */}
              <div className="hidden">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search millions of prompts by category, tag, or keyword..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Select Model
                </h2>

                <Select
                  onValueChange={(ele) => {
                    const model = models.filter(
                      (model: any) => ele == model.id
                    );
                    console.log(model);
                    setModel(model.length > 0 ? model[0] : null);
                  }}
                >
                  <SelectTrigger className="h-14!">
                    <>
                      {!selectedModel || selectedModel === null ? (
                        <>
                          <span className="text-sm text-muted-foreground">
                            Select a model
                          </span>
                        </>
                      ) : (
                        <>
                          <SelectValue className="">
                            <div className="flex  flex-col! items-start">
                              <span className="">
                                {selectedModel.displayName}
                              </span>
                              <span className="text-sm text-muted-foreground uppercase">
                                {selectedModel.provider}
                              </span>
                            </div>
                          </SelectValue>
                        </>
                      )}
                    </>
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((ele: any) => {
                      return (
                        <>
                          <SelectItem value={ele.id} className="h-14!">
                            <div className="flex  flex-col! items-start">
                              <span className="">{ele.displayName}</span>
                              <span className="text-xs text-muted-foreground uppercase">
                                {ele.provider}
                              </span>
                            </div>
                          </SelectItem>
                        </>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Select Categories
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      active={selectedCategory}
                      id={category.id}
                      name={category.name}
                      description={category.description}
                      promptCount={category.promptCount}
                      icon={category.icon}
                      onClick={() => {
                        setSelectedCategory(category.id);
                      }}
                    />
                  ))}
                </div>
              </div>
              <Button
                className=""
                disabled={selectedModel === null || selectedCategory === null}
              >
                {" "}
                Run Batch Test
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Page;
