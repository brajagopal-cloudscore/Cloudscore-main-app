'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  useCase?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isPending: boolean;
  tenantId: string;
}

export function UseCaseModal({ isOpen, mode, useCase, onClose, onSubmit, isPending, tenantId }: Props) {
  const [formData, setFormData] = useState({
    function: '',
    useCase: '',
    whatItDoes: '',
    agentPatterns: [] as string[],
    keyInputs: [] as string[],
    primaryOutputs: [] as string[],
    businessImpact: [] as string[],
    kpis: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inputValues, setInputValues] = useState({
    agentPattern: '',
    keyInput: '',
    primaryOutput: '',
    businessImpact: '',
    kpi: '',
  });

  useEffect(() => {
    if (mode === 'edit' && useCase) {
      setFormData({
        function: useCase.function,
        useCase: useCase.useCase,
        whatItDoes: useCase.whatItDoes,
        agentPatterns: useCase.agentPatterns || [],
        keyInputs: useCase.keyInputs || [],
        primaryOutputs: useCase.primaryOutputs || [],
        businessImpact: useCase.businessImpact || [],
        kpis: useCase.kpis || [],
      });
    } else {
      setFormData({
        function: '',
        useCase: '',
        whatItDoes: '',
        agentPatterns: [],
        keyInputs: [],
        primaryOutputs: [],
        businessImpact: [],
        kpis: [],
      });
    }
    setErrors({});
  }, [mode, useCase, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.function.trim()) newErrors.function = 'Function is required';
    if (!formData.useCase.trim()) newErrors.useCase = 'Use case is required';
    if (!formData.whatItDoes.trim()) newErrors.whatItDoes = 'Description is required';
    if (formData.keyInputs.length === 0) newErrors.keyInputs = 'At least one key input is required';
    if (formData.primaryOutputs.length === 0) newErrors.primaryOutputs = 'At least one primary output is required';
    if (formData.businessImpact.length === 0) newErrors.businessImpact = 'At least one business impact is required';
    if (formData.kpis.length === 0) newErrors.kpis = 'At least one KPI is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save use case' });
    }
  };

  const addArrayItem = (field: keyof typeof inputValues, arrayField: keyof typeof formData) => {
    const value = inputValues[field].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        [arrayField]: [...(prev[arrayField] as string[]), value],
      }));
      setInputValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeArrayItem = (arrayField: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: (prev[arrayField] as string[]).filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">{mode === 'create' ? 'Create Use Case' : 'Edit Use Case'}</DialogTitle>
      <DialogContent className="sm:max-w-[700px] text-black p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 space-y-1 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {mode === 'create' ? 'Create Use Case' : 'Edit Use Case'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Function */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="function" className="text-[#18181B] text-sm font-normal">Function *</Label>
              <Input
                id="function"
                value={formData.function}
                onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value }))}
                placeholder="e.g., Customer Support"
                className={errors.function ? 'border-red-500' : ''}
              />
              {errors.function && <p className="text-sm text-red-600">{errors.function}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase" className="text-[#18181B] text-sm font-normal">Use Case *</Label>
              <Input
                id="useCase"
                value={formData.useCase}
                onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
                placeholder="e.g., Answer Customer Inquiries"
                className={errors.useCase ? 'border-red-500' : ''}
              />
              {errors.useCase && <p className="text-sm text-red-600">{errors.useCase}</p>}
            </div>
          </div>

          {/* What It Does */}
          <div className="space-y-2">
            <Label htmlFor="whatItDoes" className="text-[#18181B] text-sm font-normal">What It Does *</Label>
            <Textarea
              id="whatItDoes"
              value={formData.whatItDoes}
              onChange={(e) => setFormData(prev => ({ ...prev, whatItDoes: e.target.value }))}
              placeholder="Describe what this use case accomplishes..."
              rows={3}
              className={errors.whatItDoes ? 'border-red-500' : ''}
            />
            {errors.whatItDoes && <p className="text-sm text-red-600">{errors.whatItDoes}</p>}
          </div>

          {/* Agent Patterns */}
          <div className="space-y-2">
            <Label className="text-[#18181B] text-sm font-normal">AI System Types</Label>
            <div className="flex gap-2">
              <Input
                value={inputValues.agentPattern}
                onChange={(e) => setInputValues(prev => ({ ...prev, agentPattern: e.target.value }))}
                placeholder="e.g., RAG, Chain-of-Thought"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('agentPattern', 'agentPatterns');
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem('agentPattern', 'agentPatterns')} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.agentPatterns.map((pattern, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                  {pattern}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('agentPatterns', idx)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Key Inputs */}
          <div className="space-y-2">
            <Label className="text-[#18181B] text-sm font-normal">Key Inputs *</Label>
            <div className="flex gap-2">
              <Input
                value={inputValues.keyInput}
                onChange={(e) => setInputValues(prev => ({ ...prev, keyInput: e.target.value }))}
                placeholder="e.g., Customer question"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('keyInput', 'keyInputs');
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem('keyInput', 'keyInputs')} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.keyInputs.map((input, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                  {input}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('keyInputs', idx)} />
                </Badge>
              ))}
            </div>
            {errors.keyInputs && <p className="text-sm text-red-600">{errors.keyInputs}</p>}
          </div>

          {/* Primary Outputs */}
          <div className="space-y-2">
            <Label className="text-[#18181B] text-sm font-normal">Primary Outputs *</Label>
            <div className="flex gap-2">
              <Input
                value={inputValues.primaryOutput}
                onChange={(e) => setInputValues(prev => ({ ...prev, primaryOutput: e.target.value }))}
                placeholder="e.g., Text response"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('primaryOutput', 'primaryOutputs');
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem('primaryOutput', 'primaryOutputs')} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.primaryOutputs.map((output, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                  {output}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('primaryOutputs', idx)} />
                </Badge>
              ))}
            </div>
            {errors.primaryOutputs && <p className="text-sm text-red-600">{errors.primaryOutputs}</p>}
          </div>

          {/* Business Impact */}
          <div className="space-y-2">
            <Label className="text-[#18181B] text-sm font-normal">Business Impact *</Label>
            <div className="flex gap-2">
              <Input
                value={inputValues.businessImpact}
                onChange={(e) => setInputValues(prev => ({ ...prev, businessImpact: e.target.value }))}
                placeholder="e.g., Reduce response time by 70%"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('businessImpact', 'businessImpact');
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem('businessImpact', 'businessImpact')} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.businessImpact.map((impact, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                  {impact}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('businessImpact', idx)} />
                </Badge>
              ))}
            </div>
            {errors.businessImpact && <p className="text-sm text-red-600">{errors.businessImpact}</p>}
          </div>

          {/* KPIs */}
          <div className="space-y-2">
            <Label className="text-[#18181B] text-sm font-normal">KPIs *</Label>
            <div className="flex gap-2">
              <Input
                value={inputValues.kpi}
                onChange={(e) => setInputValues(prev => ({ ...prev, kpi: e.target.value }))}
                placeholder="e.g., Response time < 3s"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('kpi', 'kpis');
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem('kpi', 'kpis')} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.kpis.map((kpi, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                  {kpi}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('kpis', idx)} />
                </Badge>
              ))}
            </div>
            {errors.kpis && <p className="text-sm text-red-600">{errors.kpis}</p>}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-600"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

