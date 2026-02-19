"use client";
import { useState } from "react";
import Sidebar from "@/components/admin/sidebar/Sidebar";
// Removed Navbar import - using static layout instead
import {
  Settings,
  Database,
  User,
  Eye,
  EyeOff,
  Edit2,
  TestTube,
} from "lucide-react";

const AgentSettings = () => {
  const [activeTab, setActiveTab] = useState("project");
  const [showKeys, setShowKeys] = useState<any>({});
  const [apiKeys, setApiKeys] = useState({
    openai: "sk-proj-e0...",
    gemini: "AIzaSyAqL5...",
    groq: "gsk_BybmcD...",
    resend: "re_...",
  });

  const toggleKeyVisibility = (keyName: any) => {
    setShowKeys((prev: any) => ({
      ...prev,
      [keyName]: !prev[keyName],
    }));
  };

  const handleKeyUpdate = (keyName: string, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [keyName]: value,
    }));
  };

  const maskKey = (key: any) => {
    if (!key) return "";
    return key.substring(0, 8) + "...";
  };

  const renderProjectTab = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Project Configuration</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure your project settings and default behaviors.
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              defaultValue="My Kodryx Project"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization
            </label>
            <input
              type="text"
              defaultValue="Your Organization"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description
          </label>
          <textarea
            rows={4}
            placeholder="Describe your project..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Model
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>OpenAI: gpt-4o</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Gemini Pro</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Threshold
            </label>
            <input
              type="number"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention (days)
            </label>
            <input
              type="number"
              defaultValue="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>JSON</option>
              <option>CSV</option>
              <option>XML</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="w-8 h-4 rounded-full p-1 bg-blue-500 transition-colors duration-200">
              <div className="w-2 h-2 rounded-full bg-white transition-transform duration-200 translate-x-4"></div>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Include metadata in exports
          </span>
        </div>

        <div className="pt-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Project Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure your API keys for LLM providers. Each key can be added,
            updated, or removed independently.
          </p>
        </div>
        <div className="p-6 space-y-8">
          {/* OpenAI API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  OpenAI API Key
                </h4>
                <p className="text-sm text-gray-600">
                  For GPT-4o and GPT-4o Mini models
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-mono text-gray-700">
                  {maskKey(apiKeys.openai)}
                </span>
                <div className="flex gap-2 ml-auto">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <TestTube className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type={showKeys.openai ? "text" : "password"}
                  placeholder="Enter your OpenAI API key (sk-...)"
                  value={showKeys.openai ? apiKeys.openai : ""}
                  onChange={(e) => handleKeyUpdate("openai", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => toggleKeyVisibility("openai")}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showKeys.openai ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Gemini API Key
                </h4>
                <p className="text-sm text-gray-600">
                  For Gemini 2.0 Flash model
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-mono text-gray-700">
                  {maskKey(apiKeys.gemini)}
                </span>
                <div className="flex gap-2 ml-auto">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <TestTube className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type={showKeys.gemini ? "text" : "password"}
                  placeholder="Enter your Gemini API key (AIza...)"
                  value={showKeys.gemini ? apiKeys.gemini : ""}
                  onChange={(e) => handleKeyUpdate("gemini", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => toggleKeyVisibility("gemini")}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showKeys.gemini ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Groq API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Groq API Key
                </h4>
                <p className="text-sm text-gray-600">For Qwen3-32B model</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-mono text-gray-700">
                  {maskKey(apiKeys.groq)}
                </span>
                <div className="flex gap-2 ml-auto">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <TestTube className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type={showKeys.groq ? "text" : "password"}
                  placeholder="Enter your Groq API key (gsk_...)"
                  value={showKeys.groq ? apiKeys.groq : ""}
                  onChange={(e) => handleKeyUpdate("groq", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => toggleKeyVisibility("groq")}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showKeys.groq ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Resend API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Resend API Key
                </h4>
                <p className="text-sm text-gray-600">
                  For email notifications and alerts
                </p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                Inactive
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-mono text-gray-700">
                  {maskKey(apiKeys.resend)}
                </span>
                <div className="flex gap-2 ml-auto">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <TestTube className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type={showKeys.resend ? "text" : "password"}
                  placeholder="Enter your Resend API key (re_...)"
                  value={showKeys.resend ? apiKeys.resend : ""}
                  onChange={(e) => handleKeyUpdate("resend", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => toggleKeyVisibility("resend")}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showKeys.resend ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Test Email Service */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Test Email Service
              </h4>
              <p className="text-sm text-gray-600">
                Send a test email to verify your email configuration
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="test@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Send Test Email
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="bg-white rounded-lg border border-gray-200"></div>
  );

  return (
    <div className="flex flex-col  p-5">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your project configuration, API keys, and preferences.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("project")}
              className={`border-b-2 pb-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === "project"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Settings className="w-4 h-4" />
              Project
            </button>
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`border-b-2 pb-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === "api-keys"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Database className="w-4 h-4" />
              API Keys
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`border-b-2 pb-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === "preferences"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="w-4 h-4" />
              Preferences
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "project" && renderProjectTab()}
        {activeTab === "api-keys" && renderApiKeysTab()}
        {activeTab === "preferences" && renderPreferencesTab()}
      </div>
    </div>
  );
};

export default AgentSettings;
