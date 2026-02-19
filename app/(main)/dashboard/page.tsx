import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpensesCard from "@/components/dashboard/ExpensesCard";
import TopServicesCard from "@/components/dashboard/TopServicesCard";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Button className="gap-2">
          <Settings2 className="h-4 w-4" />
          Apply Widget
        </Button>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ExpensesCard />
        <TopServicesCard />
      </div>

      {/* Placeholder rows for future widgets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {["Resource Groups", "Regions", "Tags"].map((title) => (
          <div
            key={title}
            className="rounded-xl border bg-card p-6 flex items-center justify-center text-muted-foreground text-sm h-40"
          >
            {title} — coming soon
          </div>
        ))}
      </div>
    </div>
  );
}
