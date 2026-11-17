"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  BookOpen01Icon,
  Cancel01Icon,
  Logout01Icon,
  Menu01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/book-clubs", label: "Book Clubs", icon: BookOpen01Icon },
  { href: "/account", label: "Account", icon: UserCircleIcon },
];

type SidebarUser = { name?: string | null; email: string };

function SidebarContent({
  user,
  onNavigate,
}: {
  user: SidebarUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

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
          {navigation.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  onNavigate={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <HugeiconsIcon icon={icon} className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
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

export function AppSidebar({ user }: { user: SidebarUser }) {
  const [open, setOpen] = useState(false);

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
        <SidebarContent user={user} />
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
              <SidebarContent user={user} onNavigate={() => setOpen(false)} />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
