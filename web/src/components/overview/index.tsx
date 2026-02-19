"use client";


import { FileText, User, Calendar, Users, Target, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { formatDate } from "@/lib/utils/date"
import ApplicationStatus from "@/components/applications/ApplicationStatus"
import { useTenant } from "@/contexts/TenantContext";
import { getApplicationDetails } from "@/lib/actions/applications";

// Custom Progress component to replace the imported one
const Progress = ({ value, className = "" }: any) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div
        className="h-full bg-blue-500 rounded-full transition-all"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

interface PolicyPack {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  state?: string;
  projectsCompliant: number;
  totalProjects: number;
  isActive: boolean;
  tags: string[];
  icon: string;
  color: string;
  type?: "Mandatory" | "Voluntary" | "";
}

interface ApplicationDetails {
  application: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  lastUpdated: {
    date: string;
    by: {
      id: string | null;
      name: string;
      email: string;
    };
  };
  stakeholders: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    department: string;
    responsibilities: string;
  }>;
  useCases: Array<{
    id: string;
    function: string;
    useCase: string;
    whatItDoes: string;
    keyInputs: string[];
    primaryOutputs: string[];
    businessImpact: string[];
    kpis: string[];
  }>;
}

export default function OverviewPage() {
  const params = useParams();
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activePolicy } = useTenant()


  const isEUEnabled = useMemo(() => {
    return activePolicy.find(
      (ele) => ele === "EU AI Act (Regulation 2024/1689)"
    ) != null
  }, [activePolicy])

  const isISOEnabled = useMemo(() => {
    return activePolicy.find((ele) => ele === "ISO/IEC 42001") != null;
  }, [activePolicy]);


  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        const data = await getApplicationDetails(
          params.tenant as string,
          params.applicationId as string
        );
        setApplicationDetails(data as ApplicationDetails);
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch application details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.tenant && params.applicationId) {
      fetchApplicationDetails();
    }
  }, [params.tenant, params.applicationId]);

  // Format team members for display
  const formatTeamMembers = (
    stakeholders: ApplicationDetails["stakeholders"]
  ) => {
    if (!stakeholders || stakeholders.length === 0) {
      return "No members have been assigned to the project";
    }

    if (stakeholders.length === 1) {
      return `${stakeholders[0].name} (${stakeholders[0].role})`;
    }

    if (stakeholders.length <= 3) {
      return stakeholders.map((s) => `${s.name} (${s.role})`).join(", ");
    }

    return `${stakeholders
      .slice(0, 2)
      .map((s) => `${s.name} (${s.role})`)
      .join(", ")} and ${stakeholders.length - 2} more`;
  };

  // Format goal from use cases "What it does" field
  const formatGoal = (useCases: ApplicationDetails["useCases"]) => {
    if (!useCases || useCases.length === 0) {
      return "To ensure compliance with AI governance standards";
    }

    // If there's only one use case, use its "What it does" field
    if (useCases.length === 1) {
      return useCases[0].whatItDoes;
    }

    // If there are multiple use cases, create a summary
    // For now, we'll use the first use case's "What it does" field
    // and indicate there are more use cases
    const primaryGoal = useCases[0].whatItDoes;
    if (useCases.length > 1) {
      return `${primaryGoal} (and ${useCases.length - 1} other use case${useCases.length > 2 ? "s" : ""})`;
    }

    return primaryGoal;
  };

  // Project Overview Data - now dynamic
  const projectData = applicationDetails
    ? {
      owner: applicationDetails.owner.name,
      lastUpdated: formatDate(applicationDetails.lastUpdated.date),
      lastUpdatedBy: applicationDetails.lastUpdated.by.name,
      goal: formatGoal(applicationDetails.useCases),
      teamMembers: formatTeamMembers(applicationDetails.stakeholders),
    }
    : {
      owner: "Loading...",
      lastUpdated: "Loading...",
      lastUpdatedBy: "Loading...",
      goal: "Loading...",
      teamMembers: "Loading...",
    };

  const getComplianceData = () => {


    return {
      euAiAct: isEUEnabled
        ? {
          subcontrols: { completed: 45, total: 100, percentage: 45 },
          assessments: { completed: 23, total: 70, percentage: 32 },
        }
        : null,
      // nist: activeNist
      //   ? {
      //       frameworks: { completed: 8, total: 15, percentage: 53 },
      //       controls: { completed: 12, total: 25, percentage: 48 },
      //     }
      //   : null,
      iso42001: isISOEnabled
        ? {
          clauses: { completed: 3, total: 24, percentage: 12 },
          annexes: { completed: 6, total: 37, percentage: 16 },
        }
        : null,
    };
  };

  const complianceData = getComplianceData();

  // Risk Data
  const risks = [
    { level: "Very High", count: 1, color: "bg-red-500" },
    { level: "High", count: 0, color: "bg-orange-500" },
    { level: "Medium", count: 1, color: "bg-yellow-500" },
    { level: "Low", count: 0, color: "bg-green-500" },
    { level: "Very Low", count: 0, color: "bg-green-300" },
  ];

  const generateReport = () => {
    console.log("Generating HTML report...");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mx-auto m-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Application Overview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mx-auto m-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading GovIQ overview
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" w-full">
      <div className="mx-auto ">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {applicationDetails?.application.name || "AI Compliance Checker"}
            </h1>
            <p className="text-gray-600">
              {applicationDetails?.application.description || "No description available"}
            </p>
          </div>
          {/* <ApplicationStatus
              id={applicationDetails?.application.id as string}
              tenant={params.tenant as string}
              // @ts-ignore
              defaultStatus={applicationDetails?.application.status}
            ></ApplicationStatus> */}
          {/* <Button
            variant="outline"
            className="border-black text-black hover:bg-gray-100 bg-transparent"
            onClick={generateReport}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate report
          </Button> */}
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-semibold text-black">
                    {projectData.owner}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="font-semibold text-black">
                    {projectData.lastUpdated}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last updated by</p>
                  <p className="font-semibold text-black">
                    {projectData.lastUpdatedBy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal and Team Members */}
        <div className="my-4 hidden grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Goal</p>
                  <p className="text-black">{projectData.goal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Team members</p>
                  <p className="text-gray-600">{projectData.teamMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="my-5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Team members</p>
                <p className="text-gray-600">{projectData.teamMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {isEUEnabled && complianceData.euAiAct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-black">
                  EU AI Act Completion Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {complianceData.euAiAct.subcontrols.completed} Subcontrols
                      out of {complianceData.euAiAct.subcontrols.total} is
                      completed
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {complianceData.euAiAct.subcontrols.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={complianceData.euAiAct.subcontrols.percentage}
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {complianceData.euAiAct.assessments.completed} Assessments
                      out of {complianceData.euAiAct.assessments.total} is
                      completed
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {complianceData.euAiAct.assessments.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={complianceData.euAiAct.assessments.percentage}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* {complianceData.nist && (
            <Card>
              <CardHeader>
                <CardTitle className="text-black">
                  NIST AI RMF Completion Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {complianceData.nist.frameworks.completed} Frameworks out
                      of {complianceData.nist.frameworks.total} is completed
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {complianceData.nist.frameworks.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={complianceData.nist.frameworks.percentage}
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {complianceData.nist.controls.completed} Controls out of{" "}
                      {complianceData.nist.controls.total} is completed
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {complianceData.nist.controls.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={complianceData.nist.controls.percentage}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          )} */}

          {isISOEnabled && complianceData.iso42001 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-black">
                  ISO 42001 Completion Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {complianceData.iso42001.clauses.completed} Clauses out of{" "}
                      {complianceData.iso42001.clauses.total} is completed
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {complianceData.iso42001.clauses.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={complianceData.iso42001.clauses.percentage}
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {complianceData.iso42001.annexes.completed} Annexes out of{" "}
                      {complianceData.iso42001.annexes.total} is completed
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {complianceData.iso42001.annexes.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={complianceData.iso42001.annexes.percentage}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Project Risks */}
        {/* <Card className="m-4">
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Application risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {risks.map((risk, index) => (
                  <div key={index} className="text-center">
                    <p className="text-sm text-gray-600 mb-2">{risk.level}</p>
                    <div className="text-4xl font-bold text-black mb-2">{risk.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
      </div>
    </div>
  );
}
