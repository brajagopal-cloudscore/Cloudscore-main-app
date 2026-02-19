import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import { Shield, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { getScoreColor, getRiskColor } from "./page";
import { Tool } from "./tools";

const ComparisonModal: React.FC<{
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
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 " />
            </div>
            <div>
              <span className="font-semibold ">{tool.tool_name}</span>
              <p className="text-sm text-muted-foreground font-normal">
                Type: {tool.type.category}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed comparison and analysis of {tool.tool_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1 ">
                <span className="text-sm font-medium">Compliance</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(complianceScore)}`}
                >
                  {complianceScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${complianceScore >= 80 ? "bg-green-500" : complianceScore >= 60 ? "bg-blue-500" : complianceScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${complianceScore}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Calculation:{" "}
                {
                  tool.trust_security_privacy_pages.compliance.compliance_score
                    .calculation
                }
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-black">
                <span className="text-sm font-medium">Trust Score</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(trustScore)}`}
                >
                  {trustScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${trustScore >= 80 ? "bg-green-500" : trustScore >= 60 ? "bg-blue-500" : trustScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${trustScore}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Confidence: {confidenceInterval} | Data: {dataCompleteness}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Trust Score Components:
            </h4>
            <div className="space-y-2">
              {Object.entries(
                tool.trust_security_privacy_pages.trust_score.score_components
              ).map(([key, component]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize text-black">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {component.score}
                    </span>
                  </div>
                  {component.user_base && (
                    <p className="text-xs text-gray-600">
                      Users: {component.user_base}
                    </p>
                  )}
                  {component.customer_reviews && (
                    <p className="text-xs text-gray-600">
                      Reviews: {component.customer_reviews}
                    </p>
                  )}
                  {component.enterprise_customers && (
                    <p className="text-xs text-gray-600">
                      Enterprise: {component.enterprise_customers}
                    </p>
                  )}
                  {component.founded_year && (
                    <p className="text-xs text-gray-600">
                      Founded: {component.founded_year} (
                      {component.years_in_operation} years)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Risk Factors:
            </h4>
            <div className="space-y-2">
              {tool.trust_security_privacy_pages.risk_factors.map(
                (risk, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 ${getRiskColor(risk.risk_level)}`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-sm font-medium ${getRiskColor(risk.risk_level)}`}
                        >
                          {risk.risk_category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Score: {risk.risk_score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {risk.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>Impact: {risk.impact_assessment}</p>
                        {risk.mitigation_options && (
                          <p>Mitigation: {risk.mitigation_options}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Certifications:
            </h4>
            <div className="space-y-2">
              {tool.trust_security_privacy_pages.certifications.map(
                (cert, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        {cert.certification_name}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {cert.verification_status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {cert.validity_period && (
                        <p>Validity: {cert.validity_period}</p>
                      )}
                      {cert.scope_of_certification && (
                        <p>Scope: {cert.scope_of_certification}</p>
                      )}
                      <p>Score Value: {cert.scoring_value} points</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Pricing Information:
            </h4>
            <div className="space-y-2">
              <div className="text-xs text-gray-600 mb-2">
                Model:{" "}
                {tool &&
                  tool.trust_security_privacy_pages &&
                  tool.trust_security_privacy_pages.pricing_information &&
                  tool.trust_security_privacy_pages.pricing_information
                    .pricing_model}{" "}
                | Transparency:{" "}
                {tool &&
                  tool.trust_security_privacy_pages &&
                  tool.trust_security_privacy_pages.pricing_information &&
                  tool.trust_security_privacy_pages.pricing_information
                    .transparency}
              </div>
              {tool?.trust_security_privacy_pages?.pricing_information?.paid_plans?.map(
                (plan, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 text-black"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{plan.tier}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {plan.target_user}
                    </p>
                    <div className="text-xs text-gray-600">
                      Features: {plan.key_features.join(", ")}
                    </div>
                  </div>
                )
              )}
              {tool?.trust_security_privacy_pages?.pricing_information
                ?.enterprise_solution?.available === "Yes" && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-900 mb-1">
                    Enterprise Solution
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      Pricing:{" "}
                      {
                        tool.trust_security_privacy_pages.pricing_information
                          .enterprise_solution.pricing
                      }
                    </p>
                    <p>
                      Features:{" "}
                      {tool.trust_security_privacy_pages.pricing_information.enterprise_solution.features.join(
                        ", "
                      )}
                    </p>
                    <p>
                      Support:{" "}
                      {
                        tool.trust_security_privacy_pages.pricing_information
                          .enterprise_solution.support
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Trust & Security:
            </h4>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  Trust Center:{" "}
                  {tool.trust_security_privacy_pages.trust_center.exists}
                </p>
                <p>
                  Compliance Info:{" "}
                  {
                    tool.trust_security_privacy_pages.trust_center
                      .compliance_info
                  }
                </p>
                <p>
                  Certifications:{" "}
                  {tool.trust_security_privacy_pages.trust_center.certifications_mentioned.join(
                    ", "
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Last Audited:{" "}
              {new Date(tool.collection_date).toLocaleDateString()}
            </span>
            <span>
              | Verified:{" "}
              {tool.trust_security_privacy_pages.compliance.verification_date}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
