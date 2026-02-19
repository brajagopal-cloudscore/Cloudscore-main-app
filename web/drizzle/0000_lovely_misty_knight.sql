CREATE TYPE "public"."application_status" AS ENUM('Not Started', 'In Progress', 'Completed', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."assessment_status" AS ENUM('not_started', 'in_progress', 'compliant', 'non_compliant', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."credential_auth_type" AS ENUM('api_key', 'oauth', 'jwt', 'azure_ad', 'service_account', 'custom');--> statement-breakpoint
CREATE TYPE "public"."dataset_type" AS ENUM('training', 'validation', 'test', 'evaluation');--> statement-breakpoint
CREATE TYPE "public"."documentation_priority" AS ENUM('low priority', 'medium priority', 'high priority');--> statement-breakpoint
CREATE TYPE "public"."documentation_section_type" AS ENUM('application_scope', 'technology_details', 'data_governance', 'record_keeping', 'information_protection', 'transparency', 'human_oversight', 'bias_monitoring_mitigation', 'explainability', 'environmental_impact');--> statement-breakpoint
CREATE TYPE "public"."documentation_status" AS ENUM('Not started', 'In Progress', 'Done');--> statement-breakpoint
CREATE TYPE "public"."eu_ai_act_risk_classification" AS ENUM('unacceptable', 'high', 'limited', 'minimal');--> statement-breakpoint
CREATE TYPE "public"."guard_tier" AS ENUM('T0', 'T1', 'T2');--> statement-breakpoint
CREATE TYPE "public"."http_method" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."infrastructure_type" AS ENUM('ml', 'llm', 'rule', 'na');--> statement-breakpoint
CREATE TYPE "public"."integration_type" AS ENUM('slack', 'jira', 'github', 'azure_devops', 'webhook', 'email', 'siem');--> statement-breakpoint
CREATE TYPE "public"."model_category" AS ENUM('llm', '3rd_party', '1st_party');--> statement-breakpoint
CREATE TYPE "public"."model_risk_level" AS ENUM('Low', 'Medium', 'High', 'Critical', 'N/A');--> statement-breakpoint
CREATE TYPE "public"."module_type" AS ENUM('goviq', 'controlnet', 'admin', 'tenant', 'global');--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('draft', 'active', 'deprecated', 'archived');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('openai', 'anthropic', 'bedrock', 'groq', 'vertex', 'ollama', 'azure_openai', 'huggingface', 'custom');--> statement-breakpoint
CREATE TYPE "public"."provider_model_status" AS ENUM('available', 'preview', 'deprecated', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'generating', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('compliance', 'governance', 'risk', 'executive', 'audit');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('Low', 'Medium', 'High', 'Critical');--> statement-breakpoint
CREATE TYPE "public"."risk_likelihood" AS ENUM('Rare', 'Unlikely', 'Possible', 'Likely');--> statement-breakpoint
CREATE TYPE "public"."risk_mitigation_status" AS ENUM('Not Started', 'In Progress', 'Requires Review', 'Completed');--> statement-breakpoint
CREATE TYPE "public"."risk_severity" AS ENUM('Minor', 'Moderate', 'Major', 'Catastrophic');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('success', 'failed', 'pending');--> statement-breakpoint
CREATE TYPE "public"."test_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."test_status" AS ENUM('passed', 'failed', 'warning', 'pending');--> statement-breakpoint
CREATE TYPE "public"."test_type" AS ENUM('adversarial', 'jailbreak', 'prompt_injection', 'toxicity', 'bias', 'safety');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"permissions" text[] DEFAULT '{""}' NOT NULL,
	"rate_limit_per_minute" integer DEFAULT 1000,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"revoked_by" text,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_api_keys_key_hash" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "application_documentation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"section_type" "documentation_section_type" NOT NULL,
	"field_key" text NOT NULL,
	"field_title" text NOT NULL,
	"content" text,
	"status" "documentation_status" DEFAULT 'Not started' NOT NULL,
	"priority" "documentation_priority" DEFAULT 'medium priority' NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_app_doc_section_field" UNIQUE("application_id","section_type","field_key")
);
--> statement-breakpoint
CREATE TABLE "application_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"vendor" text,
	"model" text,
	"hosting_location" text NOT NULL,
	"model_architecture" text NOT NULL,
	"objectives" text NOT NULL,
	"compute_infrastructure" text NOT NULL,
	"training_duration" text NOT NULL,
	"model_size" text NOT NULL,
	"training_data_size" text NOT NULL,
	"inference_latency" text NOT NULL,
	"hardware_requirements" text NOT NULL,
	"software" text NOT NULL,
	"prompt_registry" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"policy_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"policy_name" text NOT NULL,
	"policy_version" text DEFAULT 'v1',
	CONSTRAINT "uq_app_policies" UNIQUE("application_id","policy_id")
);
--> statement-breakpoint
CREATE TABLE "application_policy_center" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" text,
	"tenant_id" text,
	"application_id" text,
	"isActive" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"status" "application_status" DEFAULT 'Not Started' NOT NULL,
	"goviq_enabled" boolean DEFAULT false NOT NULL,
	"controlnet_enabled" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_size" bigint,
	"file_type" text,
	"storage_path" text NOT NULL,
	"checksum" text,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid,
	"framework_id" uuid NOT NULL,
	"control_id" uuid NOT NULL,
	"assessment_status" "assessment_status" DEFAULT 'not_started' NOT NULL,
	"evidence_provided" boolean DEFAULT false NOT NULL,
	"evidence_url" text,
	"evidence_notes" text,
	"assessed_by" text,
	"assessed_at" timestamp with time zone,
	"next_review_date" timestamp with time zone,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"dataset_type" "dataset_type",
	"source" text,
	"size_bytes" bigint,
	"row_count" integer,
	"schema" jsonb,
	"tags" text[] DEFAULT '{""}' NOT NULL,
	"storage_path" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eu_ai_act_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"risk_classification" "eu_ai_act_risk_classification" NOT NULL,
	"assessment_date" timestamp with time zone,
	"assessment_summary" text,
	"prohibited_practices" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"high_risk_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transparency_requirements" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"conformity_assessment" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"documentation_status" text,
	"assessed_by" text,
	"approved_by" text,
	"approval_date" timestamp with time zone,
	"next_review_date" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_ai_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_name" text NOT NULL,
	"short_name" text,
	"region" text,
	"effective_date" date,
	"last_updated" date,
	"status" text,
	"country" text,
	"state" text,
	"legal_status" text,
	"timeline" text,
	"sources" text,
	"summary" text,
	"who_is_affected" text,
	"how_they_are_affected" text,
	"impact" text,
	"compliance_requirements" text,
	"enforcement_details" text
);
--> statement-breakpoint
CREATE TABLE "governance_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework_id" uuid NOT NULL,
	"control_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_governance_control" UNIQUE("framework_id","control_id")
);
--> statement-breakpoint
CREATE TABLE "governance_frameworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"version" text,
	"url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_governance_frameworks_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "guardrails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"key" text NOT NULL,
	"version" text DEFAULT 'v1' NOT NULL,
	"category" text,
	"description" text,
	"tier" "guard_tier" NOT NULL,
	"performance_budget_ms" numeric(10, 3),
	"requires_onnx" boolean DEFAULT false NOT NULL,
	"onnx_model_id" text,
	"default_params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	"pack_name" text,
	"function_name" text,
	"input_schema" jsonb,
	"output_schema" jsonb,
	"fallback_strategy" text DEFAULT 'skip',
	"infrastructure" "infrastructure_type" DEFAULT 'rule' NOT NULL,
	"is_global" boolean DEFAULT false NOT NULL,
	"is_certified" boolean DEFAULT false NOT NULL,
	"fallback_guardrail_id" uuid,
	"avg_latency_ms" numeric(10, 3),
	"p95_latency_ms" numeric(10, 3),
	"accuracy_score" numeric(5, 4),
	"name" text,
	"family" text,
	"enable_install" boolean DEFAULT false,
	CONSTRAINT "uq_guardrails_tenant_key_version" UNIQUE("tenant_id","key","version")
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"integration_type" "integration_type",
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"configuration" jsonb NOT NULL,
	"credentials_encrypted" text,
	"webhook_url" text,
	"last_sync_at" timestamp with time zone,
	"sync_status" "sync_status",
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"category" text,
	"is_credentials_added" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations_admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_credentials_added" boolean DEFAULT false NOT NULL,
	"configuration" jsonb DEFAULT '{}'::jsonb,
	"api_key" text,
	"logo_url" text,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_tenant_integration" UNIQUE("tenant_id","name"),
	CONSTRAINT "unique_integration_name" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"permissions" text[] DEFAULT '{""}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_memberships_tenant_user" UNIQUE("tenant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "model_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"source" text NOT NULL,
	"uri" text NOT NULL,
	"filename" text,
	"size_bytes" integer,
	"sha256" text NOT NULL,
	"content_type" text,
	"detected_format" text,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"blocked_reason" text,
	"artifact_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "uq_model_artifacts_tenant_sha256" UNIQUE("tenant_id","sha256")
);
--> statement-breakpoint
CREATE TABLE "model_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"artifact_id" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"engine_version" text,
	"sbom" jsonb DEFAULT '{}'::jsonb,
	"report_json" jsonb,
	"report_sarif" jsonb,
	"error" text,
	"created_by" text NOT NULL,
	"updated_by" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"parent_id" uuid,
	"label" text NOT NULL,
	"path" text,
	"icon" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"required_permissions" text[] DEFAULT '{""}' NOT NULL,
	"module_type" "module_type",
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observability_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid,
	"policy_id" uuid,
	"request_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"method" text,
	"path" text,
	"status_code" integer,
	"latency_ms" integer,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"guardrail_results" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "observability_logs_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "onnx_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"model_type" text NOT NULL,
	"version" text NOT NULL,
	"file_size" integer,
	"input_shape" jsonb,
	"output_shape" jsonb,
	"max_tokens" integer DEFAULT 512,
	"avg_inference_ms" numeric(10, 3),
	"memory_usage_mb" integer,
	"framework" text DEFAULT 'onnx' NOT NULL,
	"opset" integer DEFAULT 13,
	"quantized" boolean DEFAULT false NOT NULL,
	"categories" text[] DEFAULT '{""}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"storage_url" text,
	"checksum" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deployed_at" timestamp with time zone,
	"deprecated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"p50_ms" numeric(10, 3),
	"p95_ms" numeric(10, 3),
	"auroc" numeric(5, 4),
	"recall_at_fpr_001" numeric(5, 4),
	"supported_languages" text[] DEFAULT '{""}' NOT NULL,
	"cost_tier" text,
	"family" text[] DEFAULT '{""}' NOT NULL,
	CONSTRAINT "onnx_models_model_id_unique" UNIQUE("model_id")
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"version" text DEFAULT 'v1' NOT NULL,
	"slug" text,
	"description" text,
	"yaml" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"compiled" jsonb,
	"hash" text,
	"status" "policy_status" DEFAULT 'active' NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"composition_strategy" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ai_system_policy_prompt" text,
	"flow_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"file_url" text
);
--> statement-breakpoint
CREATE TABLE "policy_center" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"country" text,
	"state" text,
	"projects_compliant" integer,
	"total_projects" integer,
	"tags" text[],
	"icon" text,
	"color" text,
	"type" text,
	"disable" boolean DEFAULT false NOT NULL,
	"tenant_id" text,
	"parent_policy_id" text,
	"metadata" jsonb,
	"isActive" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "policy_guardrails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"policy_id" uuid NOT NULL,
	"guardrail_id" uuid NOT NULL,
	"phase" text NOT NULL,
	"target" jsonb,
	"params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"threshold" numeric(5, 2),
	"weight" numeric(5, 2),
	"tier_override" "guard_tier",
	"order_index" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	CONSTRAINT "uq_policy_guard_use" UNIQUE("policy_id","guardrail_id","phase","order_index")
);
--> statement-breakpoint
CREATE TABLE "processed_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_model_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"display_name" text NOT NULL,
	"context_window" text DEFAULT '128000',
	"input_cost" text,
	"output_cost" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"model_id" text NOT NULL,
	"display_name" text,
	"family" text,
	"modality" text[],
	"context_window_tokens" integer,
	"max_output_tokens" integer,
	"supports_streaming" boolean DEFAULT true,
	"supports_json" boolean DEFAULT true,
	"input_cost_per_1k" numeric(12, 6),
	"output_cost_per_1k" numeric(12, 6),
	"currency" text DEFAULT 'USD',
	"pricing_metadata" jsonb DEFAULT '{}'::jsonb,
	"availability_status" "provider_model_status" DEFAULT 'available' NOT NULL,
	"deprecation_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" text,
	"created_by" text,
	"updated_by" text,
	"model_url" text,
	"purpose_use_case" text,
	"risk_level" "model_risk_level",
	"category" "model_category",
	"model_artifact_id" uuid,
	CONSTRAINT "uq_provider_models" UNIQUE("provider","model_id"),
	CONSTRAINT "uq_provider_models_artifact" UNIQUE("model_artifact_id")
);
--> statement-breakpoint
CREATE TABLE "red_teaming_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"policy_id" uuid,
	"test_name" text NOT NULL,
	"test_type" "test_type" NOT NULL,
	"test_input" text NOT NULL,
	"expected_behavior" text,
	"actual_output" text,
	"test_status" "test_status",
	"severity" "test_severity",
	"test_results" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"remediation_notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"tested_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"report_type" "report_type" NOT NULL,
	"description" text,
	"generated_by" text NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"report_data" jsonb,
	"filters" jsonb,
	"file_url" text,
	"scheduled" boolean DEFAULT false NOT NULL,
	"schedule_config" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"severity" text,
	"tier_recommendation" "guard_tier",
	"icon" text,
	"color" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_risk_categories_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "risk_category_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_risk_category_links" UNIQUE("category_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "risk_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"risk_name" text NOT NULL,
	"description" text,
	"severity" varchar(50),
	"likelihood" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"category" text[]
);
--> statement-breakpoint
CREATE TABLE "risks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"use_case_id" uuid,
	"risk_name" text NOT NULL,
	"description" text,
	"owner" text NOT NULL,
	"severity" "risk_severity" NOT NULL,
	"likelihood" "risk_likelihood" NOT NULL,
	"riskLevel" "risk_level" NOT NULL,
	"mitigation_plan" text,
	"last_review_date" timestamp with time zone,
	"mitigation_attachments" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"mitigationStatus" "risk_mitigation_status" DEFAULT 'Not Started' NOT NULL,
	"mitigating_guardrails" uuid[] DEFAULT '{}' NOT NULL,
	"target_date" timestamp with time zone,
	"categories" text[] DEFAULT '{""}' NOT NULL,
	"controlOwner" text
);
--> statement-breakpoint
CREATE TABLE "router_centroids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"family" text NOT NULL,
	"centroid" jsonb,
	"threshold" numeric(5, 4),
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_router_centroids_tenant_family" UNIQUE("tenant_id","family")
);
--> statement-breakpoint
CREATE TABLE "router_prompt_centroids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"prompt_id" uuid NOT NULL,
	"centroid_id" uuid NOT NULL,
	"weight" numeric(5, 4) DEFAULT '1.0',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_router_prompt_centroids" UNIQUE("prompt_id","centroid_id")
);
--> statement-breakpoint
CREATE TABLE "router_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"prompt" text NOT NULL,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scan_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"scan_id" uuid NOT NULL,
	"rule_id" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"evidence" jsonb DEFAULT '{}'::jsonb,
	"remediation" jsonb,
	"cve_id" text,
	"suppressed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stakeholders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"role" text NOT NULL,
	"email" text,
	"department" text,
	"responsibilities" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_kentron" boolean DEFAULT false NOT NULL,
	"description" text,
	"logo_url" text,
	"deleted_at" timestamp with time zone,
	"controlnetEnabled" boolean DEFAULT true,
	"govIqEnabled" boolean DEFAULT false,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "use_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"function" text NOT NULL,
	"use_case" text NOT NULL,
	"what_it_does" text NOT NULL,
	"agent_patterns" text[] DEFAULT '{""}' NOT NULL,
	"key_inputs" text[] NOT NULL,
	"primary_outputs" text[] NOT NULL,
	"business_impact" text[] NOT NULL,
	"kpis" text[] NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"region" text[]
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_name" text,
	"last_name" text
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_documentation" ADD CONSTRAINT "application_documentation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_documentation" ADD CONSTRAINT "application_documentation_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_documentation" ADD CONSTRAINT "application_documentation_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_documentation" ADD CONSTRAINT "application_documentation_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_models" ADD CONSTRAINT "application_models_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_models" ADD CONSTRAINT "application_models_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_models" ADD CONSTRAINT "application_models_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_models" ADD CONSTRAINT "application_models_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_policies" ADD CONSTRAINT "application_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_policies" ADD CONSTRAINT "application_policies_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_policies" ADD CONSTRAINT "application_policies_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_policies" ADD CONSTRAINT "application_policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."governance_frameworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."governance_controls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_assessments" ADD CONSTRAINT "compliance_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eu_ai_act_assessments" ADD CONSTRAINT "eu_ai_act_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eu_ai_act_assessments" ADD CONSTRAINT "eu_ai_act_assessments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eu_ai_act_assessments" ADD CONSTRAINT "eu_ai_act_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eu_ai_act_assessments" ADD CONSTRAINT "eu_ai_act_assessments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_controls" ADD CONSTRAINT "governance_controls_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."governance_frameworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardrails" ADD CONSTRAINT "guardrails_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardrails" ADD CONSTRAINT "guardrails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardrails" ADD CONSTRAINT "guardrails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardrails" ADD CONSTRAINT "guardrails_fallback_guardrail_id_fkey" FOREIGN KEY ("fallback_guardrail_id") REFERENCES "public"."guardrails"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_artifacts" ADD CONSTRAINT "model_artifacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_artifacts" ADD CONSTRAINT "model_artifacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_artifacts" ADD CONSTRAINT "model_artifacts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_scans" ADD CONSTRAINT "model_scans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_scans" ADD CONSTRAINT "model_scans_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "public"."model_artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_scans" ADD CONSTRAINT "model_scans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_scans" ADD CONSTRAINT "model_scans_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observability_logs" ADD CONSTRAINT "observability_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observability_logs" ADD CONSTRAINT "observability_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observability_logs" ADD CONSTRAINT "observability_logs_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_guardrails" ADD CONSTRAINT "policy_guardrails_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_guardrails" ADD CONSTRAINT "policy_guardrails_guardrail_id_fkey" FOREIGN KEY ("guardrail_id") REFERENCES "public"."guardrails"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_guardrails" ADD CONSTRAINT "policy_guardrails_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_guardrails" ADD CONSTRAINT "policy_guardrails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_guardrails" ADD CONSTRAINT "policy_guardrails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_models" ADD CONSTRAINT "provider_models_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_models" ADD CONSTRAINT "provider_models_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_models" ADD CONSTRAINT "provider_models_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_models" ADD CONSTRAINT "provider_models_model_artifact_id_fkey" FOREIGN KEY ("model_artifact_id") REFERENCES "public"."model_artifacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "red_teaming_tests" ADD CONSTRAINT "red_teaming_tests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "red_teaming_tests" ADD CONSTRAINT "red_teaming_tests_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "red_teaming_tests" ADD CONSTRAINT "red_teaming_tests_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "red_teaming_tests" ADD CONSTRAINT "red_teaming_tests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_category_links" ADD CONSTRAINT "risk_category_links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."risk_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_use_case_id_fkey" FOREIGN KEY ("use_case_id") REFERENCES "public"."use_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risks" ADD CONSTRAINT "risks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_centroids" ADD CONSTRAINT "router_centroids_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_centroids" ADD CONSTRAINT "router_centroids_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_centroids" ADD CONSTRAINT "router_centroids_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompt_centroids" ADD CONSTRAINT "router_prompt_centroids_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompt_centroids" ADD CONSTRAINT "router_prompt_centroids_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "public"."router_prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompt_centroids" ADD CONSTRAINT "router_prompt_centroids_centroid_id_fkey" FOREIGN KEY ("centroid_id") REFERENCES "public"."router_centroids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompt_centroids" ADD CONSTRAINT "router_prompt_centroids_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompts" ADD CONSTRAINT "router_prompts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompts" ADD CONSTRAINT "router_prompts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router_prompts" ADD CONSTRAINT "router_prompts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_findings" ADD CONSTRAINT "scan_findings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_findings" ADD CONSTRAINT "scan_findings_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "public"."model_scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "use_cases" ADD CONSTRAINT "use_cases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "use_cases" ADD CONSTRAINT "use_cases_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "use_cases" ADD CONSTRAINT "use_cases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "use_cases" ADD CONSTRAINT "use_cases_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_api_keys_active" ON "api_keys" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_api_keys_key_hash" ON "api_keys" USING btree ("key_hash" text_ops);--> statement-breakpoint
CREATE INDEX "idx_api_keys_key_prefix" ON "api_keys" USING btree ("key_prefix" text_ops);--> statement-breakpoint
CREATE INDEX "idx_api_keys_tenant" ON "api_keys" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_app_doc_app" ON "application_documentation" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_app_doc_section" ON "application_documentation" USING btree ("section_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_app_doc_tenant" ON "application_documentation" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_app_models_app" ON "application_models" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_app_models_tenant" ON "application_models" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_app_policies_app" ON "application_policies" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_app_policies_policy_name" ON "application_policies" USING btree ("policy_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_app_policies_tenant" ON "application_policies" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_app_policies_name_version" ON "application_policies" USING btree ("application_id" uuid_ops,"policy_name" text_ops,"policy_version" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_application_id" ON "application_policy_center" USING btree ("application_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_policy_id" ON "application_policy_center" USING btree ("policy_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_tenant_app" ON "application_policy_center" USING btree ("tenant_id" text_ops,"application_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_tenant_id" ON "application_policy_center" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_applications_created_by" ON "applications" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_applications_status" ON "applications" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_applications_tenant" ON "applications" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_attachments_entity" ON "attachments" USING btree ("entity_type" text_ops,"entity_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_attachments_tenant" ON "attachments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_attachments_uploaded_by" ON "attachments" USING btree ("uploaded_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_events_action" ON "audit_events" USING btree ("action" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_events_actor" ON "audit_events" USING btree ("actor_user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_events_created" ON "audit_events" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_events_target" ON "audit_events" USING btree ("target_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_events_tenant" ON "audit_events" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_compliance_app" ON "compliance_assessments" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_compliance_framework" ON "compliance_assessments" USING btree ("framework_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_compliance_status" ON "compliance_assessments" USING btree ("assessment_status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_compliance_tenant" ON "compliance_assessments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_datasets_app" ON "datasets" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_datasets_tenant" ON "datasets" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_datasets_type" ON "datasets" USING btree ("dataset_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_eu_ai_act_app" ON "eu_ai_act_assessments" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_eu_ai_act_classification" ON "eu_ai_act_assessments" USING btree ("risk_classification" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_eu_ai_act_tenant" ON "eu_ai_act_assessments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_governance_controls_framework" ON "governance_controls" USING btree ("framework_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_category" ON "guardrails" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_certified" ON "guardrails" USING btree ("is_certified" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_created_by" ON "guardrails" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_family" ON "guardrails" USING btree ("family" text_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_global" ON "guardrails" USING btree ("is_global" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_infrastructure" ON "guardrails" USING btree ("infrastructure" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_key" ON "guardrails" USING btree ("key" text_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_metadata_gin" ON "guardrails" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_pack_name" ON "guardrails" USING btree ("pack_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_params_gin" ON "guardrails" USING gin ("default_params" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_tenant" ON "guardrails" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_guardrails_tier" ON "guardrails" USING btree ("tier" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_integrations_enabled" ON "integrations" USING btree ("is_enabled" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_integrations_tenant" ON "integrations" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_integrations_type" ON "integrations" USING btree ("integration_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_memberships_tenant" ON "memberships" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_memberships_user" ON "memberships" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_artifacts_approval" ON "model_artifacts" USING btree ("approval_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_artifacts_created_by" ON "model_artifacts" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_artifacts_format" ON "model_artifacts" USING btree ("detected_format" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_artifacts_metadata_gin" ON "model_artifacts" USING gin ("artifact_metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_model_artifacts_sha256" ON "model_artifacts" USING btree ("sha256" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_artifacts_tenant" ON "model_artifacts" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_scans_artifact" ON "model_scans" USING btree ("artifact_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_model_scans_created_by" ON "model_scans" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_scans_sbom_gin" ON "model_scans" USING gin ("sbom" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_model_scans_status" ON "model_scans" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_model_scans_tenant" ON "model_scans" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_nav_items_module" ON "navigation_items" USING btree ("module_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_nav_items_order" ON "navigation_items" USING btree ("order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_nav_items_parent" ON "navigation_items" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_nav_items_tenant" ON "navigation_items" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_observability_app" ON "observability_logs" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_observability_request" ON "observability_logs" USING btree ("request_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_observability_tenant" ON "observability_logs" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_observability_timestamp" ON "observability_logs" USING btree ("timestamp" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_onnx_models_active" ON "onnx_models" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_onnx_models_family" ON "onnx_models" USING gin ("family" array_ops);--> statement-breakpoint
CREATE INDEX "idx_onnx_models_metadata_gin" ON "onnx_models" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_onnx_models_model_type" ON "onnx_models" USING btree ("model_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policies_compiled_gin" ON "policies" USING gin ("compiled" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_policies_created_by" ON "policies" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policies_hash" ON "policies" USING btree ("hash" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policies_metadata_gin" ON "policies" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_policies_status" ON "policies" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_policies_tenant" ON "policies" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_category" ON "policy_center" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_country" ON "policy_center" USING btree ("country" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_name" ON "policy_center" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_center_state" ON "policy_center" USING btree ("state" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_guardrails_created_by" ON "policy_guardrails" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_guardrails_params_gin" ON "policy_guardrails" USING gin ("params" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_guardrails_phase" ON "policy_guardrails" USING btree ("phase" text_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_guardrails_policy" ON "policy_guardrails" USING btree ("policy_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_guardrails_target_gin" ON "policy_guardrails" USING gin ("target" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_policy_guardrails_tenant" ON "policy_guardrails" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_model_metadata_display_name" ON "provider_model_metadata" USING btree ("display_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_model_metadata_provider" ON "provider_model_metadata" USING btree ("provider" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_artifact" ON "provider_models" USING btree ("model_artifact_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_category" ON "provider_models" USING btree ("category" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_created_by" ON "provider_models" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_family" ON "provider_models" USING btree ("family" text_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_pricing_gin" ON "provider_models" USING gin ("pricing_metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_provider" ON "provider_models" USING btree ("provider" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_risk_level" ON "provider_models" USING btree ("risk_level" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_status" ON "provider_models" USING btree ("availability_status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_models_tenant" ON "provider_models" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_red_teaming_app" ON "red_teaming_tests" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_red_teaming_status" ON "red_teaming_tests" USING btree ("test_status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_red_teaming_tenant" ON "red_teaming_tests" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_red_teaming_type" ON "red_teaming_tests" USING btree ("test_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_reports_tenant" ON "reports" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reports_type" ON "reports" USING btree ("report_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_risk_category_links_category" ON "risk_category_links" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_risk_category_links_entity" ON "risk_category_links" USING btree ("entity_type" text_ops,"entity_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_risks_app" ON "risks" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_risks_level" ON "risks" USING btree ("riskLevel" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_risks_tenant" ON "risks" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_risks_use_case" ON "risks" USING btree ("use_case_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_router_centroids_active" ON "router_centroids" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_router_centroids_family" ON "router_centroids" USING btree ("family" text_ops);--> statement-breakpoint
CREATE INDEX "idx_router_centroids_tenant" ON "router_centroids" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_router_prompt_centroids_centroid" ON "router_prompt_centroids" USING btree ("centroid_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_router_prompt_centroids_prompt" ON "router_prompt_centroids" USING btree ("prompt_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_router_prompt_centroids_tenant" ON "router_prompt_centroids" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_router_prompts_active" ON "router_prompts" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_router_prompts_tenant" ON "router_prompts" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_scan_findings_cve" ON "scan_findings" USING btree ("cve_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_scan_findings_rule" ON "scan_findings" USING btree ("rule_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_scan_findings_scan" ON "scan_findings" USING btree ("scan_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_scan_findings_severity" ON "scan_findings" USING btree ("severity" text_ops);--> statement-breakpoint
CREATE INDEX "idx_scan_findings_tenant" ON "scan_findings" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_stakeholders_app" ON "stakeholders" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_stakeholders_tenant" ON "stakeholders" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tenants_created_by_kentron" ON "tenants" USING btree ("created_by_kentron" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_tenants_slug" ON "tenants" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_use_cases_app" ON "use_cases" USING btree ("application_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_use_cases_function" ON "use_cases" USING btree ("function" text_ops);--> statement-breakpoint
CREATE INDEX "idx_use_cases_tenant" ON "use_cases" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);