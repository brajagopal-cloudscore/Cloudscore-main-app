"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import React, { ChangeEvent, useState, useEffect } from "react";
// Removed Navbar import - using static layout instead
import { successToast, errorToast } from "@/lib/utils/toast";
// Removed API imports - using static data instead
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Removed useSearchStore import - using static behavior instead
import { getStaticFileUrl } from "@/lib/utils/helpers";
import Image from "next/image";
// Removed permission check - using static behavior instead
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useTenant } from "@/contexts/TenantContext";
import {
  fetchIntegrations,
  toggleIntegrationStatus,
  addIntegrationCredentials,
  removeIntegrationCredentials,
  type Integration,
} from "@/lib/api/integrations";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrIntegration } from "react-icons/gr";

// Default integrations that can be added to the database
const defaultIntegrations = [
  // Data Platforms
  {
    name: "Databricks",
    category: "data_platforms" as const,
    logoUrl: "/logos/data-bricks.png",
    description: "Unified analytics platform",
  },
  {
    name: "Snowflake",
    category: "data_platforms" as const,
    logoUrl: "/logos/snowflake.svg",
    description: "Cloud data platform",
  },
  {
    name: "Dataiku",
    category: "data_platforms" as const,
    logoUrl: "/logos/dataiku.svg",
    description: "Data science platform",
  },

  // ML Platforms
  {
    name: "Azure AI Foundry",
    category: "ml_platforms" as const,
    logoUrl: "",
    description: "Microsoft AI platform",
  },
  {
    name: "MLFlow",
    category: "ml_platforms" as const,
    logoUrl: "/logos/mlflow.svg",
    description: "ML lifecycle management",
  },
  {
    name: "PromptLayer",
    category: "ml_platforms" as const,
    logoUrl: "",
    description: "Prompt engineering platform",
  },
  {
    name: "HoneyHive",
    category: "ml_platforms" as const,
    logoUrl: "",
    description: "LLM evaluation platform",
  },
  {
    name: "Humanloop",
    category: "ml_platforms" as const,
    logoUrl: "",
    description: "AI app development",
  },

  // LLM Providers
  {
    name: "OpenAI",
    category: "llm_providers" as const,
    logoUrl: "/logos/openAI.png",
    description: "AI research company",
  },
  {
    name: "Anthropic",
    category: "llm_providers" as const,
    logoUrl: "/logos/anthropic.svg",
    description: "AI safety company",
  },
  {
    name: "OctoAI",
    category: "llm_providers" as const,
    logoUrl: "",
    description: "AI compute platform",
  },
  {
    name: "Cohere",
    category: "llm_providers" as const,
    logoUrl: "/logos/cohere.svg",
    description: "NLP platform",
  },
  {
    name: "Hugging Face",
    category: "llm_providers" as const,
    logoUrl: "/logos/hugging-face.svg",
    description: "AI model hub",
  },
  {
    name: "Together AI",
    category: "llm_providers" as const,
    logoUrl: "",
    description: "Decentralized AI platform",
  },
  {
    name: "Scale",
    category: "llm_providers" as const,
    logoUrl: "",
    description: "AI data platform",
  },
  {
    name: "Abacus AI",
    category: "llm_providers" as const,
    logoUrl: "",
    description: "AI platform",
  },
  {
    name: "Mostly AI",
    category: "llm_providers" as const,
    logoUrl: "",
    description: "Synthetic data platform",
  },

  // AI Security
  {
    name: "Lakera",
    category: "ai_security" as const,
    logoUrl: "",
    description: "AI security platform",
  },
  {
    name: "Credal",
    category: "ai_security" as const,
    logoUrl: "",
    description: "AI governance platform",
  },
  {
    name: "Protect AI",
    category: "ai_security" as const,
    logoUrl: "",
    description: "AI security solutions",
  },
  {
    name: "Patronus AI",
    category: "ai_security" as const,
    logoUrl: "",
    description: "AI evaluation platform",
  },
  {
    name: "Athina",
    category: "ai_security" as const,
    logoUrl: "",
    description: "AI monitoring platform",
  },
  {
    name: "WhyLabs",
    category: "ai_security" as const,
    logoUrl: "",
    description: "ML monitoring platform",
  },
  {
    name: "Fiddler",
    category: "ai_security" as const,
    logoUrl: "",
    description: "Model performance management",
  },
  {
    name: "Collibra",
    category: "ai_security" as const,
    logoUrl: "",
    description: "Data governance platform",
  },
  {
    name: "Apache Atlas",
    category: "ai_security" as const,
    logoUrl: "",
    description: "Data governance framework",
  },
  {
    name: "MMUTA",
    category: "ai_security" as const,
    logoUrl: "",
    description: "AI compliance platform",
  },

  // Vector Databases
  {
    name: "Pinecone",
    category: "vector_databases" as const,
    logoUrl: "/logos/pinecone.svg",
    description: "Vector database",
  },
  {
    name: "Chroma",
    category: "vector_databases" as const,
    logoUrl: "/logos/chroma.svg",
    description: "Open-source vector database",
  },
  {
    name: "Weaviate",
    category: "vector_databases" as const,
    logoUrl: "/logos/weaviate.svg",
    description: "Vector search engine",
  },

  // Cloud Providers
  {
    name: "AWS",
    category: "cloud_providers" as const,
    logoUrl: "/logos/AWS.svg",
    description: "Amazon Web Services",
  },
];

