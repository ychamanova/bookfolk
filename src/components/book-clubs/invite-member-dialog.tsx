"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useActionState, useId } from "react";
import { inviteMember } from "@/app/(signed-in)/book-clubs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function InviteForm({ clubId }: { clubId: string }) {
  const [state, action, pending] = useActionState(inviteMember, {});
  const emailId = useId();
  return state.success ? (
    <div className="mt-5 space-y-5">
      <p role="status" className="text-sm text-muted-foreground">
        Invitation added. They can accept it in their Invited tab when they sign
        in with this email.
      </p>
      <Dialog.Close render={<Button />}>Done</Dialog.Close>
    </div>
  ) : (
    <form action={action} className="mt-5 flex flex-col gap-4">
      <input type="hidden" name="clubId" value={clubId} />
      <div className="space-y-2">
        <label htmlFor={emailId} className="text-sm font-medium">
          Email address
        </label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Dialog.Close render={<Button variant="ghost" disabled={pending} />}>
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Invite member"}
        </Button>
      </div>
    </form>
  );
}

export function InviteMemberDialog({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={<Button variant="ghost" size="icon" />}
        aria-label={`Invite members to ${clubName}`}
      >
        <span aria-hidden className="text-xl leading-none">
          ⋯
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
          <Dialog.Title className="text-xl font-semibold">
            Invite a member
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Invite someone to {clubName} using their email address.
          </Dialog.Description>
          <InviteForm clubId={clubId} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
