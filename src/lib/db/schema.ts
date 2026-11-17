import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "./auth-schema";

export const bookClubs = pgTable("book_clubs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const bookClubMembers = pgTable(
  "book_club_members",
  {
    clubId: uuid("club_id").notNull(),
    userId: uuid("user_id").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "book_club_members_pkey",
      columns: [table.clubId, table.userId],
    }),
    foreignKey({
      name: "book_club_members_club_id_fkey",
      columns: [table.clubId],
      foreignColumns: [bookClubs.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "book_club_members_user_id_fkey",
      columns: [table.userId],
      foreignColumns: [authUsers.id],
    }).onDelete("cascade"),
    index("book_club_members_user_idx").on(table.userId),
  ],
);

export const bookClubInvitations = pgTable(
  "book_club_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id").notNull(),
    inviteeEmail: text("invitee_email").notNull(),
    invitedBy: uuid("invited_by").notNull(),
    status: text("status", { enum: ["pending", "accepted"] })
      .default("pending")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    acceptedAt: timestamp("accepted_at", {
      withTimezone: true,
      mode: "string",
    }),
    acceptedBy: uuid("accepted_by"),
  },
  (table) => [
    foreignKey({
      name: "book_club_invitations_club_id_fkey",
      columns: [table.clubId],
      foreignColumns: [bookClubs.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "book_club_invitations_invited_by_fkey",
      columns: [table.invitedBy],
      foreignColumns: [authUsers.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "book_club_invitations_accepted_by_fkey",
      columns: [table.acceptedBy],
      foreignColumns: [authUsers.id],
    }).onDelete("set null"),
    check(
      "book_club_invitations_invitee_email_check",
      sql`${table.inviteeEmail} = lower(btrim(${table.inviteeEmail})) AND ${table.inviteeEmail} <> ''`,
    ),
    check(
      "book_club_invitations_status_check",
      sql`${table.status} IN ('pending', 'accepted')`,
    ),
    check(
      "book_club_invitations_check",
      sql`(${table.status} = 'accepted') = (${table.acceptedAt} IS NOT NULL)`,
    ),
    uniqueIndex("book_club_invitations_pending_unique")
      .on(table.clubId, table.inviteeEmail)
      .where(sql`${table.status} = 'pending'`),
    index("book_club_invitations_email_idx")
      .on(table.inviteeEmail, table.createdAt.desc().nullsFirst())
      .where(sql`${table.status} = 'pending'`),
  ],
);
