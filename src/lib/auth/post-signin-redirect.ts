import { getPendingInvitationCount, hasBookClubs } from "@/lib/book-clubs";

export async function getPostSignInPath(userId: string) {
  if ((await getPendingInvitationCount(userId)) > 0) {
    return "/book-clubs?tab=invited";
  }
  return (await hasBookClubs(userId)) ? "/book-clubs" : "/book-clubs/new";
}
