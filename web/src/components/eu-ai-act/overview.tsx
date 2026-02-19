import React from "react";
import { complianceData } from "./constants";
import { Button } from "@nextui-org/react";
import { BarChart3, AlertTriangle, CheckCircle, Clock } from "lucide-react";
export default function Overview() {
  const overviewStats = {
    totalControls: Object.keys(complianceData).length,
    totalSubcontrols: Object.values(complianceData).reduce(
      (total, section) => total + section.subcontrols.length,
      0
    ),
    completedSubcontrols: 45,
    overdueSubcontrols: 12,
    highRiskItems: 8,
  };
  return (
    <>
      {/* Overview Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Compliance Overview
        </h1>
        <p className="text-gray-600">
          Track your organization's progress toward AI compliance goals
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {overviewStats.completedSubcontrols} Subcontrols out of{" "}
            {overviewStats.totalSubcontrols} completed
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(
              (overviewStats.completedSubcontrols /
                overviewStats.totalSubcontrols) *
                100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round((overviewStats.completedSubcontrols / overviewStats.totalSubcontrols) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Controls</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats.totalControls}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats.completedSubcontrols}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats.overdueSubcontrols}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">High Risk Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats.highRiskItems}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Items Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Priority Items
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h3 className="font-medium text-red-800">
                2.3 Record Maintenance of AI System Activities
              </h3>
              <p className="text-sm text-red-600">Due: 3 days ago</p>
            </div>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Take Action
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <h3 className="font-medium text-yellow-800">
                5.6 AI System Deactivation Mechanisms
              </h3>
              <p className="text-sm text-yellow-600">Due: Tomorrow</p>
            </div>
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Review
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <h3 className="font-medium text-blue-800">
                6.1 AI Act Compliance Policies and Guidelines
              </h3>
              <p className="text-sm text-blue-600">Due: In 5 days</p>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Review
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">
                1.1 AI Literacy Training marked as complete
              </p>
              <p className="text-xs text-gray-500">By John Doe • 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">
                3.2 Oversight Documentation assigned to Compliance Team
              </p>
              <p className="text-xs text-gray-500">By Jane Smith • 1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">
                4.3 Prompt Corrective Actions Implementation due date updated
              </p>
              <p className="text-xs text-gray-500">
                By Mike Johnson • 2 days ago
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
