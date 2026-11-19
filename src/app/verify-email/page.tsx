import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { signOut } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/server";
import { isEmailVerified } from "@/lib/book-clubs";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage() {
  const { data: session } = await getSession();
  if (!session?.user) redirect("/signin");
  if (await isEmailVerified(session.user.id)) redirect("/book-clubs");

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-4">
        <VerifyEmailForm email={session.user.email} />
        <form action={signOut} className="text-center">
          <button
            type="submit"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
