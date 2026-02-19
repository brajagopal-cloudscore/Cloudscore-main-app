import React, { useState, useEffect } from 'react';
import { Plus, X, Check, AlertTriangle, Database, Edit2, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RiskNameSelectShadcn } from './RiskNameSelect';
import { ProjectRisk, getRiskFieldError } from '@/types/useCase';
import { useAIRisks } from '@/contexts/AIRisksContext';
import { UserSelect } from '@/components/common/UserSelect';
import { getUserNamesFromIds } from '@/lib/utils/userUtils';

interface RiskManagementProps {
  selectedRiskIds: string[];
  newRisks: Array<Partial<ProjectRisk>>;
  useAIRiskDatabase: { [key: number]: boolean };
  searchTerm?: string;
  isEdit: boolean;
  existingRisks?: ProjectRisk[];
  updatedRisks?: Array<Partial<ProjectRisk>>;
  removedRiskIds?: string[];
  tenantId: string;
  applicationId: string;
  onAddNewRisk: () => void;
  onUpdateNewRisk: (index: number, field: string, value: any) => void;
  onRemoveNewRisk: (index: number) => void;
  onToggleAIRiskDatabase: (index: number) => void;
  onSearchChange?: (term: string) => void;
  // Edit mode handlers
  onEditExistingRisk?: (riskId: string) => void;
  onUpdateExistingRisk?: (riskId: string, field: string, value: any) => void;
  onRemoveExistingRisk?: (riskId: string) => void;
  onCancelEditRisk?: (riskId: string) => void;
  onSaveEditRisk?: (riskId: string) => void;
  editingRiskId?: string | null;
  errors?: any;
}

// Tooltip content definitions
const FIELD_TOOLTIPS = {
  riskName: "The name or title that identifies this specific risk",
  owner: "The person or team responsible for managing and mitigating this risk",
  description: "Detailed explanation of the risk, its potential causes, and consequences",
  riskLevel: {
    title: "AI regulation compliance risk category based on EU AI Act",
    values: {
      "Minimal Risk": "Spam filters, low-impact recommender systems",
      "Limited Risk": "Chatbots, generative AI/deepfakes",
      "High Risk": "Critical infrastructure, recruitment, credit scoring, law enforcement, healthcare, justice",
      "Unacceptable": "Social scoring, manipulation, banned biometrics"
    }
  },
  likelihood: {
    title: "The probability that this risk will occur",
    values: {
      "Rare": "Very unlikely to occur (less than 10% chance)",
      "Unlikely": "Low probability of occurrence (10-30% chance)",
      "Possible": "Moderate probability of occurrence (30-70% chance)",
      "Likely": "High probability of occurrence (greater than 70% chance)"
    }
  },
  status: {
    title: "Current progress on risk mitigation activities",
    values: {
      "Not Started": "No mitigation actions have been initiated",
      "In Progress": "Mitigation activities are currently underway",
      "Requires Review": "Mitigation actions completed but need evaluation",
      "Completed": "All mitigation activities have been successfully finished"
    }
  },
  reviewDate: "The deadline by which risk review activities should be completed (required)",
  mitigationPlan: "Detailed plan describing how this risk will be mitigated, including specific actions and resources"
};

