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

const baseUrl = requireEnv("NEON_AUTH_BASE_URL");
const cookieSecret = requireEnv("NEON_AUTH_COOKIE_SECRET");

// Cookie-writing client: use only in Server Actions, Route Handlers, and proxy.
export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
});

const renderAuth = createAuthServer({
  baseUrl,
  cookieSecret,
  context: async () => {
    const requestHeaders = await headers();
    return {
      getCookies: () => extractNeonAuthCookies(requestHeaders),
      getHeader: (name) => requestHeaders.get(name),
      getOrigin: () =>
        requestHeaders.get("origin") ??
        requestHeaders.get("referer")?.split("/").slice(0, 3).join("/") ??
        "",
      getFramework: () => "nextjs",
      // Rendering cannot persist Set-Cookie headers. Session renewal is handled
      // by the auth proxy, Route Handler, and Server Actions instead.
      setCookie: () => {},
    };
  },
});

// Deduplicate reads within a render without caching sessions across requests.
export const getSession = cache(() => renderAuth.getSession());
