export interface Risk {
  id: string;
  tenantId: string;
  applicationId: string;
  useCaseId: string;
  riskName: string;
  description: string;
  owner: string;
  severity: "Minor" | "Moderate" | "Major" | "Catastrophic";
  likelihood: "Rare" | "Unlikely" | "Possible" | "Likely";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  mitigationPlan: string | null;
  lastReviewDate: string | null;
  mitigationAttachments: Record<string, any>;
  metadata: Record<string, any>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  mitigationStatus:
    | "Not Started"
    | "In Progress"
    | "Requires Review"
    | "Completed";

  targetDate: string | null;
  categories: string[];

  // relations
  useCase: {
    id: string;
    whatItDoes: string;
    useCase: string;
  };

  ownerUser: {
    name: string;
    email: string;
  };

  controlOwnerUser: {
    name: string;
    email: string;
  };
}
