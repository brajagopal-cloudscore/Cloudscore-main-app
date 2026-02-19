"use client"

import type React from "react"
import { useState } from "react"
import { Settings, Shield, FileText, Database, Target } from "lucide-react"
import RedTeamingTab, { type RedTeamingTask } from "./RedTeaming"
import PoliciesTab from "./Polices"
import EndpointsTab from "./Endpoints"
import GuardrailsComponent from "./Guardrails"
import DatasetsTab, { Dataset } from "./Datasets"

// Disabled Tab Component
const DisabledTab: React.FC<{ tabName: string; icon: React.ReactNode }> = ({ tabName, icon }) => {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-96">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-400 mb-2">{tabName}</h2>
      <p className="text-gray-500 text-center max-w-md">
        This feature is coming soon. Complete the previous steps to unlock this functionality.
      </p>
    </div>
  )
}

// Main Dashboard Component
const AIManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [endpoints, setEndpoints] = useState<any>([])
  const [policies, setPolicies] = useState<any>([])
  const [redTeamingTasks, setRedTeamingTasks] = useState<RedTeamingTask[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])

  // Tab configuration
  const tabs = [
    {
      name: "Endpoints",
      icon: <Settings size={16} />,
      enabled: true,
    },
    {
      name: "Guardrails",
      icon: <Shield size={16} />,
      enabled: endpoints.length > 0,
    },
    {
      name: "Policies",
      icon: <FileText size={16} />,
      enabled: endpoints.length > 0,
    },
    {
      name: "Datasets",
      icon: <Database size={16} />,
      enabled: endpoints.length > 0,
    },
    {
      name: "Red Teaming",
      icon: <Target size={16} />,
      enabled: endpoints.length > 0 && policies.length > 0,
    },
  ]

  const handleAddEndpoint = (endpointData?: any) => {
    const newEndpoint: any = endpointData || {
      id: `endpoint-${Date.now()}`,
      name: `gpt-4o-ebay-${endpoints.length + 1}`,
      modelName: "gpt-4o",
      type: "foundationModels",
      lastModified: new Date().toLocaleDateString() + " & " + new Date().toLocaleTimeString(),
    }

    if (!endpointData) {
      newEndpoint.id = `endpoint-${Date.now()}`
    } else {
      const finalEndpoint: any = {
        id: `endpoint-${Date.now()}`,
        ...endpointData,
      }
      setEndpoints([...endpoints, finalEndpoint])
      return
    }

    setEndpoints([...endpoints, newEndpoint])
  }

  const handleAddRedTeamingTask = () => {
    const newTask: RedTeamingTask = {
      id: `task-${Date.now()}`,
      name: `gpt-4o-ebay-task-${redTeamingTasks.length + 1}`,
      model: "gpt-4o",
      testPercentage: 10,
      testType: "Bias Test",
      dateRun: new Date().toLocaleDateString() + " & " + new Date().toLocaleTimeString(),
      riskScore: (Math.random() * 50 + 10).toFixed(2) + "%",
      status: Math.random() > 0.5 ? "Finished" : "Running",
    }
    setRedTeamingTasks([...redTeamingTasks, newTask])
  }

  const handleAddDataset = () => {
    const datasetTypes: Dataset["type"][] = ["training", "validation", "test", "production"]
    const sampleTags = ["nlp", "classification", "sentiment", "customer-support", "ecommerce", "multilingual"]
    const statuses: Dataset["status"][] = ["active", "processing", "archived"]

    const randomType = datasetTypes[Math.floor(Math.random() * datasetTypes.length)]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomTags = sampleTags.slice(0, Math.floor(Math.random() * 3) + 1)

    const newDataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: `eBay ${randomType} Dataset ${datasets.length + 1}`,
      description: `High-quality ${randomType} dataset for customer support AI model training and evaluation.`,
      recordCount: Math.floor(Math.random() * 100000) + 10000,
      size: `${(Math.random() * 500 + 50).toFixed(1)} MB`,
      type: randomType,
      lastUpdated: new Date().toLocaleDateString(),
      tags: randomTags,
      status: randomStatus,
    }
    setDatasets([...datasets, newDataset])
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <EndpointsTab endpoints={endpoints} onAddEndpoint={handleAddEndpoint} />
      case 1:
        return tabs[1].enabled ? <GuardrailsComponent /> : <DisabledTab tabName="Guardrails" icon={<Shield size={48} />} />
      case 2:
        return tabs[2].enabled ? (
          <PoliciesTab />
        ) : (
          <DisabledTab tabName="Policies" icon={<FileText size={48} />} />
        )
      case 3:
        return tabs[3].enabled ? (
          <DatasetsTab datasets={datasets} onAddDataset={handleAddDataset} />
        ) : (
          <DisabledTab tabName="Datasets" icon={<Database size={48} />} />
        )
      case 4:
        return tabs[4].enabled ? (
          <RedTeamingTab redTeamingTasks={redTeamingTasks} onAddRedTeamingTask={handleAddRedTeamingTask} />
        ) : (
          <DisabledTab tabName="Red Teaming" icon={<Target size={48} />} />
        )
      default:
        return <EndpointsTab endpoints={endpoints} onAddEndpoint={handleAddEndpoint} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Tab Navigation */}
      <div className="border-b border-gray-300 bg-white">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => tab.enabled && setActiveTab(index)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === index
                ? "border-black text-black bg-white"
                : tab.enabled
                  ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  : "border-transparent text-gray-300 cursor-not-allowed"
                }`}
              disabled={!tab.enabled}
            >
              <span className={tab.enabled ? "" : "opacity-50"}>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 min-h-screen">{renderTabContent()}</div>
    </div>
  )
}

export default AIManagementDashboard
