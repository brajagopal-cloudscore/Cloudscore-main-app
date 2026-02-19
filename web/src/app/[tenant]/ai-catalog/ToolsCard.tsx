import { Diff, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { getScoreColor, getRiskColor } from "./page";
import { Tool } from "./tools";
import { Button } from "@/components/ui/button";

const ToolCard: React.FC<{
  tool: Tool;
  onOpenComparison: () => void;
  onOpenFullReport: () => void;
  onOpenMultiComparison: () => void;
}> = ({ tool, onOpenComparison, onOpenFullReport, onOpenMultiComparison }) => {
  const complianceScore = Number(
    tool.trust_security_privacy_pages.compliance.compliance_score.score
  );
  const trustScore = Number(
    tool.trust_security_privacy_pages.trust_score.overall_score.score
  );

  return (
    <div className=" rounded-lg border  p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold ">{tool.tool_name}</h3>
            <p className="text-sm  text-muted-foreground">
              Type: {tool.type.category}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMultiComparison}
            title="Open for side-by-side comparison"
          >
            <Diff className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Compliance</span>
            <span
              className={`text-sm font-bold ${getScoreColor(complianceScore)}`}
            >
              {complianceScore}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${complianceScore >= 80 ? "bg-green-500" : complianceScore >= 60 ? "bg-blue-500" : complianceScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${complianceScore}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Trust Score</span>
            <span className={`text-sm font-bold ${getScoreColor(trustScore)}`}>
              {trustScore}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${trustScore >= 80 ? "bg-green-500" : trustScore >= 60 ? "bg-blue-500" : trustScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${trustScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Risk Factors:
        </h4>
        <div className="space-y-1">
          {tool.trust_security_privacy_pages.risk_factors
            .slice(0, 2)
            .map((risk, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${risk.risk_level === "Low" ? "bg-green-500/10" : risk.risk_level === "Medium" ? "bg-yellow-500/10" : "bg-red-500/10"}`}
                ></div>
                <span className={`text-xs ${getRiskColor(risk.risk_level)}`}>
                  {risk.risk_category}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Certifications:
        </h4>
        <div className="flex flex-wrap items-center gap-1">
          {tool.trust_security_privacy_pages.certifications
            .slice(0, 3)
            .map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded"
              >
                <CheckCircle className="w-3 h-3" />
                {cert.certification_name}
              </span>
            ))}
          {tool.trust_security_privacy_pages.certifications.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{tool.trust_security_privacy_pages.certifications.length - 3}{" "}
              more
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onOpenFullReport} className="rounded-none w-full">
          <ExternalLink className="w-4 h-4" />
          View Full Report
        </Button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        Last Audited: {new Date(tool.collection_date).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ToolCard;
