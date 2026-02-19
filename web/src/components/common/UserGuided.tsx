"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Settings,
  ChevronRight,
  Rocket,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

const LOCAL_STORAGE_KEY = "userGuideShown";

interface UserGuideModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const guideSteps = [
  {
    title: "Welcome to Kentron AI Guardrails",
    description: "Secure your AI application from concept to customers",
    icon: Shield,
    content:
      "Kentron AI provides enterprise-grade security for your AI applications with comprehensive guardrails including jailbreak detection, PII protection, profanity filtering, secret detection, code injection prevention, and competitor protection. Deploy guardrails in flexible modes: block threats in real-time, warn for monitoring, or log for analysis.",
  },
  {
    title: "Create an Application",
    description:
      "Create your first default application and start protecting your AI",
    icon: Rocket,
    content:
      "Get started in minutes by creating your first application in the dashboard. Once created, you'll receive an API key that you can use to make evaluation calls. Send input text, select the guardrails you need, and configure the protection mode (block/warn/log) to immediately secure your AI application.",
  },
  {
    title: "Use Launch Policy to block harmful content",
    description: "Browse and test different guardrail categories",
    icon: ShieldCheck,
    content:
      "Explore and test our powerful guardrail categories with real-world examples: prevent prompt injection attacks with Jailbreak Detection, protect sensitive data with PII Detection (emails, SSNs, phone numbers), filter inappropriate language with Profanity Detection, secure credentials with Secret Detection (API keys, tokens), defend against Code Injection, and maintain competitive advantage with Competitor Protection.",
  },
  {
    title: "Integrate with your application",
    description: "Check out our docs for seamless integration",
    icon: Settings,
    content:
      "Ready to integrate? Check out our comprehensive documentation for step-by-step integration guides, SDK examples, and API references. Learn how to implement guardrails in your application, configure environment-specific policies for dev, staging, and production, set up webhook alerts, and customize thresholds and masking strategies to match your security requirements.",
  },
];

export const UserGuideModal = ({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: UserGuideModalProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const hasShown = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!hasShown || hasShown === "true") setOpen(true);
  }, []);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    externalOnOpenChange?.(value);

    // 🔹 If user closes dialog manually (Esc or ✕)
    if (!value) {
      localStorage.setItem(LOCAL_STORAGE_KEY, "false");
      setCurrentStep(0);
    }
  };

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) setCurrentStep(currentStep + 1);
    else handleOpenChange(false);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => handleOpenChange(false);

  const step = guideSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <Dialog open={externalOpen ?? open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {(externalOpen ?? open) && (
          <DialogContent className="w-full md:max-w-[700px] p-0 overflow-hidden bg-transparent border-none shadow-none">
            <motion.div
              key="user-guide-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-background rounded-2xl border shadow-lg p-6"
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Getting Started</DialogTitle>
                <DialogDescription>
                  Learn how to use Kentron AI Guardrails to secure your AI
                  applications
                </DialogDescription>
              </DialogHeader>

              <Card className="bg-muted mt-4">
                <CardContent>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <p className="text-foreground/90 leading-relaxed text-sm">
                        {step.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2 my-4">
                {guideSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}

                  <Button onClick={handleNext}>
                    {currentStep < guideSteps.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
