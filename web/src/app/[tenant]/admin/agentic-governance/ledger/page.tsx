"use client"
import Sidebar from "@/components/admin/sidebar/Sidebar";
// Removed Navbar import - using static layout instead
import { Download, Filter, Search, Clock, User, Monitor } from "lucide-react";

const mockAuditEvents = [
  { type: 'policy_check', model: 'gpt-4', decision: 'Allow', policy: 'content-safety', timestamp: '15/01/2024, 16:00:45' },
  { type: 'response_generation', model: 'gpt-4', decision: 'Allow', policy: 'content-safety', timestamp: '15/01/2024, 16:00:47' },
  { type: 'bias_check', model: 'claude-3', decision: 'Warn', policy: 'bias-detection', timestamp: '15/01/2024, 16:00:46' },
  { type: 'audit_log', model: 'gpt-4', decision: 'Allow', policy: 'compliance-check', timestamp: '15/01/2024, 16:00:49' }
];

const mockLiveEvents = [
  { input: 'This supplement will cure your diabetes in 30 days guaranteed', output: 'deny', policy: 'Financial Compliance', user: 'test-harness@kodryx.com', timestamp: '20:01:47' },
  { input: 'Our investment products carry market risks and past performance does not guarantee future results', output: 'deny', policy: 'Financial Compliance', user: 'test-harness@kodryx.com', timestamp: '20:01:43' },
  { input: 'Buy this stock now for guaranteed 50% returns!', output: 'deny', policy: 'Financial Compliance', user: 'test-harness@kodryx.com', timestamp: '20:01:39' }
];

const Ledger = () => (
  
      <div className="flex flex-col p-5 ">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ledger</h1>
              <p className="text-gray-600 mt-1">Immutable audit trail with cryptographic verification</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Merkle Proof
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                C2PA Metadata
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-4 flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Models</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Decisions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Events */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold">Live Events</h3>
                <span className="text-sm text-gray-600">Streaming live • {mockLiveEvents.length} events shown</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {mockLiveEvents.map((event, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">rego-engine</span>
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Deny</span>
                      <span className="text-sm text-gray-600">{event.policy}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        0ms
                      </span>
                      <span>{event.user}</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">Input</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{event.input}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">Output</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">Decision: {event.output}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

);

export default Ledger;
