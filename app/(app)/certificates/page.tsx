import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getProgress } from "@/lib/progress";
import { GuestBanner } from "@/components/GuestBanner";

function SealIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M8.5 12 7 22l5-3 5 3-1.5-10" /></svg>);
}

export default async function CertificatesPage() {
  // Open to guests: seeing what a certificate is for, and what it takes to earn
  // one, is the argument for signing up. Issuing one still needs an account —
  // that is /certificates/[slug], which stays gated because a certificate has a
  // name on it.
  const user = await getCurrentUser();
  const { tracks } = await getProgress(user?.id ?? "__guest__");

  const cards = tracks.map((t) => {
    const state =
      t.totalLessons + t.totalProblems === 0 ? ("soon" as const)
      : t.pct >= 100 ? ("earned" as const)
      : t.pct === 0 ? ("new" as const)
      : ("prog" as const);
    return { t, state };
  });

  const earnedCount = cards.filter((c) => c.state === "earned").length;

  return (
    <>
      {!user && <GuestBanner what="Certificates you can earn, once there is a name to put on them" />}
      {/* Topbar already says what certificates are — only add what it can't. */}
      <p className="page-intro">
        {!user
          ? <>These are the certificates the platform issues. Finish a subject and yours is generated automatically.</>
          : earnedCount > 0
          ? <><b>{earnedCount} earned</b> so far 🎉 — put them on your resume and LinkedIn.</>
          : <>None earned yet. The first one is close — finish the Python track!</>}
      </p>
      <div className="certs">
        {cards.map(({ t, state }) => (
          <div key={t.id} className={`cert-card ${state}`}>
            <div className="cert-seal"><SealIcon /></div>
            <div className="eyebrow">Certificate</div>
            <h3>{t.shortTitle}</h3>
            <div className="sub2">Data Science Track · Etudo</div>
            {state === "earned" && (
              <div className="cert-earned">
                <span className="cert-status on">✓ Earned</span>
                <Link className="btn btn-primary cert-get" href={`/certificates/${t.slug}`}>View certificate →</Link>
              </div>
            )}
            {(state === "prog" || state === "new") && (
              <div className="cert-prog">
                <span className={`cert-status ${state === "new" ? "lock" : "prog"}`}>
                  {state === "new" ? "○ Not started" : "● In progress"}
                </span>
                <div className="pbar"><i style={{ width: `${t.pct}%` }} /></div>
                <div className="cert-meta">{t.pct}% done · {t.lessonsDone}/{t.totalLessons} lessons · {t.problemsDone}/{t.totalProblems} problems</div>
              </div>
            )}
            {state === "soon" && <span className="cert-status lock">🔒 Coming soon</span>}
          </div>
        ))}
      </div>
    </>
  );
}
