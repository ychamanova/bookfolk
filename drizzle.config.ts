import { createRequire } from "node:module";
import { defineConfig } from "drizzle-kit";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());

const connection =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connection) throw new Error("DATABASE_URL is required.");
const url = new URL(connection);
url.hostname = url.hostname.replace("-pooler.", ".");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  schemaFilter: ["public"],
  tablesFilter: ["book_clubs", "book_club_members", "book_club_invitations"],
  dbCredentials: { url: url.toString() },
});
