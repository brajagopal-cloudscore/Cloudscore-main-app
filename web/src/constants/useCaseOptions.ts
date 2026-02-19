export const BUSINESS_FUNCTIONS = [
  'Marketing', 'Sales', 'Customer Success', 'HR', 'Finance', 'Legal',
  'Compliance', 'Risk', 'Security', 'IT Ops', 'Data', 'Engineering',
  'Human-in-loop', 'Assist', 'Semi-autonomous', 'Autonomous with review',
  'Product', 'Operations', 'Supply Chain', 'Procurement', 'Facilities',
  'Exec/Strategy', 'Training', 'R&D', 'ESG', 'Communications'
];

export const AGENT_PATTERN_OPTIONS = [
  'Autonomous with override', 'Autonomous with approval', 'Multi-agent'
];

export const USE_CASE_OPTIONS = [
  'AutoWriter', 'Audience Segmentation Agent', 'Content Calendar Orchestrator',
  'SEO Optimizer', 'Deal Desk Copilot', 'Opportunity Summarizer',
  'Outreach Personalizer', 'Renewal Risk Agent', 'Knowledge Assistant',
  'Talent Sourcing Copilot', 'Policy Q&A Bot', 'Performance Review Drafting',
  'Close Automation Agent', 'Forecast Copilot', 'Expense Auditor',
  'Contract Review Agent', 'eDiscovery Triage', 'Policy Enforcement Bot',
  'AI Governance Registry', 'Model Risk Management Agent', 'Third-Party AI Risk',
  'Secure Coding Copilot', 'Access Governance Agent', 'Incident Postmortem Writer',
  'Ticket Triage & Resolution', 'SaaS Hygiene Agent', 'Semantic Data Catalog',
  'Auto-Quality Monitor', 'Code Generation Copilot', 'Agentic Refactoring',
  'Release Notes Builder', 'Voice of Customer Synthesizer', 'Experiment Copilot'
];

export const KEY_INPUTS_OPTIONS = [
  'Brand guidelines', 'CRM data', 'Product catalog', 'Analytics data',
  'Customer feedback', 'Market research', 'Sales data', 'Support tickets',
  'Historical data', 'User behavior data', 'Financial data', 'Inventory data'
];

export const PRIMARY_OUTPUTS_OPTIONS = [
  'Reports', 'Dashboards', 'Recommendations', 'Alerts', 'Summaries',
  'Predictions', 'Classifications', 'Generated content', 'Workflows',
  'Notifications', 'Automated responses', 'Risk scores', 'Insights'
];

export const BUSINESS_IMPACT_OPTIONS = [
  'Cost reduction', 'Time savings', 'Revenue increase', 'Quality improvement',
  'Risk reduction', 'Compliance enhancement', 'Customer satisfaction',
  'Operational efficiency', 'Faster decision making', 'Reduced errors'
];

export const KPIS_OPTIONS = [
  'Accuracy rate', 'Processing time', 'Cost per transaction', 'Error rate',
  'User adoption rate', 'Time to resolution', 'Customer satisfaction',
  'ROI', 'Efficiency gains', 'Quality score', 'Compliance rate'
];

export const INITIAL_NEW_RISK = {
  sRiskName: '',
  sOwner: '',
  eSeverity: 'Minor' as const,
  eLikelihood: 'Possible' as const,
  eMitigationStatus: 'Not Started' as const,
  eRiskLevel: 'Low' as const,
  dTargetDate: '',
  sDescription: ''
};
