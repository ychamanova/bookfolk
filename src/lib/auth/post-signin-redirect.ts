import { hasBookClubs } from "@/lib/book-clubs";

export async function getPostSignInPath(userId: string) {
  return (await hasBookClubs(userId)) ? "/book-clubs" : "/book-clubs/new";
}
