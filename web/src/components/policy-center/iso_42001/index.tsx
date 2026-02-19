"use client";

import React from "react";
import Progress from "./progress";
import Search from "./search";

import List from "./list";
import { ISO_42001ComplianceTrackingProvider } from "./provider";
export default function ISO_42001Tracking() {
  return (
    <ISO_42001ComplianceTrackingProvider>
      <div className="!text-black flex flex-col gap-4">
        <Progress></Progress>
        <Search></Search>
        <List></List>
      </div>
    </ISO_42001ComplianceTrackingProvider>
  );
}
