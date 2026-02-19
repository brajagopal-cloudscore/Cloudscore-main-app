import {
  pgTable,
  index,
  foreignKey,
  unique,
  uuid,
  text,
  numeric,
  boolean,
  jsonb,
  timestamp,
  integer,
  bigint,
  date,
  uniqueIndex,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const applicationStatus = pgEnum("application_status", [
  "Not Started",
  "In Progress",
  "Completed",
  "Archived",
]);
export const assessmentStatus = pgEnum("assessment_status", [
  "not_started",
  "in_progress",
  "compliant",
  "non_compliant",
  "not_applicable",
]);
export const credentialAuthType = pgEnum("credential_auth_type", [
  "api_key",
  "oauth",
  "jwt",
  "azure_ad",
  "service_account",
  "custom",
]);
export const datasetType = pgEnum("dataset_type", [
  "training",
  "validation",
  "test",
  "evaluation",
]);
export const documentationPriority = pgEnum("documentation_priority", [
  "low priority",
  "medium priority",
  "high priority",
]);
export const documentationSectionType = pgEnum("documentation_section_type", [
  "application_scope",
  "technology_details",
  "data_governance",
  "record_keeping",
  "information_protection",
  "transparency",
  "human_oversight",
  "bias_monitoring_mitigation",
  "explainability",
  "environmental_impact",
]);
export const documentationStatus = pgEnum("documentation_status", [
  "Not started",
  "In Progress",
  "Done",
]);
export const euAiActRiskClassification = pgEnum(
  "eu_ai_act_risk_classification",
  ["unacceptable", "high", "limited", "minimal"]
);
export const guardTier = pgEnum("guard_tier", ["T0", "T1", "T2"]);
export const httpMethod = pgEnum("http_method", [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);
export const infrastructureType = pgEnum("infrastructure_type", [
  "ml",
  "llm",
  "rule",
  "na",
]);
export const integrationType = pgEnum("integration_type", [
  "slack",
  "jira",
  "github",
  "azure_devops",
  "webhook",
  "email",
  "siem",
]);
export const modelCategory = pgEnum("model_category", [
  "llm",
  "3rd_party",
  "1st_party",
]);
export const modelRiskLevel = pgEnum("model_risk_level", [
  "Low",
  "Medium",
  "High",
  "Critical",
  "N/A",
]);
export const moduleType = pgEnum("module_type", [
  "goviq",
  "controlnet",
  "admin",
  "tenant",
  "global",
]);
export const policyStatus = pgEnum("policy_status", [
  "draft",
  "active",
  "deprecated",
  "archived",
]);
export const provider = pgEnum("provider", [
  "openai",
  "anthropic",
  "bedrock",
  "groq",
  "vertex",
  "ollama",
  "azure_openai",
  "huggingface",
  "custom",
]);
export const providerModelStatus = pgEnum("provider_model_status", [
  "available",
  "preview",
  "deprecated",
  "unavailable",
]);
export const reportStatus = pgEnum("report_status", [
  "draft",
  "generating",
  "completed",
  "failed",
]);
export const reportType = pgEnum("report_type", [
  "compliance",
  "governance",
  "risk",
  "executive",
  "audit",
]);
export const riskLevel = pgEnum("risk_level", [
  "Low",
  "Medium",
  "High",
  "Critical",
]);
export const riskLikelihood = pgEnum("risk_likelihood", [
  "Rare",
  "Unlikely",
  "Possible",
  "Likely",
]);
export const riskMitigationStatus = pgEnum("risk_mitigation_status", [
  "Not Started",
  "In Progress",
  "Requires Review",
  "Completed",
]);
export const riskSeverity = pgEnum("risk_severity", [
  "Minor",
  "Moderate",
  "Major",
  "Catastrophic",
]);
export const syncStatus = pgEnum("sync_status", [
  "success",
  "failed",
  "pending",
]);
export const testSeverity = pgEnum("test_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const testStatus = pgEnum("test_status", [
  "passed",
  "failed",
  "warning",
  "pending",
]);
export const testType = pgEnum("test_type", [
  "adversarial",
  "jailbreak",
  "prompt_injection",
  "toxicity",
  "bias",
  "safety",
]);

export const guardrails = pgTable(
  "guardrails",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id"),
    key: text().notNull(),
    version: text().default("v1").notNull(),
    category: text(),
    description: text(),
    tier: guardTier().notNull(),
    performanceBudgetMs: numeric("performance_budget_ms", {
      precision: 10,
      scale: 3,
    }),
    requiresOnnx: boolean("requires_onnx").default(false).notNull(),
    onnxModelId: text("onnx_model_id"),
    defaultParams: jsonb("default_params").default({}).notNull(),
    metadata: jsonb().default({}).notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    packName: text("pack_name"),
    functionName: text("function_name"),
    inputSchema: jsonb("input_schema"),
    outputSchema: jsonb("output_schema"),
    fallbackStrategy: text("fallback_strategy").default("skip"),
    infrastructure: infrastructureType().default("rule").notNull(),
    isGlobal: boolean("is_global").default(false).notNull(),
    isCertified: boolean("is_certified").default(false).notNull(),
    fallbackGuardrailId: uuid("fallback_guardrail_id"),
    avgLatencyMs: numeric("avg_latency_ms", { precision: 10, scale: 3 }),
    p95LatencyMs: numeric("p95_latency_ms", { precision: 10, scale: 3 }),
    accuracyScore: numeric("accuracy_score", { precision: 5, scale: 4 }),
    name: text(),
    family: text(),
    enableInstall: boolean("enable_install").default(false),
  },
  (table) => [
    index("idx_guardrails_category").using(
      "btree",
      table.category.asc().nullsLast().op("text_ops")
    ),
    index("idx_guardrails_certified").using(
      "btree",
      table.isCertified.asc().nullsLast().op("bool_ops")
    ),
    index("idx_guardrails_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_guardrails_family").using(
      "btree",
      table.family.asc().nullsLast().op("text_ops")
    ),
    index("idx_guardrails_global").using(
      "btree",
      table.isGlobal.asc().nullsLast().op("bool_ops")
    ),
    index("idx_guardrails_infrastructure").using(
      "btree",
      table.infrastructure.asc().nullsLast().op("enum_ops")
    ),
    index("idx_guardrails_key").using(
      "btree",
      table.key.asc().nullsLast().op("text_ops")
    ),
    index("idx_guardrails_metadata_gin").using(
      "gin",
      table.metadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_guardrails_pack_name").using(
      "btree",
      table.packName.asc().nullsLast().op("text_ops")
    ),
    index("idx_guardrails_params_gin").using(
      "gin",
      table.defaultParams.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_guardrails_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_guardrails_tier").using(
      "btree",
      table.tier.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "guardrails_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "guardrails_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "guardrails_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.fallbackGuardrailId],
      foreignColumns: [table.id],
      name: "guardrails_fallback_guardrail_id_fkey",
    }).onDelete("set null"),
    unique("uq_guardrails_tenant_key_version").on(
      table.tenantId,
      table.key,
      table.version
    ),
  ]
);

