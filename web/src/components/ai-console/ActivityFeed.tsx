"use client";
import { activityFeed, AlertEvent, AlertSeverity } from "./constants";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertCircle; color: string; bg: string }
> = {
  critical: {
    icon: AlertCircle,
    color: "text-risk-critical",
    bg: "bg-risk-critical/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-risk-medium",
    bg: "bg-risk-medium/10",
  },
  info: { icon: Info, color: "text-status-info", bg: "bg-status-info/10" },
};

export function ActivityFeed() {
  const [selectedEvent, setSelectedEvent] = useState<AlertEvent | null>(null);

  return (
    <>
      <div className="bg-card rounded-lg border border-border h-[500px] no-scrollbar card-shadow flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Activity Feed</h3>
          <span className="text-xs text-muted-foreground">
            Real-time alerts
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {activityFeed.map((event: any, i: any) => {
            // @ts-ignore
            const config = severityConfig[event.severity];
            const Icon = config.icon;

            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border border-transparent transition-all duration-200",
                  "hover:bg-accent hover:border-border",
                  " animate-fade-in"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-md mt-0.5", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {event.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {event.tool}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {event.description}
                    </p>
                    <span className="text-xs text-muted-foreground/70">
                      {event.timestamp}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  <div
                    className={cn(
                      "p-1.5 rounded-md",
                      severityConfig[selectedEvent.severity].bg
                    )}
                  >
                    {(() => {
                      const Icon = severityConfig[selectedEvent.severity].icon;
                      return (
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            severityConfig[selectedEvent.severity].color
                          )}
                        />
                      );
                    })()}
                  </div>
                  <span>Event Details</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">User</span>
                  <p className="font-medium">{selectedEvent.user}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department</span>
                  <p className="font-medium">{selectedEvent.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tool</span>
                  <p className="font-medium">{selectedEvent.tool}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Workstation</span>
                  <p className="font-medium font-mono text-xs">
                    {selectedEvent.workstation}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">
                  Description
                </span>
                <p className="text-sm mt-1">{selectedEvent.description}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">
                  Data Categories Detected
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedEvent.dataCategories.length > 0 ? (
                    selectedEvent.dataCategories.map((cat: any) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-risk-high/10 text-risk-high text-xs rounded-md"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      None detected
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {selectedEvent.timestamp}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
