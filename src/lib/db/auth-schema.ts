import { boolean, pgSchema, text, uuid } from "drizzle-orm/pg-core";

// Read-only mapping of the fields we use. Neon Auth owns this schema;
// keep it outside Drizzle Kit's schema entry point so migrations never manage it.
export const authUsers = pgSchema("neon_auth").table("user", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
});
