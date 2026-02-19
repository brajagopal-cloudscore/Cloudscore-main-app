"use client";
import React, { useState } from "react";
import Overview from "@/components/eu-ai-act/overview";
import { Calendar } from "lucide-react";
import Control from "@/components/eu-ai-act/control";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  complianceData,
  approverOptions,
  riskReviewOptions,
  statusOptions,
  ownerOptions,
  reviewerOptions,
} from "@/components/eu-ai-act/constants";
import Tracking from "@/components/iso-42001/tracking";
const ComplianceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedControl, setSelectedControl] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    approver: "",
    riskReview: "",
    owner: "",
    reviewer: "",
    dueDate: "",
    implementationDetails:
      "Rolling out comprehensive AI literacy program across departments",
    subcontrolStatus: "",
    subcontrolApprover: "",
    subcontrolRiskReview: "",
    subcontrolOwner: "",
    subcontrolReviewer: "",
    subcontrolDueDate: "",
    subcontrolImplementationDetails:
      "Established AI oversight committee with executive sponsors",
  });

  // Static dummy data for dropdowns

  // Overview statistics

  const totalSubcontrols = Object.values(complianceData).reduce(
    (total, section) => total + section.subcontrols.length,
    0
  );
  const completedSubcontrols = 45; // Based on your screenshot
  const overallCompletion = Math.round(
    (completedSubcontrols / totalSubcontrols) * 100
  );

  return (
    <div className="flex flex-col flex-1  p-5  overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Compliance Overview
        </h1>
        <p className="text-gray-600">
          Track your organization's progress toward AI compliance goals
        </p>
      </div>
      {/* Header Tabs */}
      {/* <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === "tracking"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Policies
          </button>
        </div>
      </div> */}

      {/* {activeTab === "overview" && (
        <>
          <Overview></Overview>
        </>
      )} */}

      {/* {activeTab === "tracking" && (
        <> */}
      <Tracking></Tracking>
      {/* </>
      )} */}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTitle className="sr-only">{selectedControl?.title}</DialogTitle>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-[#18181B] bg-white">
          <DialogHeader className="text-[#18181B]">
            <h1 className="text-lg font-medium text-gray-900">
              {selectedControl?.title}
            </h1>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              {selectedControl?.description}
            </p>

            {/* Form Fields Row 1 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status:
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select status"
                      className="text-black"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Approver:
                </label>
                <Select
                  value={formData.approver}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, approver: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {approverOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Risk review:
                </label>
                <Select
                  value={formData.riskReview}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, riskReview: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk review" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskReviewOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Form Fields Row 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Owner:
                </label>
                <Select
                  value={formData.owner}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, owner: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reviewer:
                </label>
                <Select
                  value={formData.reviewer}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, reviewer: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Due date:
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Implementation Details */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Implementation details:
              </label>
              <Textarea
                placeholder="Rolling out comprehensive AI literacy program across departments"
                value={formData.implementationDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    implementationDetails: e.target.value,
                  }))
                }
                className="h-20"
              />
            </div>

            {/* Add/Remove Risks */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className="bg-black text-white"
              >
                Add/Remove risks
              </Button>
              <span className="ml-2 text-sm text-gray-500">0 risks linked</span>
            </div>

            {/* Subcontrol Tabs */}
            <div>
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                    Subcontrol 1
                  </button>
                  <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                    Subcontrol 2
                  </button>
                  <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                    Subcontrol 3
                  </button>
                </div>
              </div>

              {/* Additional Tabs */}
              <div className="mt-4">
                <div className="flex space-x-6 text-sm">
                  <button className="font-medium text-gray-900 border-b-2 border-gray-900 pb-1">
                    Overview
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    Evidence
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    Auditor Feedback
                  </button>
                </div>
              </div>
            </div>

            {/* Subcontrol Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                1.1.1 We ensure executive leadership takes responsibility for
                decisions related to AI risks
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Leadership is accountable for oversight and strategic decisions
                regarding AI risks, ensuring alignment with compliance.
              </p>

              {/* Subcontrol Form Fields */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status:
                  </label>
                  <Select
                    value={formData.subcontrolStatus}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcontrolStatus: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Approver:
                  </label>
                  <Select
                    value={formData.subcontrolApprover}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcontrolApprover: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {approverOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Risk review:
                  </label>
                  <Select
                    value={formData.subcontrolRiskReview}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcontrolRiskReview: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk review" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskReviewOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Owner:
                  </label>
                  <Select
                    value={formData.subcontrolOwner}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcontrolOwner: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reviewer:
                  </label>
                  <Select
                    value={formData.subcontrolReviewer}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcontrolReviewer: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {reviewerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Due date:
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={formData.subcontrolDueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subcontrolDueDate: e.target.value,
                        }))
                      }
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Implementation details:
                </label>
                <Textarea
                  placeholder="Established AI oversight committee with executive sponsors"
                  value={formData.subcontrolImplementationDetails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcontrolImplementationDetails: e.target.value,
                    }))
                  }
                  className="h-20"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-9 px-4 text-black border-[#E4E4E7] hover:bg-gray-50 rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-black text-white hover:bg-black/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceDashboard;
