ALTER TABLE "application_documentation" ADD COLUMN "risk_id" text;--> statement-breakpoint
ALTER TABLE "provider_model_metadata" DROP COLUMN "model_id";
ALTER TABLE "provider_model_metadata" ADD COLUMN "model_id" text;