"use client";

import { useActionState } from "react";
import { createClub } from "@/app/(signed-in)/book-clubs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_CLUB_NAME_LENGTH } from "@/lib/club-constants";

export function NewClubForm() {
  const [state, action, pending] = useActionState(createClub, {});
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Book club name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          maxLength={MAX_CLUB_NAME_LENGTH}
          autoFocus
          aria-describedby={state.error ? "name-error" : undefined}
        />
        {state.error && (
          <p id="name-error" role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Creating…" : "Create book club"}
      </Button>
    </form>
  );
}
