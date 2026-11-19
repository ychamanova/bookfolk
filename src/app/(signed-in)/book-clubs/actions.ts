"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVerifiedActionUser } from "@/lib/auth/verified";
import { acceptBookClubInvitation, inviteToBookClub } from "@/lib/book-clubs";

export type ClubActionState = { error?: string; success?: boolean };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function inviteMember(
  _previous: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const user = await requireVerifiedActionUser();
  const clubId = String(formData.get("clubId") ?? "");
  if (!uuid.test(clubId)) return { error: "Invalid book club." };
  try {
    const result = await inviteToBookClub(
      user.id,
      clubId,
      String(formData.get("email") ?? ""),
    );
    revalidatePath("/book-clubs");
    return result;
  } catch (error) {
    console.error("[book-clubs] invitation failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "The invitation could not be saved. Please try again." };
  }
}

export async function acceptInvitation(
  _previous: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const user = await requireVerifiedActionUser();
  const id = String(formData.get("invitationId") ?? "");
  if (!uuid.test(id)) return { error: "Invalid invitation." };
  try {
    const accepted = await acceptBookClubInvitation(user.id, id);
    if (!accepted)
      return {
        error:
          "This invitation is unavailable, or your email still needs verification. Refresh and try again.",
      };
  } catch (error) {
    console.error("[book-clubs] acceptance failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "Could not accept the invitation. Please try again." };
  }
  revalidatePath("/book-clubs");
  redirect("/book-clubs?joined=1");
}
