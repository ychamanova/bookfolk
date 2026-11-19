import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";

type Database = ReturnType<typeof createDb>;
const globalForDb = globalThis as typeof globalThis & {
  bookfolkPool?: Pool;
  bookfolkDb?: Database;
};

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  });
  globalForDb.bookfolkPool = pool;
  return drizzle(pool, { schema });
}

// The pool is created on first use, not at import, so builds and scripts that
// import this module don't need DATABASE_URL. Caching it on globalThis (in every
// environment) keeps one pool per instance and survives dev hot reloads.
function getDb() {
  globalForDb.bookfolkDb ??= createDb();
  return globalForDb.bookfolkDb;
}

function lazy<T extends object>(get: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const target = get();
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export const db = lazy(getDb);
export const pool = lazy(() => {
  getDb();
  return globalForDb.bookfolkPool as Pool;
});
