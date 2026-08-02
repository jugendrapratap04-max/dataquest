"use client";

import Link from "next/link";
import { useEffect } from "react";

// Any uncaught server or render error used to fall through to Next's bare error
// screen — same dead end as the missing 404 page, but scarier, because a student
// cannot tell "we broke" from "you broke it".
//
// Deliberately does NOT print the error message: it can carry a query or a stack
// frame, and it means nothing to a learner. It goes to the console for us.

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="mark">D</div>
          <div><span className="wm">Etudo</span></div>
        </div>
        <h1>Something went wrong at our end</h1>
        <p className="sub">
          This one is on us, not on you. Your progress is saved — nothing you had
          already solved is affected.
        </p>
        <button className="btn btn-primary auth-btn" onClick={reset}>Try again</button>
        <p className="auth-legal">
          Still stuck? Go back to <Link href="/dashboard">your dashboard</Link> or{" "}
          <Link href="/learn">the lessons</Link>.
          {error.digest && <> Reference: <code>{error.digest}</code></>}
        </p>
      </div>
    </div>
  );
}
