import { prisma } from "@/lib/prisma";
import { PhaseList, type Phase } from "@/components/PhaseList";

export default async function RoadmapPage() {
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, take: 1, select: { slug: true } } },
  });

  const phases: Phase[] = tracks.map((t) => ({
    id: t.id, order: t.order, title: t.title, subtitle: t.subtitle, status: t.status,
    weeks: t.weeks, level: t.level, whyText: t.whyText, milestone: t.milestone,
    toolsCsv: t.toolsCsv, skills: JSON.parse(t.skillsJson || "[]"),
    firstLesson: t.lessons[0]?.slug,
  }));

  const projects = tracks.filter((t) => t.milestone).length;

  return (
    <>
      <section className="hero">
        <div className="pad">
          <div className="eyebrow">The Skill Sheet</div>
          <h1>Data Science — Zero to ₹6–12 LPA</h1>
          <p>Ek complete industry-ready roadmap. Har skill ko <b>pehle samjho, phir practice karo, phir ek real project banao</b> — tabhi wo pakki hoti hai. Seedhe follow karo, base itna strong ban jayega ki interview me confidence khud aayega.</p>
          <div className="method">
            <span className="mstep"><b>1</b> Padho</span><span className="farrow" style={{color:"#5A6478"}}>→</span>
            <span className="mstep"><b>2</b> Practice</span><span className="farrow" style={{color:"#5A6478"}}>→</span>
            <span className="mstep"><b>3</b> Project</span><span className="farrow" style={{color:"#5A6478"}}>→</span>
            <span className="mstep"><b>4</b> Repeat</span>
          </div>
        </div>
      </section>

      <section className="ov">
        <div className="card ovc"><div className="k">Total Journey</div><div className="v">~10 mo</div></div>
        <div className="card ovc"><div className="k">Skill Phases</div><div className="v">{tracks.length}</div></div>
        <div className="card ovc"><div className="k">Projects</div><div className="v">{projects}+</div></div>
        <div className="card ovc"><div className="k">Target</div><div className="v" style={{fontSize:"13px"}}>Analyst→DS</div></div>
      </section>

      <section className="mrow">
        <div className="mcard a"><span className="flag">🎯</span><div className="role">Data Analyst</div><div className="pkg">₹4 – 8 LPA</div><div className="after">Unlocks after Phase 6 — Python, Stats, Pandas, EDA, SQL &amp; a BI tool.</div></div>
        <div className="mcard b"><span className="flag">🚀</span><div className="role">Data Scientist / ML Engineer</div><div className="pkg">₹8 – 15 LPA</div><div className="after">Unlocks after Phase 9 — ML, a specialization, deployment &amp; portfolio.</div></div>
      </section>

      <PhaseList phases={phases} />

      <div className="footer"><span className="mono">DataQuest</span> — pehle padho, phir practice karo, phir project banao. 💪</div>
    </>
  );
}
