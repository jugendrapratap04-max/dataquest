"use client";

import { useMemo, useState } from "react";

type Project = { title: string; desc: string };
type Data = {
  fullName: string; role: string; email: string; phone: string; linkedin: string;
  summary: string; skills: string; education: string; projects: Project[];
};

const CORE = ["python", "sql", "pandas", "machine learning", "statistics", "numpy", "excel", "visualization", "tableau", "power bi", "scikit"];
const VERBS = ["built", "analyzed", "developed", "designed", "created", "improved", "predicted", "cleaned", "visualized", "deployed", "automated", "trained"];

function scoreResume(d: Data) {
  const checks: { ok: boolean; label: string; tip: string; weight: number }[] = [];
  const add = (ok: boolean, label: string, tip: string, weight: number) => checks.push({ ok, label, tip, weight });

  const email = /\S+@\S+\.\S+/.test(d.email);
  const phone = d.phone.replace(/\D/g, "").length >= 10;
  add(email && phone && d.linkedin.trim().length > 3, "Contact info complete", "Email, phone aur LinkedIn — teeno daalo.", 15);
  add(d.role.trim().length > 2, "Professional title", "Ek clear title likho (jaise 'Data Analyst').", 5);

  const sw = d.summary.trim().split(/\s+/).filter(Boolean).length;
  add(sw >= 15 && sw <= 70, "Focused summary (15–70 words)", "2–3 line ka crisp summary likho.", 10);

  const skills = d.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  add(skills.length >= 6, "6+ skills listed", "Kam se kam 6 relevant skills.", 15);

  const text = (d.summary + " " + d.skills).toLowerCase();
  const matched = CORE.filter((k) => skills.some((s) => s.includes(k)) || text.includes(k));
  add(matched.length >= 4, `Core DS keywords (${matched.length} mile)`, "Python, SQL, Pandas, ML, Statistics jaise keywords daalo.", 15);

  const projs = d.projects.filter((p) => p.title.trim());
  add(projs.length >= 2, "2+ projects", "Kam se kam 2 projects — portfolio ka proof.", 15);

  const allDesc = projs.map((p) => p.desc.toLowerCase()).join(" ");
  add(VERBS.some((v) => allDesc.includes(v)), "Action verbs used", "Projects 'Built / Analyzed / Developed' se shuru karo.", 10);

  const quantified = /\d+\s?%|\b\d{2,}\b|\baccuracy\b/i.test(allDesc + " " + d.summary);
  add(quantified, "Quantified impact", "Numbers daalo — '95% accuracy', '10k rows'.", 10);

  add(d.education.trim().length > 3, "Education listed", "Apni degree / education add karo.", 5);

  const score = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  return { score, checks, matched };
}

