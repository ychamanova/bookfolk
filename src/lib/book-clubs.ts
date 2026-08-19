import { sql } from "@/lib/db";

export type BookClub = {
  id: string;
  name: string;
  created_at: string;
};

export async function getBookClubsForUser(ownerId: string) {
  const rows = await sql`
    SELECT id, name, created_at
    FROM book_clubs
    WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC
  `;
  return rows as BookClub[];
}

export async function hasBookClubs(ownerId: string) {
  const [row] = await sql`
    SELECT EXISTS(SELECT 1 FROM book_clubs WHERE owner_id = ${ownerId}) AS exists
  `;
  return Boolean(row?.exists);
}

export async function createBookClubForUser(ownerId: string, name: string) {
  await sql`
    INSERT INTO book_clubs (name, owner_id)
    VALUES (${name}, ${ownerId})
  `;
}
