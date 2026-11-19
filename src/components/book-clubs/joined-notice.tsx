"use client";

import { useEffect } from "react";

// Shows the post-accept confirmation, then strips ?joined=1 from the URL so a
// refresh or a shared link doesn't repeat it.
export function JoinedNotice() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("joined")) {
      url.searchParams.delete("joined");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);
  return (
    <p role="status" className="mt-5 text-sm text-muted-foreground">
      You joined the book club.
    </p>
  );
}
