import Link from "next/link";
import { redirect } from "next/navigation";
import { AcceptInvitationForm } from "@/components/book-clubs/accept-invitation-form";
import { InviteMemberDialog } from "@/components/book-clubs/invite-member-dialog";
import { JoinedNotice } from "@/components/book-clubs/joined-notice";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import {
  getBookClubsForUser,
  getInvitationsForUser,
  getPendingInvitationCount,
} from "@/lib/book-clubs";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; joined?: string }>;
}) {
  const { data: session } = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const { tab, joined } = await searchParams;
  const invited = tab === "invited";
  const [bookClubs, invitations, invitationCount] = await Promise.all([
    getBookClubsForUser(session.user.id),
    invited ? getInvitationsForUser(session.user.id) : Promise.resolve([]),
    getPendingInvitationCount(session.user.id),
  ]);

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

        <nav
          aria-label="Book club views"
          className="mt-6 flex gap-2 border-b border-border pb-3"
        >
          <Link
            href="/book-clubs"
            aria-current={!invited ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: !invited ? "secondary" : "ghost" }),
            )}
          >
            Your clubs
          </Link>
          <Link
            href="/book-clubs?tab=invited"
            aria-current={invited ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: invited ? "secondary" : "ghost" }),
            )}
          >
            Invited{invitationCount > 0 ? ` (${invitationCount})` : ""}
          </Link>
        </nav>

        {!invited && joined === "1" && <JoinedNotice />}

        {invited ? (
          <ul className="mt-6 flex flex-col gap-3">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="space-y-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
              >
                <div>
                  <h2 className="font-medium">{invitation.club_name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Invited by {invitation.invited_by_name}
                  </p>
                </div>
                <AcceptInvitationForm
                  invitationId={invitation.id}
                  clubName={invitation.club_name}
                />
              </li>
            ))}
            {invitations.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">
                No pending invitations. Invitations sent to {session.user.email}{" "}
                will appear here.
              </li>
            )}
          </ul>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {bookClubs.map((club) => (
              <li
                key={club.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground"
              >
                <div className="min-w-0">
                  <h2 className="wrap-break-word font-medium">{club.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {club.role === "owner" ? "Owner" : "Member"}
                  </p>
                </div>
                {club.role === "owner" && (
                  <InviteMemberDialog clubId={club.id} clubName={club.name} />
                )}
              </li>
            ))}
            {bookClubs.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">
                You haven’t joined any clubs yet. Create a club or check your
                Invited tab.
              </li>
            )}
          </ul>
        )}
      </div>
    </main>
  );
}
