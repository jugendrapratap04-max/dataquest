import Link from "next/link";

/* Shared frame for the three public policy pages. They live outside the (app)
 * route group on purpose: a visitor has to be able to read what they are
 * agreeing to before they have an account. */

export const LEGAL_UPDATED = "29 July 2026";
export const GRIEVANCE_EMAIL = "jugendrapratap04@gmail.com";

const TABS = [
  { href: "/guidelines", label: "Community Guidelines" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function LegalShell({ title, current, children }: { title: string; current: string; children: React.ReactNode }) {
  return (
    <div className="legal">
      <header className="legal-top">
        <Link href="/" className="legal-brand"><span className="mono">Etudo</span></Link>
        <Link href="/" className="legal-back">← Back to site</Link>
      </header>

      <nav className="legal-tabs">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={t.href === current ? "on" : ""}>{t.label}</Link>
        ))}
      </nav>

      <article className="legal-body">
        <h1>{title}</h1>
        <p className="legal-date">Last updated {LEGAL_UPDATED}</p>
        {children}

        <section className="legal-grievance">
          <h2>Grievance Officer</h2>
          <p>
            If you have a complaint about anything on Etudo — another user&apos;s behaviour, your
            own data, or content you believe should not be here — write to the Grievance Officer.
            We acknowledge complaints within 24 hours and aim to resolve them within 15 days.
          </p>
          <p className="legal-contact">
            <b>Jugendra Pratap</b><br />
            Grievance Officer, Etudo<br />
            <a href={`mailto:${GRIEVANCE_EMAIL}`}>{GRIEVANCE_EMAIL}</a>
          </p>
        </section>
      </article>

      <footer className="legal-foot">
        <span className="mono">Etudo</span> · <Link href="/guidelines">Guidelines</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
