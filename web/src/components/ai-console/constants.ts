export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "approved" | "unapproved" | "pending";
export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertEvent {
  id: string;
  timestamp: string;
  user: string;
  tool: string;
  workstation: string;
  description: string;
  severity: AlertSeverity;
  dataCategories: string[];
  department: string;
}

export interface AITool {
  id: string;
  name: string;
  icon: string;
  usageWeekly: number;
  usageMonthly: number;
  approvalStatus: ApprovalStatus;
  riskRating: RiskLevel;
  category: string;
  lastUsed: string;
}

export interface UserRisk {
  id: string;
  name: string;
  email: string;
  department: string;
  riskScore: number;
  unapprovedUsage: number;
  sensitiveDataEvents: number;
  lastActivity: string;
}

export interface DataExposure {
  category: string;
  count: number;
  trend: number;
  color: string;
}

// Summary Stats
export const summaryStats = {
  sessions24h: 1247,
  sessions7d: 8934,
  sessions30d: 34521,
  unapprovedIncidents: 47,
  complianceRisk: "medium" as RiskLevel,
  approvedUsagePercent: 73,
  unapprovedUsagePercent: 27,
};

// Activity Feed
export const activityFeed: AlertEvent[] = [
  {
    id: "1",
    timestamp: "2024-12-04 10:12 AM",
    user: "John.Doe",
    tool: "ChatGPT",
    workstation: "finance_workstation_01",
    description:
      "External LLM chatbot accessed via browser — confidential financial data detected in prompt",
    severity: "critical",
    dataCategories: ["Financial Data", "PII"],
    department: "Finance",
  },
  {
    id: "2",
    timestamp: "2024-12-04 09:45 AM",
    user: "Sarah.Johnson",
    tool: "Claude AI",
    workstation: "engineering_ws_12",
    description:
      "Unapproved AI tool usage detected — source code snippets uploaded",
    severity: "warning",
    dataCategories: ["IP", "Source Code"],
    department: "Engineering",
  },
  {
    id: "3",
    timestamp: "2024-12-04 09:30 AM",
    user: "Mike.Chen",
    tool: "Copilot",
    workstation: "dev_machine_04",
    description: "Approved tool usage within normal parameters",
    severity: "info",
    dataCategories: [],
    department: "Engineering",
  },
  {
    id: "4",
    timestamp: "2024-12-04 09:15 AM",
    user: "Emily.Williams",
    tool: "Perplexity",
    workstation: "hr_desktop_02",
    description:
      "Employee personal data queried through external AI — GDPR risk flagged",
    severity: "critical",
    dataCategories: ["PII", "HR Data"],
    department: "Human Resources",
  },
  {
    id: "5",
    timestamp: "2024-12-04 08:50 AM",
    user: "David.Brown",
    tool: "Gemini",
    workstation: "marketing_ws_08",
    description: "Marketing materials processed — pending review",
    severity: "warning",
    dataCategories: ["Marketing Data"],
    department: "Marketing",
  },
];

// AI Tools Inventory
export const aiTools: AITool[] = [
  {
    id: "1",
    name: "GitHub Copilot",
    icon: "🤖",
    usageWeekly: 892,
    usageMonthly: 3456,
    approvalStatus: "approved",
    riskRating: "low",
    category: "Code Assistant",
    lastUsed: "2 mins ago",
  },
  {
    id: "2",
    name: "ChatGPT",
    icon: "💬",
    usageWeekly: 567,
    usageMonthly: 2341,
    approvalStatus: "unapproved",
    riskRating: "high",
    category: "General LLM",
    lastUsed: "5 mins ago",
  },
  {
    id: "3",
    name: "Claude AI",
    icon: "🧠",
    usageWeekly: 234,
    usageMonthly: 987,
    approvalStatus: "pending",
    riskRating: "medium",
    category: "General LLM",
    lastUsed: "12 mins ago",
  },
  {
    id: "4",
    name: "Midjourney",
    icon: "🎨",
    usageWeekly: 156,
    usageMonthly: 678,
    approvalStatus: "unapproved",
    riskRating: "medium",
    category: "Image Generation",
    lastUsed: "1 hour ago",
  },
  {
    id: "5",
    name: "Perplexity",
    icon: "🔍",
    usageWeekly: 89,
    usageMonthly: 345,
    approvalStatus: "unapproved",
    riskRating: "high",
    category: "Search AI",
    lastUsed: "30 mins ago",
  },
  {
    id: "6",
    name: "Microsoft Copilot",
    icon: "📊",
    usageWeekly: 445,
    usageMonthly: 1823,
    approvalStatus: "approved",
    riskRating: "low",
    category: "Productivity",
    lastUsed: "8 mins ago",
  },
];

// User Risk Scoreboard
export const userRisks: UserRisk[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Finance",
    riskScore: 87,
    unapprovedUsage: 23,
    sensitiveDataEvents: 8,
    lastActivity: "10 mins ago",
  },
  {
    id: "2",
    name: "Emily Williams",
    email: "emily.w@company.com",
    department: "HR",
    riskScore: 76,
    unapprovedUsage: 18,
    sensitiveDataEvents: 12,
    lastActivity: "25 mins ago",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    department: "Engineering",
    riskScore: 65,
    unapprovedUsage: 15,
    sensitiveDataEvents: 5,
    lastActivity: "1 hour ago",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david.b@company.com",
    department: "Marketing",
    riskScore: 54,
    unapprovedUsage: 12,
    sensitiveDataEvents: 3,
    lastActivity: "2 hours ago",
  },
  {
    id: "5",
    name: "Mike Chen",
    email: "mike.c@company.com",
    department: "Engineering",
    riskScore: 32,
    unapprovedUsage: 4,
    sensitiveDataEvents: 1,
    lastActivity: "3 hours ago",
  },
];

// Data Exposure Categories
export const dataExposure: DataExposure[] = [
  { category: "PII", count: 234, trend: 12, color: "danger" },
  { category: "Financial Data", count: 187, trend: -5, color: "warning" },
  { category: "Source Code / IP", count: 156, trend: 23, color: "purple" },
  { category: "HR / Employee Data", count: 89, trend: 8, color: "info" },
  { category: "Customer Data", count: 67, trend: -2, color: "cyan" },
];

// Compliance Risk Trends (monthly data)
export const complianceTrends = [
  { month: "Jul", incidents: 23, risk: 45 },
  { month: "Aug", incidents: 34, risk: 52 },
  { month: "Sep", incidents: 28, risk: 48 },
  { month: "Oct", incidents: 45, risk: 67 },
  { month: "Nov", incidents: 38, risk: 58 },
  { month: "Dec", incidents: 47, risk: 62 },
];

// Department Risk
export const departmentRisk = [
  { name: "Finance", risk: 78, users: 45 },
  { name: "Engineering", risk: 45, users: 120 },
  { name: "HR", risk: 65, users: 28 },
  { name: "Marketing", risk: 52, users: 35 },
  { name: "Legal", risk: 34, users: 18 },
];
