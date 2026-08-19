import { createNeonAuth } from "@neondatabase/auth/next/server";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const auth = createNeonAuth({
  baseUrl: requireEnv("NEON_AUTH_BASE_URL"),
  cookies: {
    secret: requireEnv("NEON_AUTH_COOKIE_SECRET"),
  },
});

/**
 * `auth.getSession()` can try to refresh the session cookie when its local
 * cache has expired, which throws outside a Server Action/Route Handler
 * (e.g. when called from a plain Server Component like a layout or nav bar).
 * Treat that as "no confirmed session" instead of crashing the render.
 */
export async function getSessionSafely() {
  try {
    return await auth.getSession();
  } catch (error) {
    console.error("[auth] getSession() failed during render:", error);
    return { data: null, error };
  }
}
