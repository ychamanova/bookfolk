"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useActionState } from "react";
import type { ClubActionState } from "@/app/(signed-in)/book-clubs/actions";
import { Button } from "@/components/ui/button";

type ClubAction = (
  previous: ClubActionState,
  formData: FormData,
) => Promise<ClubActionState>;

// The form lives inside the popup, which unmounts on close, so a stale error
// never survives cancelling and reopening.
function ConfirmForm({
  clubId,
  action,
  confirmLabel,
  pendingLabel,
}: {
  clubId: string;
  action: ClubAction;
  confirmLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="mt-5 flex flex-col gap-4">
      <input type="hidden" name="clubId" value={clubId} />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Dialog.Close render={<Button variant="ghost" disabled={pending} />}>
          Cancel
        </Dialog.Close>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </form>
  );
}

export function ClubConfirmDialog({
  clubId,
  title,
  description,
  confirmLabel,
  pendingLabel,
  action,
  open,
  onOpenChange,
}: {
  clubId: string;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  action: ClubAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
          <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </Dialog.Description>
          <ConfirmForm
            clubId={clubId}
            action={action}
            confirmLabel={confirmLabel}
            pendingLabel={pendingLabel}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