export const RiskManagement: React.FC<RiskManagementProps> = ({
  selectedRiskIds,
  newRisks,
  useAIRiskDatabase,
  searchTerm = '',
  isEdit,
  existingRisks = [],
  updatedRisks = [],
  removedRiskIds = [],
  tenantId,
  applicationId,
  onAddNewRisk,
  onUpdateNewRisk,
  onRemoveNewRisk,
  onToggleAIRiskDatabase,
  onSearchChange,
  // Edit mode handlers
  onEditExistingRisk,
  onUpdateExistingRisk,
  onRemoveExistingRisk,
  onCancelEditRisk,
  onSaveEditRisk,
  editingRiskId,
  errors
}) => {
  const { aiRisks } = useAIRisks();
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Calculate total risks properly
  const activeExistingRisks = existingRisks.filter(r => !removedRiskIds.includes(r._id));
  const totalRisks = activeExistingRisks.length + newRisks.length + selectedRiskIds.length;

  // Fetch user names when existing risks change
  useEffect(() => {
    const fetchUserNames = async () => {
      const uniqueOwnerIds = [...new Set(activeExistingRisks.map(risk => risk.sOwner).filter(Boolean))]
      if (uniqueOwnerIds.length > 0) {
        const names = await getUserNamesFromIds(uniqueOwnerIds, tenantId)
        setUserNames(names)
      }
    }

    if (activeExistingRisks.length > 0) {
      fetchUserNames()
    }
  }, [activeExistingRisks, tenantId])

  // Handle AI risk selection for auto-populate
  const handleAIRiskSelect = (index: number, selectedRiskName: string) => {
    const selectedAIRisk = aiRisks.find((risk: any) => risk.sRiskName === selectedRiskName);

    if (selectedAIRisk) {
      // Auto-populate all available fields from AI risk database
      onUpdateNewRisk(index, 'sRiskName', selectedAIRisk.sRiskName);

      // Auto-populate other fields if available
      if (selectedAIRisk.sDescription) {
        onUpdateNewRisk(index, 'sDescription', selectedAIRisk.sDescription);
      }

      if (selectedAIRisk.eLikelihood) {
        onUpdateNewRisk(index, 'eLikelihood', selectedAIRisk.eLikelihood);
      }

      // Set default values for fields not in AI risk database
      if (!selectedAIRisk.eMitigationStatus) {
        onUpdateNewRisk(index, 'eMitigationStatus', 'Not Started');
      }

      if (!selectedAIRisk.eRiskLevel) {
        // Set default risk level if not provided
        onUpdateNewRisk(index, 'eRiskLevel', 'Limited Risk');
      }
    } else {
      // Fallback: just set the risk name
      onUpdateNewRisk(index, 'sRiskName', selectedRiskName);
    }
  };

  // Check if a risk can be deleted (not the last one)
  const canDeleteRisk = (riskId?: string) => {
    if (!isEdit) return true;
    const wouldBeLastRisk = totalRisks <= 1;
    return !wouldBeLastRisk;
  };

  // Helper component for labels with tooltips
  const LabelWithTooltip = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
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

  // Helper component for select fields with value tooltips
  const SelectWithTooltips = ({
    value,
    onValueChange,
    tooltipData,
    children
  }: {
    value: string;
    onValueChange: (value: string) => void;
    tooltipData: any;
    children: React.ReactNode;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Select value={value} onValueChange={onValueChange}>
            {children}
          </Select>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm font-medium">{tooltipData.title}</p>
          {value && tooltipData.values[value] && (
            <p className="text-xs text-gray-300 mt-1">{tooltipData.values[value]}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Render existing risk in edit mode
  const renderExistingRisk = (risk: ProjectRisk, isEditing: boolean) => (
    <div key={risk._id} className="border rounded-md p-4 space-y-4 bg-blue-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">Existing Risk</h5>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditExistingRisk?.(risk._id)}
              >
                <Edit2 size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveExistingRisk?.(risk._id)}
                className="text-red-600 hover:text-red-700"
                disabled={!canDeleteRisk(risk._id)}
                title={!canDeleteRisk(risk._id) ? "Cannot remove the last risk" : "Remove this risk"}
              >
                <Trash2 size={16} />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSaveEditRisk?.(risk._id)}
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancelEditRisk?.(risk._id)}
              >
                <X size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        // Editable form with new field order
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.riskName}>Risk Name*</LabelWithTooltip>
              <Input
                value={risk.sRiskName || ''}
                onChange={(e) => onUpdateExistingRisk?.(risk._id, 'sRiskName', e.target.value)}
                placeholder="Enter risk name"
                className={getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sRiskName') ? 'border-red-500' : ''}
              />
              {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sRiskName') && (
                <p className="text-sm text-red-500 mt-1">
                  {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sRiskName')}
                </p>
              )}
            </div>
            <UserSelect
              value={risk.sOwner || ""}
              onChange={(value) => onUpdateExistingRisk?.(risk._id, 'sOwner', value)}
              placeholder="Select risk owner"
              error={!!getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sOwner')}
              label="Owner"
              required={true}
              tenantId={tenantId}
            />
            {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sOwner') && (
              <p className="text-sm text-red-500 mt-1">
                {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sOwner')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <LabelWithTooltip tooltip={FIELD_TOOLTIPS.description}>Description</LabelWithTooltip>
            <Textarea
              value={risk.sDescription || ''}
              onChange={(e) => onUpdateExistingRisk?.(risk._id, 'sDescription', e.target.value)}
              placeholder="Risk description"
              className={getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sDescription') ? 'border-red-500 min-h-[60px]' : 'min-h-[60px]'}
            />
            {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sDescription') && (
              <p className="text-sm text-red-500 mt-1">
                {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'sDescription')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.riskLevel.title}>Risk Level*</LabelWithTooltip>
              <SelectWithTooltips
                value={risk.eRiskLevel}
                onValueChange={(value) => onUpdateExistingRisk?.(risk._id, 'eRiskLevel', value)}
                tooltipData={FIELD_TOOLTIPS.riskLevel}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minimal Risk">Minimal Risk</SelectItem>
                  <SelectItem value="Limited Risk">Limited Risk</SelectItem>
                  <SelectItem value="High Risk">High Risk</SelectItem>
                  <SelectItem value="Unacceptable">Unacceptable</SelectItem>
                </SelectContent>
              </SelectWithTooltips>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.likelihood.title}>Likelihood*</LabelWithTooltip>
              <SelectWithTooltips
                value={risk.eLikelihood}
                onValueChange={(value) => onUpdateExistingRisk?.(risk._id, 'eLikelihood', value)}
                tooltipData={FIELD_TOOLTIPS.likelihood}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rare">Rare</SelectItem>
                  <SelectItem value="Unlikely">Unlikely</SelectItem>
                  <SelectItem value="Possible">Possible</SelectItem>
                  <SelectItem value="Likely">Likely</SelectItem>
                </SelectContent>
              </SelectWithTooltips>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.status.title}>Status*</LabelWithTooltip>
              <SelectWithTooltips
                value={risk.eMitigationStatus}
                onValueChange={(value) => onUpdateExistingRisk?.(risk._id, 'eMitigationStatus', value)}
                tooltipData={FIELD_TOOLTIPS.status}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Requires Review">Requires Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </SelectWithTooltips>
            </div>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip tooltip={FIELD_TOOLTIPS.reviewDate}>Review Date*</LabelWithTooltip>
            <Input
              type="date"
              value={risk.dTargetDate ? new Date(risk.dTargetDate).toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateExistingRisk?.(risk._id, 'dTargetDate', e.target.value)}
              className={getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'dTargetDate') ? 'border-red-500' : ''}
            />
            {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'dTargetDate') && (
              <p className="text-sm text-red-500 mt-1">
                {getRiskFieldError(errors, `updatedRisk_${risk._id}`, 'dTargetDate')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <LabelWithTooltip tooltip={FIELD_TOOLTIPS.mitigationPlan}>Mitigation Plan</LabelWithTooltip>
            <Textarea
              value={risk.sMitigationPlan || ''}
              onChange={(e) => onUpdateExistingRisk?.(risk._id, 'sMitigationPlan', e.target.value)}
              placeholder="Describe the mitigation plan for this risk"
              className="min-h-[100px]"
            />
          </div>
        </div>
      ) : (
        // Read-only view with new field order
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-500">Risk Name</Label>
              <p className="font-medium">{risk.sRiskName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Owner</Label>
              <p className="font-medium">{userNames[risk.sOwner] || risk.sOwner}</p>
            </div>
          </div>

          {risk.sDescription && (
            <div>
              <Label className="text-sm text-gray-500">Description</Label>
              <p className="text-sm">{risk.sDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-gray-500">Risk Level</Label>
              <p className='font-medium'>{risk.eRiskLevel}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Likelihood</Label>
              <p className="font-medium">{risk.eLikelihood}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Status</Label>
              <p className="font-medium">{risk.eMitigationStatus}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm text-gray-500">Review Date</Label>
            <p className="font-medium">
              {risk.dTargetDate ? new Date(risk.dTargetDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>

          {risk.sMitigationPlan && (
            <div>
              <Label className="text-sm text-gray-500">Mitigation Plan</Label>
              <p className="text-sm">{risk.sMitigationPlan}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Existing Risks Section - Only in Edit Mode */}
      {isEdit && activeExistingRisks.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Existing Risks</h4>
          {activeExistingRisks.map((risk) => renderExistingRisk(risk, editingRiskId === risk._id))}
        </div>
      )}

      {/* Manual Risk Creation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">Create New Risks</h4>
          <Button
            type="button"
            variant="outline"
            onClick={onAddNewRisk}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Risk
          </Button>
        </div>

        {/* New Risks Forms */}
        {newRisks.map((risk: any, index: number) => (
          <div key={index} className="border rounded-md p-4 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">New Risk #{index + 1}</h5>
              <div className="flex items-center gap-2">
                {/* AI Database Toggle */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleAIRiskDatabase(index)}
                  className="flex items-center gap-2"
                >
                  <Database size={16} />
                  {useAIRiskDatabase[index] ? 'Manual Entry' : 'Insert from AI Risks Database'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveNewRisk(index)}
                  disabled={!canDeleteRisk()}
                  title={!canDeleteRisk() ? "Cannot remove the last risk" : "Remove this new risk"}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* New field order: Risk name, Owner, Description, Risk Level, Likelihood, Status, Review Date, Mitigation Plan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <LabelWithTooltip tooltip={FIELD_TOOLTIPS.riskName}>Risk Name*</LabelWithTooltip>
                {useAIRiskDatabase[index] ? (
                  <>
                    <RiskNameSelectShadcn
                      value={risk.sRiskName}
                      onChange={(value) => handleAIRiskSelect(index, value)}
                      placeholder="Search and select from AI risks database"
                      className={getRiskFieldError(errors, `newRisk_${index}`, 'sRiskName') ? 'border-red-500' : ''}
                    />
                    {getRiskFieldError(errors, `newRisk_${index}`, 'sRiskName') && (
                      <p className="text-sm text-red-500 mt-1">
                        {getRiskFieldError(errors, `newRisk_${index}`, 'sRiskName')}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      value={risk.sRiskName || ''}
                      onChange={(e) => onUpdateNewRisk(index, 'sRiskName', e.target.value)}
                      placeholder="Enter risk name"
                      className={getRiskFieldError(errors, `newRisk_${index}`, 'sRiskName') ? 'border-red-500' : ''}
                    />
                    {getRiskFieldError(errors, `newRisk_${index}`, 'sRiskName') && (
                      <p className="text-sm text-red-500 mt-1">
                        {getRiskFieldError(errors, `newRisk_${index}`, 'sRiskName')}
                      </p>
                    )}
                  </>
                )}
              </div>
              <UserSelect
                value={risk.sOwner || ""}
                onChange={(value) => onUpdateNewRisk(index, 'sOwner', value)}
                placeholder="Select risk owner"
                error={!!getRiskFieldError(errors, `newRisk_${index}`, 'sOwner')}
                label="Owner"
                required={true}
                tenantId={tenantId}
              />
              {getRiskFieldError(errors, `newRisk_${index}`, 'sOwner') && (
                <p className="text-sm text-red-500 mt-1">
                  {getRiskFieldError(errors, `newRisk_${index}`, 'sOwner')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.description}>Description</LabelWithTooltip>
              <Textarea
                value={risk.sDescription || ''}
                onChange={(e) => onUpdateNewRisk(index, 'sDescription', e.target.value)}
                placeholder="Risk description"
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <LabelWithTooltip tooltip={FIELD_TOOLTIPS.riskLevel.title}>Risk Level*</LabelWithTooltip>
                <SelectWithTooltips
                  value={risk.eRiskLevel}
                  onValueChange={(value) => onUpdateNewRisk(index, 'eRiskLevel', value)}
                  tooltipData={FIELD_TOOLTIPS.riskLevel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem value="Minimal Risk">Minimal Risk</SelectItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">Spam filters, low-impact recommender systems</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem value="Limited Risk">Limited Risk</SelectItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">Chatbots, generative AI/deepfakes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem value="High Risk">High Risk</SelectItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">Critical infrastructure, recruitment, credit scoring, law enforcement, healthcare, justice</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem value="Unacceptable">Unacceptable</SelectItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">Social scoring, manipulation, banned biometrics</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectContent>
                </SelectWithTooltips>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip tooltip={FIELD_TOOLTIPS.likelihood.title}>Likelihood*</LabelWithTooltip>
                <SelectWithTooltips
                  value={risk.eLikelihood}
                  onValueChange={(value) => onUpdateNewRisk(index, 'eLikelihood', value)}
                  tooltipData={FIELD_TOOLTIPS.likelihood}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Unlikely">Unlikely</SelectItem>
                    <SelectItem value="Possible">Possible</SelectItem>
                    <SelectItem value="Likely">Likely</SelectItem>
                  </SelectContent>
                </SelectWithTooltips>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip tooltip={FIELD_TOOLTIPS.status.title}>Status*</LabelWithTooltip>
                <SelectWithTooltips
                  value={risk.eMitigationStatus}
                  onValueChange={(value) => onUpdateNewRisk(index, 'eMitigationStatus', value)}
                  tooltipData={FIELD_TOOLTIPS.status}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Requires Review">Requires Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </SelectWithTooltips>
              </div>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.reviewDate}>Review Date*</LabelWithTooltip>
              <Input
                type="date"
                value={risk.dTargetDate || ''}
                onChange={(e) => onUpdateNewRisk(index, 'dTargetDate', e.target.value)}
                className={getRiskFieldError(errors, `newRisk_${index}`, 'dTargetDate') ? 'border-red-500' : ''}
              />
              {getRiskFieldError(errors, `newRisk_${index}`, 'dTargetDate') && (
                <p className="text-sm text-red-500 mt-1">
                  {getRiskFieldError(errors, `newRisk_${index}`, 'dTargetDate')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip tooltip={FIELD_TOOLTIPS.mitigationPlan}>Mitigation Plan</LabelWithTooltip>
              <Textarea
                value={risk.sMitigationPlan || ''}
                onChange={(e) => onUpdateNewRisk(index, 'sMitigationPlan', e.target.value)}
                placeholder="Describe the mitigation plan for this risk"
                className="min-h-[100px]"
              />
            </div>
          </div>
        ))}
      </div>

      {errors?.risks && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{errors.risks}</p>
        </div>
      )}

      {/* Risk Count Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          Total Risks: {totalRisks}
          {isEdit && ` (${activeExistingRisks.length} existing, ${newRisks.length} new)`}
        </p>
      </div>
    </div>
  );
};
