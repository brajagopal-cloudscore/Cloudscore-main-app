import React, { useState } from "react";
import { complianceData } from "./constants";
import { ChevronDown, ChevronRight } from "lucide-react";
export default function Control({
  setIsModalOpen,
}: {
  setIsModalOpen: (val: boolean) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<any>({});
  const [selectedControl, setSelectedControl] = useState<any>(null);
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

  const toggleSection = (sectionId: any) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getCompletionBarColor = (percentage: any) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-400";
    return "bg-gray-300";
  };

  const getCompletionBadgeColor = (percentage: any) => {
    if (percentage === 100) return "bg-green-500 text-white";
    if (percentage >= 50) return "bg-yellow-400 text-black";
    return "bg-gray-300 text-black";
  };

  const openModal = (controlId: any) => {
    if (controlId === "1.1") {
      setSelectedControl({
        id: "1.1",
        title: "AI Literacy and Responsible AI Training",
        description:
          "Develop the AI literacy of staff and others who operate or use AI systems on behalf of the organization.",
      });
      setIsModalOpen(true);
    }
  };
  return (
    <>
      <div className="mb-6">
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
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round((overviewStats.completedSubcontrols / overviewStats.totalSubcontrols) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Compliance Status Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Compliance status overview
        </h3>

        <div className="space-y-2">
          {Object.entries(complianceData).map(([sectionId, section]: any) => (
            <div key={sectionId} className="border border-gray-200 rounded-lg">
              {/* Section Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection(sectionId)}
              >
                <div className="flex items-center space-x-2">
                  {expandedSections[sectionId] ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900">
                    {sectionId} {section.title}
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSections[sectionId] && (
                <div className="border-t border-gray-200">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500">
                    <div>Control Name</div>
                    <div>Owner</div>
                    <div># of Subcontrols</div>
                    <div>Completion</div>
                  </div>

                  {/* Subcontrol Rows */}
                  {section.subcontrols.map((subcontrol: any) => (
                    <div
                      key={subcontrol.id}
                      className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                      onClick={() => openModal(subcontrol.id)}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        <div className="font-medium">
                          {subcontrol.id} {subcontrol.title}
                        </div>
                        {subcontrol.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {subcontrol.description}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subcontrol.owner}
                      </div>
                      <div className="text-sm text-gray-900">
                        {subcontrol.subcontrolsCount} Subcontrols
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-16 h-2 rounded-full ${getCompletionBarColor(subcontrol.completion)}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {subcontrol.completion}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
