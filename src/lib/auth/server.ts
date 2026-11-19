import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import {
  createAuthServer,
  extractNeonAuthCookies,
} from "@neondatabase/auth/server";
import { headers } from "next/headers";
import { cache } from "react";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

type AuthClient = ReturnType<typeof createNeonAuth>;
type RenderAuthClient = ReturnType<typeof createAuthServer>;
const globalForAuth = globalThis as typeof globalThis & {
  bookfolkAuth?: { auth: AuthClient; renderAuth: RenderAuthClient };
};

// Built on first use so importing this module (builds, scripts) doesn't require
// the auth environment variables.
function getClients() {
  if (globalForAuth.bookfolkAuth) return globalForAuth.bookfolkAuth;
  const baseUrl = requireEnv("NEON_AUTH_BASE_URL");
  const cookieSecret = requireEnv("NEON_AUTH_COOKIE_SECRET");

  // Cookie-writing client: use only in Server Actions, Route Handlers, and proxy.
  const auth = createNeonAuth({ baseUrl, cookies: { secret: cookieSecret } });

  const renderAuth = createAuthServer({
    baseUrl,
    cookieSecret,
    context: async () => {
      const requestHeaders = await headers();
      // Derive the origin from the request host rather than the client-supplied
      // Origin/Referer headers, which may be absent or spoofed.
      const host =
        requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
      const proto =
        requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        (process.env.NODE_ENV === "production" ? "https" : "http");
      return {
        getCookies: () => extractNeonAuthCookies(requestHeaders),
        getHeader: (name) => requestHeaders.get(name),
        getOrigin: () => (host ? `${proto}://${host}` : ""),
        getFramework: () => "nextjs",
        // Rendering cannot persist Set-Cookie headers. Session renewal is
        // handled by the auth proxy, Route Handler, and Server Actions instead.
        setCookie: () => {},
      };
    },
  });
  globalForAuth.bookfolkAuth = { auth, renderAuth };
  return globalForAuth.bookfolkAuth;
}

export const auth = new Proxy({} as AuthClient, {
  get(_target, prop) {
    const target = getClients().auth;
    const value = Reflect.get(target, prop, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

// Deduplicate reads within a render without caching sessions across requests.
export const getSession = cache(() => getClients().renderAuth.getSession());

// Mutations must revalidate upstream so a revoked session cannot authorize a
// write just because its signed render cache is still within its TTL.
export function getActionSession() {
  return auth.getSession({ query: { disableCookieCache: "true" } });
}
