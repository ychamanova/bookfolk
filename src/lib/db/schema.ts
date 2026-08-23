import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const bookClubs = pgTable("book_clubs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
