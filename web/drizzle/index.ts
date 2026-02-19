import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relation from "./relations";
const connectionString = process.env.DATABASE_URL!;

// Singleton pattern for Next.js app directory
// Prevents creating multiple connection pools during hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof postgres> | undefined;
}

if (!global.__db) {
  global.__db = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const queryClient = global.__db;

export const db = drizzle(queryClient, {
  schema: {
    ...schema,
    ...relation,
  },
});

export const migrationClient = postgres(connectionString, { max: 1 });

// Re-export types
export * from "./relations";
export * from "./schema";
export type * from "./schema";
