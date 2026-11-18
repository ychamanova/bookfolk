# Security review — November 17, 2026

This review covers the application source, dependency lockfile, locally available
Git history, generated browser assets, and read-only database grant metadata.
It is not a penetration test or a guarantee that every vulnerability is absent.

## Changes made

- Updated Next.js to 16.4.6 and Neon Auth to 0.7.0-beta.
- Pinned patched Better Auth, core, OAuth provider, and Zod versions through npm
  overrides because the Neon SDK pins older transitive versions. Revisit these
  overrides when Neon updates its own dependency requirements.
- Overrode the obsolete esbuild copy under `@esbuild-kit/core-utils` with
  0.25.12 or a compatible patch. Drizzle migration generation was verified after
  the override. The old esbuild development-server advisory is
  [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99).
- Marked database access and server authentication modules with `server-only` to
  make accidental imports into Client Components fail at build time.
- Made database-writing actions bypass the session cookie cache and validate the
  session upstream. A regression test confirms a revoked session is rejected
  even when the browser still presents a valid signed render-cache cookie.
- Kept query parameters and database error details out of invitation error logs.
- Added anti-framing, MIME-sniffing, referrer, and browser-permission headers.
  The CSP only restricts framing, base URLs, and object embeds; it does not provide
  a complete script-source or nonce policy.
- Expanded ignored private-key file extensions and added weekly npm Dependabot
  updates. These updates take effect after the configuration reaches the default
  branch.
- Moved the shadcn CLI to development dependencies. Its stylesheet is still used
  during the frontend build, so build environments need development dependencies.

## Verification results

- `npm audit --omit=dev`: **0 known dependency vulnerabilities** at review time.
- Full `npm audit`: **10 development-tool findings** (8 high, 2 moderate), described
  below. Audit counts include packages affected through vulnerable dependencies.
- TypeScript and auth regression tests pass.
- Invitation integration tests pass in disposable local PostgreSQL databases:
  owner/member authorization, outsider rejection, email verification, invitations
  before signup, duplicate requests, concurrent acceptance, and cascade cleanup.
- Fresh and legacy-schema migrations pass, including repeat migration and
  preservation of an existing club record.
- `npm run db:generate`: no unintended schema changes.
- `npm run build -- --webpack`: production build passes.
- Production HTTP smoke checks: home/sign-in return 200; account/book-club pages
  redirect signed-out visitors to sign-in; configured security headers are present.
- Pattern checks found no committed environment/private-key files, credential
  patterns, or current local secret values in the 15 commits available locally.
  Current local secret values were also absent from 49 generated browser assets.
  Pattern checks can miss unknown or previously rotated secrets.
- Database grant inspection found application-table grants only for the owner
  role. Application tables do not enable row-level security; authorization is
  enforced by the server's session checks and database queries. Anyone possessing
  the owner connection string can bypass application authorization.

## Outstanding development dependencies

The shadcn tooling tree still includes picomatch and minimatch denial-of-service
findings. No application route accepts user-supplied glob patterns or exposes the
CLI as a service. These are development/build-tool exposures, not findings in the
production dependency audit.

[Picomatch GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
affects all published versions through 4.0.7 and has no published patch at review
time. Minimatch's
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
is patched in 11.0.1+, but its upstream tooling currently depends on an earlier
major. A forced major override or CLI downgrade was not applied without a
compatibility basis. Keep these findings open until upstream dependencies update
or the tooling is replaced and its stylesheet/build integration is migrated.

## Deployment checks outside this review

GitHub secret-scanning/push-protection settings, deployed secret storage, managed
Neon Auth service updates, trusted origins, and production firewall/rate-limit
settings were not verified. The app does not implement per-user write quotas.
Before opening the deployment to substantial traffic, confirm those settings and
consider a dedicated runtime database role with fewer privileges than the owner.
Never put database URLs, signing secrets, or private keys in `NEXT_PUBLIC_*`
variables or commit them. If a real secret is exposed later, rotate it; deleting
it from the latest commit does not revoke it or remove existing copies.
