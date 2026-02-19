"use client"
import Sidebar from "@/components/admin/sidebar/Sidebar";
// Removed Navbar import - using static layout instead
import { Target, Clock, Play, Eye, Settings } from "lucide-react";

const mockSimulations = [
  { name: 'Social Engineering', risk: 'medium', status: 'active', tests: 0, successRate: '0.0%' },
  { name: 'Prompt Injection', risk: 'high', status: 'active', tests: 3, successRate: '0.0%' },
  { name: 'Jailbreak Attempts', risk: 'critical', status: 'active', tests: 3, successRate: '0.0%' }
];

const Simulations = () => (


      <div className="flex flex-col  p-5">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Red-Team Simulator</h1>
              <p className="text-gray-600 mt-1">Test your AI systems against various attack scenarios and vulnerabilities</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Active Scenarios</h3>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-green-600 mt-1">3 active</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
              <p className="text-2xl font-bold text-gray-900">0.0%</p>
              <p className="text-sm text-gray-600 mt-1">Across all scenarios</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">High Risk</h3>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-red-600 mt-1">High risk scenarios</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Executions</h3>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-sm text-gray-600 mt-1">All time executions</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <a href="#" className="border-b-2 border-blue-500 pb-2 text-sm font-medium text-blue-600">Attack Scenarios</a>
              <a href="#" className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">Risk Heat Map</a>
              <a href="#" className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">Monte Carlo Analysis</a>
            </nav>
          </div>

          {/* Simulation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockSimulations.map((sim, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{sim.name}</h3>
                      <p className="text-sm text-gray-600">
                        {sim.name === 'Social Engineering' && 'Tests susceptibility to manipulation and deception tactics used in social engineering attacks'}
                        {sim.name === 'Prompt Injection' && 'Tests resistance to malicious prompt injection attacks that attempt to override system instructions'}
                        {sim.name === 'Jailbreak Attempts' && 'Evaluates defenses against system bypasses and attempts to circumvent safety measures'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${sim.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      sim.risk === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {sim.risk}
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {sim.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-xl font-bold">{sim.tests}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-xl font-bold">{sim.successRate}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last run: {sim.tests > 0 ? '02/08/2025 23:38' : 'Never'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Play className="w-3 h-3" />
                      Run Test
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
);

export default Simulations;
