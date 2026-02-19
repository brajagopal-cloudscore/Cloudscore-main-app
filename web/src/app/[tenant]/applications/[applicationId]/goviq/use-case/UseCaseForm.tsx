import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { UseCaseSelect } from "./UseCaseSelect";
import {
  AGENT_PATTERN_OPTIONS,
  BUSINESS_FUNCTIONS,
  BUSINESS_IMPACT_OPTIONS,
  KEY_INPUTS_OPTIONS,
  KPIS_OPTIONS,
  PRIMARY_OUTPUTS_OPTIONS,
  USE_CASE_OPTIONS,
} from "@/constants/useCaseOptions";
import {
  UseCase,
  AddUseCaseWithRisksData,
  ValidationError,
} from "@/types/useCase";

interface UseCaseFormProps {
  data: UseCase | AddUseCaseWithRisksData;
  errors: ValidationError;
  isEdit: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectChange: Function;
  onArrayChange: Function;
}

// Tooltip content definitions
const FIELD_TOOLTIPS = {
  sFunction:
    "Select the primary business function this use case belongs to (e.g., Operations, Sales, Marketing, HR, Finance, etc.)",
  sUseCase:
    "Specific use case name or category. You can select from predefined options or enter a custom use case",
  sWhatItDoes:
    "Provide a clear and detailed description of what this AI use case accomplishes, its purpose, and main functionality",
  aAgentPatterns:
    "AI agent patterns or architectures used in this implementation (e.g., RAG, Chain-of-Thought, Multi-Agent, etc.)",
  aKeyInputs:
    "Primary data sources, inputs, or resources required for this use case to function effectively",
  aPrimaryOutputs:
    "Main outputs, results, or deliverables produced by this use case",
  aBusinessImpact:
    "Specific business benefits, improvements, or impacts this use case delivers to the organization",
  aKPIs:
    "Key Performance Indicators used to measure the success and effectiveness of this use case",
};

export const UseCaseForm: React.FC<UseCaseFormProps> = ({
  data,
  errors,
  isEdit,
  onInputChange,
  onSelectChange,
  onArrayChange,
}) => {
  // Helper component for labels with tooltips
  const LabelWithTooltip = ({
    children,
    tooltip,
  }: {
    children: React.ReactNode;
    tooltip: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="text-sm font-medium flex items-center gap-1 cursor-help">
            {children}
            <Info size={12} className="text-gray-400" />
          </Label>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <LabelWithTooltip tooltip={FIELD_TOOLTIPS.sFunction}>
            Function*
          </LabelWithTooltip>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  value={data.sFunction || ""}
                  onValueChange={(value) => onSelectChange("sFunction", value)}
                >
                  <SelectTrigger
                    className={`w-full ${errors.sFunction ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_FUNCTIONS.map((func: string) => (
                      <SelectItem key={func} value={func}>
                        {func}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{FIELD_TOOLTIPS.sFunction}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {errors.sFunction && (
            <p className="text-sm text-red-500">{errors.sFunction}</p>
          )}
        </div>

        <div className="space-y-2">
          <LabelWithTooltip tooltip={FIELD_TOOLTIPS.sUseCase}>
            Use Case*
          </LabelWithTooltip>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <UseCaseSelect
                    options={USE_CASE_OPTIONS}
                    value={data.sUseCase}
                    onChange={(value) => onSelectChange("sUseCase", value)}
                    placeholder="Select or enter use case"
                    error={errors.sUseCase}
                    allowCustom={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{FIELD_TOOLTIPS.sUseCase}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {errors.sUseCase && (
            <p className="text-sm text-red-500">{errors.sUseCase}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <LabelWithTooltip tooltip={FIELD_TOOLTIPS.sWhatItDoes}>
          What it does*
        </LabelWithTooltip>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Textarea
                className={`${errors.sWhatItDoes ? "border-red-500" : ""} min-h-[80px]`}
                value={data.sWhatItDoes}
                name="sWhatItDoes"
                onChange={onInputChange}
                placeholder="Describe what this use case does"
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{FIELD_TOOLTIPS.sWhatItDoes}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {errors.sWhatItDoes && (
          <p className="text-sm text-red-500">{errors.sWhatItDoes}</p>
        )}
      </div>

      <div className="space-y-2">
        <LabelWithTooltip tooltip={FIELD_TOOLTIPS.aAgentPatterns}>
          AI System Types
        </LabelWithTooltip>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MultiSelect
                  options={AGENT_PATTERN_OPTIONS}
                  value={data?.aAgentPatterns || []}
                  onChange={(value) => onArrayChange("aAgentPatterns", value)}
                  placeholder={`Select or add agent patterns${isEdit ? " (optional)" : ""}`}
                  error={errors.aAgentPatterns}
                  allowCustom={true}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{FIELD_TOOLTIPS.aAgentPatterns}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {errors.aAgentPatterns && (
          <p className="text-sm text-red-500">{errors.aAgentPatterns}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <LabelWithTooltip tooltip={FIELD_TOOLTIPS.aKeyInputs}>
            Key Inputs*
          </LabelWithTooltip>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MultiSelect
                    options={KEY_INPUTS_OPTIONS}
                    value={data.aKeyInputs}
                    onChange={(value) => onArrayChange("aKeyInputs", value)}
                    placeholder="Select or add key inputs"
                    error={errors.aKeyInputs}
                    allowCustom={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{FIELD_TOOLTIPS.aKeyInputs}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {errors.aKeyInputs && (
            <p className="text-sm text-red-500">{errors.aKeyInputs}</p>
          )}
        </div>

        <div className="space-y-2">
          <LabelWithTooltip tooltip={FIELD_TOOLTIPS.aPrimaryOutputs}>
            Primary Outputs*
          </LabelWithTooltip>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MultiSelect
                    options={PRIMARY_OUTPUTS_OPTIONS}
                    value={data.aPrimaryOutputs}
                    onChange={(value) =>
                      onArrayChange("aPrimaryOutputs", value)
                    }
                    placeholder="Select or add primary outputs"
                    error={errors.aPrimaryOutputs}
                    allowCustom={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{FIELD_TOOLTIPS.aPrimaryOutputs}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {errors.aPrimaryOutputs && (
            <p className="text-sm text-red-500">{errors.aPrimaryOutputs}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <LabelWithTooltip tooltip={FIELD_TOOLTIPS.aBusinessImpact}>
          Business Impact*
        </LabelWithTooltip>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MultiSelect
                  options={BUSINESS_IMPACT_OPTIONS}
                  value={data.aBusinessImpact}
                  onChange={(value) => onArrayChange("aBusinessImpact", value)}
                  placeholder="Select or add business impacts"
                  error={errors.aBusinessImpact}
                  allowCustom={true}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{FIELD_TOOLTIPS.aBusinessImpact}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {errors.aBusinessImpact && (
          <p className="text-sm text-red-500">{errors.aBusinessImpact}</p>
        )}
      </div>

      <div className="space-y-2">
        <LabelWithTooltip tooltip={FIELD_TOOLTIPS.aKPIs}>
          KPIs*
        </LabelWithTooltip>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MultiSelect
                  options={KPIS_OPTIONS}
                  value={data.aKPIs}
                  onChange={(value) => onArrayChange("aKPIs", value)}
                  placeholder="Key performance indicators"
                  error={errors.aKPIs}
                  allowCustom={true}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{FIELD_TOOLTIPS.aKPIs}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {errors.aKPIs && <p className="text-sm text-red-500">{errors.aKPIs}</p>}
      </div>
    </div>
  );
};
