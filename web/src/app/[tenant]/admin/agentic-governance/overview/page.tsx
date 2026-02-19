"use client"
import { Eye, Play, TrendingUp, Shield, Clock, CheckCircle, Activity } from "lucide-react";
import Sidebar from '@/components/admin/sidebar/Sidebar';
// Removed Navbar import - using static layout instead

export const mockMetrics = {
  totalRequests: 6,
  policyBlocks: 0,
  avgLatency: 120,
  activePolicies: 3,
  requestGrowth: 5,
  blocksChange: -5,
  latencyChange: 5,
  policiesStatus: 'All operational'
};

export const mockAuditEvents = [
  { type: 'policy_check', model: 'gpt-4', decision: 'Allow', policy: 'content-safety', timestamp: '15/01/2024, 16:00:45' },
  { type: 'response_generation', model: 'gpt-4', decision: 'Allow', policy: 'content-safety', timestamp: '15/01/2024, 16:00:47' },
  { type: 'bias_check', model: 'claude-3', decision: 'Warn', policy: 'bias-detection', timestamp: '15/01/2024, 16:00:46' },
  { type: 'audit_log', model: 'gpt-4', decision: 'Allow', policy: 'compliance-check', timestamp: '15/01/2024, 16:00:49' }
];

const Overview = () => (


      <div className="flex flex-col p-5 ">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your AI safety and compliance in real-time</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Eye className="w-4 h-4" />
                View Live Console
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Play className="w-4 h-4" />
                Run Simulation
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalRequests}</p>
                  <p className="text-sm text-green-600 mt-1">↑ {mockMetrics.requestGrowth}% from last hour</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Policy Blocks</p>
                  <p className="text-2xl font-bold text-gray-900">{mockMetrics.policyBlocks}</p>
                  <p className="text-sm text-red-600 mt-1">↓ {mockMetrics.blocksChange}% from last hour</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Latency</p>
                  <p className="text-2xl font-bold text-gray-900">{mockMetrics.avgLatency}ms</p>
                  <p className="text-sm text-orange-600 mt-1">↑ {mockMetrics.latencyChange}% from last hour</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Policies</p>
                  <p className="text-2xl font-bold text-gray-900">{mockMetrics.activePolicies}</p>
                  <p className="text-sm text-green-600 mt-1">{mockMetrics.policiesStatus}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Request Volume</h3>
              <p className="text-sm text-gray-600 mb-4">AI requests over the last 24 hours</p>
              <div className="h-64 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Request volume chart would go here</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Decision Breakdown</h3>
              <p className="text-sm text-gray-600 mb-4">Policy decisions in the last 24 hours</p>
              <div className="h-64 flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">75% Allow</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Allow: 75%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Deny: 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Warn: 5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Recent Events</h3>
              <p className="text-sm text-gray-600 mt-1">Latest AI requests and policy decisions</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAuditEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.type.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${event.decision === 'Allow' ? 'bg-green-100 text-green-800' :
                          event.decision === 'Deny' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {event.decision}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.policy} • {event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

);

export default Overview;
