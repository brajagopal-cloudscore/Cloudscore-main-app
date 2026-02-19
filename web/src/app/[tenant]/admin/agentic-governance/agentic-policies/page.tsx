"use client"
import Sidebar from "@/components/admin/sidebar/Sidebar";
// Removed Navbar import - using static layout instead
import { Shield, Zap, Settings } from "lucide-react";

const mockPolicies = [
  { name: 'Demographic Diversity', status: 'draft', category: 'ethics', rules: 0, triggers: 0 },
  { name: 'Bias Detection', status: 'active', category: 'ethics', rules: 12, triggers: 157 },
  { name: 'Data Retention', status: 'active', category: 'privacy', rules: 6, triggers: 13 },
  { name: 'PII Protection', status: 'active', category: 'privacy', rules: 8, triggers: 99 },
  { name: 'Financial Compliance', status: 'active', category: 'compliance', rules: 20, triggers: 6 },
  { name: 'Content Safety', status: 'active', category: 'safety', rules: 15, triggers: 247 }
];

const AgenticPolicies = () => (
  

      <div className="flex flex-col  p-5">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
              <p className="text-gray-600 mt-1">Manage AI Trust & Alignment policies with real-time enforcement and comprehensive testing</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span className="text-lg">+</span>
              New Policy
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{mockPolicies.length} policies</span>
            <span>{mockPolicies.filter(p => p.status === 'active').length} active</span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <a href="#" className="border-b-2 border-blue-500 pb-2 text-sm font-medium text-blue-600">Policy List</a>
              <a href="#" className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">Policy Editor</a>
              <a href="#" className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">Test Harness</a>
            </nav>
          </div>

          {/* Policy List */}
          <div className="space-y-4">
            {mockPolicies.map((policy, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{policy.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${policy.status === 'active' ? 'bg-green-100 text-green-800' :
                        policy.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {policy.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${policy.category === 'ethics' ? 'bg-purple-100 text-purple-800' :
                        policy.category === 'privacy' ? 'bg-blue-100 text-blue-800' :
                          policy.category === 'compliance' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {policy.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      {policy.name === 'Demographic Diversity' && 'Demographic diversity checks bias as per region.'}
                      {policy.name === 'Bias Detection' && 'Identifies and warns about potential bias in AI responses'}
                      {policy.name === 'Data Retention' && 'Manages data retention and deletion policies'}
                      {policy.name === 'PII Protection' && 'Blocks requests and responses containing personal information'}
                      {policy.name === 'Financial Compliance' && 'Ensures compliance with financial regulations and policies'}
                      {policy.name === 'Content Safety' && 'Prevents generation of harmful or inappropriate content'}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {policy.rules} rules
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {policy.triggers} triggers
                      </span>
                      <span>Updated Jul 31, 2025</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Edit
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Test
                    </button>
                    {policy.status === 'active' ? (
                      <button className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded">
                        Pause
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

);

export default AgenticPolicies;
