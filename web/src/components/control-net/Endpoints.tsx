"use client";

import type React from "react";

import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";

interface Endpoint {
  id: string;
  name: string;
  modelName: string;
  type: string;
  lastModified: string;
}

// Create Endpoint Modal Component
const CreateEndpointModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (endpoint: Omit<Endpoint, "id">) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    endpointType: "LLM",
    systemPrompt: "You are a helpful AI assistant",
    provider: "Custom",
    modelName: "gpt-4o",
    inputModality: "text",
    outputModality: "text",
    transportType: "HTTPS",
    url: "https://api.openai.com:443/v1/chat/completions",
    apiKey: "",
    configurationName: "gpt-4o-ebay",
    version: "1",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const newEndpoint = {
      name: formData.configurationName,
      modelName: formData.modelName,
      type: "foundationModels",
      lastModified:
        new Date().toLocaleDateString() +
        " & " +
        new Date().toLocaleTimeString(),
    };
    onSave(newEndpoint);
    onClose();
    setCurrentStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-white text-black">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-black">
                Add New Endpoint
              </DialogTitle>
            </DialogHeader>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                Endpoint Configuration
              </h2>
              <p className="text-gray-600 text-sm">
                An Endpoint enables real-time predictions from a deployed model.
              </p>
            </div>

            {/* Step Navigation */}
            <div className="mb-8">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center ${currentStep >= 1 ? "text-black" : "text-gray-400"}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    1
                  </span>
                  <span className="ml-2 font-medium">Endpoint Info</span>
                  {currentStep === 1 && (
                    <ChevronRight size={16} className="ml-2" />
                  )}
                </div>

                <div
                  className={`flex items-center ${currentStep >= 2 ? "text-black" : "text-gray-400"}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    2
                  </span>
                  <span className="ml-2 font-medium">Connection/Transport</span>
                  {currentStep === 2 && (
                    <ChevronRight size={16} className="ml-2" />
                  )}
                </div>

                <div
                  className={`flex items-center ${currentStep >= 3 ? "text-black" : "text-gray-400"}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 3
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    3
                  </span>
                  <span className="ml-2 font-medium">Save & Confirm</span>
                </div>
              </div>
            </div>

            {/* Step 1: Endpoint Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2">
                    Select Endpoint Type:
                  </Label>
                  <RadioGroup
                    value={formData.endpointType}
                    onValueChange={(value) =>
                      handleInputChange("endpointType", value)
                    }
                    className="flex gap-4 mt-2"
                  >
                    {["LLM", "Chatbot/Copilot", "Agent"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={type}
                          id={type}
                          className="border-gray-300 text-black"
                        />
                        <Label htmlFor={type}>{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label
                    htmlFor="systemPrompt"
                    className="text-sm font-medium mb-2"
                  >
                    System Prompt:
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) =>
                      handleInputChange("systemPrompt", e.target.value)
                    }
                    className="mt-2 focus:ring-2 focus:ring-black focus:border-black"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2">
                    Select Provider:
                  </Label>
                  <RadioGroup
                    value={formData.provider}
                    onValueChange={(value) =>
                      handleInputChange("provider", value)
                    }
                    className="flex gap-4 mt-2 mb-2"
                  >
                    {["Custom", "OpenAI", "Fireworks", "Together"].map(
                      (provider) => (
                        <div
                          key={provider}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={provider}
                            id={provider}
                            className="border-gray-300 text-black"
                          />
                          <Label htmlFor={provider}>{provider}</Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                  <Button className="bg-black hover:bg-gray-900 text-white text-sm">
                    Show all providers
                  </Button>
                </div>

                <div>
                  <Label
                    htmlFor="modelName"
                    className="text-sm font-medium mb-2"
                  >
                    Model Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="modelName"
                    type="text"
                    value={formData.modelName}
                    onChange={(e) =>
                      handleInputChange("modelName", e.target.value)
                    }
                    className="mt-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2">
                    Input modality:
                  </Label>
                  <div className="flex gap-4 mt-2">
                    {["Text", "Image", "Audio"].map((modality) => (
                      <div
                        key={modality}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`input-${modality}`}
                          checked={formData.inputModality.includes(
                            modality.toLowerCase()
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange(
                                "inputModality",
                                formData.inputModality +
                                  "," +
                                  modality.toLowerCase()
                              );
                            } else {
                              handleInputChange(
                                "inputModality",
                                formData.inputModality
                                  .replace(modality.toLowerCase(), "")
                                  .replace(",,", ",")
                              );
                            }
                          }}
                          className="border-gray-300 text-black"
                        />
                        <Label htmlFor={`input-${modality}`}>{modality}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2">
                    Model Output modality:
                  </Label>
                  <RadioGroup
                    value={formData.outputModality}
                    onValueChange={(value) =>
                      handleInputChange("outputModality", value)
                    }
                    className="flex gap-4 mt-2"
                  >
                    {["Text", "Image", "Audio"].map((modality) => (
                      <div
                        key={modality}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={modality.toLowerCase()}
                          id={`output-${modality}`}
                          className="border-gray-300 text-black"
                        />
                        <Label htmlFor={`output-${modality}`}>{modality}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Connection/Transport */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2">
                    Transport Type:
                  </Label>
                  <RadioGroup
                    value={formData.transportType}
                    onValueChange={(value) =>
                      handleInputChange("transportType", value)
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="HTTPS"
                        id="https"
                        className="border-gray-300 text-black"
                      />
                      <Label htmlFor="https">HTTPS</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="url" className="text-sm font-medium mb-2">
                    URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="url"
                    type="text"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    className="mt-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey" className="text-sm font-medium mb-2">
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      handleInputChange("apiKey", e.target.value)
                    }
                    placeholder="Enter API Key"
                    className="mt-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <Button
                  onClick={() => setCurrentStep(3)}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 3: Save & Confirm */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="configName"
                    className="text-sm font-medium mb-2"
                  >
                    Configuration Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="configName"
                    type="text"
                    value={formData.configurationName}
                    onChange={(e) =>
                      handleInputChange("configurationName", e.target.value)
                    }
                    className="mt-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <Label htmlFor="version" className="text-sm font-medium mb-2">
                    Version <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="version"
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      handleInputChange("version", e.target.value)
                    }
                    className="mt-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div className="flex gap-4">
                  <Button className="border border-black bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-md transition-colors">
                    Test Connection
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-gray-50 p-6 border-l border-gray-200">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Endpoint Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> foundationModels
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span>{" "}
                    {formData.provider.toLowerCase()}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span>{" "}
                    {formData.modelName}
                  </div>
                  <div>
                    <span className="font-medium">Input Modalities:</span>{" "}
                    {formData.inputModality}
                  </div>
                  <div>
                    <span className="font-medium">Output Modality:</span>{" "}
                    {formData.outputModality}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Connection</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Transport:</span>{" "}
                    {formData.transportType.toLowerCase()}
                  </div>
                  <div>
                    <span className="font-medium">URL:</span> {formData.url}
                  </div>
                  <div>
                    <span className="font-medium">Headers:</span>
                  </div>
                  <div className="ml-2">Content-Type: application/json</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Deployment</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Configuration Name:</span>{" "}
                    {formData.configurationName}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span>{" "}
                    {formData.version}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Endpoints Tab Component
const EndpointsTab: React.FC<{
  endpoints: Endpoint[];
  onAddEndpoint: () => void;
}> = ({ endpoints, onAddEndpoint }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [endpointSubTypes] = useState([
    "View All",
    "LLM",
    "Chatbots/Copilots",
    "Agents",
  ]);
  const [activeSubType, setActiveSubType] = useState(0);

  const handleSaveEndpoint = (endpointData: Omit<Endpoint, "id">) => {
    const newEndpoint: Endpoint = {
      id: `endpoint-${Date.now()}`,
      ...endpointData,
    };
    onAddEndpoint();
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Endpoints</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add New Endpoint
        </Button>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-4 mb-6">
        {endpointSubTypes.map((subType, index) => (
          <Button
            key={subType}
            onClick={() => setActiveSubType(index)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSubType === index
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {subType}
          </Button>
        ))}
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
            <div>Endpoint Configuration Name</div>
            <div>Model Name</div>
            <div>Endpoint Type</div>
            <div>Last Modified At</div>
          </div>
        </div>

        <div className="bg-white">
          {endpoints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No endpoints configured. Add your first endpoint to get started.
            </div>
          ) : (
            endpoints.map((endpoint: any, index: any) => (
              <div
                key={endpoint.id}
                className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                <div className="grid grid-cols-4 gap-4 text-sm items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      {endpoint.name}
                    </span>
                    {index === 0 && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        Sample Endpoint
                      </span>
                    )}
                  </div>
                  <div className="text-gray-900">{endpoint.modelName}</div>
                  <div className="text-gray-900">{endpoint.type}</div>
                  <div className="text-gray-900">{endpoint.lastModified}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>Page 1 of 1</span>
        <div className="flex gap-2">
          <Button className="px-3 py-1 border border-gray-300 rounded bg-black text-white cursor-not-allowed">
            Previous
          </Button>
          <Button className="px-3 py-1 border border-gray-300 rounded bg-black text-white cursor-not-allowed">
            Next
          </Button>
        </div>
      </div>

      <CreateEndpointModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveEndpoint}
      />
    </>
  );
};

export default EndpointsTab;
