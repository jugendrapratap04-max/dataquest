import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getProgress } from "@/lib/progress";

function SealIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M8.5 12 7 22l5-3 5 3-1.5-10" /></svg>);
}

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { tracks } = await getProgress(user.id);

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
      {/* Topbar already says what certificates are — only add what it can't. */}
      <p className="page-intro">
        {earnedCount > 0
          ? <>Abhi tak <b>{earnedCount} earned</b> 🎉 — resume aur LinkedIn pe daal sakte ho.</>
          : <>Abhi ek bhi earned nahi. Pehla certificate paas hi hai — Python track poora karo!</>}
      </p>
      <div className="certs">
        {cards.map(({ t, state }) => (
          <div key={t.id} className={`cert-card ${state}`}>
            <div className="cert-seal"><SealIcon /></div>
            <div className="eyebrow">Certificate</div>
            <h3>{t.shortTitle}</h3>
            <div className="sub2">Data Science Track · DataMarg</div>
            {state === "earned" && (
              <div className="cert-earned">
                <span className="cert-status on">✓ Earned</span>
                <Link className="btn btn-primary cert-get" href={`/certificates/${t.slug}`}>Certificate dekho →</Link>
              </div>
            )}
            {(state === "prog" || state === "new") && (
              <div className="cert-prog">
                <span className={`cert-status ${state === "new" ? "lock" : "prog"}`}>
                  {state === "new" ? "○ Shuru nahi kiya" : "● In progress"}
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
