"use client";
import { Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Lock } from "lucide-react";

export default function ComingSoon() {
  return (
    <>
      {/* <ActivationDialog /> */}
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="max-w-2xl text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-xl shadow-sm">
              <Shield className="w-12 h-12 " strokeWidth={1.5} />
            </div>
          </div>

          {/* Header */}
          <h1 className="text-4xl font-bold  tracking-tight">Red Teaming</h1>

          {/* Description */}
          <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
            Comprehensive security testing and vulnerability assessment tools
            are on the way. We're building advanced red teaming capabilities to
            help you identify and fix potential threats.
          </p>

          {/* Subtle divider */}
          <div className="pt-4">
            <div className="h-px w-24 bg-muted mx-auto"></div>
          </div>
        </div>
      </div>
    </>
  );
}
