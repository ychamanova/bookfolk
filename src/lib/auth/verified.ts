import "server-only";

import { redirect } from "next/navigation";
import { getActionSession } from "@/lib/auth/server";
import { isEmailVerified } from "@/lib/book-clubs";

// For Server Actions, which can be invoked without rendering the gated layout.
export async function requireVerifiedActionUser() {
  const { data: session } = await getActionSession();
  if (!session?.user) redirect("/signin");
  if (!(await isEmailVerified(session.user.id))) redirect("/verify-email");
  return session.user;
}
