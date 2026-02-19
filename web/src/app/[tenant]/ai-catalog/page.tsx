"use client";
import React, { useState, useEffect } from "react";
import { Tool, toolsData } from "./tools";
import FullReportModal from "./FullReportModal";
import ComparisonModal from "./ComparisonModal";
import MultiComparisonModal from "./MultiComparisonModal";
import ToolCard from "./ToolsCard";

// Helper functions
export const getRiskColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "low":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "high":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

// Main Dashboard Component
const AIToolsDashboard: React.FC = () => {
  const [openComparisonModal, setOpenComparisonModal] = useState<{
    tool: Tool;
    open: boolean;
  } | null>(null);
  const [openFullReportModal, setOpenFullReportModal] = useState<{
    tool: Tool;
    open: boolean;
  } | null>(null);
  const [openMultiComparisonModals, setOpenMultiComparisonModals] = useState<
    Array<{
      id: string;
      tool: Tool;
      position: { x: number; y: number };
    }>
  >([]);

  const calculateModalPosition = (index: number, totalModals: number) => {
    const modalWidth = 360;
    const modalHeight = 600;
    const gap = 20;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const modalsPerRow = Math.max(
      1,
      Math.floor((viewportWidth - 100) / (modalWidth + gap))
    );

    const row = Math.floor(index / modalsPerRow);
    const col = index % modalsPerRow;

    let x = 270 + col * (modalWidth + gap);
    let y = 100 + row * (modalHeight + gap);

    if (x + modalWidth > viewportWidth - 50) {
      x = viewportWidth - modalWidth - 50;
    }

    if (y + modalHeight > viewportHeight - 50) {
      y = Math.max(100, viewportHeight - modalHeight - 50);
    }

    return { x, y };
  };

  useEffect(() => {
    const updateModalPositions = () => {
      setOpenMultiComparisonModals((prev) =>
        prev.map((modal, index) => ({
          ...modal,
          position: calculateModalPosition(index, prev.length),
        }))
      );
    };

    window.addEventListener("resize", updateModalPositions);
    updateModalPositions();

    return () => {
      window.removeEventListener("resize", updateModalPositions);
    };
  }, [openMultiComparisonModals.length]);

  const openComparison = (tool: Tool) => {
    setOpenComparisonModal({ tool, open: true });
  };

  const openFullReport = (tool: Tool) => {
    setOpenFullReportModal({ tool, open: true });
  };

  const openMultiComparison = (tool: Tool) => {
    const modalId = `${tool.tool_name}-${Date.now()}`;
    const exist = openMultiComparisonModals.find(
      (ele) => ele.tool.tool_name === tool.tool_name
    );
    if (exist) return;
    const position = calculateModalPosition(
      openMultiComparisonModals.length,
      openMultiComparisonModals.length + 1
    );
    setOpenMultiComparisonModals((prev) => [
      ...prev,
      { id: modalId, tool, position },
    ]);
  };

  const closeComparisonModal = () => {
    setOpenComparisonModal(null);
  };

  const closeFullReportModal = () => {
    setOpenFullReportModal(null);
  };

  const closeMultiComparisonModal = (modalId: string) => {
    setOpenMultiComparisonModals((prev) =>
      prev.filter((modal) => modal.id !== modalId)
    );
  };

  return (
    <div className="min-h-screen">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        body {
          font-family: "Inter", sans-serif;
        }
      `}</style>

      <div className="flex w-full flex-1 relative z-0">
        <div className="flex flex-col z-30 overflow-auto p-5 w-full mb-[30px]">
          {/* Sidebar and Main Content */}
          <div className="px-4">
            <div className="flex gap-6">
              {/* Main Content */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold  mb-2">
                    AI Models Analysis
                  </h1>
                  <p className="text-muted-fore">
                    Compare security, compliance, and trust scores across AI
                    Models
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toolsData.map((tool, index) => (
                    <ToolCard
                      key={index}
                      tool={tool}
                      onOpenComparison={() => openComparison(tool)}
                      onOpenFullReport={() => openFullReport(tool)}
                      onOpenMultiComparison={() => openMultiComparison(tool)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {openComparisonModal && (
            <ComparisonModal
              tool={openComparisonModal.tool}
              open={openComparisonModal.open}
              onOpenChange={(open) => !open && closeComparisonModal()}
            />
          )}

          {openFullReportModal && (
            <FullReportModal
              tool={openFullReportModal.tool}
              open={openFullReportModal.open}
              onOpenChange={(open) => !open && closeFullReportModal()}
            />
          )}

          {openMultiComparisonModals.map((modal, index) => (
            <MultiComparisonModal
              key={modal.id}
              tool={modal.tool}
              open={true}
              onOpenChange={(open) =>
                !open && closeMultiComparisonModal(modal.id)
              }
              position={modal.position}
              zIndex={1000 + index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIToolsDashboard;
