import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export function NavBar() {
  return (
    <nav className="w-full border-b bg-[##ebdab5]/90 backdrop-blur supports-[backdrop-filter]:bg-[#fff4c2]/70 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-gray-900"
          >
            bookfolk.
          </Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            <NavigationMenuItem>
              <Link
                href="/signin"
                className={buttonVariants({ variant: "outline", className: "border-black" })}
                style={{ borderColor: "black" }}
              >
                Sign In
              </Link>
            </NavigationMenuItem>
       
            <NavigationMenuItem>
              <Link href="/signup" className={buttonVariants()}>
                Sign Up
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}