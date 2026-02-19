'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, AlertTriangle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createUseCaseWithRisks, updateUseCase, deleteUseCase } from '@/lib/actions/use-cases';
import { createRisk, updateRisk, deleteRisk } from '@/lib/actions/risks';
import { UseCaseModal } from './UseCaseModal';

interface UseCase {
  id: string;
  function: string;
  useCase: string;
  whatItDoes: string;
  agentPatterns: string[];
  keyInputs: string[];
  primaryOutputs: string[];
  businessImpact: string[];
  kpis: string[];
  risks?: Risk[];
}

interface Risk {
  id: string;
  riskName: string;
  owner: string;
  severity: string;
  likelihood: string;
  riskLevel: string;
  mitigationStatus: string;
}

interface Props {
  initialUseCases: UseCase[];
  applicationId: string;
  tenantId: string;
  userId: string;
}

export function UseCasesList({ initialUseCases, applicationId, tenantId, userId }: Props) {
  const [useCases, setUseCases] = useState(initialUseCases);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filteredUseCases = useCases.filter(uc =>
    uc.function.toLowerCase().includes(search.toLowerCase()) ||
    uc.useCase.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    startTransition(async () => {
      try {
        const newUseCase = await createUseCaseWithRisks(
          {
            tenantId,
            applicationId,
            function: data.function,
            useCase: data.useCase,
            whatItDoes: data.whatItDoes,
            agentPatterns: data.agentPatterns || [],
            keyInputs: data.keyInputs,
            primaryOutputs: data.primaryOutputs,
            businessImpact: data.businessImpact,
            kpis: data.kpis,
          }
        );
        setUseCases(prev => [newUseCase as any, ...prev]);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to create use case:', error);
        throw error;
      }
    });
  };

  const handleUpdate = async (data: any) => {
    if (!selectedUseCase) return;

    startTransition(async () => {
      try {
        const updated = await updateUseCase(selectedUseCase.id, data);
        setUseCases(prev => prev.map(uc => uc.id === updated.id ? { ...uc, ...updated } : uc));
        setIsModalOpen(false);
        setSelectedUseCase(null);
      } catch (error) {
        console.error('Failed to update use case:', error);
        throw error;
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteUseCase(id);
        setUseCases(prev => prev.filter(uc => uc.id !== id));
        setOpenDropdownId(null);
      } catch (error) {
        console.error('Failed to delete use case:', error);
        throw error;
      }
    });
  };

  const handleDropdownOpenChange = (open: boolean, useCaseId: string) => {
    if (open) {
      setOpenDropdownId(useCaseId);
    } else {
      setOpenDropdownId(null);
    }
  };

  const handleDropdownAction = (action: () => void, useCaseId: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      handleDropdownOpenChange(false, useCaseId);
      document.body.style.pointerEvents = 'auto';

      setTimeout(() => {
        action();
      }, 50);
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">Use Cases</h1>
          <p className="text-gray-600 text-sm font-normal">Document AI use cases and their associated risks</p>
        </div>
        <Button
          onClick={() => {
            setSelectedUseCase(null);
            setIsModalOpen(true);
          }}
          className="bg-[#18181B] hover:bg-gray-800 text-white"
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Use Case
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-[343px]">
        <Input
          type="search"
          placeholder="Search use cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-[#E4E4E7] text-[#18181B]"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Use Cases Grid */}
      <div className="grid gap-4">
        {filteredUseCases.length === 0 ? (
          <Card className="border-[#E4E4E7]">
            <CardContent className="py-12">
              <p className="text-center text-gray-500 text-sm font-normal">
                {search ? 'No use cases found' : 'No use cases yet. Create one to get started!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUseCases.map((useCase) => (
            <Card key={useCase.id} className="border-[#E4E4E7]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex-1">
                  <CardTitle className="text-xl text-[#18181B]">{useCase.useCase}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm font-normal">
                    {useCase.function}
                  </CardDescription>
                </div>
                <DropdownMenu
                  open={openDropdownId === useCase.id}
                  onOpenChange={(open) => handleDropdownOpenChange(open, useCase.id)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="text-[#18181B] h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={handleDropdownAction(() => {
                        setSelectedUseCase(useCase);
                        setIsModalOpen(true);
                      }, useCase.id)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <div className="border-t border-gray-200 my-1"></div>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={handleDropdownAction(() => handleDelete(useCase.id), useCase.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* What It Does */}
                <div>
                  <h4 className="font-medium mb-2 text-[#18181B] text-sm">Description</h4>
                  <p className="text-gray-600 text-sm font-normal leading-[20px]">{useCase.whatItDoes}</p>
                </div>

                {/* Agent Patterns */}
                {useCase.agentPatterns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-[#18181B] text-sm">AI System Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {useCase.agentPatterns.map((pattern, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Inputs & Outputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-[#18181B] text-sm">Key Inputs</h4>
                    <div className="flex flex-wrap gap-2">
                      {useCase.keyInputs.map((input, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                          {input}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-[#18181B] text-sm">Primary Outputs</h4>
                    <div className="flex flex-wrap gap-2">
                      {useCase.primaryOutputs.map((output, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                          {output}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Business Impact */}
                <div>
                  <h4 className="font-medium mb-2 text-[#18181B] text-sm">Business Impact</h4>
                  <div className="flex flex-wrap gap-2">
                    {useCase.businessImpact.map((impact, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                        {impact}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* KPIs */}
                <div>
                  <h4 className="font-medium mb-2 text-[#18181B] text-sm">KPIs</h4>
                  <div className="flex flex-wrap gap-2">
                    {useCase.kpis.map((kpi, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-gray-100 text-[#18181B] text-xs">
                        {kpi}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Associated Risks */}
                {useCase.risks && useCase.risks.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <p className="text-sm font-medium text-[#18181B]">Associated Risks ({useCase.risks.length})</p>
                    </div>
                    <div className="space-y-2">
                      {useCase.risks.map((risk) => (
                        <div key={risk.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
                          <span className="font-medium text-[#18181B]">{risk.riskName}</span>
                          <div className="flex gap-2">
                            <Badge variant={
                              risk.riskLevel === 'High' ? 'destructive' :
                                'outline'
                            }>
                              {risk.riskLevel}
                            </Badge>
                            <Badge variant={risk.mitigationStatus === 'Completed' ? 'secondary' : 'outline'}>
                              {risk.mitigationStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <UseCaseModal
        isOpen={isModalOpen}
        mode={selectedUseCase ? 'edit' : 'create'}
        useCase={selectedUseCase}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUseCase(null);
        }}
        onSubmit={selectedUseCase ? handleUpdate : handleCreate}
        isPending={isPending}
        tenantId={tenantId}
      />
    </div>
  );
}

