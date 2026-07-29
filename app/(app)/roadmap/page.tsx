import { getCurrentUser } from "@/lib/session";
import { getProgress } from "@/lib/progress";
import { PhaseList, type Phase } from "@/components/PhaseList";

export default async function RoadmapPage() {
  // Open to visitors — the roadmap is the clearest picture of what's on offer,
  // so it should be visible before signing up. A guest id matches no progress
  // rows, which is exactly the view a guest should get: every track at 0%.
  const user = await getCurrentUser();

  const { tracks } = await getProgress(user?.id ?? "__guest__");

  const phases: Phase[] = tracks.map((t) => ({
    id: t.id, slug: t.slug, order: t.order, title: t.title, subtitle: t.subtitle, status: t.status,
    weeks: t.weeks, level: t.level, whyText: t.whyText, milestone: t.milestone,
    toolsCsv: t.toolsCsv, skills: t.skills,
    firstLesson: t.firstLesson, pct: t.pct,
  }));

  // Counted from the database, so these can only ever say what is really there.
  // The row they replaced advertised "~10 mo" and a target job title, neither of
  // which anybody could check and neither of which was ours to promise.
  const ready = tracks.filter((t) => t.status !== "locked").length;
  const totalLessons = tracks.reduce((n, t) => n + t.totalLessons, 0);
  const totalProblems = tracks.reduce((n, t) => n + t.totalProblems, 0);

  return (
    <>
      <section className="hero">
        <div className="pad">
          <div className="eyebrow">The Skill Sheet</div>
          <h1>Every skill, in the order that works</h1>
          {/* No salary figures and no job promise. We can be held to what we
              teach; we cannot be held to what somebody is paid afterwards, and
              a number we cannot stand behind is worth less than none. */}
          <p>Nine subjects, each built the same way: <b>understand it, practise it, then build something real with it</b> — that is what makes it stick. What you get from us is the skill and the evidence you have it. What you do with that is yours.</p>
          <div className="method">
            <span className="mstep"><b>1</b> Learn</span><span className="farrow" style={{color:"#5A6478"}}>→</span>
            <span className="mstep"><b>2</b> Practice</span><span className="farrow" style={{color:"#5A6478"}}>→</span>
            <span className="mstep"><b>3</b> Project</span><span className="farrow" style={{color:"#5A6478"}}>→</span>
            <span className="mstep"><b>4</b> Repeat</span>
          </div>
        </div>
      </section>

      <section className="ov">
        <div className="card ovc"><div className="k">Subjects</div><div className="v">{tracks.length}</div></div>
        <div className="card ovc"><div className="k">Ready now</div><div className="v">{ready}</div></div>
        <div className="card ovc"><div className="k">Lessons</div><div className="v">{totalLessons}</div></div>
        <div className="card ovc"><div className="k">Practice problems</div><div className="v">{totalProblems}</div></div>
      </section>

      {/* The two career cards that sat here — "Data Analyst ₹4-8 LPA" and "Data
          Scientist / ML Engineer ₹8-15 LPA" — are gone. They read as a promise
          about somebody's salary, which is not a thing a course can promise and
          not a thing this one is trying to sell. What replaces them is the same
          claim made honestly: here is what you will actually have. */}
      <section className="ov" style={{ marginTop: -6 }}>
        <div className="card ovc" style={{ gridColumn: "1 / -1", textAlign: "left" }}>
          <div className="k">What you come out with</div>
          {/* Only things that exist. An earlier draft of this line promised "9
              portfolio projects", which /projects openly says are not built yet
              — swapping one unbacked promise for another. */}
          <div className="v" style={{ fontSize: "13.5px", fontWeight: 500, lineHeight: 1.6 }}>
            {totalProblems} practice problems, each checked against real Python or SQL the moment you
            submit, and a certificate for every subject you finish. We teach the skill and show the
            evidence for it — where you take that is up to you.
          </div>
        </div>
      </section>

      <PhaseList phases={phases} />

      <div className="footer"><span className="mono">DataMarg</span> — learn it, practise it, then build with it. 💪</div>
    </>
  );
}
