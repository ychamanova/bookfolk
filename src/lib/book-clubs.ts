import "server-only";

import {
  and,
  count,
  desc,
  eq,
  exists,
  or,
  type SQLWrapper,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { authUsers } from "@/lib/db/auth-schema";
import {
  bookClubs,
  bookClubInvitations as invitations,
  bookClubMembers as members,
} from "@/lib/db/schema";

const normalizedEmail = (email: SQLWrapper) =>
  sql<string>`lower(btrim(${email}))`;

function accessibleClubs(userId: string) {
  return or(
    eq(bookClubs.ownerId, userId),
    exists(
      db
        .select({ clubId: members.clubId })
        .from(members)
        .where(
          and(eq(members.clubId, bookClubs.id), eq(members.userId, userId)),
        ),
    ),
  );
}

export async function getBookClubsForUser(userId: string) {
  return db
    .select({
      id: bookClubs.id,
      name: bookClubs.name,
      created_at: bookClubs.createdAt,
      role: sql<
        "owner" | "member"
      >`case when ${bookClubs.ownerId} = ${userId} then 'owner' else 'member' end`,
    })
    .from(bookClubs)
    .where(accessibleClubs(userId))
    .orderBy(desc(bookClubs.createdAt));
}

export type BookClub = Awaited<ReturnType<typeof getBookClubsForUser>>[number];

export async function hasBookClubs(userId: string) {
  const [club] = await db
    .select({ id: bookClubs.id })
    .from(bookClubs)
    .where(accessibleClubs(userId))
    .limit(1);
  return Boolean(club);
}

export async function getInvitationsForUser(userId: string) {
  const inviter = alias(authUsers, "inviter");
  return db
    .select({
      id: invitations.id,
      club_name: bookClubs.name,
      invited_by_name: inviter.name,
    })
    .from(invitations)
    .innerJoin(bookClubs, eq(bookClubs.id, invitations.clubId))
    .innerJoin(authUsers, eq(authUsers.id, userId))
    .innerJoin(inviter, eq(inviter.id, invitations.invitedBy))
    .where(
      and(
        eq(invitations.status, "pending"),
        eq(invitations.inviteeEmail, normalizedEmail(authUsers.email)),
        eq(authUsers.emailVerified, true),
      ),
    )
    .orderBy(desc(invitations.createdAt));
}

export type ClubInvitation = Awaited<
  ReturnType<typeof getInvitationsForUser>
>[number];

export async function getPendingInvitationCount(userId: string) {
  const [row] = await db
    .select({ count: count() })
    .from(invitations)
    .innerJoin(authUsers, eq(authUsers.id, userId))
    .where(
      and(
        eq(invitations.status, "pending"),
        eq(invitations.inviteeEmail, normalizedEmail(authUsers.email)),
        eq(authUsers.emailVerified, true),
      ),
    );
  return row?.count ?? 0;
}

export async function isEmailVerified(userId: string) {
  const [user] = await db
    .select({ verified: authUsers.emailVerified })
    .from(authUsers)
    .where(eq(authUsers.id, userId));
  return user?.verified === true;
}

export async function inviteToBookClub(
  ownerId: string,
  clubId: string,
  rawEmail: string,
): Promise<{ success?: true; error?: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  return db.transaction(async (tx) => {
    // Lock the club while checking ownership and inserting the invitation.
    // The partial unique index also protects against duplicate requests.
    const [club] = await tx
      .select({ id: bookClubs.id })
      .from(bookClubs)
      .where(and(eq(bookClubs.id, clubId), eq(bookClubs.ownerId, ownerId)))
      .for("update");
    if (!club) return { error: "Only the club owner can invite members." };

    const [owner] = await tx
      .select({ email: authUsers.email })
      .from(authUsers)
      .where(eq(authUsers.id, ownerId));
    if (!owner || owner.email.trim().toLowerCase() === email) {
      return { error: "You own this club already." };
    }

    const member = alias(authUsers, "member");
    const [existingMember] = await tx
      .select({ userId: members.userId })
      .from(members)
      .innerJoin(member, eq(member.id, members.userId))
      .where(
        and(
          eq(members.clubId, clubId),
          eq(normalizedEmail(member.email), email),
        ),
      )
      .limit(1);
    if (existingMember) {
      return { error: "This person is already a member of the club." };
    }

    const [created] = await tx
      .insert(invitations)
      .values({ clubId, invitedBy: ownerId, inviteeEmail: email })
      .onConflictDoNothing({
        target: [invitations.clubId, invitations.inviteeEmail],
        where: sql`${invitations.status} = 'pending'`,
      })
      .returning({ id: invitations.id });
    return created
      ? { success: true }
      : { error: "This address has already been invited." };
  });
}

export async function acceptBookClubInvitation(
  userId: string,
  invitationId: string,
) {
  return db.transaction(async (tx) => {
    // Updating the invitation locks the row until membership is committed.
    // Only its verified recipient can claim it or retry a previous acceptance.
    const [accepted] = await tx
      .update(invitations)
      .set({
        status: "accepted",
        acceptedAt: sql`coalesce(${invitations.acceptedAt}, now())`,
        acceptedBy: authUsers.id,
      })
      .from(authUsers)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(authUsers.id, userId),
          eq(authUsers.emailVerified, true),
          eq(invitations.inviteeEmail, normalizedEmail(authUsers.email)),
          or(
            eq(invitations.status, "pending"),
            and(
              eq(invitations.status, "accepted"),
              eq(invitations.acceptedBy, authUsers.id),
            ),
          ),
        ),
      )
      .returning({ clubId: invitations.clubId });

    if (!accepted) return false;
    await tx
      .insert(members)
      .values({ clubId: accepted.clubId, userId })
      .onConflictDoNothing({ target: [members.clubId, members.userId] });
    return true;
  });
}

export async function createBookClubForUser(ownerId: string, name: string) {
  await db.insert(bookClubs).values({ name, ownerId });
}
