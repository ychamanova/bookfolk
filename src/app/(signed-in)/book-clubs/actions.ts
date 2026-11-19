"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVerifiedActionUser } from "@/lib/auth/verified";
import {
  acceptBookClubInvitation,
  createBookClubForUser,
  deleteBookClub,
  inviteToBookClub,
  leaveBookClub,
} from "@/lib/book-clubs";
import { MAX_CLUB_NAME_LENGTH } from "@/lib/club-constants";
import { isUuid } from "@/lib/uuid";

export type ClubActionState = { error?: string; success?: boolean };

export async function inviteMember(
  _previous: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const user = await requireVerifiedActionUser();
  const clubId = String(formData.get("clubId") ?? "");
  if (!isUuid(clubId)) return { error: "Invalid book club." };
  try {
    const result = await inviteToBookClub(
      user.id,
      clubId,
      String(formData.get("email") ?? ""),
    );
    revalidatePath("/book-clubs", "layout");
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
  if (!isUuid(id)) return { error: "Invalid invitation." };
  let clubId: string | null;
  try {
    clubId = await acceptBookClubInvitation(user.id, id);
    if (!clubId)
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
  revalidatePath("/book-clubs", "layout");
  redirect(`/book-clubs/${clubId}?joined=1`);
}

export async function deleteClub(
  _previous: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const user = await requireVerifiedActionUser();
  const clubId = String(formData.get("clubId") ?? "");
  if (!isUuid(clubId)) return { error: "Invalid book club." };
  try {
    if (!(await deleteBookClub(user.id, clubId)))
      return { error: "Only the club owner can delete this book club." };
  } catch (error) {
    console.error("[book-clubs] deletion failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "The book club could not be deleted. Please try again." };
  }
  revalidatePath("/book-clubs", "layout");
  redirect("/book-clubs");
}

export async function createClub(
  _previous: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const user = await requireVerifiedActionUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter a name for your book club." };
  if (name.length > MAX_CLUB_NAME_LENGTH)
    return {
      error: `Book club names can be up to ${MAX_CLUB_NAME_LENGTH} characters.`,
    };
  let clubId: string;
  try {
    clubId = await createBookClubForUser(user.id, name);
  } catch (error) {
    console.error("[book-clubs] creation failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "The book club could not be created. Please try again." };
  }
  revalidatePath("/book-clubs", "layout");
  redirect(`/book-clubs/${clubId}`);
}

export async function leaveClub(
  _previous: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const user = await requireVerifiedActionUser();
  const clubId = String(formData.get("clubId") ?? "");
  if (!isUuid(clubId)) return { error: "Invalid book club." };
  try {
    if (!(await leaveBookClub(user.id, clubId)))
      return { error: "You’re not a member of this book club." };
  } catch (error) {
    console.error("[book-clubs] leave failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "Could not leave the book club. Please try again." };
  }
  revalidatePath("/book-clubs", "layout");
  redirect("/book-clubs");
}
