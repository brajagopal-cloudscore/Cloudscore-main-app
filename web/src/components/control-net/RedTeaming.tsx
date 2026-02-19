"use client";

import { ChevronLeft, Info, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RedTeamingTask {
  id: string;
  name: string;
  model: string;
  testPercentage: number;
  testType: string;
  dateRun: string;
  riskScore: string;
  status: "Finished" | "Failed" | "Running" | "Queued";
}

// Create Red Teaming Task Modal Component
const CreateRedTeamingTaskModal = ({
  isOpen,
  onClose,
  onSave,
  endpoints = [],
}: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCustomTestDetails, setShowCustomTestDetails] = useState(false);
  const [formData, setFormData] = useState({
    taskName: "gpt-4o-ebay-v1",
    selectedTests: ["Bias Test", "Toxicity Test"],
    comprehensiveness: "Low",
    selectedEndpoint: "gpt-4o-ebay",
    customTests: {
      systemDescription:
        "You are a friendly and knowledgeable customer support agent for eBay.com. Your role is to engage warmly with customers, listen to their concerns or questions, and provide accurate and helpful solutions by referencing the eBay knowledge base whenever possible. Your key responsibilities include: Greeting customers politely and making them feel heard and",
      riskCategories: "",
      policy: "",
      attackScenarios: "3",
    },
  });

  const testTypes = [
    { name: "Bias Test", tags: ["OWASP Top 10", "NIST AI 600", "EU AI Act"] },
    { name: "CBRN Test", tags: ["NIST AI 600"] },
    {
      name: "Harmful Test",
      tags: ["OWASP Top 10", "NIST AI 600", "EU AI Act"],
    },
    {
      name: "Insecure Code Test",
      tags: ["OWASP Top 10", "NIST AI 600", "EU AI Act"],
    },
    {
      name: "Toxicity Test",
      tags: ["OWASP Top 10", "NIST AI 600", "EU AI Act"],
    },
  ];

  const handleTestSelection = (testName: any) => {
    setFormData((prev) => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testName)
        ? prev.selectedTests.filter((t) => t !== testName)
        : [...prev.selectedTests, testName],
    }));
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      selectedTests: testTypes.map((t) => t.name),
    }));
  };

  const handleSave = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: formData.taskName,
      model: "gpt-4o",
      testPercentage: 10,
      testType: formData.selectedTests[0] || "Custom Test",
      dateRun:
        new Date().toLocaleDateString() +
        " & " +
        new Date().toLocaleTimeString(),
      riskScore: (Math.random() * 50 + 10).toFixed(2) + "%",
      status: "Running",
    };
    onSave(newTask);
    onClose();
    setCurrentStep(1);
    setShowCustomTestDetails(false);
    setFormData({
      taskName: "gpt-4o-ebay-v1",
      selectedTests: ["Bias Test", "Toxicity Test"],
      comprehensiveness: "Low",
      selectedEndpoint: "gpt-4o-ebay",
      customTests: {
        systemDescription:
          "You are a friendly and knowledgeable customer support agent for eBay.com...",
        riskCategories: "",
        policy: "",
        attackScenarios: "3",
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[95vh] bg-white flex flex-col text-black">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              {showCustomTestDetails
                ? "Custom Test Details"
                : "Add Red Teaming Task"}
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              {showCustomTestDetails ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="system-description"
                      className="text-sm font-medium"
                    >
                      AI System Description*
                    </Label>
                    <Textarea
                      id="system-description"
                      value={formData.customTests.systemDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customTests: {
                            ...prev.customTests,
                            systemDescription: e.target.value,
                          },
                        }))
                      }
                      className="focus:ring-2 focus:ring-black focus:border-black"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="risk-categories"
                      className="text-sm font-medium"
                    >
                      Risk Categories
                    </Label>
                    <Input
                      id="risk-categories"
                      type="text"
                      placeholder="e.g. Order cancellations, Wrong refund"
                      value={formData.customTests.riskCategories}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customTests: {
                            ...prev.customTests,
                            riskCategories: e.target.value,
                          },
                        }))
                      }
                      className="focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="policy-select"
                      className="text-sm font-medium"
                    >
                      Policy
                    </Label>
                    <Select
                      value={formData.customTests.policy}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          customTests: { ...prev.customTests, policy: value },
                        }))
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-black focus:border-black">
                        <SelectValue placeholder="Select Policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy1">Policy 1</SelectItem>
                        <SelectItem value="policy2">Policy 2</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox id="advanced-settings" />
                      <Label
                        htmlFor="advanced-settings"
                        className="text-sm text-gray-600"
                      >
                        Show Advanced Settings
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="attack-scenarios"
                      className="text-sm font-medium"
                    >
                      Attack Scenarios*
                    </Label>
                    <Input
                      id="attack-scenarios"
                      type="text"
                      value={formData.customTests.attackScenarios}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customTests: {
                            ...prev.customTests,
                            attackScenarios: e.target.value,
                          },
                        }))
                      }
                      className="focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowCustomTestDetails(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back to Task Configuration
                    </Button>
                    <Button
                      onClick={() => setShowCustomTestDetails(false)}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Save Details
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Generative AI Red Teaming identifies vulnerabilities in an
                      AI endpoint. Steps for conducting Red Teaming:
                    </p>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div>
                        <strong>1. Task configuration:</strong> Select tests
                        from a preconfigured list and create custom tests. Risk
                        analysis on selected tests is available in Red Teaming
                        Report.
                      </div>
                      <div>
                        <strong>2. Endpoint configuration:</strong> Configure AI
                        endpoints including LLMs, Chatbots and Copilots.
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200 mb-6">
                    <div className="flex">
                      <Button
                        variant="ghost"
                        className={`px-4 py-2 text-sm font-medium border-b-2 rounded-none ${
                          currentStep === 1
                            ? "border-black text-black"
                            : "border-transparent text-gray-500"
                        }`}
                        onClick={() => setCurrentStep(1)}
                      >
                        Task Configuration
                      </Button>
                      <Button
                        variant="ghost"
                        className={`px-4 py-2 text-sm font-medium border-b-2 rounded-none ${
                          currentStep === 2
                            ? "border-black text-black"
                            : "border-transparent text-gray-500"
                        }`}
                        onClick={() => setCurrentStep(2)}
                      >
                        Endpoint Configuration
                      </Button>
                    </div>
                  </div>

                  {/* Step 1: Task Configuration */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="task-name"
                          className="text-sm font-medium"
                        >
                          Task Name*
                        </Label>
                        <Input
                          id="task-name"
                          type="text"
                          value={formData.taskName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              taskName: e.target.value,
                            }))
                          }
                          className="focus:ring-2 focus:ring-black focus:border-black"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-medium">Custom Tests</h3>
                          <Info size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Conduct Custom Red Teaming by adding detail of the AI
                          system
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>1. AI System Description</div>
                          <div>2. Custom Risk Categories</div>
                          <div>3. Policy or Code of Conduct</div>
                          <div>4. Attack Scenarios</div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setShowCustomTestDetails(true)}
                          className="border-black text-black hover:bg-gray-50"
                        >
                          Add Details
                        </Button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">
                              Test Types *
                            </h3>
                            <Info size={16} className="text-gray-400" />
                          </div>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="link"
                              onClick={handleSelectAll}
                              className="text-sm text-black hover:text-gray-600 p-0 h-auto"
                            >
                              Select All
                            </Button>
                            <div className="flex gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                NIST AI 600
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                OWASP Top 10
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                EU AI Act
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Choose any test types to run Red Teaming Task
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {testTypes.map((test, index) => (
                            <div
                              key={test.name}
                              className="border border-gray-300 rounded-lg p-4"
                            >
                              <div className="flex items-center mb-3">
                                <Checkbox
                                  id={`test-${index}`}
                                  checked={formData.selectedTests.includes(
                                    test.name
                                  )}
                                  onCheckedChange={() =>
                                    handleTestSelection(test.name)
                                  }
                                  className="mr-3"
                                />
                                <Label
                                  htmlFor={`test-${index}`}
                                  className="font-medium"
                                >
                                  {test.name}
                                </Label>
                                <Info
                                  size={16}
                                  className="text-gray-400 ml-2"
                                />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {test.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-medium">
                            Comprehensiveness of tests *
                          </h3>
                          <Info size={16} className="text-gray-400" />
                        </div>
                        <RadioGroup
                          value={formData.comprehensiveness}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              comprehensiveness: value,
                            }))
                          }
                          className="flex gap-4"
                        >
                          {["Low", "Medium", "High"].map((level) => (
                            <div
                              key={level}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem value={level} id={level} />
                              <Label htmlFor={level} className="text-sm">
                                {level}{" "}
                                {level === "Low" && "(For a Quick Report)"}
                                {level === "High" &&
                                  "(For Comprehensive Report)"}
                              </Label>
                              {level !== "Medium" && (
                                <Info
                                  size={16}
                                  className="text-gray-400 ml-1"
                                />
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          onClick={onClose}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setCurrentStep(2)}
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Endpoint Configuration */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="endpoint-select"
                          className="text-sm font-medium"
                        >
                          Select Config Or Enter Custom Config
                        </Label>
                        <Select
                          value={formData.selectedEndpoint}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              selectedEndpoint: value,
                            }))
                          }
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-black focus:border-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o-ebay">
                              gpt-4o-ebay
                            </SelectItem>
                            <SelectItem value="gpt-4o-ebay-2">
                              gpt-4o-ebay-2
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Endpoint Info</h3>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              foundationModels
                            </div>
                            <div>
                              <span className="font-medium">Provider:</span>{" "}
                              custom
                            </div>
                            <div>
                              <span className="font-medium">Model:</span> gpt-4o
                            </div>
                            <div>
                              <span className="font-medium">
                                Input Modalities:
                              </span>{" "}
                              text
                            </div>
                            <div>
                              <span className="font-medium">
                                Output Modality:
                              </span>{" "}
                              text
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Connection</h3>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Transport:</span>{" "}
                              https
                            </div>
                            <div>
                              <span className="font-medium">URL:</span>
                            </div>
                            <div>
                              <span className="font-medium">Headers:</span>
                            </div>
                            <div className="ml-4">
                              Content-Type: application/json
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Deployment</h3>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">
                                Configuration Name:
                              </span>{" "}
                              gpt-4o-ebay
                            </div>
                            <div>
                              <span className="font-medium">Version:</span> 1
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentStep(1)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleSave}
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          Run Test
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RedTeamingTab = ({ redTeamingTasks = [], onAddRedTeamingTask }: any) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Finished":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Running":
        return "bg-blue-100 text-blue-800";
      case "Queued":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTestTypeColor = (testType: any) => {
    return "bg-gray-100 text-gray-800";
  };

  const handleSaveTask = (taskData: any) => {
    onAddRedTeamingTask(taskData);
    setShowCreateModal(false);
  };

  const sampleTasks =
    redTeamingTasks.length === 0
      ? [
          {
            id: "sample-1",
            name: "Red Team Deepseek R1",
            model: "deepseek-reasoner",
            testPercentage: 100,
            testType: "Bias Test",
            dateRun: "12 Mar 2025 & 4:02 PM",
            riskScore: "42.39%",
            status: "Finished",
            tags: ["+4"],
          },
          {
            id: "sample-2",
            name: "Red Team o3-mini",
            model: "o3-mini",
            testPercentage: 100,
            testType: "Bias Test",
            dateRun: "12 Mar 2025 & 4:03 PM",
            riskScore: "25.91%",
            status: "Finished",
            tags: ["+4"],
          },
          {
            id: "sample-3",
            name: "gpt-4o-ebay-v1",
            model: "gpt-4o",
            testPercentage: 10,
            testType: "Bias Test",
            dateRun: "14 Apr 2025 & 8:40 AM",
            riskScore: "34.52%",
            status: "Finished",
            tags: ["+1"],
          },
          {
            id: "sample-4",
            name: "gpt-4o-ebay",
            model: "gpt-4o",
            testPercentage: 10,
            testType: "Custom Test",
            dateRun: "14 Apr 2025 & 8:38 AM",
            riskScore: "----",
            status: "Failed",
            tags: ["+1"],
          },
          {
            id: "sample-5",
            name: "gpt-4o-customer-support",
            model: "gpt-4o-mini",
            testPercentage: 10,
            testType: "Bias Test",
            dateRun: "14 Apr 2025 & 8:00 AM",
            riskScore: "33.73%",
            status: "Finished",
            tags: ["+1"],
          },
        ]
      : redTeamingTasks;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Red Teaming</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-black hover:bg-gray-900 text-white flex items-center gap-2"
        >
          <Plus size={16} />
          Add Red Teaming Task
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        {["View All", "Finished", "Failed", "Running", "Queued"].map(
          (filter, index) => (
            <Button
              key={filter}
              variant={index === 0 ? "default" : "secondary"}
              size="sm"
              className={
                index === 0
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            >
              {filter}
            </Button>
          )
        )}
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-700">
            <div>Test Name</div>
            <div>LLM Model</div>
            <div>Test (%)</div>
            <div>Tested For</div>
            <div>Date Run</div>
            <div>Risk Score</div>
            <div>Status</div>
          </div>
        </div>

        <div className="bg-white">
          {sampleTasks.map((task: any) => (
            <div
              key={task.id}
              className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
            >
              <div className="grid grid-cols-7 gap-4 text-sm items-center">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    {task.name}
                  </span>
                  {task.id.startsWith("sample-") && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      Sample Report
                    </span>
                  )}
                </div>
                <div className="text-gray-900">{task.model}</div>
                <div className="text-gray-900">{task.testPercentage}</div>
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${getTestTypeColor(task.testType)}`}
                  >
                    {task.testType}
                  </span>
                  {task.tags && (
                    <span className="text-xs text-gray-500">
                      {task.tags[0]}
                    </span>
                  )}
                </div>
                <div className="text-gray-900">{task.dateRun}</div>
                <div className="text-gray-900 font-medium">
                  {task.riskScore}
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>Page 1 of 1</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-gray-400 bg-transparent"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-gray-400 bg-transparent"
          >
            Next
          </Button>
        </div>
      </div>

      <CreateRedTeamingTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveTask}
        endpoints={[]}
      />
    </>
  );
};

export default RedTeamingTab;
