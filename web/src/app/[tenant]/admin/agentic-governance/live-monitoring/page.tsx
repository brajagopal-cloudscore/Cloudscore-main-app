"use client"
import Sidebar from "@/components/admin/sidebar/Sidebar";
import { Pause, Download, Filter, Search, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { mockAuditEvents } from "../overview/page";

const LiveMonitoring = () => (
 

      <div className="flex flex-col p-5 w-full">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Console</h1>
              <p className="text-gray-600 mt-1">Real-time monitoring of AI decisions and policy enforcement</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Pause className="w-4 h-4" />
                Pause Stream
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export Logs
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
                    placeholder="Search hash, policy, user..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Last 24 Hours</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Models</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Actions</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>All Decisions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <a href="#" className="border-b-2 border-blue-500 pb-2 text-sm font-medium text-blue-600">DAG View</a>
              <a href="#" className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">Timeline</a>
              <a href="#" className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">Verification</a>
            </nav>
          </div>

          {/* Audit Trail */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Audit Timeline</h3>
              <p className="text-sm text-gray-600 mt-1">Chronological view of all audit events</p>
            </div>
            <div className="divide-y divide-gray-200">
              {mockAuditEvents.map((event, index) => (
                <div key={index} className="p-6 flex items-center gap-4">
                  <div className={`p-2 rounded-full ${event.decision === 'Allow' ? 'bg-green-100' :
                    event.decision === 'Deny' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                    {event.decision === 'Allow' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : event.decision === 'Deny' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{event.type.replace('_', ' ')}</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{event.model}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${event.decision === 'Allow' ? 'bg-green-100 text-green-800' :
                        event.decision === 'Deny' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {event.decision}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>0x{Math.random().toString(16).substr(2, 12)}...</span>
                      <span>{event.policy}</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    <Eye className="w-3 h-3" />
                    Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

);

export default LiveMonitoring;
