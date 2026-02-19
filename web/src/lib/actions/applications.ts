/**
 * Server actions for Applications
 * Used for mutations from client components
 */

"use server";

import { db, applications, stakeholders, users, tenants } from "@db";
import { createAuditEvent } from "@/lib/server/audit";
import { eq, and, sql, isNull, or, ilike } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  getApplicationsWithSummary,
  getArchivedApplications,
} from "@/lib/queries/applications";

interface CreateApplicationInput {
  tenantId: string;
  name: string;
  description?: string;
  goviqEnabled: boolean;
  controlnetEnabled: boolean;
}

interface UpdateApplicationInput {
  id: string;
  name?: string;
  description?: string;
  status?: "Not Started" | "In Progress" | "Completed" | "Archived";
  goviqEnabled?: boolean;
  controlnetEnabled?: boolean;
  metadata?: any;
}

// Create application
export const createApplication = async (input: CreateApplicationInput) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  if (!input.goviqEnabled && !input.controlnetEnabled) {
    throw new Error(
      "At least one module (GovIQ or ControlNet) must be enabled"
    );
  }
  const { application } = await db.transaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    const [application] = await tx
      .insert(applications)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        description: input.description,
        goviqEnabled: input.goviqEnabled,
        controlnetEnabled: input.controlnetEnabled,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    // 3. Insert the Stakeholder (using the fetched user details and a default role)
    const [stakeholder] = await tx
      .insert(stakeholders)
      .values({
        tenantId: application.tenantId,
        applicationId: application.id,
        userName: user.name as string,
        role: "member",
        email: user.email,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
    return { application, stakeholder };
  });

  revalidatePath(`/${input.tenantId}/applications`);

  // Audit: application created
  try {
    await createAuditEvent({
      tenantId: input.tenantId,
      actorUserId: userId,
      action: "application.created",
      targetType: "application",
      targetId: application.id,
      metadata: { name: application.name },
    });
  } catch (e) {
    console.error("Failed to write audit event (application.created):", e);
  }

  return {
    application,
    success: true,
    message: "Application with same name already exists",
  };
};

// Update application
export const updateApplication = async (input: UpdateApplicationInput) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const { id, ...updateData } = input;
  const [application] = await db
    .update(applications)
    .set({
      ...updateData,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(applications.id, id))
    .returning();

  if (!application) {
    throw new Error("Application not found");
  }

  revalidatePath(`/applications`);

  // Audit: application updated
  try {
    await createAuditEvent({
      tenantId: application.tenantId,
      actorUserId: userId,
      action: "application.updated",
      targetType: "application",
      targetId: application.id,
      metadata: { update: updateData },
    });
  } catch (e) {
    console.error("Failed to write audit event (application.updated):", e);
  }

  return application;
};

// Archive application
export const archiveApplication = async (id: string, tenantId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const [application] = await db
    .update(applications)
    .set({
      status: "Archived",
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(applications.id, id), eq(applications.tenantId, tenantId)))
    .returning();

  if (!application) {
    throw new Error("Application not found");
  }

  revalidatePath(`/${tenantId}/applications`);

  // Audit: application archived
  try {
    await createAuditEvent({
      tenantId: tenantId,
      actorUserId: userId,
      action: "application.archived",
      targetType: "application",
      targetId: application.id,
      metadata: { name: application.name },
    });
  } catch (e) {
    console.error("Failed to write audit event (application.archived):", e);
  }

  return { success: true };
};

export const updateStatusApplication = async (
  id: string,
  tenant: string,
  status: "Not Started" | "In Progress" | "Completed" | "Archived"
) => {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Authentication required");
  }

  const [application] = await db
    .update(applications)
    .set({
      status,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(applications.id, id), eq(applications.tenantId, orgId)))
    .returning();

  if (!application) {
    throw new Error("Application not found");
  }

  console.log("[HERE] ", application);
  revalidatePath(`/${tenant}/applications/${id}/goviq/overview`);

  // Audit: application status updated
  try {
    await createAuditEvent({
      tenantId: orgId,
      actorUserId: userId,
      action: "application.status_updated",
      targetType: "application",
      targetId: application.id,
      metadata: { status },
    });
  } catch (e) {
    console.error(
      "Failed to write audit event (application.status_updated):",
      e
    );
  }

  return { success: true };
};

