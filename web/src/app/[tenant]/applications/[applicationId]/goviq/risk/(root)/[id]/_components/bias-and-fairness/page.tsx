"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Shield } from "lucide-react"
import BiasAndFairnessPage from "./BiasAndFairnessPage"
import BiasMonitoringTab from "../bias-monitoring-mitigation/bias-monitoring-mitigation-tab"

export interface UnifiedBiasFairnessDashboardProps {
  hasBiasReadPermission?: boolean
  hasBiasWritePermission?: boolean
  setComponent?: any
}

export interface BiasCheck {
  _id: string
  sCheckId: string
  sModel: string
  sDescription: string
  sStatus: string
  dCreatedAt?: string
  dUpdatedAt?: string
}


const UnifiedBiasFairnessDashboard: React.FC<UnifiedBiasFairnessDashboardProps> = ({
  hasBiasReadPermission = true,
  hasBiasWritePermission = true,
  setComponent,
}) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  // Modal handlers (simplified for now)
  const handleValidateFairness = () => {
    console.log("Opening validate fairness modal")
  }

  const handleAddBiasCheck = () => {
    console.log("Opening add bias check modal")
  }

  const handleEditBiasCheck = (check: BiasCheck) => {
    console.log("Opening edit bias check modal", check)
  }

  const handleDeleteBiasCheck = (id: string) => {
    console.log("Opening delete confirmation modal", id)
  }

  const handleViewDetails = (check: BiasCheck) => {
    console.log("Opening details modal", check)
  }

  const tabs = [
    {
      id: 0,
      name: "Bias & fairness",
      icon: BarChart3,
      enabled: hasBiasReadPermission,
    },
    {
      id: 1,
      name: "Bias Monitoring",
      icon: Shield,
      enabled: hasBiasReadPermission,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bias & Fairness Management</h1>
          <p className="text-slate-600">Comprehensive bias detection, fairness validation, and monitoring dashboard</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const isEnabled = tab.enabled

                return (
                  <button
                    key={tab.id}
                    onClick={() => isEnabled && setActiveTab(tab.id)}
                    disabled={!isEnabled}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                      ${isActive
                        ? "border-black text-black"
                        : isEnabled
                          ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          : "border-transparent text-gray-300 cursor-not-allowed"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 min-h-[600px]">
          {activeTab === 0 && (
            <BiasAndFairnessPage />
          )}
          {activeTab === 1 && <BiasMonitoringTab />}
        </div>
      </div>
    </div>
  )
}

export default UnifiedBiasFairnessDashboard
