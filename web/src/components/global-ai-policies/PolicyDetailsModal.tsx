"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  FileText,
  Users,
  AlertTriangle,
  Shield,
  Gavel,
  ExternalLink,
} from "lucide-react";
import { GlobalAiPolicy } from "@/types/global-ai-policies";
import { format } from "date-fns";

interface PolicyDetailsModalProps {
  policy: GlobalAiPolicy | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component to display detailed information about a global AI policy
 */
export const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({
  policy,
  isOpen,
  onClose,
}) => {
  if (!policy) return null;

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string | null | undefined): string => {
    if (!status) return "bg-gray-500/10 text-gray-500";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("active") || statusLower.includes("enacted")) {
      return "bg-green-500/10 text-green-500";
    } else if (
      statusLower.includes("proposed") ||
      statusLower.includes("draft")
    ) {
      return "bg-yellow-500/10 text-yellow-500";
    } else if (
      statusLower.includes("repealed") ||
      statusLower.includes("expired")
    ) {
      return "bg-red-500/10 text-red-500";
    } else {
      return "bg-blue-500/10 text-blue-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl! max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-start gap-2">
            <FileText className="h-5 w-5 mt-1" />
            <div className="flex items-center justify-start gap-2">
              {policy.policyName}
              <a
                href={policy.sources || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </DialogTitle>
          {policy.shortName && (
            <p className="text-lg text-gray-700">{policy.shortName}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Location */}
          <div className="flex flex-wrap gap-4">
            {policy.status && (
              <Badge className={getStatusColor(policy.status)}>
                {policy.status}
              </Badge>
            )}
            {policy.legalStatus && (
              <Badge variant="outline">
                <Gavel className="h-3 w-3 mr-1" />
                {policy.legalStatus}
              </Badge>
            )}
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {policy.country && (
                  <p className="text-sm">
                    <span className="font-medium">Country:</span>{" "}
                    {policy.country}
                  </p>
                )}
                {policy.state && (
                  <p className="text-sm">
                    <span className="font-medium">State/Province:</span>{" "}
                    {policy.state}
                  </p>
                )}
                {policy.region && (
                  <p className="text-sm">
                    <span className="font-medium">Region:</span> {policy.region}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {policy.effectiveDate && (
                  <p className="text-sm">
                    <span className="font-medium">Effective Date:</span>{" "}
                    {formatDate(policy.effectiveDate)}
                  </p>
                )}
                {policy.lastUpdated && (
                  <p className="text-sm">
                    <span className="font-medium">Last Updated:</span>{" "}
                    {formatDate(policy.lastUpdated)}
                  </p>
                )}
                {policy.timeline && (
                  <p className="text-sm">
                    <span className="font-medium">Timeline:</span>{" "}
                    {policy.timeline}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {policy.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{policy.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Impact and Affected Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policy.whoIsAffected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Who Is Affected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {policy.whoIsAffected}
                  </p>
                </CardContent>
              </Card>
            )}

            {policy.howTheyAreAffected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    How They Are Affected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {policy.howTheyAreAffected}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Impact */}
          {policy.impact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{policy.impact}</p>
              </CardContent>
            </Card>
          )}

          {/* Compliance Requirements */}
          {policy.complianceRequirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {policy.complianceRequirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Enforcement Details */}
          {policy.enforcementDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Enforcement Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {policy.enforcementDetails}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
