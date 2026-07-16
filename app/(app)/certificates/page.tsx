import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

function SealIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M8.5 12 7 22l5-3 5 3-1.5-10" /></svg>);
}

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { include: { problems: { select: { id: true } } } } },
  });

  const doneLessons = new Set(
    (await prisma.lessonProgress.findMany({ where: { userId: user.id, status: "done" }, select: { lessonId: true } })).map((d) => d.lessonId)
  );
  const solved = new Set(
    (await prisma.submission.findMany({ where: { userId: user.id, passed: true }, distinct: ["problemId"], select: { problemId: true } })).map((s) => s.problemId)
  );

  const cards = tracks.map((t) => {
    const totalLessons = t.lessons.length;
    const totalProblems = t.lessons.reduce((n, l) => n + l.problems.length, 0);
    const total = totalLessons + totalProblems;
    if (total === 0) return { t, state: "soon" as const, pct: 0 };
    const lessonsDone = t.lessons.filter((l) => doneLessons.has(l.id)).length;
    const problemsDone = t.lessons.reduce((n, l) => n + l.problems.filter((p) => solved.has(p.id)).length, 0);
    const pct = Math.round(((lessonsDone + problemsDone) / total) * 100);
    return { t, state: pct >= 100 ? ("earned" as const) : ("prog" as const), pct, lessonsDone, totalLessons, problemsDone, totalProblems };
  });

  const earnedCount = cards.filter((c) => c.state === "earned").length;

  return (
    <>
      <p className="page-intro">
        Har track complete karke ek certificate kamaao — apni mehnat ka proof, jo resume aur LinkedIn pe daal sako.
        {earnedCount > 0 ? <> Abhi tak <b>{earnedCount} earned</b> 🎉</> : <> Pehla certificate paas hi hai — Python track poora karo!</>}
      </p>
      <div className="certs">
        {cards.map((c) => {
          const name = c.t.title.split(" — ")[0].replace("Programming Foundations", "Python");
          return (
            <div key={c.t.id} className={`cert-card ${c.state}`}>
              <div className="cert-seal"><SealIcon /></div>
              <div className="eyebrow">Certificate</div>
              <h3>{name}</h3>
              <div className="sub2">Data Science Track · DataQuest</div>
              {c.state === "earned" && <span className="cert-status on">✓ Earned</span>}
              {c.state === "prog" && (
                <div className="cert-prog">
                  <span className="cert-status prog">● In progress</span>
                  <div className="pbar"><i style={{ width: `${c.pct}%` }} /></div>
                  <div className="cert-meta">{c.pct}% done · {c.lessonsDone}/{c.totalLessons} lessons · {c.problemsDone}/{c.totalProblems} problems</div>
                </div>
              )}
              {c.state === "soon" && <span className="cert-status lock">🔒 Coming soon</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