export const scanFindings = pgTable(
  "scan_findings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    scanId: uuid("scan_id").notNull(),
    ruleId: text("rule_id").notNull(),
    severity: text().notNull(),
    title: text().notNull(),
    description: text(),
    evidence: jsonb().default({}),
    remediation: jsonb(),
    cveId: text("cve_id"),
    suppressed: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_scan_findings_cve").using(
      "btree",
      table.cveId.asc().nullsLast().op("text_ops")
    ),
    index("idx_scan_findings_rule").using(
      "btree",
      table.ruleId.asc().nullsLast().op("text_ops")
    ),
    index("idx_scan_findings_scan").using(
      "btree",
      table.scanId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_scan_findings_severity").using(
      "btree",
      table.severity.asc().nullsLast().op("text_ops")
    ),
    index("idx_scan_findings_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "scan_findings_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.scanId],
      foreignColumns: [modelScans.id],
      name: "scan_findings_scan_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const modelArtifacts = pgTable(
  "model_artifacts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    source: text().notNull(),
    uri: text().notNull(),
    filename: text(),
    sizeBytes: integer("size_bytes"),
    sha256: text().notNull(),
    contentType: text("content_type"),
    detectedFormat: text("detected_format"),
    approvalStatus: text("approval_status").default("pending").notNull(),
    blockedReason: text("blocked_reason"),
    artifactMetadata: jsonb("artifact_metadata").default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_model_artifacts_approval").using(
      "btree",
      table.approvalStatus.asc().nullsLast().op("text_ops")
    ),
    index("idx_model_artifacts_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_model_artifacts_format").using(
      "btree",
      table.detectedFormat.asc().nullsLast().op("text_ops")
    ),
    index("idx_model_artifacts_metadata_gin").using(
      "gin",
      table.artifactMetadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_model_artifacts_sha256").using(
      "btree",
      table.sha256.asc().nullsLast().op("text_ops")
    ),
    index("idx_model_artifacts_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "model_artifacts_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "model_artifacts_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "model_artifacts_updated_by_fkey",
    }).onDelete("set null"),
    unique("uq_model_artifacts_tenant_sha256").on(table.tenantId, table.sha256),
  ]
);

