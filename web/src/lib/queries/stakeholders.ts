/**
 * Server-side queries for Stakeholders
 */

import { db, stakeholders } from "@db";
import { eq, desc } from "drizzle-orm";
import { cache } from "react";

export const getStakeholders = cache(async (applicationId: string) => {
  return await db.query.stakeholders.findMany({
    where: eq(stakeholders.applicationId, applicationId),
    with: {
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(stakeholders.createdAt)],
  });
});
