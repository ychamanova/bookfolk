import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { auth } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

async function signOut() {
  "use server";
  await auth.signOut();
  redirect("/");
}

export async function NavBar() {
  const { data: session } = await auth.getSession();

  return (
    <nav className="w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-foreground"
          >
            bookfolk.
          </Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            {session?.user ? (
              <NavigationMenuItem>
                <form action={signOut}>
                  <Button type="submit" variant="outline">
                    Log out
                  </Button>
                </form>
              </NavigationMenuItem>
            ) : (
              <>
                <NavigationMenuItem>
                  <Link
                    href="/signin"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Sign In
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/signup" className={buttonVariants()}>
                    Sign Up
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
