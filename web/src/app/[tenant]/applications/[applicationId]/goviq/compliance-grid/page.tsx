import React from "react";
import Setting from "@/components/setting/setting";

export default function page() {
  const applicationDetails = {
    workspace_name: "AI Model Governance Workspace",
    description:
      "Comprehensive workspace for managing AI model lifecycle, compliance, and governance across the organization.",
    workspace_status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2025-01-28T14:22:00Z",
    created_by: { username: "admin" },
    updated_by: { username: "data_scientist" },
  };

  return (
    <Setting
      hasWorkspaceDetailsReadPermission={true}
      hasWorkspaceDetailsWritePermission={true}
      workspaceDetails={applicationDetails}
    />
  );
}
