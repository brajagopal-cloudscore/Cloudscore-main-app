"use client";

import React, { useEffect, useState } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Icons
import { Loader2, RefreshCw } from "lucide-react";
import { fetchSummaryMetrics, fetchUseCasesByRisk } from "@/lib/api/reports";

interface ReportsPageProps {
  params: Promise<{ tenant: string }>;
}

interface RiskClassificationData {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
  "No Risk": number;
}

interface UseCasesByRiskResponse {
  success: boolean;
  data: {
    riskClassification: RiskClassificationData;
    totalUseCases: number;
    summary: {
      withRisks: number;
      withoutRisks: number;
    };
  };
}

interface SummaryMetricsResponse {
  success: boolean;
  data: {
    totalApplications: number;
    totalUseCases: number;
    systemTypeCounts: {
      "In-house ML": number;
      GenAI: number;
      "3rd Party": number;
      Agent: number;
    };
  };
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const [riskData, setRiskData] = useState<RiskClassificationData>({
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    "No Risk": 0,
  });
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalApplications: 0,
    totalUseCases: 0,
    systemTypeCounts: {
      "In-house ML": 0,
      GenAI: 0,
      "3rd Party": 0,
      Agent: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaryMetricsData = async () => {
    try {
      const resolvedParams = await params;
      const data = await fetchSummaryMetrics(resolvedParams.tenant);
      setSummaryMetrics(data);
    } catch (err) {
      console.error("Error fetching summary metrics:", err);
      // Don't set error state for summary metrics to avoid breaking the main functionality
    }
  };

  const fetchRiskData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const resolvedParams = await params;
      const data = await fetchUseCasesByRisk(resolvedParams.tenant);

      setRiskData(data.riskClassification);
    } catch (err) {
      console.error("Error fetching risk data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRiskData(true);
    fetchSummaryMetricsData();
  };

  useEffect(() => {
    fetchRiskData();
    fetchSummaryMetricsData();
  }, [params]);

  // Helper function to get bar width based on count
  const getBarWidth = (count: number, maxCount: number) => {
    if (maxCount === 0) return "w-4";
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80) return "w-24";
    if (percentage >= 60) return "w-20";
    if (percentage >= 40) return "w-16";
    if (percentage >= 20) return "w-12";
    return "w-8";
  };

  // Helper function to get bar color based on risk level
  const getBarColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Critical":
        return "bg-red-800";
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-orange-500";
      case "Low":
        return "bg-yellow-500";
      case "No Risk":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calculate max count for proportional bar widths
  const maxCount = Math.max(...Object.values(riskData));

  const complianceData = [
    { name: "EU AI act", cases: 44, evidence: "29/44" },
    { name: "ISO 42001", cases: 32, evidence: "1/32" },
    { name: "NYC local law no.144", cases: 14, evidence: "2/14" },
  ];

  const topDomains = [
    "Candidate scoring",
    "Natural language processing",
    "Text generation",
    "Candidate recommendation",
  ];

  return (
    <div className="min-h-screen  p-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 ">AI Governance Reports</h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive overview of AI use cases and compliance status
          </p>
        </div>

        {/* Executive Overview Dashboard */}
        <Card className="w-full">
          <CardContent className="space-y-6 pt-4">
            {/* Summary Metrics Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold ">
                Applications and Use Cases Metrics
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="bg-muted border-muted p-6 rounded-xl border  hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Total Applications
                    </div>
                    <div className="text-3xl font-bold">
                      {summaryMetrics.totalApplications}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-muted border-muted p-6 rounded-xl border  shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Total Use Cases
                    </div>
                    <div className="text-3xl font-bold ">
                      {summaryMetrics.totalUseCases}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* AI System Type Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted border-muted p-6 rounded-xl border  shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      In-house ML
                    </div>
                    <div className="text-3xl font-bold ">
                      {summaryMetrics.systemTypeCounts["In-house ML"]}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-muted border-muted p-6 rounded-xl border  shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      GenAI
                    </div>
                    <div className="text-3xl font-bold ">
                      {summaryMetrics.systemTypeCounts["GenAI"]}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-muted border-muted p-6 rounded-xl border  shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      3rd Party
                    </div>
                    <div className="text-3xl font-bold ">
                      {summaryMetrics.systemTypeCounts["3rd Party"]}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-muted border-muted p-6 rounded-xl border  shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Agent
                    </div>
                    <div className="text-3xl font-bold ">
                      {summaryMetrics.systemTypeCounts["Agent"]}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Three Column Layout */}
            {/* add grid instead of hidden to make it visible */}
            <div className="hidden grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Use case count by risk classification */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      Use case count by risk classification
                    </h3>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      <span className="ml-2 text-sm text-gray-500">
                        Loading risk data...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-600 mb-2">
                        Error loading risk data
                      </p>
                      <p className="text-xs text-gray-500">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(riskData).map(([riskLevel, count]) => (
                        <div
                          key={riskLevel}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {riskLevel}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`${getBarWidth(count, maxCount)} h-3 ${getBarColor(riskLevel)} rounded`}
                            ></div>
                            <span className="text-sm font-semibold">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compliance progress */}
                <div>
                  <h3 className="font-semibold mb-3">Compliance progress</h3>
                  <div className="space-y-3">
                    {complianceData.map((compliance, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{compliance.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">88</div>
                      <div className="text-xs text-gray-600">Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">60</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-6">
                {/* Use case governance progress */}
                <div>
                  <h3 className="font-semibold mb-3">
                    Use case governance progress
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Intake</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-3 bg-purple-500 rounded"></div>
                        <span className="text-sm font-semibold">100</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Review</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-3 bg-purple-500 rounded"></div>
                        <span className="text-sm font-semibold">20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Governance</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-3 bg-purple-500 rounded"></div>
                        <span className="text-sm font-semibold">80</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed use case evidence */}
                <div>
                  <h3 className="font-semibold mb-3">
                    Detailed use case evidence
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">44 use cases</span>
                      <span className="text-gray-600">
                        {" "}
                        Evidence provided: 29/44
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">32 use cases</span>
                      <span className="text-gray-600">
                        {" "}
                        Evidence provided: 1/32
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">14 use cases</span>
                      <span className="text-gray-600">
                        {" "}
                        Evidence provided: 2/14
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top domains */}
                <div>
                  <h3 className="font-semibold mb-3">Top domains</h3>
                  <div className="space-y-2">
                    {topDomains.map((domain, index) => (
                      <div key={index} className="text-sm">
                        {domain}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Use cases by region */}
                <div>
                  <h3 className="font-semibold mb-3">Use cases by region</h3>
                  <div className="space-y-2">
                    {[
                      { name: "Midwest", value: 45 },
                      { name: "East coast", value: 52 },
                      { name: "West coast", value: 48 },
                      { name: "Europe", value: 38 },
                      { name: "Not defined", value: 17 },
                    ].map((region, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {region.name}
                        </span>
                        <div className="w-12 h-2 bg-pink-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most valuable use cases */}
                <div>
                  <h3 className="font-semibold mb-3 border-b-2 border-blue-500 pb-1">
                    Most valuable use cases
                  </h3>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Total use case value
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-4">
                      $240m
                    </div>
                    <div className="space-y-2">
                      <div className="w-20 h-2 bg-pink-300 rounded"></div>
                      <div className="w-16 h-2 bg-pink-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
