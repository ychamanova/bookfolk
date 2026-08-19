import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getSessionSafely } from "@/lib/auth/server";
import { getBookClubsForUser } from "@/lib/book-clubs";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookClubsPage() {
  const { data: session } = await getSessionSafely();

  if (!session?.user) {
    redirect("/signin");
  }

  const bookClubs = await getBookClubsForUser(session.user.id);

  return (
    <main className="flex flex-1 justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">
            Your book clubs
          </h1>
          <Link href="/book-clubs/new" className={cn(buttonVariants())}>
            New book club
          </Link>
        </div>

        <ul className="mt-8 flex flex-col gap-2">
          {bookClubs.map((club) => (
            <li
              key={club.id}
              className="rounded-xl border border-border bg-card px-4 py-3 text-card-foreground"
            >
              {club.name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
