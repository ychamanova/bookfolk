import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { signOut } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/server";

export default async function AccountPage() {
  const { data: session } = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <PageContainer align="center" width="md">
      <Card>
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
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
