/**
 * Server-side queries for Application Models (Models Info)
 */

import { db, applicationModels } from "@db";
import { eq, desc } from "drizzle-orm";
import { cache } from "react";

export const getApplicationModels = cache(async (applicationId: string) => {
  return await db.query.applicationModels.findMany({
    where: eq(applicationModels.applicationId, applicationId),
    with: {
      user_createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(applicationModels.createdAt)],
  });
});
