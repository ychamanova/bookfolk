import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
// Never run fixture writes against the app's configured database.
const testUrl = process.env.TEST_DATABASE_URL;
assert(testUrl, "Set TEST_DATABASE_URL to an isolated Neon branch.");
assert.notEqual(
  new URL(testUrl).hostname.replace("-pooler.", "."),
  new URL(process.env.DATABASE_URL ?? testUrl).hostname.replace(
    "-pooler.",
    ".",
  ),
  "Tests require a database branch separate from the app database.",
);
process.env.DATABASE_URL = testUrl;
const { pool } = await import("../src/lib/db");
// Use SQL fixtures to check the Drizzle implementation independently.
async function query(text: string, values: unknown[] = []) {
  return (await pool.query(text, values)).rows;
}
const clubs = await import("../src/lib/book-clubs");
const { getPostSignInPath } = await import(
  "../src/lib/auth/post-signin-redirect"
);

const suffix = randomUUID();
const owner = randomUUID();
const recipient = randomUUID();
const outsider = randomUUID();
const unverified = randomUUID();
const futureUser = randomUUID();
const userIds = [owner, recipient, outsider, unverified, futureUser];
const emailFor = (id: string) => `${id}.${suffix}@example.invalid`;
let clubId: string | undefined;

async function createUser(id: string, verified = true) {
  await query(
    `
    INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "updatedAt")
    VALUES ($1::uuid, 'Invitation test', $2, $3, now())
  `,
    [id, emailFor(id), verified],
  );
}

try {
  for (const id of userIds.slice(0, 4)) await createUser(id, id !== unverified);
  await clubs.createBookClubForUser(owner, `Invitation test ${suffix}`);
  const owned = await clubs.getBookClubsForUser(owner);
  assert.equal(owned.length, 1);
  assert.equal(owned[0].role, "owner");
  clubId = owned[0].id;

  assert.equal(await getPostSignInPath(outsider), "/book-clubs/new");
  assert(
    (await clubs.inviteToBookClub(outsider, clubId, emailFor(recipient))).error,
  );
  assert((await clubs.inviteToBookClub(owner, clubId, emailFor(owner))).error);
  assert((await clubs.inviteToBookClub(owner, clubId, "bad-email")).error);

  const duplicateResults = await Promise.all([
    clubs.inviteToBookClub(
      owner,
      clubId,
      ` ${emailFor(recipient).toUpperCase()} `,
    ),
    clubs.inviteToBookClub(owner, clubId, emailFor(recipient)),
  ]);
  assert.equal(duplicateResults.filter((result) => result.success).length, 1);
  assert.equal(await clubs.getPendingInvitationCount(recipient), 1);
  assert.equal(await getPostSignInPath(recipient), "/book-clubs/invited");
  const [invitation] = await clubs.getInvitationsForUser(recipient);
  assert(invitation);
  assert.equal(
    await clubs.acceptBookClubInvitation(outsider, invitation.id),
    null,
  );
  assert.equal(await clubs.hasBookClubs(recipient), false);
  assert.equal((await clubs.getInvitationsForUser(outsider)).length, 0);

  assert.deepEqual(
    await Promise.all([
      clubs.acceptBookClubInvitation(recipient, invitation.id),
      clubs.acceptBookClubInvitation(recipient, invitation.id),
    ]),
    [clubId, clubId],
  );
  assert.equal(await clubs.getPendingInvitationCount(recipient), 0);
  assert.equal(await getPostSignInPath(recipient), "/book-clubs");
  assert.equal((await clubs.getBookClubsForUser(recipient))[0].role, "member");
  assert.equal((await clubs.getBookClubsForUser(owner))[0].role, "owner");
  assert(
    (await clubs.inviteToBookClub(owner, clubId, emailFor(recipient))).error,
  );
  assert(
    (await clubs.inviteToBookClub(recipient, clubId, emailFor(outsider))).error,
  );
  const [memberCount] = await query(
    `SELECT count(*)::int AS count FROM book_club_members WHERE club_id = $1::uuid`,
    [clubId],
  );
  assert.equal(memberCount.count, 1);

  assert(
    (await clubs.inviteToBookClub(owner, clubId, emailFor(unverified))).success,
  );
  assert.equal(await clubs.isEmailVerified(unverified), false);
  assert.equal(await clubs.getPendingInvitationCount(unverified), 1);
  assert.equal((await clubs.getInvitationsForUser(unverified)).length, 0);
  const [unverifiedInvite] = await query(
    `SELECT id FROM book_club_invitations WHERE club_id = $1::uuid AND invitee_email = $2`,
    [clubId, emailFor(unverified)],
  );
  assert.equal(
    await clubs.acceptBookClubInvitation(unverified, unverifiedInvite.id),
    null,
  );
  await query(
    `UPDATE neon_auth."user" SET "emailVerified" = true WHERE id = $1::uuid`,
    [unverified],
  );
  assert.equal(await clubs.isEmailVerified(unverified), true);
  assert.equal((await clubs.getInvitationsForUser(unverified)).length, 1);
  assert.equal(
    await clubs.acceptBookClubInvitation(unverified, unverifiedInvite.id),
    clubId,
  );

  // Invites sent before signup become visible when that email creates an account.
  assert(
    (await clubs.inviteToBookClub(owner, clubId, emailFor(futureUser))).success,
  );
  await createUser(futureUser);
  const [futureInvitation] = await clubs.getInvitationsForUser(futureUser);
  assert(futureInvitation);
  assert.equal(
    await clubs.acceptBookClubInvitation(futureUser, futureInvitation.id),
    clubId,
  );

  assert.equal(await clubs.leaveBookClub(owner, clubId), false);
  assert.equal(await clubs.leaveBookClub(outsider, clubId), false);
  assert.equal(await clubs.deleteBookClub(recipient, clubId), false);
  assert.equal(await clubs.deleteBookClub(outsider, clubId), false);
  assert.equal((await clubs.getBookClubsForUser(owner)).length, 1);
  assert.equal(await clubs.deleteBookClub(owner, clubId), true);
  assert.equal(await clubs.deleteBookClub(owner, clubId), false);
  assert.equal((await clubs.getBookClubsForUser(recipient)).length, 0);
  const [remaining] = await query(
    `SELECT
    (SELECT count(*) FROM book_club_members WHERE club_id = $1::uuid) +
    (SELECT count(*) FROM book_club_invitations WHERE club_id = $2::uuid) AS count`,
    [clubId, clubId],
  );
  assert.equal(Number(remaining.count), 0);
  console.log(
    "Passed: owner/member roles, invite authorization, email normalization, concurrent invites and acceptance, verification, pre-signup invites, redirects, and cascade cleanup.",
  );
} finally {
  try {
    if (clubId)
      await query(`DELETE FROM book_clubs WHERE id = $1::uuid`, [clubId]);
    for (const id of userIds)
      await query(`DELETE FROM neon_auth."user" WHERE id = $1::uuid`, [id]);
  } finally {
    await pool.end();
  }
}
