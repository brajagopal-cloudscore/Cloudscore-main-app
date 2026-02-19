"use client";

import type React from "react";

import { SingleSelectField, MultiSelectField } from "./_components/field";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  ChevronsUpDown,
  Edit2,
  Calendar,
  User,
  Target,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  SquareUser,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import {
  createUseCaseWithRisks,
  updateUseCase,
  deleteUseCase,
} from "@/lib/actions/use-cases";
import { getRisksByUseCase, getRisksByApplication } from "@/lib/actions/risks";
import { getFormattedDateString } from "@/lib/utils/helpers";
import { getUserNamesFromIds } from "@/lib/utils/userUtils";

// Mock constants - replace with actual imports
const BUSINESS_FUNCTIONS = [
  "Marketing",
  "Sales",
  "Customer Service",
  "Human Resources",
  "Finance",
  "Operations",
  "IT",
  "Legal",
  "Product Development",
  "Research & Development",
];

const USE_CASE_OPTIONS = [
  "Document Analysis",
  "Customer Support Automation",
  "Content Generation",
  "Data Analysis",
  "Process Automation",
  "Knowledge Management",
  "Code Generation",
  "Translation Services",
  "Sentiment Analysis",
  "Recommendation Engine",
];

// Map each business function to its relevant use cases
const FUNCTION_USE_CASE_MAP: Record<string, string[]> = {
  Marketing: [
    "Content Generation",
    "Data Analysis",
    "Sentiment Analysis",
    "Recommendation Engine",
  ],
  Sales: [
    "Customer Support Automation",
    "Data Analysis",
    "Recommendation Engine",
  ],
  "Customer Service": [
    "Customer Support Automation",
    "Knowledge Management",
    "Sentiment Analysis",
  ],
  "Human Resources": [
    "Document Analysis",
    "Process Automation",
    "Knowledge Management",
  ],
  Finance: ["Data Analysis", "Process Automation", "Document Analysis"],
  Operations: ["Process Automation", "Data Analysis"],
  IT: ["Code Generation", "Process Automation", "Knowledge Management"],
  Legal: ["Document Analysis", "Knowledge Management", "Translation Services"],
  "Product Development": [
    "Code Generation",
    "Data Analysis",
    "Content Generation",
  ],
  "Research & Development": [
    "Data Analysis",
    "Knowledge Management",
    "Translation Services",
  ],
};

// Function to filter use cases based on selected business function
function getUseCasesForFunction(
  businessFunction: string | undefined
): string[] {
  if (!businessFunction) {
    return USE_CASE_OPTIONS;
  }
  return FUNCTION_USE_CASE_MAP[businessFunction] || USE_CASE_OPTIONS;
}

const AGENT_PATTERN_OPTIONS = ["In-house ML", "GenAI", "3rd Party", "Agent"];

const KEY_INPUTS_OPTIONS = [
  "Text Documents",
  "Images",
  "Audio",
  "Video",
  "Structured Data",
  "Customer Feedback",
  "Financial Data",
  "Sensor Data",
  "User Interactions",
  "API Data",
];

const REGION_INPUT_OPTIONS = [
  "Global",
  "US California",
  "US Colorado",
  "EU Union",
];

const PRIMARY_OUTPUTS_OPTIONS = [
  "Reports",
  "Recommendations",
  "Classifications",
  "Predictions",
  "Summaries",
  "Alerts",
  "Insights",
  "Automated Actions",
  "Content",
  "Responses",
];

const BUSINESS_IMPACT_OPTIONS = [
  "Cost Reduction",
  "Revenue Increase",
  "Efficiency Improvement",
  "Customer Satisfaction",
  "Risk Mitigation",
  "Innovation",
  "Competitive Advantage",
  "Quality Improvement",
];

const KPIS_OPTIONS = [
  "Accuracy Rate",
  "Processing Time",
  "Cost Savings",
  "User Adoption",
  "Error Rate",
  "Customer Satisfaction Score",
  "Revenue Impact",
  "Efficiency Gain",
  "Response Time",
];

