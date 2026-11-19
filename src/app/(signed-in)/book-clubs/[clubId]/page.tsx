import { notFound, redirect } from "next/navigation";
import { ClubMenu } from "@/components/book-clubs/club-menu";
import { JoinedNotice } from "@/components/book-clubs/joined-notice";
import { PageContainer } from "@/components/ui/page-container";
import { getSession } from "@/lib/auth/server";
import { getBookClubForUser } from "@/lib/book-clubs";
import { isUuid } from "@/lib/uuid";

export const dynamic = "force-dynamic";

export default async function BookClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ joined?: string }>;
}) {
  const { data: session } = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const { clubId } = await params;
  if (!isUuid(clubId)) notFound();

  const { joined } = await searchParams;
  const club = await getBookClubForUser(session.user.id, clubId);
  if (!club) notFound();

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="wrap-break-word text-3xl font-semibold tracking-tight">
            {club.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {club.role === "owner" ? "Owner" : "Member"}
          </p>
        </div>
        <ClubMenu clubId={club.id} clubName={club.name} role={club.role} />
      </div>
      {joined === "1" && <JoinedNotice />}
    </PageContainer>
  );
}
