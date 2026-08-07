"use client";

import Link from "next/link";
import { useEffect } from "react";

/* The error boundary for every signed-in page.
 *
 * There was already one at app/error.tsx and it is still there, but it is the
 * ROOT boundary: it replaces the whole document, sidebar and topbar included,
 * with a centred card. That is right for the landing page, which has no shell —
 * and wrong here, because it makes a failure on /progress look like the entire
 * site went down, and it takes away the navigation the reader needs to get
 * somewhere that still works.
 *
 * This one sits inside the layout, so the shell stays and only the content area
 * is replaced. Nearest boundary wins, so adding it changes nothing else.
 *
 * Like the root one it deliberately does NOT print the message: it can carry a
 * query fragment or a stack frame, and it means nothing to a learner. It goes
 * to the console for us, and the digest is offered as a reference to quote.
 */
export default function AppSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in an app page:", error);
  }, [error]);

  return (
    <div className="card pad" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>This page did not load</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 6px" }}>
        Something failed at our end, not at yours. <b>Nothing you have already solved is
        affected</b> — your progress is stored separately from anything on this screen.
      </p>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 18px" }}>
        It is often temporary. Try it again first.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={reset}>Try again</button>
        <Link className="btn" href="/dashboard">Go to the dashboard</Link>
        <Link className="btn" href="/learn">Open a lesson</Link>
      </div>
      {error.digest && (
        <p style={{ color: "var(--ink-faint)", fontSize: 12, margin: "16px 0 0" }}>
          If you report this, quote <code>{error.digest}</code>.
        </p>
      )}
    </div>
  );
}
