import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const ORDER = ["Easy", "Medium", "Hard", "Super Hard"] as const;
const diffClass = (d: string) =>
  d === "Medium" ? "medium" : d === "Hard" ? "hard" : d === "Super Hard" ? "superhard" : "";
const dotColor = (d: string) =>
  d === "Medium" ? "var(--accent)" : d === "Hard" ? "var(--bad)" : d === "Super Hard" ? "#6D4BD1" : "var(--good)";

export default async function PracticeList() {
  // Open to visitors: the problem list and the editor are readable and runnable
  // without an account. Only "solved" ticks and XP need one.
  const user = await getCurrentUser();
  const problems = await prisma.problem.findMany({
    include: { lesson: true },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
  const solved = user
    ? await prisma.submission.findMany({
        where: { userId: user.id, passed: true }, distinct: ["problemId"],
      })
    : [];
  const solvedIds = new Set(solved.map((s) => s.problemId));

  const groups = ORDER.map((d) => ({ d, items: problems.filter((p) => p.difficulty === d) })).filter((g) => g.items.length);

  return (
    <>
      <p className="page-intro">
        {problems.length} problems, arranged by difficulty — start at Easy and climb to Super Hard.
        Every problem is checked against test cases in a real Python compiler. 🎯
      </p>

      {groups.map((g) => (
        <div className="diff-group" key={g.d}>
          <div className="diff-group-head">
            <span className="diff-dot" style={{ background: dotColor(g.d) }} />
            <h2>{g.d}</h2>
            <span className="cnt">{g.items.filter((p) => solvedIds.has(p.id)).length} / {g.items.length} solved</span>
          </div>
          {/* No inline grid-template-columns here: .arena already sets two
              columns, and an inline copy beat the "@media (max-width:560px)"
              rule that collapses them — so on a phone the cards stayed in two
              columns, each one wider than half the screen, and the whole page
              scrolled sideways. */}
          <div className="arena">
            {g.items.map((p) => (
              <Link key={p.id} href={`/practice/${p.slug}`} className="pcard">
                <div className="top">
                  <div className="ic py"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg></div>
                  <h3>{p.title}<small>{p.lesson ? p.lesson.title : "Python"}</small></h3>
                </div>
                <div className="foot" style={{ marginTop: 12 }}>
                  <span className={`diff ${diffClass(p.difficulty)}`}>{p.difficulty}</span>
                  {p.tagsCsv.split(",").filter(Boolean).slice(0, 1).map((t) => <span key={t} className="tag">{t}</span>)}
                  <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11.5, color: solvedIds.has(p.id) ? "var(--good)" : "var(--ink-faint)" }}>
                    {solvedIds.has(p.id) ? "✓ solved" : `+${p.xp} XP`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
