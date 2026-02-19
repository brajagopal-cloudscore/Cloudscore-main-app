"use client";

import React from "react";
import Progress from "./progress";
import Search from "./search";

import List from "./list";
import { EUComplianceTrackingProvider } from "./provider";
export default function EUTracking() {
  return (
    <EUComplianceTrackingProvider>
      <div className="!text-black flex flex-col gap-4">
        <Progress></Progress>
        <Search></Search>
        <List></List>
      </div>
    </EUComplianceTrackingProvider>
  );
}