export function ResumeBuilder({ name, role }: { name: string; role: string }) {
  // Your saved title, so the resume starts from what your profile actually says
  // rather than a hardcoded one. Changing it here can be saved back (it's the
  // only place the role was ever editable).
  const [savedRole, setSavedRole] = useState(role);
  const [savingRole, setSavingRole] = useState(false);
  const [d, setD] = useState<Data>({
    fullName: name || "Jugendra Pratap",
    role: role || "Aspiring Data Analyst",
    email: "you@email.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/you",
    summary: "Aspiring Data Analyst with strong Python, SQL and Pandas skills. Built end-to-end data projects and comfortable turning messy data into clear, actionable insights.",
    skills: "Python, SQL, Pandas, NumPy, Statistics, Data Visualization, Excel, Machine Learning",
    education: "B.Tech, Computer Science — 2026",
    projects: [
      { title: "Sales Dashboard EDA", desc: "Cleaned a 10k-row messy dataset and built an EDA report that surfaced 5 key sales trends using Pandas & Matplotlib." },
      { title: "Churn Prediction Model", desc: "Developed an end-to-end ML model predicting customer churn with 88% accuracy using scikit-learn." },
      { title: "", desc: "" },
    ],
  });

  const { score, checks, matched } = useMemo(() => scoreResume(d), [d]);
  const set = (k: keyof Data, v: string) => setD((p) => ({ ...p, [k]: v }));

  async function saveRole() {
    setSavingRole(true);
    const r = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: d.role }),
    }).then((x) => x.json()).catch(() => null);
    setSavingRole(false);
    if (r?.ok) setSavedRole(r.role);
  }
  const setProj = (i: number, k: keyof Project, v: string) =>
    setD((p) => ({ ...p, projects: p.projects.map((pr, idx) => (idx === i ? { ...pr, [k]: v } : pr)) }));

  const band = score >= 75 ? "good" : score >= 50 ? "warn" : "bad";
  const bandColor = band === "good" ? "var(--good)" : band === "warn" ? "var(--accent)" : "var(--bad)";
  const verdict = score >= 75 ? "Shabaash — ATS-ready! 🎉" : score >= 50 ? "Theek hai, thoda aur polish karo." : "Abhi kaam baaki hai — tips follow karo.";

  const skillList = d.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const projList = d.projects.filter((p) => p.title.trim());

  return (
    <div className="resume-grid">
      {/* form */}
      <div className="card pad rb-form">
        <div className="sec-head"><h2>Apni details bharo</h2></div>
        <div className="rb-field"><label>Full name</label><input className="auth-input" value={d.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
        <div className="rb-field">
          <label>Title / Role</label>
          <input className="auth-input" value={d.role} onChange={(e) => set("role", e.target.value)} />
          {d.role.trim() && d.role.trim() !== savedRole && (
            <button type="button" className="rb-saverole" onClick={saveRole} disabled={savingRole}>
              {savingRole ? "Save ho raha…" : "↑ Ye title profile me bhi save karo"}
            </button>
          )}
        </div>
        <div className="rb-row">
          <div className="rb-field"><label>Email</label><input className="auth-input" value={d.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="rb-field"><label>Phone</label><input className="auth-input" value={d.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>
        <div className="rb-field"><label>LinkedIn</label><input className="auth-input" value={d.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></div>
        <div className="rb-field"><label>Summary</label><textarea className="auth-input" rows={3} value={d.summary} onChange={(e) => set("summary", e.target.value)} /></div>
        <div className="rb-field"><label>Skills (comma se alag)</label><textarea className="auth-input" rows={2} value={d.skills} onChange={(e) => set("skills", e.target.value)} /></div>
        <div className="rb-field"><label>Education</label><input className="auth-input" value={d.education} onChange={(e) => set("education", e.target.value)} /></div>
        <div className="sec-head" style={{ margin: "8px 0 10px" }}><h2 style={{ fontSize: 13 }}>Projects</h2></div>
        {d.projects.map((p, i) => (
          <div className="rb-proj" key={i}>
            <input className="auth-input" placeholder={`Project ${i + 1} title`} value={p.title} onChange={(e) => setProj(i, "title", e.target.value)} />
            <textarea className="auth-input" rows={2} placeholder="Kya banaya + result (action verb + number)" value={p.desc} onChange={(e) => setProj(i, "desc", e.target.value)} />
          </div>
        ))}
      </div>

      {/* ATS + preview */}
      <div className="rb-right">
        <div className="card pad">
          <div className="sec-head"><h2>ATS Score<span className="sub">machine kaise padhti hai</span></h2></div>
          <div className="ats-top">
            <div className="ats-ring" style={{ background: `conic-gradient(${bandColor} ${score * 3.6}deg, var(--panel-2) 0)` }}>
              <div className="ats-inner"><b style={{ color: bandColor }}>{score}</b><span>/ 100</span></div>
            </div>
            <div className="ats-verdict"><b>{verdict}</b><p>Ye tumhara resume ATS software (jo companies use karti hain) me kaisa perform karega uska estimate hai.</p></div>
          </div>
          <ul className="ats-list">
            {checks.map((c, i) => (
              <li key={i} className={c.ok ? "ok" : "no"}>
                <span className="ai">{c.ok ? "✓" : "✕"}</span>
                <span className="al">{c.label}{!c.ok && <em> — {c.tip}</em>}</span>
                <span className="aw">+{c.weight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card pad">
          <div className="sec-head"><h2>Live Preview<span className="sub">print / PDF ready</span></h2></div>
          <div className="rsm">
            <div className="rsm-head">
              <h1>{d.fullName || "Your Name"}</h1>
              <div className="rsm-role">{d.role}</div>
              <div className="rsm-contact">{[d.email, d.phone, d.linkedin].filter(Boolean).join("  ·  ")}</div>
            </div>
            {d.summary && <><div className="rsm-h">Summary</div><p className="rsm-p">{d.summary}</p></>}
            {skillList.length > 0 && <><div className="rsm-h">Skills</div><div className="rsm-skills">{skillList.map((s, i) => <span key={i} className={matched.includes(s.toLowerCase()) ? "hit" : ""}>{s}</span>)}</div></>}
            {projList.length > 0 && <><div className="rsm-h">Projects</div>{projList.map((p, i) => <div key={i} className="rsm-proj"><b>{p.title}</b>{p.desc && <span>{p.desc}</span>}</div>)}</>}
            {d.education && <><div className="rsm-h">Education</div><p className="rsm-p">{d.education}</p></>}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
            Download / Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
