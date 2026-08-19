import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, getSessionSafely } from "@/lib/auth/server";
import { createBookClubForUser } from "@/lib/book-clubs";

async function createBookClub(formData: FormData) {
  "use server";
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await createBookClubForUser(session.user.id, name);
  redirect("/book-clubs");
}

export const dynamic = "force-dynamic";

export default async function NewBookClubPage() {
  const { data: session } = await getSessionSafely();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-card-foreground">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a book club
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Give your book club a name to get started.
        </p>
        <form action={createBookClub} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Book club name
            </label>
            <Input id="name" name="name" type="text" required autoFocus />
          </div>
          <Button type="submit" className="mt-2 w-full">
            Create book club
          </Button>
        </form>
      </div>
    </main>
  );
}
