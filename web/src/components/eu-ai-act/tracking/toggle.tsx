import React from "react";
import { useComplianceTracking } from "./provider";
import { Switch } from "@/components/ui/switch";
export default function Toggle() {
  const { hide, toggleHide } = useComplianceTracking();
  return (
    <div className="p-4 border rounded-md flex gap-10 items-center justify-between">
      <div className="w-[80%]">
        <h2 className="text-[1.5rem] font-semibold mb-1">
          Compliance Tracking
        </h2>
        <p className="text-[0.8rem]">
          Enable compliance tracking to start documenting your ISO 42001
          controls. Once enabled, you'll be able to upload and manage documents
          for each control requirement.
        </p>
      </div>
      <Switch checked={hide} onCheckedChange={(e) => toggleHide(e)}></Switch>
    </div>
  );
}
