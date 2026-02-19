ALTER TABLE "router_prompts" DROP CONSTRAINT "router_prompts_tenant_id_fkey";
--> statement-breakpoint
DROP INDEX "idx_router_prompts_tenant";--> statement-breakpoint
ALTER TABLE "router_prompts" DROP COLUMN "tenant_id";