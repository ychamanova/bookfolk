import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/signin",
});

export const config = {
  matcher: ["/account/:path*", "/book-clubs/:path*"],
};
