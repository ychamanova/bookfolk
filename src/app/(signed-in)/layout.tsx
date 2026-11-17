import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { getSessionSafely } from "@/lib/auth/server";

export default async function SignedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await getSessionSafely();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col md:flex-row">
      <a
        href="#page-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:p-3 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar
        user={{ name: session.user.name, email: session.user.email }}
      />
      <div
        id="page-content"
        tabIndex={-1}
        className="flex min-w-0 flex-1 flex-col outline-none"
      >
        {children}
      </div>
    </div>
  );
}
