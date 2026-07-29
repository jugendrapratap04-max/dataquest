import Link from "next/link";
import type { Metadata } from "next";

// Until this file existed, a wrong slug rendered Next's built-in 404: no logo,
// no navigation, no link home. Four routes call notFound() (a lesson, a problem,
// a book track, a certificate), and every one of them was a dead end you could
// only leave with the browser's back button.
//
// Reuses the auth card's classes so it needs no CSS of its own and still looks
// like the rest of the site.

export const metadata: Metadata = {
  title: "Page not found — DataMarg",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="mark">D</div>
          <div><span className="wm">DataMarg</span></div>
        </div>
        <h1>This page does not exist</h1>
        <p className="sub">
          The link may be old, or the lesson may have been renamed. Nothing is lost —
          pick up from any of these.
        </p>
        <Link className="btn btn-primary auth-btn" href="/learn">Go to the lessons →</Link>
        <p className="auth-legal">
          Or try <Link href="/practice">practice problems</Link>,{" "}
          <Link href="/book">the free notes</Link>, or{" "}
          <Link href="/dashboard">your dashboard</Link>.
        </p>
      </div>
    </div>
  );
}
