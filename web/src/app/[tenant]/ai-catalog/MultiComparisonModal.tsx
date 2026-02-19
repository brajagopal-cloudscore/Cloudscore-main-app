import { Shield, X, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { getScoreColor, getRiskColor } from "./page";
import { Tool } from "./tools";

const MultiComparisonModal: React.FC<{
  tool: Tool;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  zIndex: number;
}> = ({ tool, open, onOpenChange, position, zIndex }) => {
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

  if (!open) return null;

  return (
    <div
      className="fixed z-50 bg-muted rounded-lg shadow-2xl border flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "360px",
        maxHeight: "85vh",
        zIndex: zIndex,
      }}
    >
      <div className="flex items-center justify-between p-4 border-b  shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold  text-sm truncate block">
              {tool.tool_name}
            </span>
            <p className="text-xs text-muted-foreground font-normal truncate">
              Type: {tool.type.category}
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className=" ml-2"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-inherit duration-150  transition-colors" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto grow">
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
            <div className="w-full bg-muted-foreground rounded-full h-2">
              <div
                className={`h-2 rounded-full ${complianceScore >= 80 ? "bg-green-500" : complianceScore >= 60 ? "bg-blue-500" : complianceScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {
                tool.trust_security_privacy_pages.compliance.compliance_score
                  .calculation
              }
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ">
              <span className="text-sm font-medium">Trust Score</span>
              <span
                className={`text-sm font-bold ${getScoreColor(trustScore)}`}
              >
                {trustScore}%
              </span>
            </div>
            <div className="w-full bg-muted-foreground rounded-full h-2">
              <div
                className={`h-2 rounded-full ${trustScore >= 80 ? "bg-green-500" : trustScore >= 60 ? "bg-blue-500" : trustScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${trustScore}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Confidence: {confidenceInterval} | Data: {dataCompleteness}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium  mb-2">Score Breakdown:</h4>
          <div className="space-y-1">
            {Object.entries(
              tool.trust_security_privacy_pages.trust_score.score_components
            ).map(([key, component]) => (
              <div
                key={key}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-muted-foreground capitalize truncate">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="font-medium text-blue-500 shrink-0 ml-2">
                  {component.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium  mb-2">Risk Factors:</h4>
          <div className="space-y-2">
            {tool.trust_security_privacy_pages.risk_factors.map(
              (risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 shrink-0 ${getRiskColor(risk.risk_level)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-sm font-medium ${getRiskColor(risk.risk_level)}`}
                      >
                        {risk.risk_category}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-1">
                        {risk.risk_score}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground wrap-break-words">
                      {risk.description}
                    </p>
                    {risk.impact_assessment && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Impact: {risk.impact_assessment}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Certifications:</h4>
          <div className="space-y-2">
            {tool.trust_security_privacy_pages.certifications.map(
              (cert, index) => (
                <div key={index} className="bg-green-500/10 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-green-500 font-medium truncate">
                      {cert.certification_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {cert.validity_period && (
                      <p>Valid: {cert.validity_period}</p>
                    )}
                    <p>Points: {cert.scoring_value}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium  mb-2">Pricing:</h4>
          <div className="text-xs text-muted-foreground mb-2">
            {
              tool?.trust_security_privacy_pages?.pricing_information
                ?.pricing_model
            }{" "}
            |{" "}
            {
              tool?.trust_security_privacy_pages?.pricing_information
                ?.transparency
            }
          </div>
          <div className="space-y-2">
            {tool?.trust_security_privacy_pages?.pricing_information?.paid_plans?.map(
              (plan, index) => (
                <div key={index} className=" rounded-lg p-3 border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate">
                      {plan.tier}
                    </span>
                    <span className="text-sm font-bold text-blue-500 shrink-0 ml-2">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {plan.target_user}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {plan.key_features.join(", ")}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className=" rounded-lg p-3 border">
          <h4 className="text-sm font-medium  mb-2">Trust Center:</h4>
          <div className="">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Status: {tool.trust_security_privacy_pages.trust_center.exists}
              </p>
              <p>
                Compliance:{" "}
                {tool.trust_security_privacy_pages.trust_center.compliance_info}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t ">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>
            Audited: {new Date(tool.collection_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MultiComparisonModal;
