"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  BookOpen01Icon,
  Cancel01Icon,
  Logout01Icon,
  Mail01Icon,
  Menu01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type SidebarUser = { name?: string | null; email: string };
type SidebarClub = { id: string; name: string };
type SidebarData = {
  user: SidebarUser;
  clubs: SidebarClub[];
  invitationCount: number;
};

const itemClass =
  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring";
const activeClass = "bg-sidebar-accent text-sidebar-accent-foreground";

function SidebarContent({
  user,
  clubs,
  invitationCount,
  onNavigate,
}: SidebarData & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const onInvited = pathname === "/book-clubs/invited";
  const onClubsHome =
    pathname === "/book-clubs" || pathname === "/book-clubs/new";
  const onAccount = pathname === "/account";

  return (
    <>
      <Link
        href="/book-clubs"
        onNavigate={onNavigate}
        className="w-fit rounded-md text-xl font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        bookfolk.
      </Link>
      <nav aria-label="Main navigation" className="mt-10">
        <ul className="space-y-2">
          <li>
            <Link
              href="/book-clubs"
              onNavigate={onNavigate}
              aria-current={onClubsHome ? "page" : undefined}
              className={cn(itemClass, onClubsHome && activeClass)}
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="size-5"
                aria-hidden
              />
              Your clubs
            </Link>
            {clubs.length > 0 && (
              <ul className="mt-1 ml-5 space-y-1 border-l border-sidebar-border pl-3">
                {clubs.map((club) => {
                  const href = `/book-clubs/${club.id}`;
                  const active = pathname === href;
                  return (
                    <li key={club.id}>
                      <Link
                        href={href}
                        onNavigate={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block truncate rounded-lg px-3 py-2 text-sm transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          active &&
                            "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                        )}
                      >
                        {club.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/book-clubs/invited"
              onNavigate={onNavigate}
              aria-current={onInvited ? "page" : undefined}
              className={cn(itemClass, onInvited && activeClass)}
            >
              <HugeiconsIcon icon={Mail01Icon} className="size-5" aria-hidden />
              Invited{invitationCount > 0 ? ` (${invitationCount})` : ""}
            </Link>
          </li>
          <li>
            <Link
              href="/account"
              onNavigate={onNavigate}
              aria-current={onAccount ? "page" : undefined}
              className={cn(itemClass, onAccount && activeClass)}
            >
              <HugeiconsIcon
                icon={UserCircleIcon}
                className="size-5"
                aria-hidden
              />
              Account
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto border-t border-sidebar-border pt-5">
        <p className="truncate text-sm font-semibold">
          {user.name || user.email}
        </p>
        {user.name && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        )}
        <form action={signOut} className="mt-4">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4" aria-hidden />
            Log out
          </Button>
        </form>
      </div>
    </>
  );
}

export function AppSidebar({ user, clubs, invitationCount }: SidebarData) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  // The layout does not re-render on soft navigation, so refresh the club list
  // and invitation badge whenever the user comes back to the tab.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [router]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground md:flex">
        <SidebarContent
          user={user}
          clubs={clubs}
          invitationCount={invitationCount}
        />
      </aside>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground md:hidden">
        <Link href="/book-clubs" className="text-xl font-bold tracking-tight">
          bookfolk.
        </Link>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            render={<Button variant="ghost" size="icon" />}
            aria-label="Open navigation"
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" aria-hidden />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
            <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100%-3rem)] flex-col gap-6 overflow-y-auto border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground outline-none">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <Dialog.Close
                render={<Button variant="ghost" size="icon" />}
                aria-label="Close navigation"
                className="absolute top-4 right-4"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="size-5"
                  aria-hidden
                />
              </Dialog.Close>
              <SidebarContent
                user={user}
                clubs={clubs}
                invitationCount={invitationCount}
                onNavigate={() => setOpen(false)}
              />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
