"use client";
import React, { useState, useEffect, useCallback } from "react";

// Removed Navbar import - using static layout instead
import { successToast, errorToast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, X } from "lucide-react";

import { useTenant } from "@/contexts/TenantContext";
import { PolicyPack, Connector } from "./type";
import {
  fetchPolicyCenterPolicies,
  updatePolicyCenterPolicyStatus,
} from "@/lib/api/policy-center";

// Helper function to map API response to PolicyPack
const mapToPolicyPack = (data: any[]): PolicyPack[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    category: item.category ?? null,
    country: item.country ?? null,
    state: item.state ?? null,
    projectsCompliant: item.projectsCompliant ?? 0,
    totalProjects: item.totalProjects ?? 0,
    isActive: item.isActive ?? false,
    tags: item.tags ?? null,
    icon: item.icon ?? null,
    color: item.color ?? "",
    type: item.type,
    docsRequired: item.docsRequired,
    disable: item.disable,
  }));
};

const PolicyCenter = () => {
  const [selectedTab, setSelectedTab] = useState<string>("policy-packs");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyDescription, setNewPolicyDescription] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // State for policy packs from database
  const [mockPolicyPacks, setMockPolicyPacks] = useState<PolicyPack[]>([]);

  // State for all policies (for dropdown options)
  const [allPolicies, setAllPolicies] = useState<PolicyPack[]>([]);

  // Fetch all policies for dropdown options (unfiltered)
  const fetchAllPolicies = useCallback(async () => {
    try {
      const data = await fetchPolicyCenterPolicies();
      setAllPolicies(mapToPolicyPack(data));
    } catch (error) {
      console.error("Error fetching all policies:", error);
    }
  }, []);

  // Fetch policies from API with filters
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCountry && selectedCountry !== "all") {
        params.append("country", selectedCountry);
      }
      if (selectedState && selectedState !== "all") {
        params.append("state", selectedState);
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const options = {
        country: selectedCountry !== "all" ? selectedCountry : undefined,
        state: selectedState !== "all" ? selectedState : undefined,
        search: debouncedSearch || undefined,
      };

      const data = await fetchPolicyCenterPolicies(options);
      setMockPolicyPacks(mapToPolicyPack(data));
    } catch (error) {
      errorToast("Error loading policies");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedState, debouncedSearch]);

  // Fetch all policies once on mount for dropdown options
  useEffect(() => {
    fetchAllPolicies();
  }, [fetchAllPolicies]);

  // Fetch filtered policies when filters change
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Mock data for connectors
  const mockConnectors: Connector[] = [];

  // Get unique countries for the dropdown from all policies
  const availableCountries = Array.from(
    new Set(
      allPolicies
        .map((pack) => pack.country)
        .filter((c): c is string => c !== null)
    )
  ).sort();

  // Get unique states for the selected country from all policies
  const availableStates =
    selectedCountry && selectedCountry !== "all"
      ? Array.from(
          new Set(
            allPolicies
              .filter((pack) => pack.country === selectedCountry && pack.state)
              .map((pack) => pack.state!)
          )
        ).sort()
      : [];

  // No need for client-side filtering anymore - API handles it
  const filteredPolicyPacks = mockPolicyPacks;

  // Reset state filter when country changes
  React.useEffect(() => {
    setSelectedState("all");
  }, [selectedCountry]);

  const handleAddPolicy = () => {
    if (!newPolicyName.trim()) {
      errorToast("Policy name is required");
      return;
    }

    // In a real app, this would make an API call
    successToast("Policy pack added successfully", "", "");
    setNewPolicyName("");
    setNewPolicyDescription("");
    setShowAddDialog(false);
  };
  const { refreshPolicyStatus, policyStatus } = useTenant();

  const handleTogglePolicyStatus = async (policyId: string) => {
    const policy = mockPolicyPacks.find((p) => p.id === policyId);
    if (!policy) return;

    const currentValue = policy["isActive"];
    const newValue = !currentValue;

    // Optimistically update UI
    setMockPolicyPacks((prevPolicies) =>
      prevPolicies.map((p) =>
        p.id === policyId ? { ...p, isActive: newValue } : p
      )
    );

    try {
      // Update in database
      await updatePolicyCenterPolicyStatus(policyId, newValue);

      // Refresh policy status from database to update sidebar
      await refreshPolicyStatus();

      successToast(
        `Policy ${newValue ? "enabled" : "disabled"} successfully`,
        "Policy",
        "updated"
      );
    } catch (error) {
      // Revert on error
      setMockPolicyPacks((prevPolicies) =>
        prevPolicies.map((p) =>
          p.id === policyId ? { ...p, isActive: currentValue } : p
        )
      );
      errorToast(`Error updating policy isActive`);
    }
  };

  const renderPolicyPackCard = (policy: PolicyPack) => {
    return (
      <>
        <div
          key={policy.id}
          className=" rounded-lg p-6 hover:shadow-md transition-shadow h-full bg-muted"
        >
          <div className="flex items-start justify-between mb-3 h-full">
            <div className="flex items-start gap-3 flex-1 h-full ">
              <div
                className={`w-8 h-8 rounded-full ${policy.color} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
              >
                {policy.icon || ""}
              </div>
              <div className="flex-1 min-w-0 flex flex-col h-full ">
                <h3 className="font-semibold  text-sm leading-tight mb-1 line-clamp-2">
                  {policy.name}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-2">
                  {policy.description || ""}
                </p>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {policy.category && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5  text-muted-foreground"
                    >
                      {policy.category}
                    </Badge>
                  )}
                  {policy.country && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5  text-muted-foreground"
                    >
                      {policy.country}
                      {policy.state ? `, ${policy.state}` : ""}
                    </Badge>
                  )}
                  {/* Mandatory/Voluntary Badge */}
                  {policy.type && (
                    <Badge
                      className={cn(
                        "text-xs px-2 py-0.5 font-medium border",
                        policy.type === "Mandatory"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-500"
                      )}
                    >
                      {policy.type}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t  mt-auto">
                  {/* Active Status Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Status
                    </span>
                    <Switch
                      defaultChecked={policy.isActive}
                      onCheckedChange={() =>
                        handleTogglePolicyStatus(policy.id)
                      }
                      disabled={policy.disable}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderConnectorCard = (connector: Connector) => {
    const isAddCredentials = connector.status === "Add Credentials";

    return (
      <div
        key={connector.id}
        className="bg-white border border-[#E4E4E7] rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-medium  text-sm">{connector.name}</span>
          </div>
          <button
            className={cn(
              "text-xs font-medium border-b",
              isAddCredentials
                ? "text-[#1C9852] border-[#1C9852] hover:text-[#15803D]"
                : "text-[#D84040] border-[#D84040] hover:text-[#B91C1C]"
            )}
          >
            {connector.status}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col p-5 w-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold  mb-2">Compliance Policies</h1>
          <p className="text-muted-foreground text-sm">
            Manage and monitor your policy compliance across all projects
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm  "
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="text-sm  ">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent className=" border ">
                <SelectItem value="all" className=" ">
                  All Countries
                </SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country} className=" ">
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* State/Province Filter - Only show when states are available */}
          {availableStates.length > 0 && (
            <div className="w-full sm:w-64">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="text-sm border-[#E4E4E7] ">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E4E4E7]">
                  <SelectItem value="all" className=" hover:bg-[#F4F4F5]">
                    cd d: All States
                  </SelectItem>
                  <SelectItem value="federal" className=" hover:bg-[#F4F4F5]">
                    Federal Only
                  </SelectItem>
                  {availableStates.map((state) => (
                    <SelectItem
                      key={state}
                      value={state}
                      className=" hover:bg-[#F4F4F5]"
                    >
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Content */}
        {selectedTab === "policy-packs" && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">
                  Loading policies...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPolicyPacks
                  .sort((a, b) => {
                    if (a.disable === b.disable) return 0;
                    return a.disable ? 1 : -1;
                  })
                  .map((policy, idx) => (
                    <div key={"policy" + idx}>
                      {renderPolicyPackCard(policy)}
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {selectedTab === "connectors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockConnectors.map(renderConnectorCard)}
          </div>
        )}

        {filteredPolicyPacks.length === 0 &&
          selectedTab === "policy-packs" &&
          search && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No policy found</p>
            </div>
          )}
      </div>
    </>
  );
};

export default PolicyCenter;
