import Link from "next/link";

/**
 * Shown at the top of a page a signed-out visitor is allowed to look around.
 *
 * These pages used to redirect guests straight to /login, which meant the only
 * thing anyone could see before creating an account was a marketing page and a
 * form. The measured cost of that was 12 of 14 real signups never opening a
 * single lesson: people were being asked to commit before they had seen
 * anything worth committing to.
 *
 * So the rule is now: **you can look at everything, you sign in to keep it.**
 * A page that holds nothing but the visitor's own data — their notes, their
 * focus session, a room they would appear inside — still requires an account,
 * because there is genuinely nothing there to show a stranger.
 *
 * One component rather than a banner per page, so the promise is worded
 * identically everywhere and there is one place to change it.
 */
export function GuestBanner({ what }: { what: string }) {
  return (
    <section className="card pad guest-banner">
      <div className="eyebrow">You&apos;re exploring as a guest</div>
      <h3>{what}</h3>
      <p>
        Look around as much as you like — none of this is behind a wall. An account is what
        makes it <b>yours</b>: it remembers the lessons you finish, checks your code and pays
        the XP, and opens certificates, notes and study rooms.
      </p>
      <div className="gb-cta">
        <Link className="btn btn-primary" href="/signup">Create free account →</Link>
        <Link className="btn btn-ghost" href="/login">I have an account</Link>
      </div>
    </section>
  );
}
