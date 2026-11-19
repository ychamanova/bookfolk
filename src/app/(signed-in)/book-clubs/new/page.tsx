import { redirect } from "next/navigation";
import { NewClubForm } from "@/components/book-clubs/new-club-form";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function NewBookClubPage() {
  const { data: session } = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <PageContainer align="center" width="sm">
      <Card>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a book club
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Give your book club a name to get started.
        </p>
        <NewClubForm />
      </Card>
    </PageContainer>
  );
}