// Get applications with pagination and search
export const getApplications = async (
  tenantSlug: string,
  page?: number,
  pageSize?: number,
  search?: string
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");

  const pageNum = page && page > 0 ? page : 1;
  const limit = pageSize && pageSize > 0 ? Math.min(pageSize, 200) : 50;
  const searchTerm = search?.trim();

  const tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);
  if (!tenantRow.length) {
    return {
      applications: [],
      total: 0,
      pagination: { page: pageNum, pageSize: limit, totalPages: 1 },
    };
  }
  const tenantId = tenantRow[0].id;

  let apps;
  let total = 0;

  if (searchTerm) {
    const allApps = await getApplicationsWithSummary(tenantId);
    const filtered = allApps.filter(
      (app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
    );
    total = filtered.length;
    const offset = (pageNum - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);
    apps = paginated;
  } else {
    const allApps = await getApplicationsWithSummary(tenantId);
    total = allApps.length;
    const offset = (pageNum - 1) * limit;
    apps = allApps.slice(offset, offset + limit);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    applications: apps.map((app) => ({
      id: app.id,
      name: app.name,
      slug: app.slug,
      status: app.status as
        | "Not Started"
        | "In Progress"
        | "Completed"
        | "Archived",

      goviqEnabled: app.goviqEnabled,
      controlnetEnabled: app.controlnetEnabled,
      description: app.description,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      createdBy: app.createdByUser,
      updatedBy: app.updatedByUser,
      stats: app.stats,
    })),
    total,
    pagination: { page: pageNum, pageSize: limit, totalPages },
  };
};

// Restore archived application
export const restoreApplication = async (id: string, tenantId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");

  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!app.length || app[0].tenantId !== tenantId) {
    throw new Error("Application not found");
  }
  if (app[0].status !== "Archived") {
    throw new Error("Application is not archived");
  }

  const [application] = await db
    .update(applications)
    .set({
      status: "Not Started",
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(applications.id, id))
    .returning();

  revalidatePath(`/${tenantId}/applications`);

  try {
    await createAuditEvent({
      tenantId,
      actorUserId: userId,
      action: "application.restored",
      targetType: "application",
      targetId: application.id,
    });
  } catch (e) {
    console.error("Failed to write audit event (application.restored):", e);
  }

  return { success: true };
};

// Hard delete application (permanently delete)
export const hardDeleteApplication = async (id: string, tenantId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");

  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!app.length || app[0].tenantId !== tenantId) {
    throw new Error("Application not found");
  }
  if (app[0].status !== "Archived") {
    throw new Error("Only archived applications can be permanently deleted");
  }

  // Hard delete - permanently remove from database
  await db.delete(applications).where(eq(applications.id, id));

  revalidatePath(`/${tenantId}/admin/archived-applications`);

  try {
    await createAuditEvent({
      tenantId,
      actorUserId: userId,
      action: "application.deleted",
      targetType: "application",
      targetId: id,
      metadata: { name: app[0].name },
    });
  } catch (e) {
    console.error("Failed to write audit event (application.deleted):", e);
  }

  return { success: true };
};

