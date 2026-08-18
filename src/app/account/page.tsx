import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome, {session.user.name}
      </h1>
    </main>
  );
}