export const modelScans = pgTable(
  "model_scans",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    artifactId: uuid("artifact_id").notNull(),
    status: text().default("queued").notNull(),
    engineVersion: text("engine_version"),
    sbom: jsonb().default({}),
    reportJson: jsonb("report_json"),
    reportSarif: jsonb("report_sarif"),
    error: text(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
    finishedAt: timestamp("finished_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_model_scans_artifact").using(
      "btree",
      table.artifactId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_model_scans_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_model_scans_sbom_gin").using(
      "gin",
      table.sbom.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_model_scans_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("idx_model_scans_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "model_scans_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.artifactId],
      foreignColumns: [modelArtifacts.id],
      name: "model_scans_artifact_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "model_scans_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "model_scans_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const policies = pgTable(
  "policies",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    version: text().default("v1").notNull(),
    slug: text(),
    description: text(),
    yaml: text(),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    compiled: jsonb(),
    hash: text(),
    status: policyStatus().default("active").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true, mode: "string" }),
    validTo: timestamp("valid_to", { withTimezone: true, mode: "string" }),
    compositionStrategy: jsonb("composition_strategy").default({}).notNull(),
    aiSystemPolicyPrompt: text("ai_system_policy_prompt"),
    flowRules: jsonb("flow_rules").default([]).notNull(),
    fileUrl: text("file_url"),
  },
  (table) => [
    index("idx_policies_compiled_gin").using(
      "gin",
      table.compiled.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_policies_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_policies_hash").using(
      "btree",
      table.hash.asc().nullsLast().op("text_ops")
    ),
    index("idx_policies_metadata_gin").using(
      "gin",
      table.metadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_policies_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops")
    ),
    index("idx_policies_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "policies_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "policies_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "policies_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const policyGuardrails = pgTable(
  "policy_guardrails",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    policyId: uuid("policy_id").notNull(),
    guardrailId: uuid("guardrail_id").notNull(),
    phase: text().notNull(),
    target: jsonb(),
    params: jsonb().default({}).notNull(),
    threshold: numeric({ precision: 5, scale: 2 }),
    weight: numeric({ precision: 5, scale: 2 }),
    tierOverride: guardTier("tier_override"),
    orderIndex: integer("order_index").default(0).notNull(),
    enabled: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
  },
  (table) => [
    index("idx_policy_guardrails_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_guardrails_params_gin").using(
      "gin",
      table.params.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_policy_guardrails_phase").using(
      "btree",
      table.phase.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_guardrails_policy").using(
      "btree",
      table.policyId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_policy_guardrails_target_gin").using(
      "gin",
      table.target.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_policy_guardrails_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.policyId],
      foreignColumns: [policies.id],
      name: "policy_guardrails_policy_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.guardrailId],
      foreignColumns: [guardrails.id],
      name: "policy_guardrails_guardrail_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "policy_guardrails_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "policy_guardrails_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "policy_guardrails_updated_by_fkey",
    }).onDelete("set null"),
    unique("uq_policy_guard_use").on(
      table.policyId,
      table.guardrailId,
      table.phase,
      table.orderIndex
    ),
  ]
);

export const observabilityLogs = pgTable(
  "observability_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id"),
    policyId: uuid("policy_id"),
    requestId: text("request_id").notNull(),
    timestamp: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    method: text(),
    path: text(),
    statusCode: integer("status_code"),
    latencyMs: integer("latency_ms"),
    requestPayload: jsonb("request_payload"),
    responsePayload: jsonb("response_payload"),
    guardrailResults: jsonb("guardrail_results"),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_observability_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_observability_request").using(
      "btree",
      table.requestId.asc().nullsLast().op("text_ops")
    ),
    index("idx_observability_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_observability_timestamp").using(
      "btree",
      table.timestamp.desc().nullsFirst().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "observability_logs_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "observability_logs_application_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.policyId],
      foreignColumns: [policies.id],
      name: "observability_logs_policy_id_fkey",
    }).onDelete("set null"),
    unique("observability_logs_request_id_unique").on(table.requestId),
  ]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    reportType: reportType("report_type").notNull(),
    description: text(),
    generatedBy: text("generated_by").notNull(),
    status: reportStatus().default("draft").notNull(),
    reportData: jsonb("report_data"),
    filters: jsonb(),
    fileUrl: text("file_url"),
    scheduled: boolean().default(false).notNull(),
    scheduleConfig: jsonb("schedule_config"),
    metadata: jsonb().default({}).notNull(),
    generatedAt: timestamp("generated_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_reports_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops")
    ),
    index("idx_reports_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_reports_type").using(
      "btree",
      table.reportType.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "reports_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.generatedBy],
      foreignColumns: [users.id],
      name: "reports_generated_by_fkey",
    }).onDelete("restrict"),
  ]
);

export const stakeholders = pgTable(
  "stakeholders",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    userName: text("user_name").notNull(),
    role: text().notNull(),
    email: text(),
    department: text(),
    responsibilities: text(),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_stakeholders_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_stakeholders_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "stakeholders_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "stakeholders_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "stakeholders_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "stakeholders_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const tenants = pgTable(
  "tenants",
  {
    id: text().primaryKey().notNull(),
    slug: text().notNull(),
    name: text().notNull(),
    plan: text().default("free").notNull(),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdByKentron: boolean("created_by_kentron").default(false).notNull(),
    description: text(),
    logoUrl: text("logo_url"),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    controlnetEnabled: boolean().default(true),
    govIqEnabled: boolean().default(false),
  },
  (table) => [
    index("idx_tenants_created_by_kentron").using(
      "btree",
      table.createdByKentron.asc().nullsLast().op("bool_ops")
    ),
    index("idx_tenants_slug").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops")
    ),
    unique("tenants_slug_unique").on(table.slug),
  ]
);

