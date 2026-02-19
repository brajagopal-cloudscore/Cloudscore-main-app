"use client";
import React from "react";
import ApplicationStatus from "@/components/application-scope/status";
import { ApplicationScopeForm } from "@/components/application-scope/form";

const ApplicationScope: React.FC = () => {
  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold  my-2">
          Application Scope
        </h1>
        {/* <ApplicationStatus></ApplicationStatus> */}
      </div>
      <ApplicationScopeForm></ApplicationScopeForm>
    </>
  );
};

export default ApplicationScope;
