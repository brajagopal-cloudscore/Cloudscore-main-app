"use client"
import Sidebar from "@/components/admin/sidebar/Sidebar";
// Removed Navbar import - using static layout instead
import { Bell, TrendingUp, Clock, AlertTriangle, Settings, Play, XCircle } from "lucide-react";

const mockAlerts = [
  { name: 'High Denial Rate', status: 'active', condition: 'denials greater than 5in 60 seconds', triggered: 12 },
  { name: 'Policy Bypass Attempt', status: 'active', condition: 'jailbreak attempts greater than 3in 5 minutes', triggered: 3 },
  { name: 'High Latency Warning', status: 'paused', condition: 'avg latency greater than 2000in 10 minutes', triggered: 0 },
  { name: 'Compliance Violation', status: 'active', condition: 'compliance violations any 1in 1 seconds', triggered: 8 }
];

const Alerts = () => (
  

      <div className="flex flex-col p-5">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
              <p className="text-gray-600 mt-1">Configure and manage real-time alerts for AI governance events</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span className="text-lg">+</span>
              New Alert
            </button>
          </div>

          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                  <p className="text-sm text-green-600 mt-1">3 active</p>
                </div>
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Triggered Today</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                  <p className="text-sm text-green-600 mt-1">↑ 18% from yesterday</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">1.2s</p>
                  <p className="text-sm text-green-600 mt-1">↓ 0.3s improvement</p>
                </div>
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-red-600 mt-1">Needs attention</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Alert Rules */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Configured Alerts</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your alert rules and notification channels</p>
            </div>
            <div className="divide-y divide-gray-200">
              {mockAlerts.map((alert, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold">{alert.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${alert.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                            }`}>
                            {alert.status}
                          </span>
                          <div className="flex items-center">
                            <div className={`w-8 h-4 rounded-full p-1 ${alert.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                              } transition-colors duration-200`}>
                              <div className={`w-2 h-2 rounded-full bg-white transition-transform duration-200 ${alert.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                                }`}></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.name === 'High Denial Rate' && 'Triggers when policy denials exceed threshold'}
                          {alert.name === 'Policy Bypass Attempt' && 'Detects potential policy bypass attempts'}
                          {alert.name === 'High Latency Warning' && 'Alerts when response times are consistently high'}
                          {alert.name === 'Compliance Violation' && 'Immediate alert for compliance policy violations'}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>{alert.condition}</span>
                          <span>2 actions</span>
                          <span>Triggered {alert.triggered} times</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Bell className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        <Play className="w-3 h-3" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-600">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

);

export default Alerts;
