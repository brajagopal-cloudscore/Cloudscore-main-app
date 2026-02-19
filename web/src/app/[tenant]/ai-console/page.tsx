import { RiskSnapshot } from "@/components/ai-console/RiskSnapshot";
import { ActivityFeed } from "@/components/ai-console/ActivityFeed";
import { ToolInventory } from "@/components/ai-console/ToolInventory";
import { DataExposurePanel } from "@/components/ai-console/DataExposurePanel";
import { UserRiskScoreboard } from "@/components/ai-console/UserRiskScoreboard";
import { GovernancePanel } from "@/components/ai-console/GovernancePanel";
import { Shield, Bell, FileText, Settings } from "lucide-react";

import { ActivateDialog } from "@/components/common/FeatureActivation";

const Page = ({ isEnabled }: { isEnabled: boolean }) => {
  return (
    <>
      <ActivateDialog isOpen={!isEnabled}></ActivateDialog>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Shadow AI Governance
                </h1>
                <p className="text-xs text-muted-foreground">
                  Enterprise Security Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-risk-high rounded-full animate-pulse-glow" />
              </button>
              <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
          {/* Risk Snapshot */}
          <section>
            <RiskSnapshot />
          </section>

          {/* Activity Feed + Tool Inventory */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
            <div className="lg:col-span-2">
              <ToolInventory />
            </div>
          </section>

          {/* Data Exposure */}
          <section>
            <DataExposurePanel />
          </section>

          {/* User Risk + Governance */}
          <section>
            <UserRiskScoreboard />
          </section>

          {/* Governance Panel */}
          <section>
            <GovernancePanel />
          </section>
        </main>
      </div>
    </>
  );
};

export default Page;
