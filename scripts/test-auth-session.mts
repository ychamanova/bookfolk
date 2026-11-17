import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";

// Exercise the actual auth module against Next's read-only render boundary.
// No auth service, database, or real credentials are used.
const require = createRequire(import.meta.url);
const headersPath = require.resolve("next/headers");
require(headersPath);
const headersModule = require.cache[headersPath];
assert(headersModule);
const originalHeaders = headersModule.exports;
const originalFetch = globalThis.fetch;
const cookieSecret = "session-regression-test-secret-at-least-32-characters";
process.env.NEON_AUTH_BASE_URL = "https://auth.example.invalid";
process.env.NEON_AUTH_COOKIE_SECRET = cookieSecret;

let requestHeaders = new Headers();
let canWriteCookies = false;
let cookieWrites = 0;
let upstreamCalls = 0;
headersModule.exports = {
  ...originalHeaders,
  headers: async () => requestHeaders,
  cookies: async () => ({
    set() {
      cookieWrites++;
      if (!canWriteCookies) {
        throw new Error(
          "Cookies can only be modified in a Server Action or Route Handler.",
        );
      }
    },
  }),
};

const tokenName = "__Secure-neon-auth.session_token";
const cacheName = "__Secure-neon-auth.local.session_data";
const now = new Date().toISOString();
const userId = "c166d413-bac7-48b9-9bf6-e450af208b60";
const session = {
  user: {
    id: userId,
    name: "Session test",
    email: "test@example.invalid",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  },
  session: {
    id: "session-test",
    userId,
    token: "test-token",
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  },
};
let upstreamSession: typeof session | null = session;
globalThis.fetch = async () => {
  upstreamCalls++;
  return Response.json(upstreamSession, {
    headers: {
      "Set-Cookie": `${tokenName}=test-token; Path=/; HttpOnly; Secure; SameSite=Lax`,
    },
  });
};

function cachedSession(expiresAt: number) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: expiresAt }),
  ).toString("base64url");
  const message = `${header}.${payload}`;
  return `${message}.${createHmac("sha256", cookieSecret).update(message).digest("base64url")}`;
}

try {
  const { auth, getSession } = await import("../src/lib/auth/server");

  for (const cached of [undefined, "invalid-cookie", cachedSession(1)]) {
    requestHeaders = new Headers({
      cookie: `${tokenName}=test-token${cached ? `; ${cacheName}=${cached}` : ""}`,
    });
    const before = upstreamCalls;
    assert.equal((await getSession()).data?.user?.id, userId);
    assert(
      upstreamCalls > before,
      "Missing, invalid, and expired caches must revalidate upstream.",
    );
    assert.equal(
      cookieWrites,
      0,
      "Rendering must never call Next's cookie mutation API.",
    );
  }

  requestHeaders = new Headers({
    cookie: `${tokenName}=test-token; ${cacheName}=${cachedSession(Math.floor(Date.now() / 1000) + 300)}`,
  });
  const before = upstreamCalls;
  assert.equal((await getSession()).data?.user?.id, userId);
  assert.equal(
    upstreamCalls,
    before,
    "A valid signed session cache should be reused.",
  );

  requestHeaders = new Headers();
  upstreamSession = null;
  assert.equal((await getSession()).data, null);
  assert.equal(cookieWrites, 0);

  // A fresh request must not inherit a previous user's session.
  requestHeaders = new Headers({ cookie: `${tokenName}=test-token` });
  upstreamSession = session;
  canWriteCookies = true;
  assert.equal((await auth.getSession()).data?.user?.id, userId);
  assert(
    cookieWrites > 0,
    "The action/handler client must still persist auth cookies.",
  );
  console.log(
    "Passed: read-only session rendering, missing/invalid/expired/valid caches, signed-out requests, and writable action cookies.",
  );
} finally {
  globalThis.fetch = originalFetch;
  headersModule.exports = originalHeaders;
}
