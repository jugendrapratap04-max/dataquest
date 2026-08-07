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
  // The nearest finish line, rather than "finish the Python track!" said to
  // someone who is 91% through HTML. Only started-and-unfinished subjects
  // qualify — a subject at 0% is not close to anything.
  const closest = cards
    .filter((c) => c.state === "prog")
    .sort((a, b) => b.t.pct - a.t.pct)[0]?.t;

  return (
    <>
      {!user && <GuestBanner what="Certificates you can earn, once there is a name to put on them" />}
      {/* Topbar already says what certificates are — only add what it can't. */}
      <p className="page-intro">
        {!user
          ? <>These are the certificates the platform issues. Finish a subject and yours is generated automatically.</>
          : earnedCount > 0
          ? <><b>{earnedCount} earned</b> so far 🎉 — put them on your resume and LinkedIn.</>
          : closest
          ? <>None earned yet — <b>{closest.shortTitle}</b> is your closest at {closest.pct}%. Finish it and the certificate is issued automatically.</>
          : <>None earned yet. Finish any subject and its certificate is issued automatically, with your name on it.</>}
      </p>
      <div className="certs">
        {cards.map(({ t, state }) => (
          <div key={t.id} className={`cert-card ${state}`}>
            <div className="cert-seal"><SealIcon /></div>
            <div className="eyebrow">Certificate</div>
            <h3>{t.shortTitle}</h3>
            {/* This said "Data Science Track" on every card — including HTML
                and the 8085 microprocessor course. The subject names itself. */}
            <div className="sub2">{t.shortTitle} · Etudo</div>
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
