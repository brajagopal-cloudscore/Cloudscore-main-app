import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Link,
} from "lucide-react";
import { Tool } from "./tools";
import { getScoreColor, getRiskColor } from "./page";

const FullReportModal: React.FC<{
  tool: Tool;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ tool, open, onOpenChange }) => {
  const complianceScore = Number(
    tool.trust_security_privacy_pages.compliance.compliance_score.score
  );
  const trustScore = Number(
    tool.trust_security_privacy_pages.trust_score.overall_score.score
  );
  const confidenceInterval =
    tool.trust_security_privacy_pages.trust_score.overall_score
      .confidence_interval || "N/A";
  const dataCompleteness =
    tool.trust_security_privacy_pages.trust_score.overall_score
      .data_completeness || "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">
        Full Report for {tool.tool_name}
      </DialogTitle>
      <DialogContent className="max-w-6xl!  max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 px-6">
              <h2 className="text-xl font-bold  mb-2">
                {tool.tool_name} - Full Research Report
              </h2>
              <p className="text-muted-foreground text-sm font-normal">
                Comprehensive analysis and evaluation
              </p>
              {tool.type && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded">
                    {tool.type.category}
                  </span>
                  {tool.type.source_url && (
                    <a
                      href={tool.type.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      <Link className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Executive Summary Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4  border-b  pb-3">
              Executive Summary
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground mb-4">
              <p>
                <strong>Overview:</strong>{" "}
                {tool.trust_security_privacy_pages.executive_summary.overview}
              </p>
              <p>
                <strong>Compliance Status:</strong>{" "}
                {
                  tool.trust_security_privacy_pages.executive_summary
                    .compliance_status
                }
              </p>
              <p>
                <strong>Trust Level:</strong>{" "}
                {
                  tool.trust_security_privacy_pages.executive_summary
                    .trust_level
                }
              </p>
              <p>
                <strong>Risk Profile:</strong>{" "}
                {
                  tool.trust_security_privacy_pages.executive_summary
                    .risk_profile
                }
              </p>
              <p>
                <strong>Business Readiness:</strong>{" "}
                {
                  tool.trust_security_privacy_pages.executive_summary
                    .business_readiness
                }
              </p>
              <p>
                <strong>Data Confidence:</strong>{" "}
                {
                  tool.trust_security_privacy_pages.executive_summary
                    .data_confidence
                }
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {
                  tool.trust_security_privacy_pages.executive_summary
                    .recommendation
                }
              </p>
            </div>

            {/* Audit Information */}
            <div className="bg-muted rounded-md p-4 ">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-1 text-sm font-medium ">
                  <Calendar className="w-5 h-5 " />
                  Audit: {new Date(tool.collection_date).toLocaleDateString()}
                </div>
                <div className="text-sm ">
                  Verified:{" "}
                  {
                    tool.trust_security_privacy_pages.compliance
                      .verification_date
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Compliance and Trust Score Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Compliance Section with Evidence */}
            <div className="bg-muted rounded-md">
              <div className="px-6 py-4 border-b ">
                <h4 className="font-semibold ">Compliance Score</h4>
              </div>
              <div className="p-6">
                <div className="bg-green-500/10 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Compliance</span>
                    <span
                      className={`font-bold text-lg ${getScoreColor(complianceScore)}`}
                    >
                      {complianceScore}%
                    </span>
                  </div>
                  <div className="w-full  rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${complianceScore >= 80 ? "bg-green-500" : complianceScore >= 60 ? "bg-blue-500" : "bg-yellow-500"}`}
                      style={{ width: `${complianceScore}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {
                      tool.trust_security_privacy_pages.compliance
                        .compliance_score.calculation
                    }
                  </div>
                </div>

                {/* Compliance Evidence */}
                <h5 className="font-medium mb-3">Compliance Evidence</h5>
                <div className="space-y-2">
                  {tool.trust_security_privacy_pages.compliance.compliance_score.evidence_points.map(
                    (evidence, index) => (
                      <div
                        key={index}
                        className="text-sm bg-green-500/10 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex justify-start items-center gap-2">
                            <div className="font-medium text-green-500">
                              {evidence.certification}
                            </div>
                            <a
                              href={evidence.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:underline"
                            >
                              <Link className="w-3 h-3" />
                            </a>
                          </div>
                          <span className="text-green-500 font-bold">
                            {evidence.points} pts
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Trust Score Section with Score Breakdown */}
            <div className="bg-muted rounded-sm ">
              <div className="px-6 py-4 border-b ">
                <h4 className="font-semibold 0">Trust Score</h4>
              </div>
              <div className="p-6">
                <div className=" bg-blue-500/10 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2 ">
                    <span className="font-medium">Overall Trust</span>
                    <span
                      className={`font-bold text-lg ${getScoreColor(trustScore)}`}
                    >
                      {trustScore}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${trustScore >= 80 ? "bg-green-500" : trustScore >= 60 ? "bg-blue-500" : "bg-yellow-500"}`}
                      style={{ width: `${trustScore}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Confidence: {confidenceInterval}</p>
                    <p>Data Completeness: {dataCompleteness}</p>
                    {tool.trust_security_privacy_pages.trust_score.overall_score
                      .transparency_bonus && (
                      <p>
                        Transparency Bonus:{" "}
                        {
                          tool.trust_security_privacy_pages.trust_score
                            .overall_score.transparency_bonus
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                <h5 className="font-medium mb-3">Score Breakdown</h5>
                <div className="space-y-3">
                  {Object.entries(
                    tool.trust_security_privacy_pages.trust_score
                      .score_components
                  ).map(([key, component]) => (
                    <div
                      key={key}
                      className=" rounded-lg p-3 bg-blue-500/10 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2 justify-start items-center">
                          <div className="text-sm font-semibold text-blue-500 capitalize">
                            {key.replace(/_/g, " ")}
                          </div>
                          {component.evidence_url && (
                            <a
                              href={component.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-800 hover:underline font-medium"
                            >
                              <Link className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-lg font-bold text-blue-500">
                          {component.score}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {component.user_base && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Users:
                            </span>
                            <span className="font-medium text-gray-800">
                              {component.user_base}
                            </span>
                          </div>
                        )}
                        {component.customer_reviews && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Reviews:
                            </span>
                            <span className="font-medium text-gray-800">
                              {component.customer_reviews}
                            </span>
                          </div>
                        )}
                        {component.enterprise_customers && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Enterprise:
                            </span>
                            <span className="font-medium text-gray-800">
                              {component.enterprise_customers}
                            </span>
                          </div>
                        )}
                        {component.funding_total && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Funding:
                            </span>
                            <span className="font-medium text-gray-800">
                              {component.funding_total}
                            </span>
                          </div>
                        )}
                        {component.founded_year && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Founded:
                            </span>
                            <span className="font-medium text-gray-800">
                              {component.founded_year} (
                              {component.years_in_operation} years)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information Section */}
          {tool.trust_security_privacy_pages.pricing_information && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-black">
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <h4 className="font-medium text-purple-500 mb-3">
                    Pricing Model
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Model:</strong>{" "}
                      {
                        tool.trust_security_privacy_pages.pricing_information
                          .pricing_model
                      }
                    </p>
                    <p>
                      <strong>Transparency:</strong>{" "}
                      {
                        tool.trust_security_privacy_pages.pricing_information
                          .transparency
                      }
                    </p>
                    {tool?.trust_security_privacy_pages?.pricing_information
                      ?.free_tier?.available !== "No" && (
                      <div>
                        <p>
                          <strong>Free Tier:</strong>{" "}
                          {
                            tool?.trust_security_privacy_pages
                              ?.pricing_information?.free_tier?.available
                          }
                        </p>
                        {tool?.trust_security_privacy_pages?.pricing_information
                          ?.free_tier?.features !== "N/A" && (
                          <p>
                            <strong>Free Features:</strong>{" "}
                            {
                              tool?.trust_security_privacy_pages
                                ?.pricing_information?.free_tier?.features
                            }
                          </p>
                        )}
                      </div>
                    )}
                    {tool.trust_security_privacy_pages.pricing_information
                      .pricing_notes && (
                      <p>
                        <strong>Notes:</strong>{" "}
                        {
                          tool.trust_security_privacy_pages.pricing_information
                            .pricing_notes
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4">
                  <h4 className="font-medium text-green-500 mb-3">
                    Pricing Plans
                  </h4>
                  <div className="space-y-3">
                    {tool.trust_security_privacy_pages.pricing_information.paid_plans?.map(
                      (plan, index) => (
                        <div
                          key={index}
                          className="border border-green-200/10 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-500">
                              {plan.tier}
                            </span>
                            <span className="text-green-500 font-bold">
                              {plan.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {plan.target_user}
                          </p>
                          <div className="text-xs text-gray-600">
                            <p>
                              <strong>Features:</strong>{" "}
                              {plan.key_features.join(", ")}
                            </p>
                            {plan.usage_limits !== "None detailed" && (
                              <p>
                                <strong>Limits:</strong> {plan.usage_limits}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    {tool?.trust_security_privacy_pages?.pricing_information
                      ?.enterprise_solution?.available === "Yes" && (
                      <div className="border border-green-200/10 rounded-lg p-3 ">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-green-500">
                            Enterprise
                          </span>
                          <span className="text-green-500 font-bold">
                            {
                              tool.trust_security_privacy_pages
                                .pricing_information.enterprise_solution.pricing
                            }
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>
                            <strong>Features:</strong>{" "}
                            {tool.trust_security_privacy_pages.pricing_information.enterprise_solution.features.join(
                              ", "
                            )}
                          </p>
                          <p>
                            <strong>Support:</strong>{" "}
                            {
                              tool.trust_security_privacy_pages
                                .pricing_information.enterprise_solution.support
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trust & Security Infrastructure */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 ">
              Trust & Security Infrastructure
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-500/10 rounded-lg p-4">
                <h4 className="font-medium text-blue-500 mb-3">Trust Center</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Status:</strong>{" "}
                    {tool.trust_security_privacy_pages.trust_center.exists}
                  </p>
                  <p>
                    <strong>URL:</strong>{" "}
                    <a
                      href={tool.trust_security_privacy_pages.trust_center.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {tool.trust_security_privacy_pages.trust_center.url}
                    </a>
                  </p>
                  <p>
                    <strong>Compliance Info:</strong>{" "}
                    {
                      tool.trust_security_privacy_pages.trust_center
                        .compliance_info
                    }
                  </p>
                  <p>
                    <strong>Mentioned Certifications:</strong>{" "}
                    {tool.trust_security_privacy_pages.trust_center.certifications_mentioned.join(
                      ", "
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4">
                <h4 className="font-medium text-green-500 mb-3">
                  Detailed Certifications
                </h4>
                <div className="space-y-3">
                  {tool.trust_security_privacy_pages.certifications.map(
                    (cert, index) => (
                      <div
                        key={index}
                        className="border border-green-200/10 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center justify-start gap-2">
                              <h5 className="font-medium text-green-500 text-sm">
                                {cert.certification_name}
                              </h5>
                              {cert.evidence_url && (
                                <a
                                  href={cert.evidence_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-500 hover:underline"
                                >
                                  <Link className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <span
                              className={`inline-block text-xs font-medium px-2 py-1 rounded mt-1 ${
                                cert.verification_status === "Verified"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {cert.verification_status}
                            </span>
                          </div>
                          <span className="text-green-500 font-bold text-sm">
                            {cert.scoring_value} pts
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <strong>Scope:</strong>{" "}
                            {cert.scope_of_certification}
                          </p>
                          {cert.validity_period &&
                            cert.validity_period !== "Not specified" && (
                              <p>
                                <strong>Valid:</strong> {cert.validity_period}
                              </p>
                            )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Strengths and Limitations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-500">
                Key Strengths
              </h3>
              <div className="space-y-4">
                {tool.trust_security_privacy_pages.key_strengths.map(
                  (strength, index) => (
                    <div
                      key={index}
                      className="border border-green-200/10 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-500">
                            {strength.strength}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Evidence:</strong> {strength.evidence}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Business Impact:</strong>{" "}
                            {strength.business_impact}
                          </p>
                          <span className="inline-block text-xs font-medium px-2 py-1 rounded mt-2 bg-green-500/10 text-green-500">
                            {strength.verification_status || "Verified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-500">
                Key Limitations
              </h3>
              <div className="space-y-4">
                {tool.trust_security_privacy_pages.key_limitations.map(
                  (limitation, index) => (
                    <div
                      key={index}
                      className="border border-red-200/10 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-red-500">
                            {limitation.limitation}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Evidence:</strong> {limitation.evidence}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Business Impact:</strong>{" "}
                            {limitation.business_impact}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                                limitation.severity === "High"
                                  ? "bg-red-500/10 text-red-500"
                                  : limitation.severity === "Medium"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : "bg-green-500/10 text-green-500"
                              }`}
                            >
                              {limitation.severity} Severity
                            </span>
                          </div>
                          {limitation.mitigation && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Mitigation:</strong>{" "}
                              {limitation.mitigation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Detailed Risk Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ">
              Detailed Risk Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tool.trust_security_privacy_pages.risk_factors.map(
                (risk, index) => (
                  <div key={index} className=" rounded-lg p-4 bg-muted">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className={`w-6 h-6  ${getRiskColor(risk.risk_level)}`}
                            />
                            <h4
                              className={`font-medium ${getRiskColor(risk.risk_level)}`}
                            >
                              {risk.risk_category} Risk
                            </h4>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-bold ${getRiskColor(risk.risk_level)}`}
                            >
                              {risk.risk_level}
                            </span>
                            {risk.risk_score && (
                              <p className="text-xs text-muted-foreground">
                                Score: {risk.risk_score}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {risk.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          {risk.impact_assessment && (
                            <p>
                              <strong>Impact:</strong> {risk.impact_assessment}
                            </p>
                          )}
                          {risk.probability && (
                            <p>
                              <strong>Probability:</strong> {risk.probability}
                            </p>
                          )}
                          {risk.mitigation_options && (
                            <p>
                              <strong>Mitigation:</strong>{" "}
                              {risk.mitigation_options}
                            </p>
                          )}
                          {risk.evidence_source && (
                            <p>
                              <strong>Source:</strong>{" "}
                              <a
                                href={risk.evidence_source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {risk.found_on_page || "Evidence"}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullReportModal;
