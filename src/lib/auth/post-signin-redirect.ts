import {
  getPendingInvitationCount,
  hasBookClubs,
  isEmailVerified,
} from "@/lib/book-clubs";

export async function getPostSignInPath(userId: string) {
  if (!(await isEmailVerified(userId))) return "/verify-email";
  if ((await getPendingInvitationCount(userId)) > 0) {
    return "/book-clubs?tab=invited";
  }
  return (await hasBookClubs(userId)) ? "/book-clubs" : "/book-clubs/new";
}
