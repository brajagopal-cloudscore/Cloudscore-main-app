ALTER TABLE "router_prompts" DROP CONSTRAINT "router_prompts_created_by_fkey";
--> statement-breakpoint
ALTER TABLE "router_prompts" DROP CONSTRAINT "router_prompts_updated_by_fkey";
--> statement-breakpoint
ALTER TABLE "router_prompts" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "router_prompts" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "router_prompts" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "router_prompts" DROP COLUMN "updated_by";