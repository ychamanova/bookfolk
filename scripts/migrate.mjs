import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const connection =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connection) throw new Error("DATABASE_URL is required.");
const url = new URL(connection);
url.hostname = url.hostname.replace("-pooler.", ".");
const pool = new pg.Pool({ connectionString: url.toString() });

try {
  await migrate(drizzle(pool), {
    migrationsFolder: fileURLToPath(new URL("../drizzle/", import.meta.url)),
  });
  console.log("Database migrations complete.");
} finally {
  await pool.end();
}
