'use client';

import React from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Icons
import { Settings } from 'lucide-react';

interface AIRiskCenterPageProps {
  params: Promise<{ tenant: string }>;
}

export default function AIRiskCenterPage({ params }: AIRiskCenterPageProps) {
  const useCaseRisks = [
    { name: 'FaceSecure', risk: 'high', color: 'bg-red-500' },
    { name: 'ClaimAssist', risk: 'high', color: 'bg-red-500' },
    { name: 'CV Scanner', risk: 'medium', color: 'bg-blue-500' },
    { name: 'TalentFinder', risk: 'medium', color: 'bg-orange-500' },
    { name: 'Underwrite Easy', risk: 'medium', color: 'bg-orange-500' },
    { name: 'AdCopy Gen', risk: 'low', color: 'bg-blue-500' }
  ];

  const highImpactRisks = [
    {
      title: 'AI Hiring Tool',
      description: 'Model not assessed for disparate impact among intersectional groups.',
      type: 'Regulatory',
      severity: 'high'
    },
    {
      title: 'Insurance Model',
      description: 'Substandard performance, which may lead to inaccurate outcomes.',
      type: 'Operational',
      severity: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black">AI Risk Center</h1>
          <p className="text-gray-600 mb-6">Comprehensive overview of risks</p>
        </div>

      {/* Risk Center Dashboard */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-black">AI Risk Center</CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Use Case Risks */}
            <div>
              <h3 className="font-semibold mb-3">Use Case Risks</h3>
              <div className="grid grid-cols-3 gap-1">
                {useCaseRisks.map((useCase, index) => (
                  <div
                    key={index}
                    className={`${useCase.color} text-white p-3 text-xs font-medium text-center rounded`}
                  >
                    {useCase.name}
                  </div>
                ))}
              </div>
            </div>

            {/* High Impact Risks */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-3">High Impact Risks</h3>
              <div className="space-y-3">
                {highImpactRisks.map((risk, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{risk.title}</h4>
                      <Badge variant={risk.type === 'Regulatory' ? 'destructive' : 'secondary'}>
                        {risk.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain Risk */}
            <div>
              <h3 className="font-semibold mb-3">Domain Risk</h3>
              <div className="space-y-2">
                {[
                  { name: 'Property Damage', low: 2, medium: 1, high: 3 },
                  { name: 'Fraud Detection', low: 8, medium: 2, high: 4 },
                  { name: 'Claims Processing', low: 3, medium: 1, high: 0 },
                  { name: 'HR Candidates', low: 2, medium: 0, high: 1 },
                  { name: 'Text Generation', low: 1, medium: 0, high: 3 },
                  { name: 'Facial Recognition', low: 4, medium: 2, high: 1 },
                  { name: 'Ranking', low: 2, medium: 1, high: 0 }
                ].map((domain, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm w-32">{domain.name}</span>
                    <div className="flex space-x-1">
                      <div className="bg-blue-500 h-3" style={{ width: `${domain.low * 8}px` }}></div>
                      <div className="bg-orange-500 h-3" style={{ width: `${domain.medium * 8}px` }}></div>
                      <div className="bg-red-500 h-3" style={{ width: `${domain.high * 8}px` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-4 mt-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-300"></div>
                  <span>N/A</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500"></div>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Risk Category Levels */}
            <div>
              <h3 className="font-semibold mb-3">Risk Category Levels</h3>
              <div className="flex items-end space-x-4 h-32">
                <div className="flex flex-col items-center">
                  <div className="bg-purple-500 w-12 h-16 mb-1"></div>
                  <span className="text-xs">Regulatory</span>
                  <span className="text-xs font-semibold">22</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-500 w-12 h-24 mb-1"></div>
                  <span className="text-xs">Operational</span>
                  <span className="text-xs font-semibold">32</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-300 w-12 h-6 mb-1"></div>
                  <span className="text-xs">Reputational</span>
                  <span className="text-xs font-semibold">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Use Case Owner Risks */}
            <div>
              <h3 className="font-semibold mb-3">Use Case Owner Risks</h3>
              <div className="bg-gray-100 h-24 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Risk distribution by owner</div>
                  <div className="flex space-x-2 mt-2">
                    <div className="bg-purple-600 w-4 h-12"></div>
                    <div className="bg-gray-300 w-4 h-8"></div>
                    <div className="bg-gray-300 w-4 h-6"></div>
                    <div className="bg-gray-300 w-4 h-4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generative AI Usage */}
            <div>
              <h3 className="font-semibold mb-3">Generative AI Usage</h3>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500"></div>
                    <span className="text-xs">Submitted</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500"></div>
                    <span className="text-xs">Saved</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                    <span className="text-xs">Cost</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Cost</div>
                  <div className="text-lg font-bold">$25</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">250 submissions saved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
