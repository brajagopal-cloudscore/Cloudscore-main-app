import React from "react";
import { Risk } from "../type";

import View from "./view";
import TransparencyUserInfo from "./transparency-user-information";
import HumanOversight from "./human-oversight";
import BiasMonitoringTab from "./bias-monitoring-mitigation/bias-monitoring-mitigation-tab";
import Explainability from "./explainability";
import EnvironmentalImpact from "./environmental-impact";
import BiasAndFairnessPage from "./bias-and-fairness/BiasAndFairnessPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tab({ risk }: { risk: Risk }) {
  if (risk.riskLevel !== "High") {
    return <View risk={risk} />;
  }
  return (
    <>
      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger defaultChecked value="risks">
            Risk Details
          </TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
          <TabsTrigger value="human-oversight">Human Oversight</TabsTrigger>
          <TabsTrigger value="bias-fairness">Bias & Fairness</TabsTrigger>
          <TabsTrigger value="bias-monitoring">Bias Monitoring</TabsTrigger>
          <TabsTrigger value="explainability">Explainability</TabsTrigger>
          <TabsTrigger value="environmental-impact">
            Environmental Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-6">
          <View risk={risk} />
        </TabsContent>

        <TabsContent value="transparency" className="space-y-6">
          <TransparencyUserInfo />
        </TabsContent>

        <TabsContent value="human-oversight" className="space-y-6">
          <HumanOversight />
        </TabsContent>

        <TabsContent value="bias-fairness" className="space-y-6">
          <BiasAndFairnessPage />
        </TabsContent>

        <TabsContent value="bias-monitoring" className="space-y-6">
          <BiasMonitoringTab />
        </TabsContent>

        <TabsContent value="explainability" className="space-y-6">
          <Explainability />
        </TabsContent>

        <TabsContent value="environmental-impact" className="space-y-6">
          <EnvironmentalImpact />
        </TabsContent>
      </Tabs>
    </>
  );
}