// Get archived applications with pagination and search
export const getArchivedApplicationsAction = async (
  tenantSlug: string,
  page?: number,
  pageSize?: number,
  search?: string
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");

  const pageNum = page && page > 0 ? page : 1;
  const limit = pageSize && pageSize > 0 ? Math.min(pageSize, 200) : 50;
  const searchTerm = search?.trim();

  const tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);
  if (!tenantRow.length) {
    return {
      applications: [],
      total: 0,
      pagination: { page: pageNum, pageSize: limit, totalPages: 1 },
    };
  }
  const tenantId = tenantRow[0].id;

  // Get total count first
  const countConditions = [
    eq(applications.tenantId, tenantId),
    isNull(applications.deletedAt),
    eq(applications.status, "Archived"),
  ];

  if (searchTerm) {
    const term = `%${searchTerm}%`;
    countConditions.push(
      or(
        ilike(applications.name, term),
        ilike(applications.description, term)
      )
    );
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${applications.id})` })
    .from(applications)
    .where(and(...countConditions));

  const total = Number(count) || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Get paginated apps
  const apps = await getArchivedApplications(
    tenantId,
    searchTerm,
    pageNum,
    limit
  );

  return {
    applications: apps.map((app) => ({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description,
      status: app.status as
        | "Not Started"
        | "In Progress"
        | "Completed"
        | "Archived",
      goviqEnabled: app.goviqEnabled,
      controlnetEnabled: app.controlnetEnabled,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      archivedAt: app.updatedAt,
      archivedBy:
        app.archivedByName || app.archivedByEmail || app.updatedBy || "Unknown",
    })),
    total,
    pagination: { page: pageNum, pageSize: limit, totalPages },
  };
};

// Get single application by ID (simple query)
export const getApplicationById = async (
  tenantSlugOrId: string,
  applicationId: string
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Authentication required");

  // Try to find tenant by ID first, then by slug
  let tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantSlugOrId))
    .limit(1);
  if (!tenantRow.length) {
    tenantRow = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlugOrId))
      .limit(1);
  }
  if (!tenantRow.length) throw new Error("Tenant not found");
  const tenantId = tenantRow[0].id;

  // Get application
  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, applicationId),
      eq(applications.tenantId, tenantId),
      isNull(applications.deletedAt)
    ),
    columns: {
      id: true,
      name: true,
      description: true,
      status: true,
      goviqEnabled: true,
      controlnetEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  return application;
};

// Get application details for overview page
export const getApplicationDetails = async (
  tenantSlugOrId: string,
  applicationId: string
) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Authentication required");

  // Try to find tenant by ID first, then by slug
  let tenantRow = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantSlugOrId))
    .limit(1);
  if (!tenantRow.length) {
    tenantRow = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlugOrId))
      .limit(1);
  }
  if (!tenantRow.length) throw new Error("Tenant not found");
  const tenantId = tenantRow[0].id;

  // Verify tenant matches orgId
  if (tenantId !== orgId) {
    throw new Error("Tenant not found");
  }

  // Get application with related data
  const result = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, applicationId),
      eq(applications.tenantId, tenantId)
    ),
    columns: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
    },
    with: {
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      user_updatedBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      stakeholders: {
        columns: {
          id: true,
          userName: true,
          role: true,
          email: true,
          department: true,
          responsibilities: true,
        },
      },
      useCases: {
        where: (useCases, { isNull }) => isNull(useCases.deletedAt),
        columns: {
          id: true,
          function: true,
          useCase: true,
          whatItDoes: true,
          keyInputs: true,
          primaryOutputs: true,
          businessImpact: true,
          kpis: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error("Application not found");
  }

  return {
    application: {
      id: result.id,
      name: result.name,
      description: result.description,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    },
    owner: {
      id: result.user_createdBy,
      name: result.user_createdBy?.name || "Unknown",
      email: result.user_createdBy?.email || "",
    },
    lastUpdated: {
      date: result.updatedAt,
      by: {
        id: result.updatedBy,
        name: result.user_updatedBy?.name || "Unknown",
        email: result.user_updatedBy?.email || "",
      },
    },
    stakeholders: result.stakeholders.map((stakeholder) => ({
      id: stakeholder.id,
      name: stakeholder.userName,
      role: stakeholder.role,
      email: stakeholder.email,
      department: stakeholder.department,
      responsibilities: stakeholder.responsibilities,
    })),
    useCases: result.useCases.map((useCase) => ({
      id: useCase.id,
      function: useCase.function,
      useCase: useCase.useCase,
      whatItDoes: useCase.whatItDoes,
      keyInputs: useCase.keyInputs,
      primaryOutputs: useCase.primaryOutputs,
      businessImpact: useCase.businessImpact,
      kpis: useCase.kpis,
    })),
  };

};
