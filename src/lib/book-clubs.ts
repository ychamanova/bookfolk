import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookClubs } from "@/lib/db/schema";

export type BookClub = {
  id: string;
  name: string;
  created_at: string;
};

export async function getBookClubsForUser(ownerId: string) {
  const rows = await db
    .select({
      id: bookClubs.id,
      name: bookClubs.name,
      created_at: bookClubs.createdAt,
    })
    .from(bookClubs)
    .where(eq(bookClubs.ownerId, ownerId))
    .orderBy(desc(bookClubs.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    created_at: row.created_at.toISOString(),
  }));
}

export async function hasBookClubs(ownerId: string) {
  const rows = await db
    .select({ id: bookClubs.id })
    .from(bookClubs)
    .where(eq(bookClubs.ownerId, ownerId))
    .limit(1);

  return rows.length > 0;
}

export async function createBookClubForUser(ownerId: string, name: string) {
  await db.insert(bookClubs).values({ name, ownerId });
}
