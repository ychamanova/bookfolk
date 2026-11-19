"use client";

import { Menu } from "@base-ui/react/menu";
import { useRef, useState } from "react";
import { deleteClub, leaveClub } from "@/app/(signed-in)/book-clubs/actions";
import { ClubConfirmDialog } from "@/components/book-clubs/club-confirm-dialog";
import { InviteMemberDialog } from "@/components/book-clubs/invite-member-dialog";
import { Button } from "@/components/ui/button";

type DialogName = "invite" | "delete" | "leave";

const itemClass =
  "flex w-full cursor-default items-center rounded-lg px-3 py-2 text-sm outline-none select-none data-highlighted:bg-muted";

// Actions for a club: owners can invite and delete, members can leave. Each
// menu item opens a dialog that is controlled from here. The dialog opens only
// once the menu has finished closing, so the menu's focus restoration and the
// dialog's focus trap never compete.
export function ClubMenu({
  clubId,
  clubName,
  role,
}: {
  clubId: string;
  clubName: string;
  role: "owner" | "member";
}) {
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const requested = useRef<DialogName | null>(null);

  const close = (open: boolean) => {
    if (!open) setDialog(null);
  };

  return (
    <>
      <Menu.Root
        onOpenChangeComplete={(open) => {
          if (!open && requested.current) {
            setDialog(requested.current);
            requested.current = null;
          }
        }}
      >
        <Menu.Trigger
          render={<Button variant="ghost" size="icon" />}
          aria-label={`Actions for ${clubName}`}
        >
          <span aria-hidden className="text-xl leading-none">
            ⋯
          </span>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="end" sideOffset={4} className="z-50">
            <Menu.Popup className="min-w-48 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none">
              {role === "owner" ? (
                <>
                  <Menu.Item
                    className={itemClass}
                    onClick={() => {
                      requested.current = "invite";
                    }}
                  >
                    Invite members
                  </Menu.Item>
                  <Menu.Item
                    className={`${itemClass} text-destructive`}
                    onClick={() => {
                      requested.current = "delete";
                    }}
                  >
                    Delete book club
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item
                  className={`${itemClass} text-destructive`}
                  onClick={() => {
                    requested.current = "leave";
                  }}
                >
                  Leave book club
                </Menu.Item>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      {role === "owner" ? (
        <>
          <InviteMemberDialog
            clubId={clubId}
            clubName={clubName}
            open={dialog === "invite"}
            onOpenChange={close}
          />
          <ClubConfirmDialog
            clubId={clubId}
            title={`Delete ${clubName}?`}
            description="This permanently deletes the book club, removes all of its members, and cancels any pending invitations. This can’t be undone."
            confirmLabel="Delete permanently"
            pendingLabel="Deleting…"
            action={deleteClub}
            open={dialog === "delete"}
            onOpenChange={close}
          />
        </>
      ) : (
        <ClubConfirmDialog
          clubId={clubId}
          title={`Leave ${clubName}?`}
          description="You’ll lose access to this book club. You can rejoin only if the owner invites you again."
          confirmLabel="Leave book club"
          pendingLabel="Leaving…"
          action={leaveClub}
          open={dialog === "leave"}
          onOpenChange={close}
        />
      )}
    </>
  );
}
