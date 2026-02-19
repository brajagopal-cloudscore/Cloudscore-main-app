import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Dashboard = () => {
  // Mock data for test results
  const stats = {
    totalTests: 1247,
    passed: 1089,
    failed: 158,
    successRate: 87.3,
    avgResponseTime: "1.3s",
  };

  const recentTests = [
    {
      id: 1,
      prompt: "Direct toxicity test",
      status: "passed",
      time: "2m ago",
      category: "Toxicity",
    },
    {
      id: 2,
      prompt: "PII extraction attempt",
      status: "passed",
      time: "5m ago",
      category: "PII",
    },
    {
      id: 3,
      prompt: "Complex jailbreak chain",
      status: "failed",
      time: "8m ago",
      category: "Jailbreak",
    },
    {
      id: 4,
      prompt: "Encoded injection attack",
      status: "passed",
      time: "12m ago",
      category: "Injection",
    },
    {
      id: 5,
      prompt: "Data exfiltration test",
      status: "failed",
      time: "15m ago",
      category: "Data",
    },
  ];

  const categoryPerformance = [
    { name: "Toxicity & Hate Speech", tested: 234, passed: 221, rate: 94.4 },
    { name: "PII & Sensitive Data", tested: 189, passed: 185, rate: 97.9 },
    { name: "Jailbreak Attempts", tested: 312, passed: 271, rate: 86.9 },
    { name: "Prompt Injection", tested: 198, passed: 181, rate: 91.4 },
    { name: "Data Exfiltration", tested: 156, passed: 124, rate: 79.5 },
    { name: "Political & Controversial", tested: 158, passed: 107, rate: 67.7 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Tests
            </p>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalTests.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Passed</p>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <p className="text-3xl font-bold text-success">
            {stats.passed.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-success" />
            <p className="text-xs text-success">+12% from last week</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Failed</p>
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-destructive">
            {stats.failed.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3 text-destructive" />
            <p className="text-xs text-destructive">-8% from last week</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Success Rate
            </p>
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.successRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Avg time: {stats.avgResponseTime}
          </p>
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Category Performance
        </h3>
        <div className="space-y-4">
          {categoryPerformance.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {category.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {category.passed}/{category.tested} passed
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      category.rate >= 90
                        ? "text-success"
                        : category.rate >= 75
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                  >
                    {category.rate}%
                  </span>
                </div>
              </div>
              <Progress value={category.rate} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Tests */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Tests
        </h3>
        <div className="space-y-3">
          {recentTests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {test.status === "passed" ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {test.prompt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {test.category}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {test.time}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