export const redTeamingTests = pgTable(
  "red_teaming_tests",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    policyId: uuid("policy_id"),
    testName: text("test_name").notNull(),
    testType: testType("test_type").notNull(),
    testInput: text("test_input").notNull(),
    expectedBehavior: text("expected_behavior"),
    actualOutput: text("actual_output"),
    testStatus: testStatus("test_status"),
    severity: testSeverity(),
    testResults: jsonb("test_results").default({}).notNull(),
    remediationNotes: text("remediation_notes"),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    testedAt: timestamp("tested_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_red_teaming_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_red_teaming_status").using(
      "btree",
      table.testStatus.asc().nullsLast().op("enum_ops")
    ),
    index("idx_red_teaming_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_red_teaming_type").using(
      "btree",
      table.testType.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "red_teaming_tests_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "red_teaming_tests_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.policyId],
      foreignColumns: [policies.id],
      name: "red_teaming_tests_policy_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "red_teaming_tests_created_by_fkey",
    }).onDelete("restrict"),
  ]
);

export const applicationModels = pgTable(
  "application_models",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    vendor: text(),
    model: text(),
    hostingLocation: text("hosting_location").notNull(),
    modelArchitecture: text("model_architecture").notNull(),
    objectives: text().notNull(),
    computeInfrastructure: text("compute_infrastructure").notNull(),
    trainingDuration: text("training_duration").notNull(),
    modelSize: text("model_size").notNull(),
    trainingDataSize: text("training_data_size").notNull(),
    inferenceLatency: text("inference_latency").notNull(),
    hardwareRequirements: text("hardware_requirements").notNull(),
    software: text().notNull(),
    promptRegistry: text("prompt_registry"),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_app_models_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_app_models_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "application_models_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "application_models_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "application_models_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "application_models_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const users = pgTable(
  "users",
  {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    name: text(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
  },
  (table) => [
    index("idx_users_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
  ]
);
export const applicationDocumentation = pgTable(
  "application_documentation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    riskId: text("risk_id"),
    applicationId: uuid("application_id").notNull(),
    sectionType: documentationSectionType("section_type").notNull(),
    fieldKey: text("field_key").notNull(),
    fieldTitle: text("field_title").notNull(),
    content: text(),
    status: documentationStatus().default("Not started").notNull(),
    priority: documentationPriority().default("medium priority").notNull(),
    files: jsonb().default([]).notNull(),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_app_doc_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_app_doc_section").using(
      "btree",
      table.sectionType.asc().nullsLast().op("enum_ops")
    ),
    index("idx_app_doc_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),

    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "application_documentation_tenant_id_fkey",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "application_documentation_application_id_fkey",
    }).onDelete("cascade"),

    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "application_documentation_created_by_fkey",
    }).onDelete("restrict"),

    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "application_documentation_updated_by_fkey",
    }).onDelete("set null"),
    unique("uq_app_doc_section_field").on(
      table.applicationId,
      table.sectionType,
      table.fieldKey
    ),
    sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_app_doc_with_risk
      ON application_documentation (application_id, section_type, field_key, risk_id)
      WHERE risk_id IS NOT NULL;
    `,
  ]
);

export const processedWebhookEvents = pgTable("processed_webhook_events", {
  id: text().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const onnxModels = pgTable(
  "onnx_models",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    modelId: text("model_id").notNull(),
    name: text().notNull(),
    description: text(),
    modelType: text("model_type").notNull(),
    version: text().notNull(),
    fileSize: integer("file_size"),
    inputShape: jsonb("input_shape"),
    outputShape: jsonb("output_shape"),
    maxTokens: integer("max_tokens").default(512),
    avgInferenceMs: numeric("avg_inference_ms", { precision: 10, scale: 3 }),
    memoryUsageMb: integer("memory_usage_mb"),
    framework: text().default("onnx").notNull(),
    opset: integer().default(13),
    quantized: boolean().default(false).notNull(),
    categories: text().array().default([""]).notNull(),
    metadata: jsonb().default({}).notNull(),
    storageUrl: text("storage_url"),
    checksum: text(),
    isActive: boolean("is_active").default(true).notNull(),
    deployedAt: timestamp("deployed_at", {
      withTimezone: true,
      mode: "string",
    }),
    deprecatedAt: timestamp("deprecated_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    p50Ms: numeric("p50_ms", { precision: 10, scale: 3 }),
    p95Ms: numeric("p95_ms", { precision: 10, scale: 3 }),
    auroc: numeric({ precision: 5, scale: 4 }),
    recallAtFpr001: numeric("recall_at_fpr_001", { precision: 5, scale: 4 }),
    supportedLanguages: text("supported_languages")
      .array()
      .default([""])
      .notNull(),
    costTier: text("cost_tier"),
    family: text().array().default([""]).notNull(),
  },
  (table) => [
    index("idx_onnx_models_active").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops")
    ),
    index("idx_onnx_models_family").using(
      "gin",
      table.family.asc().nullsLast().op("array_ops")
    ),
    index("idx_onnx_models_metadata_gin").using(
      "gin",
      table.metadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_onnx_models_model_type").using(
      "btree",
      table.modelType.asc().nullsLast().op("text_ops")
    ),
    unique("onnx_models_model_id_unique").on(table.modelId),
  ]
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    fileName: text("file_name").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    fileSize: bigint("file_size", { mode: "number" }),
    fileType: text("file_type"),
    storagePath: text("storage_path").notNull(),
    checksum: text(),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    metadata: jsonb().default({}).notNull(),
  },
  (table) => [
    index("idx_attachments_entity").using(
      "btree",
      table.entityType.asc().nullsLast().op("text_ops"),
      table.entityId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_attachments_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_attachments_uploaded_by").using(
      "btree",
      table.uploadedBy.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "attachments_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.uploadedBy],
      foreignColumns: [users.id],
      name: "attachments_uploaded_by_fkey",
    }).onDelete("restrict"),
  ]
);

export const complianceAssessments = pgTable(
  "compliance_assessments",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id"),
    frameworkId: uuid("framework_id").notNull(),
    controlId: uuid("control_id").notNull(),
    assessmentStatus: assessmentStatus("assessment_status")
      .default("not_started")
      .notNull(),
    evidenceProvided: boolean("evidence_provided").default(false).notNull(),
    evidenceUrl: text("evidence_url"),
    evidenceNotes: text("evidence_notes"),
    assessedBy: text("assessed_by"),
    assessedAt: timestamp("assessed_at", {
      withTimezone: true,
      mode: "string",
    }),
    nextReviewDate: timestamp("next_review_date", {
      withTimezone: true,
      mode: "string",
    }),
    notes: text(),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_compliance_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_compliance_framework").using(
      "btree",
      table.frameworkId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_compliance_status").using(
      "btree",
      table.assessmentStatus.asc().nullsLast().op("enum_ops")
    ),
    index("idx_compliance_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "compliance_assessments_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "compliance_assessments_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.frameworkId],
      foreignColumns: [governanceFrameworks.id],
      name: "compliance_assessments_framework_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.controlId],
      foreignColumns: [governanceControls.id],
      name: "compliance_assessments_control_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.assessedBy],
      foreignColumns: [users.id],
      name: "compliance_assessments_assessed_by_fkey",
    }).onDelete("set null"),
  ]
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    action: text().notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb().default({}).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_audit_events_action").using(
      "btree",
      table.action.asc().nullsLast().op("text_ops")
    ),
    index("idx_audit_events_actor").using(
      "btree",
      table.actorUserId.asc().nullsLast().op("text_ops")
    ),
    index("idx_audit_events_created").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("idx_audit_events_target").using(
      "btree",
      table.targetType.asc().nullsLast().op("text_ops")
    ),
    index("idx_audit_events_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "audit_events_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.actorUserId],
      foreignColumns: [users.id],
      name: "audit_events_actor_user_id_fkey",
    }).onDelete("restrict"),
  ]
);

export const memberships = pgTable(
  "memberships",
  {
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    role: text().default("member").notNull(),
    permissions: text().array().default([""]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_memberships_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_memberships_user").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "memberships_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "memberships_user_id_fkey",
    }).onDelete("cascade"),
    unique("uq_memberships_tenant_user").on(table.tenantId, table.userId),
  ]
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    keyHash: text("key_hash").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
      mode: "string",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    isActive: boolean("is_active").default(true).notNull(),
    permissions: text().array().default([""]).notNull(),
    rateLimitPerMinute: integer("rate_limit_per_minute").default(1000),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    revokedBy: text("revoked_by"),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_api_keys_active").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops")
    ),
    index("idx_api_keys_key_hash").using(
      "btree",
      table.keyHash.asc().nullsLast().op("text_ops")
    ),
    index("idx_api_keys_key_prefix").using(
      "btree",
      table.keyPrefix.asc().nullsLast().op("text_ops")
    ),
    index("idx_api_keys_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "api_keys_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "api_keys_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.revokedBy],
      foreignColumns: [users.id],
      name: "api_keys_revoked_by_fkey",
    }).onDelete("set null"),
    unique("uq_api_keys_key_hash").on(table.keyHash),
  ]
);

export const governanceControls = pgTable(
  "governance_controls",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    frameworkId: uuid("framework_id").notNull(),
    controlId: text("control_id").notNull(),
    name: text().notNull(),
    description: text(),
    category: text(),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_governance_controls_framework").using(
      "btree",
      table.frameworkId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.frameworkId],
      foreignColumns: [governanceFrameworks.id],
      name: "governance_controls_framework_id_fkey",
    }).onDelete("cascade"),
    unique("uq_governance_control").on(table.frameworkId, table.controlId),
  ]
);

export const providerModels = pgTable(
  "provider_models",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    provider: provider().notNull(),
    modelId: text("model_id").notNull(),
    displayName: text("display_name"),
    family: text(),
    modality: text().array(),
    contextWindowTokens: integer("context_window_tokens"),
    maxOutputTokens: integer("max_output_tokens"),
    supportsStreaming: boolean("supports_streaming").default(true),
    supportsJson: boolean("supports_json").default(true),
    inputCostPer1K: numeric("input_cost_per_1k", { precision: 12, scale: 6 }),
    outputCostPer1K: numeric("output_cost_per_1k", { precision: 12, scale: 6 }),
    currency: text().default("USD"),
    pricingMetadata: jsonb("pricing_metadata").default({}),
    availabilityStatus: providerModelStatus("availability_status")
      .default("available")
      .notNull(),
    deprecationDate: timestamp("deprecation_date", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    tenantId: text("tenant_id"),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    modelUrl: text("model_url"),
    purposeUseCase: text("purpose_use_case"),
    riskLevel: modelRiskLevel("risk_level"),
    category: modelCategory(),
    modelArtifactId: uuid("model_artifact_id"),
  },
  (table) => [
    index("idx_provider_models_artifact").using(
      "btree",
      table.modelArtifactId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_provider_models_category").using(
      "btree",
      table.category.asc().nullsLast().op("enum_ops")
    ),
    index("idx_provider_models_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_provider_models_family").using(
      "btree",
      table.family.asc().nullsLast().op("text_ops")
    ),
    index("idx_provider_models_pricing_gin").using(
      "gin",
      table.pricingMetadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_provider_models_provider").using(
      "btree",
      table.provider.asc().nullsLast().op("enum_ops")
    ),
    index("idx_provider_models_risk_level").using(
      "btree",
      table.riskLevel.asc().nullsLast().op("enum_ops")
    ),
    index("idx_provider_models_status").using(
      "btree",
      table.availabilityStatus.asc().nullsLast().op("enum_ops")
    ),
    index("idx_provider_models_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "provider_models_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "provider_models_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "provider_models_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.modelArtifactId],
      foreignColumns: [modelArtifacts.id],
      name: "provider_models_model_artifact_id_fkey",
    }).onDelete("set null"),
    unique("uq_provider_models_tenant").on(
      table.provider,
      table.modelId,
      table.tenantId
    ),
    unique("uq_provider_models_artifact").on(table.modelArtifactId),
  ]
);

export const governanceFrameworks = pgTable(
  "governance_frameworks",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    version: text(),
    url: text(),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("uq_governance_frameworks_slug").on(table.slug)]
);

export const integrations = pgTable(
  "integrations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    integrationType: integrationType("integration_type"),
    description: text(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    configuration: jsonb().notNull(),
    credentialsEncrypted: text("credentials_encrypted"),
    webhookUrl: text("webhook_url"),
    lastSyncAt: timestamp("last_sync_at", {
      withTimezone: true,
      mode: "string",
    }),
    syncStatus: syncStatus("sync_status"),
    errorMessage: text("error_message"),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    category: text(),
    isCredentialsAdded: boolean("is_credentials_added")
      .default(false)
      .notNull(),
  },
  (table) => [
    index("idx_integrations_enabled").using(
      "btree",
      table.isEnabled.asc().nullsLast().op("bool_ops")
    ),
    index("idx_integrations_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_integrations_type").using(
      "btree",
      table.integrationType.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "integrations_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "integrations_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "integrations_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const datasets = pgTable(
  "datasets",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    name: text().notNull(),
    description: text(),
    datasetType: datasetType("dataset_type"),
    source: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    rowCount: integer("row_count"),
    schema: jsonb(),
    tags: text().array().default([""]).notNull(),
    storagePath: text("storage_path"),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_datasets_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_datasets_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_datasets_type").using(
      "btree",
      table.datasetType.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "datasets_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "datasets_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "datasets_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "datasets_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const euAiActAssessments = pgTable(
  "eu_ai_act_assessments",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    riskClassification: euAiActRiskClassification(
      "risk_classification"
    ).notNull(),
    assessmentDate: timestamp("assessment_date", {
      withTimezone: true,
      mode: "string",
    }),
    assessmentSummary: text("assessment_summary"),
    prohibitedPractices: jsonb("prohibited_practices").default([]).notNull(),
    highRiskCriteria: jsonb("high_risk_criteria").default([]).notNull(),
    transparencyRequirements: jsonb("transparency_requirements")
      .default({})
      .notNull(),
    conformityAssessment: jsonb("conformity_assessment").default({}).notNull(),
    documentationStatus: text("documentation_status"),
    assessedBy: text("assessed_by"),
    approvedBy: text("approved_by"),
    approvalDate: timestamp("approval_date", {
      withTimezone: true,
      mode: "string",
    }),
    nextReviewDate: timestamp("next_review_date", {
      withTimezone: true,
      mode: "string",
    }),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_eu_ai_act_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_eu_ai_act_classification").using(
      "btree",
      table.riskClassification.asc().nullsLast().op("enum_ops")
    ),
    index("idx_eu_ai_act_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "eu_ai_act_assessments_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "eu_ai_act_assessments_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.assessedBy],
      foreignColumns: [users.id],
      name: "eu_ai_act_assessments_assessed_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.approvedBy],
      foreignColumns: [users.id],
      name: "eu_ai_act_assessments_approved_by_fkey",
    }).onDelete("set null"),
  ]
);

export const applications = pgTable(
  "applications",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    slug: text(),
    description: text(),
    status: applicationStatus().default("Not Started").notNull(),
    goviqEnabled: boolean("goviq_enabled").default(false).notNull(),
    controlnetEnabled: boolean("controlnet_enabled").default(false).notNull(),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_applications_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("text_ops")
    ),
    index("idx_applications_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops")
    ),
    index("idx_applications_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "applications_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "applications_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "applications_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const navigationItems = pgTable(
  "navigation_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id"),
    parentId: uuid("parent_id"),
    label: text().notNull(),
    path: text(),
    icon: text(),
    orderIndex: integer("order_index").default(0).notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    requiredPermissions: text("required_permissions")
      .array()
      .default([""])
      .notNull(),
    moduleType: moduleType("module_type"),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_nav_items_module").using(
      "btree",
      table.moduleType.asc().nullsLast().op("enum_ops")
    ),
    index("idx_nav_items_order").using(
      "btree",
      table.orderIndex.asc().nullsLast().op("int4_ops")
    ),
    index("idx_nav_items_parent").using(
      "btree",
      table.parentId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_nav_items_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "navigation_items_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "navigation_items_parent_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const useCases = pgTable(
  "use_cases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    function: text().notNull(),
    useCase: text("use_case").notNull(),
    whatItDoes: text("what_it_does").notNull(),
    agentPatterns: text("agent_patterns").array().default([""]).notNull(),
    keyInputs: text("key_inputs").array().notNull(),
    primaryOutputs: text("primary_outputs").array().notNull(),
    businessImpact: text("business_impact").array().notNull(),
    kpis: text().array().notNull(),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    region: text().array(),
  },
  (table) => [
    index("idx_use_cases_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_use_cases_function").using(
      "btree",
      table.function.asc().nullsLast().op("text_ops")
    ),
    index("idx_use_cases_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "use_cases_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "use_cases_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "use_cases_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "use_cases_updated_by_fkey",
    }).onDelete("set null"),
  ]
);

export const integrationsAdmin = pgTable(
  "integrations_admin",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    category: text(),
    description: text(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    isCredentialsAdded: boolean("is_credentials_added")
      .default(false)
      .notNull(),
    configuration: jsonb().default({}),
    apiKey: text("api_key"),
    logoUrl: text("logo_url"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("unique_tenant_integration").on(table.tenantId, table.name),
    unique("unique_integration_name").on(table.name),
  ]
);

export const globalAiPolicies = pgTable("global_ai_policies", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  policyName: text("policy_name").notNull(),
  shortName: text("short_name"),
  region: text(),
  effectiveDate: date("effective_date"),
  lastUpdated: date("last_updated"),
  status: text(),
  country: text(),
  state: text(),
  legalStatus: text("legal_status"),
  timeline: text(),
  sources: text(),
  summary: text(),
  whoIsAffected: text("who_is_affected"),
  howTheyAreAffected: text("how_they_are_affected"),
  impact: text(),
  complianceRequirements: text("compliance_requirements"),
  enforcementDetails: text("enforcement_details"),
});

export const applicationPolicies = pgTable(
  "application_policies",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    policyId: uuid("policy_id").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    priority: integer().default(0).notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    policyName: text("policy_name").notNull(),
    policyVersion: text("policy_version").default("v1"),
  },
  (table) => [
    index("idx_app_policies_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_app_policies_policy_name").using(
      "btree",
      table.policyName.asc().nullsLast().op("text_ops")
    ),
    index("idx_app_policies_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("uq_app_policies_name_version").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops"),
      table.policyName.asc().nullsLast().op("text_ops"),
      table.policyVersion.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "application_policies_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "application_policies_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.policyId],
      foreignColumns: [policies.id],
      name: "application_policies_policy_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "application_policies_created_by_fkey",
    }).onDelete("restrict"),
    unique("uq_app_policies").on(table.applicationId, table.policyId),
  ]
);

export const riskList = pgTable("risk_list", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  riskName: text("risk_name").notNull(),
  description: text(),
  severity: varchar({ length: 50 }),
  likelihood: varchar({ length: 50 }),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  category: text().array(),
});

export const riskCategories = pgTable(
  "risk_categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    severity: text(),
    tierRecommendation: guardTier("tier_recommendation"),
    icon: text(),
    color: text(),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("uq_risk_categories_slug").on(table.slug)]
);

export const riskCategoryLinks = pgTable(
  "risk_category_links",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    categoryId: uuid("category_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_risk_category_links_category").using(
      "btree",
      table.categoryId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_risk_category_links_entity").using(
      "btree",
      table.entityType.asc().nullsLast().op("text_ops"), // TEXT → text_ops
      table.entityId.asc().nullsLast().op("uuid_ops") // UUID → uuid_ops ✅
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [riskCategories.id],
      name: "risk_category_links_category_id_fkey",
    }).onDelete("cascade"),
    unique("uq_risk_category_links").on(
      table.categoryId,
      table.entityType,
      table.entityId
    ),
  ]
);

export const routerCentroids = pgTable(
  "router_centroids",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    family: text().notNull(),
    centroid: jsonb(),
    threshold: numeric({ precision: 5, scale: 4 }),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_router_centroids_active").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops")
    ),
    index("idx_router_centroids_family").using(
      "btree",
      table.family.asc().nullsLast().op("text_ops")
    ),
    index("idx_router_centroids_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "router_centroids_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "router_centroids_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "router_centroids_updated_by_fkey",
    }).onDelete("set null"),
    unique("uq_router_centroids_tenant_family").on(
      table.tenantId,
      table.family
    ),
  ]
);

export const routerPromptCentroids = pgTable(
  "router_prompt_centroids",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    promptId: uuid("prompt_id").notNull(),
    centroidId: uuid("centroid_id").notNull(),
    weight: numeric({ precision: 5, scale: 4 }).default("1.0"),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_router_prompt_centroids_centroid").using(
      "btree",
      table.centroidId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_router_prompt_centroids_prompt").using(
      "btree",
      table.promptId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_router_prompt_centroids_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "router_prompt_centroids_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.promptId],
      foreignColumns: [routerPrompts.id],
      name: "router_prompt_centroids_prompt_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.centroidId],
      foreignColumns: [routerCentroids.id],
      name: "router_prompt_centroids_centroid_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "router_prompt_centroids_created_by_fkey",
    }).onDelete("restrict"),
    unique("uq_router_prompt_centroids").on(table.promptId, table.centroidId),
  ]
);

export const routerPrompts = pgTable(
  "router_prompts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    prompt: text().notNull(),
    category: text(),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_router_prompts_active").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops")
    ),
  ]
);

export const providerModelMetadata = pgTable(
  "provider_model_metadata",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    provider: provider().notNull(),
    modelId: text("model_id"), // API identifier (e.g., gpt-4o, claude-3-5-sonnet)
    displayName: text("display_name").notNull(),
    contextWindow: text("context_window").default("128000"),
    inputCost: text("input_cost"),
    outputCost: text("output_cost"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_provider_model_metadata_display_name").using(
      "btree",
      table.displayName.asc().nullsLast().op("text_ops")
    ),
    index("idx_provider_model_metadata_provider").using(
      "btree",
      table.provider.asc().nullsLast().op("enum_ops")
    ),
  ]
);

export const policyCenter = pgTable(
  "policy_center",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    category: text(),
    country: text(),
    state: text(),
    projectsCompliant: integer("projects_compliant"),
    totalProjects: integer("total_projects"),
    tags: text().array(),
    icon: text(),
    color: text(),
    type: text(),
    disable: boolean().default(false).notNull(),
    tenantId: text("tenant_id"),
    parentPolicyId: text("parent_policy_id"),
    metadata: jsonb(),
    isActive: boolean().default(false),
  },
  (table) => [
    index("idx_policy_center_category").using(
      "btree",
      table.category.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_center_country").using(
      "btree",
      table.country.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_center_name").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_center_state").using(
      "btree",
      table.state.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const applicationPolicyCenter = pgTable(
  "application_policy_center",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    policyId: text("policy_id"),
    tenantId: text("tenant_id"),
    applicationId: text("application_id"),
    isActive: boolean().default(false),
  },
  (table) => [
    index("idx_policy_center_application_id").using(
      "btree",
      table.applicationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_center_policy_id").using(
      "btree",
      table.policyId.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_center_tenant_app").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.applicationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_policy_center_tenant_id").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const risks = pgTable(
  "risks",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    applicationId: uuid("application_id").notNull(),
    useCaseId: uuid("use_case_id"),
    riskName: text("risk_name").notNull(),
    description: text(),
    owner: text().notNull(),
    severity: riskSeverity().notNull(),
    likelihood: riskLikelihood().notNull(),
    riskLevel: riskLevel().notNull(),
    mitigationPlan: text("mitigation_plan"),
    lastReviewDate: timestamp("last_review_date", {
      withTimezone: true,
      mode: "string",
    }),
    mitigationAttachments: jsonb("mitigation_attachments").$defaultFn(
      () => ({})
    ),
    metadata: jsonb().default({}).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    mitigationStatus: riskMitigationStatus().default("Not Started").notNull(),
    mitigatingGuardrails: uuid("mitigating_guardrails")
      .array()
      .notNull()
      .default(sql`'{}'`),

    targetDate: timestamp("target_date", {
      withTimezone: true,
      mode: "string",
    }),
    categories: text().array().default([""]).notNull(),
    controlOwner: text(),
  },
  (table) => [
    index("idx_risks_app").using(
      "btree",
      table.applicationId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_risks_level").using(
      "btree",
      table.riskLevel.asc().nullsLast().op("enum_ops")
    ),
    index("idx_risks_tenant").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops")
    ),
    index("idx_risks_use_case").using(
      "btree",
      table.useCaseId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenants.id],
      name: "risks_tenant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [applications.id],
      name: "risks_application_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.useCaseId],
      foreignColumns: [useCases.id],
      name: "risks_use_case_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "risks_created_by_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "risks_updated_by_fkey",
    }).onDelete("set null"),
  ]
);
