// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import {
  DefaultGuardrails,
} from "@/constants/guardrails";
import {
  db,
  tenants,
  users,
  memberships,
  processedWebhookEvents,
  generateSlug,
  extractDomainFromEmail,
  createOrgSlugFromDomain,
  createOrgNameFromDomain,
  isKentronEmail,
  findClerkOrgBySlug,
  createClerkOrganization,
  addUserToClerkOrg,
} from "@db";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { trackPOST, TRACKING_OPTIONS } from "@/lib/api-tracking-wrappers";
import { createAuditEvent } from "@/lib/server/audit";
import { installMarketplaceGuardrail } from "@/app/[tenant]/guardrails/actions";

export const POST = trackPOST(async (req: Request) => {
  console.log("🔔 Webhook received - Starting processing");

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("📋 Headers:", {
    svix_id,
    svix_timestamp,
    hasSignature: !!svix_signature,
  });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Check if we've already processed this webhook
  console.log(`🔍 Checking if webhook ${svix_id} was already processed`);
  try {
    const existingEvent = await db.query.processedWebhookEvents.findFirst({
      where: eq(processedWebhookEvents.id, svix_id),
    });

    if (existingEvent) {
      console.log(`✅ Webhook ${svix_id} already processed, skipping`);
      return NextResponse.json({ success: true }, { status: 200 });
    }
    console.log(`✅ Webhook ${svix_id} is new, proceeding`);
  } catch (err) {
    console.error("❌ Error checking processed webhooks:", err);
    // Continue anyway - better to process twice than not at all
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log("📦 Payload type:", payload.type);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("✅ Webhook signature verified");
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`🎯 Processing webhook type: ${eventType}`);

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;
        const email = email_addresses?.[0]?.email_address;
        const name = `${first_name || ""} ${last_name || ""}`.trim();

        console.log(`👤 Creating user: ${id}, email: ${email}, name: ${name}`);

        try {
          await db
            .insert(users)
            .values({
              id: id,
              email: email || "",
              name: name || null,
              imageUrl: image_url || null,
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                email: email || users.email,
                name: name || users.name,
                imageUrl: image_url || users.imageUrl,
                updatedAt: new Date().toISOString(),
              },
            });
          console.log(`✅ User ${eventType}: ${id}`);
        } catch (err) {
          console.error(`❌ Failed to insert/update user ${id}:`, err);
          throw err;
        }

        try {
          await createAuditEvent({
            tenantId: "",
            actorUserId: id,
            action: "auth.user_created",
            targetType: "user",
            targetId: id,
            metadata: { email },
          });
          console.log(`✅ Audit event created for user ${id}`);
        } catch (e) {
          console.error(
            "❌ Failed to write audit event (auth.user_created):",
            e
          );
        }

        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;
        const email = email_addresses?.[0]?.email_address;
        const name = `${first_name || ""} ${last_name || ""}`.trim();

        console.log(`👤 Updating user: ${id}, email: ${email}, name: ${name}`);

        try {
          await db
            .insert(users)
            .values({
              id: id,
              email: email || "",
              name: name || null,
              imageUrl: image_url || null,
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                email: email || users.email,
                name: name || users.name,
                imageUrl: image_url || users.imageUrl,
                updatedAt: new Date().toISOString(),
              },
            });
          console.log(`✅ User ${eventType}: ${id}`);
        } catch (err) {
          console.error(`❌ Failed to update user ${id}:`, err);
          throw err;
        }

        try {
          await createAuditEvent({
            tenantId: "",
            actorUserId: id,
            action: "auth.user_updated",
            targetType: "user",
            targetId: id,
            metadata: { email },
          });
          console.log(`✅ Audit event created for user update ${id}`);
        } catch (e) {
          console.error(
            "❌ Failed to write audit event (auth.user_updated):",
            e
          );
        }
        break;
      }

      case "organization.created":
      case "organization.updated": {
        const { id, name, slug, public_metadata } = evt.data;
        const plan = (public_metadata as any)?.plan || "free";
        const createdByKentron =
          (public_metadata as any)?.createdByKentron || false;

        console.log(
          `🏢 ${eventType} - ID: ${id}, Name: ${name}, Slug: ${slug}, Plan: ${plan}, CreatedByKentron: ${createdByKentron}`
        );
        console.log(`📋 Public metadata:`, JSON.stringify(public_metadata));

        try {
          await db
            .insert(tenants)
            .values({
              id: id,
              slug: slug || generateSlug(name),
              name: name,
              plan: plan,
              createdByKentron: createdByKentron,
              metadata: public_metadata || {},
            })
            .onConflictDoUpdate({
              target: tenants.id,
              set: {
                name: name,
                slug: slug || tenants.slug,
                plan: plan,
                createdByKentron: createdByKentron,
                metadata: public_metadata || tenants.metadata,
                updatedAt: new Date().toISOString(),
              },
            });
          console.log(
            `✅ Organization ${eventType}: ${id} (createdByKentron: ${createdByKentron})`
          );
        } catch (err) {
          console.error(`❌ Failed to insert/update tenant ${id}:`, err);
          console.error("Tenant data that failed:", {
            id,
            slug,
            name,
            plan,
            createdByKentron,
          });
          throw err;
        }

        try {
          await createAuditEvent({
            tenantId: id,
            actorUserId: "system",
            action:
              eventType === "organization.created"
                ? "tenant.created"
                : "tenant.updated",
            targetType: "tenant",
            targetId: id,
            metadata: { name, slug },
          });
          console.log(`✅ Audit event created for tenant ${id}`);
        } catch (e) {
          console.error(
            "❌ Failed to write audit event (tenant created/updated):",
            e
          );
        }
        break;
      }

      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const { organization, public_user_data } = evt.data;
        const userId = public_user_data.user_id;
        const orgId = organization.id;
        const slug = organization.slug;
        const role = (evt.data as any).role || "member";

        console.log(
          `👥 ${eventType} - User: ${userId}, Org: ${orgId}, Role: ${role}`
        );

        // First ensure the user exists in our database
        console.log(`🔍 Checking if user ${userId} exists`);
        let existingUser;
        try {
          existingUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
          });
        } catch (err) {
          console.error(`❌ Error querying user ${userId}:`, err);
          throw err;
        }

        if (!existingUser) {
          console.log(
            `⚠️ User ${userId} not found in local database, skipping membership`
          );
          break;
        }
        console.log(`✅ User ${userId} found`);

        // Ensure tenant exists (race condition: membership webhook can fire before organization webhook)
        console.log(`🔍 Checking if tenant ${orgId} exists`);
        let existingTenant;
        try {
          existingTenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, orgId),
          });
        } catch (err) {
          console.error(`❌ Error querying tenant ${orgId}:`, err);
          throw err;
        }

        if (!existingTenant) {
          console.log(
            `⚠️ Tenant ${orgId} not found, creating it now (race condition handling)`
          );
          console.log(
            `📋 Organization data from membership:`,
            JSON.stringify(organization)
          );

          try {
            await db
              .insert(tenants)
              .values({
                id: orgId,
                slug: organization.slug || generateSlug(organization.name),
                name: organization.name,
                plan: "free",
                createdByKentron: false,
                metadata: {},
              })
              .onConflictDoNothing();

            console.log(`✅ Created tenant ${orgId} from membership webhook`);
          } catch (err) {
            console.error(`❌ Failed to create tenant ${orgId}:`, err);
            throw err;
          }
        } else {
          console.log(`✅ Tenant ${orgId} found`);
        }

        // Store membership
        console.log(
          `💾 Upserting membership: tenantId=${orgId}, userId=${existingUser.id}, role=${role}`
        );
        try {
          await db
            .insert(memberships)
            .values({
              tenantId: orgId,
              userId: existingUser.id,
              role: role,
              permissions: [],
            })
            .onConflictDoUpdate({
              target: [memberships.tenantId, memberships.userId],
              set: {
                role: role,
                permissions: [],
                updatedAt: new Date().toISOString(),
              },
            });
          console.log(
            `✅ User ${userId} added to org ${orgId} with role ${role}`
          );
        } catch (err) {
          console.error(
            `❌ Failed to upsert membership for user ${userId} in org ${orgId}:`,
            err
          );
          throw err;
        }

        // installing guardrail for new tenant

        try {
          console.log("🔔 [GUARDRAIL INSTALLATION STARTED]");
          console.log("➡️  Incoming orgId:", orgId);
          console.log("➡️  Acting userId:", userId);

          const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, orgId),
          });

          if (!tenant) {
            console.error(
              "⛔ Skipping Guardrail Installation — Tenant not found for orgId:",
              orgId
            );
            throw new Error("Tenant not found");
          }

          console.log(
            "🏢 Tenant Found:",
            JSON.stringify({
              id: tenant.id,
              slug: tenant.slug,
              createdAt: tenant.createdAt,
            })
          );

      
          const guardrailList = DefaultGuardrails;

          console.log(
            `⚙️  Running Installation`
          );
          console.log(
            `📌 Total Guardrails to Install: ${Object.keys(guardrailList).length}`
          );

          let index = 0;
          const startTime = Date.now();

          for (let guardrailId of guardrailList) {
            index++;
            console.log(
              `🧩 Installing guardrail ${index}/${Object.keys(guardrailList).length} → ID: ${guardrailId}`
            );

            try {
              await installMarketplaceGuardrail({
                tenantSlug: tenant.slug,
                userId,
                sourceGuardrailId: guardrailId,
              });

              console.log(`✔️ Installed: ${guardrailId}`);
            } catch (err: any) {
              console.error(
                `❌ Failed to install guardrail: ${guardrailId} — Error:`,
                err?.message ?? err
              );
            }
          }

          const totalTime = (Date.now() - startTime) / 1000;
          console.log(`🏁 Guardrail Installation Completed in ${totalTime}s`);
          console.log("🚀 Status: SUCCESS");
        } catch (err: any) {
          console.error(
            "🔥 TOP-LEVEL ERROR IN GUARDRAIL INSTALLATION:",
            err?.message ?? err
          );
          console.log("🛑 Status: FAILED");
        }

        try {
          await createAuditEvent({
            tenantId: orgId,
            actorUserId: userId,
            action: "membership.upserted",
            targetType: "membership",
            targetId: `${orgId}:${userId}`,
            metadata: { role },
          });
          console.log(
            `✅ Audit event created for membership ${orgId}:${userId}`
          );
        } catch (e) {
          console.error(
            "❌ Failed to write audit event (membership.upserted):",
            e
          );
        }
        break;
      }

      case "organizationMembership.deleted": {
        const { public_user_data, organization } = evt.data;
        const userId = public_user_data.user_id;
        const orgId = organization.id;

        console.log(`👥 Deleting membership - User: ${userId}, Org: ${orgId}`);

        // Find the user
        console.log(`🔍 Finding user ${userId}`);
        let existingUser;
        try {
          existingUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
          });
        } catch (err) {
          console.error(`❌ Error finding user ${userId}:`, err);
          throw err;
        }

        if (existingUser) {
          console.log(`✅ User ${userId} found, deleting membership`);
          try {
            await db
              .delete(memberships)
              .where(
                and(
                  eq(memberships.tenantId, orgId),
                  eq(memberships.userId, existingUser.id)
                )
              );
            console.log(`✅ User ${userId} removed from organization ${orgId}`);
          } catch (err) {
            console.error(
              `❌ Failed to delete membership for user ${userId} in org ${orgId}:`,
              err
            );
            throw err;
          }
        } else {
          console.log(`⚠️ User ${userId} not found, nothing to delete`);
        }

        try {
          await createAuditEvent({
            tenantId: orgId,
            actorUserId: userId,
            action: "membership.deleted",
            targetType: "membership",
            targetId: `${orgId}:${userId}`,
          });
          console.log(`✅ Audit event created for membership deletion`);
        } catch (e) {
          console.error(
            "❌ Failed to write audit event (membership.deleted):",
            e
          );
        }
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;

        console.log(`👤 Deleting user: ${id}`);

        try {
          await db.delete(users).where(eq(users.id, id!));
          console.log(`✅ User deleted: ${id}`);
        } catch (err) {
          console.error(`❌ Failed to delete user ${id}:`, err);
          throw err;
        }

        try {
          await createAuditEvent({
            tenantId: "",
            actorUserId: id!,
            action: "auth.user_deleted",
            targetType: "user",
            targetId: id!,
          });
          console.log(`✅ Audit event created for user deletion ${id}`);
        } catch (e) {
          console.error(
            "❌ Failed to write audit event (auth.user_deleted):",
            e
          );
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${eventType}`);
    }

    // Mark webhook as processed
    console.log(`💾 Marking webhook ${svix_id} as processed`);
    try {
      await db.insert(processedWebhookEvents).values({ id: svix_id });
      console.log(`✅ Webhook ${svix_id} marked as processed`);
    } catch (err) {
      console.error(`❌ Failed to mark webhook ${svix_id} as processed:`, err);
      // Don't throw - the webhook was processed successfully
    }

    console.log(`🎉 Webhook ${svix_id} processing completed successfully`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      eventType,
      svix_id,
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}, TRACKING_OPTIONS.WEBHOOK);

//  // installing guardrails for new tenant
//           if (eventType === "organization.created") {

//             await installMarketplaceGuardrail({
//               tenantSlug:slug,
//               userId:userId,
//               sourceGuardrailId: guardrailId,
//             });
//           }
