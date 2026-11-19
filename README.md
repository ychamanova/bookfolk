# bookfolk [WIP]

A place to organize your book club. Then take it offline.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database migrations

Application queries use Drizzle ORM with a shared `pg` connection pool. Table
definitions live in `src/lib/db/schema.ts`. Neon Auth owns `neon_auth`; the app
only maps the user fields it reads, and Drizzle migrations do not manage auth.

After editing the application schema:

```bash
npm run db:generate -- --name=describe_change
# Review the generated SQL in drizzle/ before applying it.
npm run db:migrate
```

The migration command uses `DATABASE_URL_UNPOOLED` when provided, otherwise the
direct host derived from `DATABASE_URL`. Applied migrations are recorded in
`drizzle.__drizzle_migrations`. `npm run db:studio` opens Drizzle Studio.

The initial Drizzle migration adopts the existing tables with `IF NOT EXISTS`,
preserving existing records and constraints. It also supports fresh databases
after Neon Auth has been enabled. The old `migrations/` SQL (now removed) and `app_migrations`
table are historical; the migration command now uses `drizzle/` exclusively.

Test migrations on an isolated Neon branch before applying them to the app's
database. Existing club owners remain in `book_clubs.owner_id`; accepted members
and invitations are stored in `book_club_members` and `book_club_invitations`.

## Invitation checks

Run `npm run test:invitations` with `TEST_DATABASE_URL` set to a migrated, isolated
Neon branch. The script refuses the app's configured database host, creates
disposable fixtures, and cleans them up afterward.

Owners invite by email through the club's three-dot button. Recipients find
invitations in **Book Clubs → Invited**, verify their email if needed, and accept
to join as a member. Invitations also work before the recipient signs up.
Invitation emails are not sent; the verification form uses the existing Neon
Auth email OTP service.

## Server authentication

Pages, layouts, and Server Components read sessions with `getSession()` from
`src/lib/auth/server.ts`. This reader validates sessions without writing cookies
and deduplicates reads within each render. Use `auth` from the same module in
sign-in/sign-out actions, Route Handlers, and the auth proxy, where cookie writes
are allowed. Actions that create clubs or invitations or accept invitations use
`getActionSession()` to revalidate the session upstream before writing data. The
proxy handles session renewal for protected pages.

Run `npm run test:auth` to check session-cache expiration and the read-only render
boundary. These checks use mocked auth responses and need no database or secrets.

See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for the security review, dependency
override rationale, verification results, and outstanding development-tool findings.

## Stack

- [Next.js](https://nextjs.org) (App Router) + [Tailwind CSS](https://tailwindcss.com)
- [Neon](https://neon.tech) Postgres + built-in Auth, provisioned via the Vercel Marketplace
- [Drizzle ORM](https://orm.drizzle.team) + `pg` for typed queries and transactions