interface UseCase {
  id: string;
  function: string;
  useCase: string;
  whatItDoes: string;
  agentPatterns: string[];
  keyInputs: string[];
  primaryOutputs: string[];
  businessImpact: string[];
  region: string[];
  kpis: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  user_createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  user_updatedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface UseCaseModuleProps {
  initialUseCases?: UseCase[];
  applicationId: string;
  tenantId: string;
}

export default function UseCaseModule({
  initialUseCases = [],
  applicationId,
  tenantId,
}: UseCaseModuleProps) {
  const [useCases, setUseCases] = useState<UseCase[]>(initialUseCases);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteUseCaseModal, setDeleteUseCaseModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [useCaseRisks, setUseCaseRisks] = useState<Record<string, any[]>>({});

  const [formData, setFormData] = useState<Partial<UseCase>>({
    function: "",
    useCase: "",
    whatItDoes: "",
    agentPatterns: [],
    keyInputs: [],
    primaryOutputs: [],
    businessImpact: [],
    kpis: [],
    region: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  // Filter use cases based on selected business function
  const filteredUseCases = useMemo(() => {
    return getUseCasesForFunction(formData.function);
  }, [formData.function]);

  // Clear useCase if it's not in the filtered list when function changes
  useEffect(() => {
    if (formData.function && formData.useCase) {
      const validUseCases = getUseCasesForFunction(formData.function);
      if (!validUseCases.includes(formData.useCase)) {
        setFormData((prev) => ({ ...prev, useCase: "" }));
      }
    }
  }, [formData.function, formData.useCase]);

  // Memoize use case IDs to prevent infinite loops
  const useCaseIds = useMemo(
    () =>
      useCases
        ?.map((uc) => uc.id)
        .sort()
        .join(","),
    [useCases]
  );

  const previousUseCaseIdsRef = useRef<string>("");

  // Fetch risks for each use case
  useEffect(() => {
    // Only fetch if the IDs have actually changed
    if (useCaseIds === previousUseCaseIdsRef.current) {
      return;
    }

    previousUseCaseIdsRef.current = useCaseIds;

    const fetchRisks = async () => {
      const risksMap: Record<string, any[]> = {};
      for (const useCase of useCases) {
        try {
          const risks = await getRisksByUseCase(useCase.id);
          if (risks && risks.length > 0) {
            risksMap[useCase.id] = risks;
          }
        } catch (error) {
          console.error(
            `Error fetching risks for use case ${useCase.id}:`,
            error
          );
        }
      }
      setUseCaseRisks(risksMap);
    };

    if (useCases.length > 0) {
      fetchRisks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCaseIds]);

  // Memoize initial use case IDs
  const initialUseCaseIds = useMemo(
    () =>
      initialUseCases
        ?.map((uc) => uc.id)
        .sort()
        .join(","),
    [initialUseCases]
  );

  const previousInitialIdsRef = useRef<string>("");

  useEffect(() => {
    // Only update if the IDs have actually changed
    if (initialUseCaseIds === previousInitialIdsRef.current) {
      return;
    }

    previousInitialIdsRef.current = initialUseCaseIds;

    if (initialUseCases?.length > 0) {
      // Only update if the IDs have changed to prevent infinite loops
      const currentIds = useCases
        ?.map((uc) => uc.id)
        .sort()
        .join(",");
      if (currentIds !== initialUseCaseIds) {
        setUseCases(initialUseCases);
      }
    } else if (useCases?.length > 0) {
      // Clear use cases if initialUseCases becomes empty
      setUseCases([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUseCaseIds]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.function?.trim()) newErrors.function = "Function is required";
    if (!formData.useCase) newErrors.useCase = "Use case is required";
    if (!formData.whatItDoes?.trim())
      newErrors.whatItDoes = "Description is required";
    if (!formData.keyInputs?.length)
      newErrors.keyInputs = "At least one key input is required";
    if (!formData.primaryOutputs?.length)
      newErrors.primaryOutputs = "At least one primary output is required";
    if (!formData.businessImpact?.length)
      newErrors.businessImpact = "At least one business impact is required";
    if (!formData.kpis?.length) newErrors.kpis = "At least one KPI is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsPending(true);
    try {
      const now = new Date().toISOString();
      const useCaseData = {
        tenantId,
        applicationId,
        function: formData.function || "",
        useCase: formData.useCase || "",
        whatItDoes: formData.whatItDoes || "",
        agentPatterns: formData.agentPatterns || [],
        keyInputs: formData.keyInputs || [],
        primaryOutputs: formData.primaryOutputs || [],
        businessImpact: formData.businessImpact || [],
        kpis: formData.kpis || [],
        region: formData.region || [],
      };

      if (isEditing && useCase) {
        // Update existing use case
        const res = await updateUseCase(useCase.id, useCaseData);
        const updated = {
          ...res,
          region: res.region ?? [],
        };
        const updatedUseCases = useCases?.map((uc) =>
          uc.id === updated.id ? { ...uc, ...updated } : uc
        );
        setUseCases(updatedUseCases);
        setUseCase(updated);
      } else {
        const newUseCase = await createUseCaseWithRisks(useCaseData);
        const updatedUseCases = [newUseCase as any, ...useCases];
        setUseCases(updatedUseCases);
        setUseCase(newUseCase as any);

        // Fetch the risks for the new use case
        try {
          const risks = await getRisksByUseCase(newUseCase.id);
          if (risks && risks.length > 0) {
            setUseCaseRisks((prev) => ({ ...prev, [newUseCase.id]: risks }));
          }
        } catch (error) {
          console.error("Error fetching risks for new use case:", error);
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save use case:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleEdit = () => {
    if (useCase) {
      setFormData(useCase);
      setIsEditing(true);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setDeleteUseCaseModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteUseCaseModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!useCase) return;

    setIsDeleting(true);
    try {
      await deleteUseCase(useCase.id);
      const updatedUseCases = useCases.filter((uc) => uc.id !== useCase.id);
      setUseCases(updatedUseCases);
      setUseCase(null);

      // Remove the risk from state (it's automatically deleted by the cascade)
      setUseCaseRisks((prev) => {
        const newRisks = { ...prev };
        delete newRisks[useCase.id];
        return newRisks;
      });

      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting use case:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("useCases", useCases);
  const resetForm = () => {
    setFormData({
      function: "",
      useCase: "",
      whatItDoes: "",
      agentPatterns: [],
      keyInputs: [],
      primaryOutputs: [],
      businessImpact: [],
      kpis: [],
      region: [],
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="">
              {isEditing ? "Edit Use Case" : "Create Use Case"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm font-normal">
              {isEditing
                ? "Update your AI use case details."
                : "Define your AI use case with all required details."}
            </DialogDescription>
          </DialogHeader>

          <div
            className="grid gap-6 py-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          >
            <SingleSelectField
              field="function"
              options={BUSINESS_FUNCTIONS}
              placeholder="Select business function"
              label="Business Function"
              required={true}
              formData={formData}
              data={formData["function"] ?? ""}
              error={errors["function"]}
              onUpdate={setFormData}
            />

            <SingleSelectField
              field="useCase"
              options={filteredUseCases}
              placeholder="Select a use case"
              label="Use Case"
              required={true}
              formData={formData}
              data={formData["useCase"] ?? ""}
              error={errors["useCase"]}
              onUpdate={setFormData}
            />

            <div className="space-y-2">
              <Label
                htmlFor="whatItDoes"
                className="text-muted-foreground text-sm font-normal"
              >
                What it does *
              </Label>
              <Textarea
                id="whatItDoes"
                placeholder="Describe what this use case does..."
                value={formData.whatItDoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    whatItDoes: e.target.value,
                  }))
                }
                rows={4}
                className=""
              />
              {errors.whatItDoes && (
                <p className="text-sm text-red-600">{errors.whatItDoes}</p>
              )}
            </div>

            <MultiSelectField
              field="agentPatterns"
              options={AGENT_PATTERN_OPTIONS}
              placeholder="Select AI System Types"
              label="AI System Types"
              formData={formData}
              data={formData["agentPatterns"] ?? []}
              error={errors["agentPatterns"]}
              onUpdate={setFormData}
            />

            <MultiSelectField
              field="keyInputs"
              options={KEY_INPUTS_OPTIONS}
              placeholder="Select key inputs"
              label="Key Inputs"
              formData={formData}
              data={formData["keyInputs"] ?? []}
              error={errors["keyInputs"]}
              onUpdate={setFormData}
            />

            <MultiSelectField
              field="region"
              options={REGION_INPUT_OPTIONS}
              placeholder="Select Region"
              label="Region"
              formData={formData}
              data={formData["region"] ?? []}
              error={errors["region"]}
              onUpdate={setFormData}
            />

            <MultiSelectField
              field="primaryOutputs"
              options={PRIMARY_OUTPUTS_OPTIONS}
              placeholder="Select primary outputs"
              label="Primary Outputs"
              formData={formData}
              data={formData["primaryOutputs"] ?? []}
              error={errors["primaryOutputs"]}
              onUpdate={setFormData}
            />

            <MultiSelectField
              field="businessImpact"
              options={BUSINESS_IMPACT_OPTIONS}
              placeholder="Select business impacts"
              label="Business Impact"
              formData={formData}
              data={formData["businessImpact"] ?? []}
              error={errors["businessImpact"]}
              onUpdate={setFormData}
            />

            <MultiSelectField
              field="kpis"
              options={KPIS_OPTIONS}
              placeholder="Select KPIs"
              label="KPIs"
              formData={formData}
              data={formData["kpis"] ?? []}
              error={errors["kpis"]}
              onUpdate={setFormData}
            />
            {formData.kpis && formData.kpis.length > 0 && (
              <>
                {formData.kpis?.map((kpi, idx) => (
                  <div className="space-y-2" key={idx}>
                    <Label
                      key={`kpi-${idx}`}
                      htmlFor={`kpi-${idx}`}
                      className="text-muted-foreground text-sm font-normal"
                    >
                      {kpi} Value
                    </Label>
                    <Input
                      key={`kpi-input-${idx}`}
                      type="number"
                      id={`kpi-${idx}`}
                      min={0}
                      max={100}
                      placeholder="0-100"
                      className="[&::-webkit-inner-spin-button]:appearance-none 
             [&::-webkit-outer-spin-button]:appearance-none 
             [&::-moz-appearance]:textfield"
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save" : "Create Use Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use Cases List */}
      <div className="grid gap-4">
        {useCases?.length === 0 ? (
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div></div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2 ">
                No use case identified
              </h3>
              <p className="text-muted-foreground text-center mb-6 text-sm font-normal">
                Start by adding use case associated with your application to
                enable proper use case management.
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Use Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          useCases?.map((useCaseItem) => (
            <Card key={useCaseItem.id}>
              <CardHeader className="flex gap-2">
                <div className="flex gap-3 flex-col">
                  <CardTitle className="text-xl font-semibold">
                    {useCaseItem.useCase}
                  </CardTitle>
                  <CardDescription>{useCaseItem.whatItDoes}</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setUseCase(useCaseItem);
                      setFormData(useCaseItem);
                      setIsEditing(true);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setUseCase(useCaseItem);
                      setDeleteUseCaseModal(true);
                    }}
                  >
                    <Trash2 className=" h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Function Section */}
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    <h4 className="font-semibold  text-sm">
                      Business Function
                    </h4>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-500 text-sm font-medium px-3 py-1"
                  >
                    {useCaseItem.function}
                  </Badge>
                </div>

                {/* AI System Types */}
                {useCaseItem.agentPatterns &&
                  useCaseItem.agentPatterns.length > 0 && (
                    <div className=" rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-purple-500/10 rounded-md">
                          <Activity className="h-4 w-4 text-purple-500" />
                        </div>
                        <h4 className="font-semibold  text-sm">
                          AI System Types
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {useCaseItem.agentPatterns?.map((pattern, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-purple-500/10 text-purple-500 text-sm font-medium px-3 py-1"
                          >
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Key Inputs */}
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-orange-500/10 rounded-md">
                      <Target className="h-4 w-4 text-orange-500" />
                    </div>
                    <h4 className="font-semibold  text-sm">Key Inputs</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {useCaseItem.keyInputs?.map((input) => (
                      <Badge
                        key={input}
                        variant="secondary"
                        className="bg-orange-500/10 text-orange-500 text-sm font-medium px-3 py-1"
                      >
                        {input}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Primary Outputs */}
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-500/10 rounded-md">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Primary Outputs</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {useCaseItem.primaryOutputs?.map((output) => (
                      <Badge
                        key={output}
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-500 text-sm font-medium px-3 py-1"
                      >
                        {output}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Business Impact */}
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-cyan-500/10 rounded-md">
                      <TrendingUp className="h-4 w-4 text-cyan-500" />
                    </div>
                    <h4 className="font-semibold  text-sm">Business Impact</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {useCaseItem.businessImpact?.map((impact) => (
                      <Badge
                        key={impact}
                        variant="secondary"
                        className="bg-cyan-500/10 text-cyan-500 text-sm font-medium px-3 py-1"
                      >
                        {impact}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-pink-500/10 rounded-md">
                      <TrendingUp className="h-4 w-4 text-pink-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Region</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {useCaseItem.region?.map((impact) => (
                      <Badge
                        key={impact}
                        variant="secondary"
                        className="bg-pink-500/10 text-pink-500 text-sm font-medium px-3 py-1"
                      >
                        {impact}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* KPIs */}
                <div className=" rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-md">
                      <Target className="h-4 w-4 text-indigo-500" />
                    </div>
                    <h4 className="font-semibold text-sm">
                      Key Performance Indicators
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {useCaseItem.kpis?.map((kpi) => (
                      <Badge
                        key={kpi}
                        variant="secondary"
                        className="bg-indigo-500/10 text-indigo-500 text-sm font-medium px-3 py-1"
                      >
                        {kpi}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex text-muted-foreground flex-row gap-2 flex-wrap my-2 text-sm">
                  <div className="flex flex-row items-center gap-1 pr-2 border-r border-r-muted">
                    <User className="h-4 w-4" />
                    <span>
                      Created by:
                      {useCaseItem.user_createdBy?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-1 pr-2 border-r border-r-muted">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created: {getFormattedDateString(useCaseItem.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-1 pr-2 border-r border-r-muted">
                    <SquareUser className="h-4 w-4" />
                    <span>
                      Updated by:{" "}
                      {useCaseItem.user_updatedBy?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-1 pr-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Updated: {getFormattedDateString(useCaseItem.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteUseCaseModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Are you sure you want to delete this use case?"
        itemName={useCase?.useCase || "this use case"}
        itemType="use case"
      />
    </div>
  );
}
