import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Reuse the pool across development hot reloads. Connections are opened lazily.
const globalForDb = globalThis as typeof globalThis & { bookfolkPool?: Pool };
export const pool =
  globalForDb.bookfolkPool ??
  new Pool({
    connectionString: requireEnv("DATABASE_URL"),
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  });
if (process.env.NODE_ENV !== "production") globalForDb.bookfolkPool = pool;

export const db = drizzle(pool, { schema });