const categoryLabels = {
  data_platforms: "Data Platforms",
  ml_platforms: "ML Platforms",
  llm_providers: "LLM Providers",
  ai_security: "AI Security & Governance",
  vector_databases: "Vector Databases",
  cloud_providers: "Cloud Providers",
};

const _Integrations = () => {
  const { tenant } = useTenant();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [hostUrl, setHostUrl] = useState("");
  const [credValue, setCredValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [search, setSearch] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "enabled" | "disabled"
  >("all");
  const [credentialsFilter, setCredentialsFilter] = useState<
    "all" | "with_credentials" | "without_credentials"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Load integrations from database
  useEffect(() => {
    const loadIntegrations = async () => {
      if (!tenant?.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchIntegrations(tenant.id);
        console.log("data", data);
        setIntegrations(data);
      } catch (err) {
        console.error("Error loading integrations:", err);
        setError("Failed to load integrations");
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [tenant?.id]);

  // Add credentials to integration
  const addCredentials = async (credentials: Record<string, any>) => {
    if (!tenant?.id || !selectedIntegration) return;

    try {
      const updatedIntegration = await addIntegrationCredentials(
        tenant.id,
        selectedIntegration.id,
        credentials
      );

      // Update local state
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === selectedIntegration.id
            ? updatedIntegration
            : integration
        )
      );

      successToast("", "Integration", "credentials added");
      resetState();
    } catch (err) {
      errorToast("Failed to add credentials");
    }
  };

  // Remove credentials from integration
  const deleteCredentials = async (integration: Integration) => {
    if (!tenant?.id) return;

    try {
      const updatedIntegration = await removeIntegrationCredentials(
        tenant.id,
        integration.id
      );

      // Update local state
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === integration.id ? updatedIntegration : item
        )
      );

      successToast(null, "Integration", "credentials removed");
    } catch (err) {
      console.error("Error removing credentials:", err);
      errorToast("Failed to remove credentials");
    }
  };

  const handleUpdateIntegrationStatus = async (integration: Integration) => {
    if (!tenant?.id) return;

    const newStatus = !integration.isEnabled;

    // Update local state immediately for better UX
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === integration.id ? { ...item, isEnabled: newStatus } : item
      )
    );

    try {
      const updatedIntegration = await toggleIntegrationStatus(
        tenant.id,
        integration.id,
        newStatus
      );

      // Update with server response
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === integration.id ? updatedIntegration : item
        )
      );

      successToast(null, "Integration", "status updated");
    } catch (err) {
      console.error("Error updating integration status:", err);
      // Revert local state on error
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === integration.id
            ? { ...item, isEnabled: integration.isEnabled }
            : item
        )
      );
      errorToast("Failed to update integration status");
    }
  };

  const validateForm = () => {
    if (!selectedIntegration) {
      setIsFormValid(false);
      return;
    }

    let isValid = false;

    // Different validation logic based on integration type
    switch (selectedIntegration.name) {
      case "OpenAI":
      case "Anthropic":
      case "Cohere":
        isValid = apiKey !== "";
        break;
      case "Databricks":
      case "Snowflake":
        isValid = hostUrl !== "" && apiKey !== "";
        break;
      case "Azure AI Foundry":
        isValid = apiKey !== "" && apiSecret !== "";
        break;
      default:
        try {
          if (credValue.trim()) {
            JSON.parse(credValue);
            isValid = true;
          }
        } catch {
          isValid = false;
        }
        break;
    }

    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm();
  }, [selectedIntegration, apiKey, apiSecret, hostUrl, credValue]);

  const handleSave = async () => {
    if (!selectedIntegration || !isFormValid) {
      setShowError(true);
      return;
    }

    let secretConfig = {};

    switch (selectedIntegration.name) {
      case "OpenAI":
      case "Anthropic":
      case "Cohere":
        secretConfig = { api_key: apiKey };
        break;
      case "Databricks":
      case "Snowflake":
        secretConfig = { host_url: hostUrl, api_key: apiKey };
        break;
      case "Azure AI Foundry":
        secretConfig = { api_key: apiKey, api_secret: apiSecret };
        break;
      default:
        try {
          secretConfig = JSON.parse(credValue);
        } catch (error) {
          errorToast("Invalid JSON format");
          return;
        }
        break;
    }

    setShowError(false);
    setOpen(false);
    await addCredentials(secretConfig);
  };

  const handleDelete = async (integration: Integration) => {
    await deleteCredentials(integration);
  };

  const renderCredentialComponent = (integrationName: string) => {
    switch (integrationName) {
      case "OpenAI":
      case "Anthropic":
      case "Cohere":
        return (
          <div className="space-y-2">
            <label
              htmlFor="apiKey"
              className="text-sm font-medium text-[#18181B]"
            >
              API Key*
            </label>
            <Input
              id="apiKey"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              className={cn(
                "text-sm border-[#E4E4E7] text-[#18181B]",
                showError && apiKey === "" && "border-red-500"
              )}
            />
            {showError && apiKey === "" && (
              <p className="text-xs text-red-500">API key is required</p>
            )}
          </div>
        );

      case "Databricks":
      case "Snowflake":
        return (
          <>
            <div className="space-y-2">
              <label
                htmlFor="hostUrl"
                className="text-sm font-medium text-[#18181B]"
              >
                Host URL*
              </label>
              <Input
                id="hostUrl"
                placeholder="Enter your host URL"
                value={hostUrl}
                onChange={(e) => setHostUrl(e.target.value)}
                className={cn(
                  "text-sm border-[#E4E4E7] text-[#18181B]",
                  showError && hostUrl === "" && "border-red-500"
                )}
              />
              {showError && hostUrl === "" && (
                <p className="text-xs text-red-500">Host URL is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="text-sm font-medium text-[#18181B]"
              >
                API Key*
              </label>
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                className={cn(
                  "text-sm border-[#E4E4E7] text-[#18181B]",
                  showError && apiKey === "" && "border-red-500"
                )}
              />
              {showError && apiKey === "" && (
                <p className="text-xs text-red-500">API key is required</p>
              )}
            </div>
          </>
        );

      case "Azure AI Foundry":
        return (
          <>
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="text-sm font-medium text-[#18181B]"
              >
                API Key*
              </label>
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                className={cn(
                  "text-sm border-[#E4E4E7] text-[#18181B]",
                  showError && apiKey === "" && "border-red-500"
                )}
              />
              {showError && apiKey === "" && (
                <p className="text-xs text-red-500">API key is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="apiSecret"
                className="text-sm font-medium text-[#18181B]"
              >
                API Secret*
              </label>
              <Input
                id="apiSecret"
                placeholder="Enter your API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                type="password"
                className={cn(
                  "text-sm border-[#E4E4E7] text-[#18181B]",
                  showError && apiSecret === "" && "border-red-500"
                )}
              />
              {showError && apiSecret === "" && (
                <p className="text-xs text-red-500">API secret is required</p>
              )}
            </div>
          </>
        );

      default:
        return (
          <div className="space-y-2">
            <label
              htmlFor="credentials"
              className="text-sm font-medium text-[#18181B]"
            >
              Configuration JSON*
            </label>
            <Textarea
              id="credentials"
              placeholder="Enter your configuration JSON here"
              value={credValue}
              onChange={(e) => setCredValue(e.target.value)}
              className={cn(
                "text-sm border-[#E4E4E7] text-[#18181B] min-h-[100px]",
                showError && credValue === "" && "border-red-500"
              )}
            />
            {showError && credValue === "" && (
              <p className="text-xs text-red-500">
                Configuration JSON is required
              </p>
            )}
          </div>
        );
    }
  };

  const resetState = () => {
    setSelectedIntegration(null);
    setApiKey("");
    setApiSecret("");
    setHostUrl("");
    setCredValue("");
    setShowError(false);
    setIsFormValid(false);
  };

  // Enhanced filtering logic
  const filteredIntegrations = integrations.filter((integration) => {
    // Search filter
    const matchesSearch =
      debouncedSearch === "" ||
      integration.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (integration.description &&
        integration.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())) ||
      integration.category
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === "all" || integration.category === selectedCategory;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && integration.isEnabled) ||
      (statusFilter === "disabled" && !integration.isEnabled);

    // Credentials filter (checking if configuration has credentials)
    const hasCredentials =
      integration.configuration &&
      Object.keys(integration.configuration).length > 0;
    const matchesCredentials =
      credentialsFilter === "all" ||
      (credentialsFilter === "with_credentials" && hasCredentials) ||
      (credentialsFilter === "without_credentials" && !hasCredentials);

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesCredentials
    );
  });

  // Get filter counts for display
  const getFilterCounts = () => {
    const total = integrations.length;
    const enabled = integrations.filter((i) => i.isEnabled).length;
    const disabled = total - enabled;
    const withCredentials = integrations.filter(
      (i) => i.configuration && Object.keys(i.configuration).length > 0
    ).length;
    const withoutCredentials = total - withCredentials;

    return { total, enabled, disabled, withCredentials, withoutCredentials };
  };

  const filterCounts = getFilterCounts();

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setStatusFilter("all");
    setCredentialsFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    search !== "" ||
    selectedCategory !== "all" ||
    statusFilter !== "all" ||
    credentialsFilter !== "all";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search integrations"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (event.key === "Escape" && search) {
        setSearch("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [search]);

  // Get search suggestions based on available integrations
  const getSearchSuggestions = () => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];

    const suggestions = new Set<string>();
    integrations.forEach((integration) => {
      if (
        integration.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        suggestions.add(integration.name);
      }
      if (
        integration.description &&
        integration.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      ) {
        suggestions.add(integration.description);
      }
      if (
        integration.category
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      ) {
        suggestions.add(
          categoryLabels[integration.category as keyof typeof categoryLabels]
        );
      }
    });

    return Array.from(suggestions).slice(0, 5);
  };

  const searchSuggestions = getSearchSuggestions();

  const categories = Object.keys(categoryLabels) as Array<
    keyof typeof categoryLabels
  >;

  return (
    <div className="flex  flex-col justify-between w-full h-full overflow-hidden">
      <div className="flex w-full h-full relative z-0 overflow-hidden">
        <div className="flex flex-col z-30 p-5 w-full h-[100vh] pl-[15px] relative">
          {/* Blurred Content */}
          <div className="blur-[2px] pointer-events-none select-none h-full overflow-hidden">
            <div className="w-full h-full overflow-hidden">
              <div className="border-b border-[#FFFFFF]">
                <div className="flex overflow-x-hidden">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 font-sans leading-4 text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                      selectedCategory === "all"
                        ? "border-b border-black text-[#18181B]"
                        : "text-[#71717A] hover:text-[#18181B]"
                    }`}
                  >
                    All Integrations
                    <Badge variant="secondary" className="text-xs">
                      {integrations.length}
                    </Badge>
                  </button>
                  {categories.map((category) => {
                    const categoryCount = integrations.filter(
                      (i) => i.category === category
                    ).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 font-sans leading-4 text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                          selectedCategory === category
                            ? "border-b border-black text-[#18181B]"
                            : "text-[#71717A] hover:text-[#18181B]"
                        }`}
                      >
                        {categoryLabels[category]}
                        <Badge variant="secondary" className="text-xs">
                          {categoryCount}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* <div className="mt-4">
              <div className="flex items-center gap-2 p-3 bg-[#F9F9F9F9] border border-[#E4E4E7] rounded-lg">
                <AlertCircle size={16} className="text-[#18181B]" />
                <span className="text-sm font-medium font-sans leading-[100%] text-[#18181B]">
                  You need to add credentials to the integration before you can enable it.
                </span>
              </div>
            </div> */}

              {/* Search and Filter Section */}
              <div className="mt-4 mb-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search integrations by name, description, or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-20 text-sm border-[#E4E4E7] text-[#18181B]"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
                      ⌘K
                    </div>

                    {/* Search Suggestions */}
                    {searchSuggestions.length > 0 && debouncedSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                            Suggestions
                          </div>
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setSearch(suggestion)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="flex items-center justify-center h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {
                          [
                            search,
                            selectedCategory !== "all",
                            statusFilter !== "all",
                            credentialsFilter !== "all",
                          ].filter(Boolean).length
                        }
                      </Badge>
                    )}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Status
                        </label>
                        <div className="flex gap-2">
                          {[
                            {
                              value: "all",
                              label: "All",
                              count: filterCounts.total,
                            },
                            {
                              value: "enabled",
                              label: "Enabled",
                              count: filterCounts.enabled,
                            },
                            {
                              value: "disabled",
                              label: "Disabled",
                              count: filterCounts.disabled,
                            },
                          ].map(({ value, label, count }) => (
                            <button
                              key={value}
                              onClick={() => setStatusFilter(value as any)}
                              className={cn(
                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                statusFilter === value
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                              )}
                            >
                              {label} ({count})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Credentials Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Credentials
                        </label>
                        <div className="flex gap-2">
                          {[
                            {
                              value: "all",
                              label: "All",
                              count: filterCounts.total,
                            },
                            {
                              value: "with_credentials",
                              label: "With Credentials",
                              count: filterCounts.withCredentials,
                            },
                            {
                              value: "without_credentials",
                              label: "Without Credentials",
                              count: filterCounts.withoutCredentials,
                            },
                          ].map(({ value, label, count }) => (
                            <button
                              key={value}
                              onClick={() => setCredentialsFilter(value as any)}
                              className={cn(
                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                credentialsFilter === value
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                              )}
                            >
                              {label} ({count})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                {hasActiveFilters && (
                  <div className="text-sm text-gray-600">
                    Showing {filteredIntegrations.length} of{" "}
                    {integrations.length} integrations
                  </div>
                )}
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-sm text-gray-500">
                    Loading integrations...
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-sm text-red-500">{error}</div>
                </div>
              )}

              {!loading && !error && filteredIntegrations.length === 0 && (
                <div className="flex flex-col justify-center items-center py-12 space-y-4">
                  {integrations.length === 0 ? (
                    <>
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-900 mb-2">
                          No integrations available
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                          Get started by adding some default integrations
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!tenant?.id) return;
                          try {
                            setLoading(true);
                            const response = await fetch(
                              `/api/tenants/${tenant.id}/integrations/seed`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                              }
                            );

                            if (response.ok) {
                              const result = await response.json();
                              successToast(
                                null,
                                "Integrations",
                                `seeded ${result.count} integrations successfully`
                              );
                              // Reload integrations
                              const data = await fetchIntegrations(tenant.id);
                              setIntegrations(data);
                            } else {
                              errorToast("Failed to seed integrations");
                            }
                          } catch (err) {
                            console.error("Error seeding integrations:", err);
                            errorToast("Failed to seed integrations");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="bg-black text-white hover:bg-black/90"
                      >
                        Seed Default Integrations
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-900 mb-2">
                          No integrations match your filters
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                          Try adjusting your search terms or filters to find
                          what you're looking for
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Clear all filters
                        </Button>
                        {search && (
                          <Button
                            variant="outline"
                            onClick={() => setSearch("")}
                            className="flex items-center gap-2"
                          >
                            <Search className="h-4 w-4" />
                            Clear search
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {!loading && !error && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredIntegrations
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((integration) => (
                      <div
                        key={integration.id}
                        className="flex flex-col border-[#E4E4E7] border rounded-md p-4"
                      >
                        <div className="flex flex-row items-center">
                          <div className="flex items-start gap-2 w-full">
                            <div className="flex items-center justify-center w-[24px] h-[24px]">
                              {integration.logoUrl ? (
                                <Image
                                  src={integration.logoUrl}
                                  width={24}
                                  height={24}
                                  alt={integration.name}
                                  className="object-contain"
                                />
                              ) : (
                                <Blocks />
                              )}
                            </div>
                            <div className="flex flex-col w-full">
                              <span className="text-[#09090B] font-semibold text-[13px] leading-none font-sans">
                                {integration.name}
                              </span>
                              <span className="text-[10px] text-[#71717A] font-normal mb-2">
                                {integration.description}
                              </span>
                              <div className="pb-2 pt-0">
                                {!integration.isCredentialsAdded ? (
                                  <span
                                    onClick={() => {
                                      setSelectedIntegration(integration);
                                      setOpen(true);
                                    }}
                                    className="text-[12px] font-normal font-sans leading-5 border-b border-[#1C9852] text-[#1C9852] cursor-pointer"
                                  >
                                    Add Credentials
                                  </span>
                                ) : (
                                  <span
                                    onClick={() => {
                                      handleDelete(integration);
                                    }}
                                    className="text-[12px] font-normal font-sans leading-5 border-b border-[#D84040] text-[#D84040] cursor-pointer"
                                  >
                                    Revoke Connection
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-row items-center justify-between">
                                <span className="mt-0 font-normal text-[12px] leading-5 text-[#777777]">
                                  Manage Integration
                                </span>
                                <Switch
                                  checked={integration.isEnabled}
                                  onCheckedChange={() =>
                                    handleUpdateIntegrationStatus(integration)
                                  }
                                  disabled={!integration.isCredentialsAdded}
                                  className=" data-[state=checked]:bg-black data-[state=checked]:border-black"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          {/* Coming Soon Overlay - Clear and on top */}
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[1px] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm px-8 py-4 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">
                Coming Soon
              </h2>
              <p className="text-sm text-gray-600 mt-1 text-center">
                This feature will be available shortly
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetState();
          }
          setOpen(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#18181B]">
              {selectedIntegration && (
                <Image
                  src={getStaticFileUrl(selectedIntegration.logoUrl || "")}
                  width={20}
                  height={20}
                  alt={selectedIntegration.name}
                  className="w-[20px] h-[20px] object-contain"
                />
              )}
              Add Credentials
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {renderCredentialComponent(selectedIntegration?.name || "")}
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetState();
              }}
              className="border-[#E4E4E7] text-[#18181B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid}
              className="bg-black text-white hover:bg-black/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Integrations = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-2xl text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-xl shadow-sm">
            <GrIntegration className="w-12 h-12 " strokeWidth={1.5} />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold  tracking-tight">
          Integration Coming Soon
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
          Integration of key compliance frameworks such as the EU AI Act and ISO
          42001 is on the way. We’re building unified tools to help you automate
          assessments, ensure continuous compliance, and stay ahead of evolving
          AI governance requirements.
        </p>
        {/* Subtle divider */}
        <div className="pt-4">
          <div className="h-px w-24 bg-muted mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
