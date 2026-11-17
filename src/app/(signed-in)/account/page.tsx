import { redirect } from "next/navigation";
import { getSessionSafely } from "@/lib/auth/server";

export default async function AccountPage() {
  const { data: session } = await getSessionSafely();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome,{" "}
          <span className="font-bold">
            {session.user.name ?? session.user.email}
          </span>
        </p>
        <div className="mt-6 space-y-1">
          <div>
            <span className="font-medium">Email: </span>
            <span>{session.user.email}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
