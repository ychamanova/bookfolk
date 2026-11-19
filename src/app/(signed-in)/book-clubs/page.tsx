import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { getSession } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookClubsPage() {
  const { data: session } = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Your clubs</h1>
        <Link href="/book-clubs/new" className={cn(buttonVariants())}>
          New book club
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Pick a club from the sidebar, create a new one, or see your{" "}
        <Link
          href="/book-clubs/invited"
          className="underline underline-offset-4"
        >
          invitations
        </Link>
        .
      </p>
    </PageContainer>
  );
}
