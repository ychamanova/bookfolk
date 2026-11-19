"use client";

import { useActionState } from "react";
import { acceptInvitation } from "@/app/(signed-in)/book-clubs/actions";
import { Button } from "@/components/ui/button";

export function AcceptInvitationForm({
  invitationId,
  clubName,
}: {
  invitationId: string;
  clubName: string;
}) {
  const [state, action, pending] = useActionState(acceptInvitation, {});
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      <Button
        type="submit"
        disabled={pending}
        aria-label={`Accept invitation to ${clubName}`}
      >
        {pending ? "Joining…" : "Accept"}
      </Button>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
