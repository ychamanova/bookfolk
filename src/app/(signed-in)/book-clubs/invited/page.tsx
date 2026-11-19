import { redirect } from "next/navigation";
import { AcceptInvitationForm } from "@/components/book-clubs/accept-invitation-form";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { getSession } from "@/lib/auth/server";
import { getInvitationsForUser } from "@/lib/book-clubs";

export const dynamic = "force-dynamic";

export default async function InvitedPage() {
  const { data: session } = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const invitations = await getInvitationsForUser(session.user.id);

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight">Invited</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            <Card size="compact" className="space-y-4">
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
            </Card>
          </li>
        ))}
        {invitations.length === 0 && (
          <li className="py-6 text-sm text-muted-foreground">
            No pending invitations. Invitations sent to {session.user.email}{" "}
            will appear here.
          </li>
        )}
      </ul>
    </PageContainer>
  );
}
