"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { formatDuration } from "@/lib/duration";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { grade, hex2, hex4, type AsmTest, type GradeResult } from "@/lib/asm8085";
import { Celebrate } from "@/components/Celebrate";

/* The practice editor for 8085 assembly.
 *
 * It is a sibling of PracticeWorkbench (Python) and SqlWorkbench (SQL), and the
 * shape is deliberately the same: same tabs, same Run and Submit, same no-paste
 * rule, same autosave, same celebration. A student who has solved a Python
 * problem here should not have to learn a new screen.
 *
 * Two things are specific to assembly and both come from what a program leaves
 * behind rather than what it returns:
 *
 *   - There is no return value. A test names the state it judges — a register, a
 *     flag, a byte of memory — and grading diffs the student's machine against the
 *     reference's on exactly those. So any correct program passes, including one
 *     that uses different registers from the reference.
 *   - The register and flag panel is not decoration. When a test fails, "your A
 *     is 50 and it should be F0" is the entire debugging conversation, and the
 *     T-state count is the answer to a different exam question anyway. */

export type AsmProblemData = {
  id: string; title: string; difficulty: string; tags: string[];
  descriptionMd: string; examples: { input: string; output: string }[];
  starterCode: string; solutionCode: string;
  tests: AsmTest[];
  hints: string[]; xp: number; recap: string; lessonSlug?: string; nextSlug?: string | null;
  alreadySolved?: boolean;
  savedCode?: string | null;
  bestSeconds?: number | null;
};

function mdLite(md: string) {
  // Fenced blocks are pulled out FIRST. The inline-code rule below matches any
  // pair of backticks, so a \`\`\` fence gets eaten as inline code — which leaves
  // two stray backticks visible on the page and collapses the block onto a
  // single line. That shipped on three problems before anyone looked at one.
  const blocks: string[] = [];
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const pre = (i: string) => `<pre class="md-pre"><code>${esc(blocks[Number(i)])}</code></pre>`;

  return md
    .replace(/\`\`\`[a-zA-Z]*\n([\s\S]*?)\`\`\`/g, (_m, body: string) => {
      blocks.push(body.replace(/\n$/, ""));
      return `\u0000FENCE${blocks.length - 1}\u0000`;
    })
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\`([^\`]+)\`/g, '<code class="kbd">$1</code>')
    .split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("")
    // A <pre> nested in a <p> is invalid HTML, so unwrap the paragraph the
    // placeholder ended up alone in before falling back to a bare swap.
    .replace(/<p>\s*\u0000FENCE(\d+)\u0000\s*<\/p>/g, (_m, i: string) => pre(i))
    .replace(/\u0000FENCE(\d+)\u0000/g, (_m, i: string) => pre(i));
}

const REGS = ["A", "B", "C", "D", "E", "H", "L"] as const;
const FLAGS = ["S", "Z", "AC", "P", "CY"] as const;

function Chip({ name, value }: { name: string; value: string }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        padding: "4px 7px", borderRadius: 6, background: "var(--panel-2)", border: "1px solid var(--line)",
      }}
    >
      <span style={{ fontSize: 9, letterSpacing: ".06em", color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{name}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: "var(--mono)" }}>{value}</span>
    </div>
  );
}

export function Asm8085Workbench({ p }: { p: AsmProblemData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"desc" | "hint" | "recap">("desc");
  const [code, setCode] = useState(p.savedCode || p.starterCode);
  const [elapsed, setElapsed] = useState(0);
  const [bestSeconds, setBestSeconds] = useState<number | null>(p.bestSeconds ?? null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [resTab, setResTab] = useState<"tests" | "machine">("tests");
  const [busy, setBusy] = useState<null | "run" | "submit">(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [noPaste, setNoPaste] = useState(false);
  const [submitNote, setSubmitNote] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    if (p.alreadySolved) return;
    const id = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [p.alreadySolved]);

  useEffect(() => {
    if (code === p.starterCode && !p.savedCode) return;
    const id = setTimeout(() => {
      void fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: p.id, code }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(id);
  }, [code, p.id, p.starterCode, p.savedCode]);

  /** The bytes the first test puts in memory — what the student is working on. */
  const given = useMemo(() => {
    const m = p.tests[0]?.memory ?? {};
    return Object.keys(m)
      .map(Number)
      .sort((a, b) => a - b)
      .map((a) => [a, m[a]] as const);
  }, [p.tests]);

  function flashNoPaste() {
    setNoPaste(true);
    setTimeout(() => setNoPaste(false), 1900);
  }

  function handleMount(editor: any, monaco: any) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, flashNoPaste);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV, flashNoPaste);
    const dom = editor.getDomNode?.();
    if (dom) {
      dom.addEventListener("paste", (e: ClipboardEvent) => { e.preventDefault(); e.stopPropagation(); flashNoPaste(); }, true);
      dom.addEventListener("drop", (e: DragEvent) => { e.preventDefault(); flashNoPaste(); }, true);
    }
  }

  async function doRun(submit: boolean) {
    setBusy(submit ? "submit" : "run");
    setResult(null);
    setResTab("tests");
    setSubmitNote(null);
    setNeedsLogin(false);
    try {
      // No engine to load — the simulator is already in the bundle, so this is
      // instant. The same `grade` runs on the server when Submit is pressed.
      const r = grade(code, p.solutionCode, p.tests);
      setResult(r);
      const pass = r.compiled && !r.referenceBroken && r.passed === r.total && r.total > 0;
      if (submit) {
        const resp = await fetch("/api/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: p.id, code, passed: pass }),
        }).catch(() => null);
        const res = resp ? await resp.json().catch(() => null) : null;
        if (!pass) {
          // the test panel already shows which state did not match
        } else if (resp?.status === 401) {
          setNeedsLogin(true);
        } else if (!res?.ok) {
          setSubmitNote("Submission did not save — check your connection and press Submit again.");
        } else if (res.verifyNote) {
          setSubmitNote(`The server could not verify this: ${res.verifyNote}`);
        } else {
          if (typeof res.solvedSeconds === "number") setBestSeconds(res.solvedSeconds);
          setCelebrate(res.awardedXp ?? 0);
        }
      }
    } catch (e) {
      setResult({ compiled: false, error: String(e), cases: [], passed: 0, total: p.tests.length });
    } finally {
      setBusy(null);
    }
  }

  const allPass = result && result.compiled && !result.referenceBroken && result.passed === result.total && result.total > 0;
  const last = result?.last;

  return (
    <>
      <div className="crumb" style={{ marginBottom: 16 }}>
        <Link href="/practice">← Practice</Link> / <b>{p.title}</b>
        {p.lessonSlug && <> · <Link href={`/learn/${p.lessonSlug}`} style={{ color: "var(--teal)" }}>read the lesson</Link></>}
      </div>

      <div className="psplit">
        {/* problem */}
        <div className="card pad">
          <div className="ptabs">
            <button className={`ptab${tab === "desc" ? " active" : ""}`} onClick={() => setTab("desc")}>Description</button>
            <button className={`ptab${tab === "hint" ? " active" : ""}`} onClick={() => setTab("hint")}>Hints</button>
            <button className={`ptab${tab === "recap" ? " active" : ""}`} onClick={() => setTab("recap")}>Recap</button>
          </div>

          {tab === "desc" && (
            <div>
              <h1 style={{ fontSize: 20, marginBottom: 10 }}>{p.title}</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
                <span className={`diff ${p.difficulty === "Medium" ? "medium" : p.difficulty === "Hard" ? "hard" : p.difficulty === "Super Hard" ? "superhard" : ""}`}>{p.difficulty}</span>
                {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                {p.alreadySolved && <span className="solved-pill">✓ Solved</span>}
                {bestSeconds !== null && <span className="time-pill">⏱ {formatDuration(bestSeconds)}</span>}
                {!p.alreadySolved && elapsed > 0 && <span className="time-pill live">⏱ {formatDuration(elapsed)}</span>}
              </div>
              {p.alreadySolved && (
                <div className="note tip" style={{ marginBottom: 14 }}><span className="i">✓</span><div>
                  You already solved this{bestSeconds !== null ? <> in <b>{formatDuration(bestSeconds)}</b></> : null}, and your last
                  program is loaded below. Solving it again earns no further XP — it is here to practise on.
                  {p.nextSlug && <> Ready to move on? <Link href={`/practice/${p.nextSlug}`} style={{ color: "var(--teal)" }}>Next unsolved problem →</Link></>}
                </div></div>
              )}
              <div dangerouslySetInnerHTML={{ __html: mdLite(p.descriptionMd) }} />
              {p.examples.map((ex, i) => (
                <div className="ex-box" key={i}>
                  <div className="elb">Example {i + 1}</div>
                  <div className="erow"><span>Input:</span> {ex.input}</div>
                  <div className="erow"><span>Output:</span> {ex.output}</div>
                </div>
              ))}

              {given.length > 0 && (
                <div className="sql-side">
                  <h4>Memory you are given</h4>
                  <div className="sql-tbl">
                    <div className="nm">first test case</div>
                    <div className="cols">
                      {given.map(([a, v]) => (
                        <div key={a}>{hex4(a)}H <span>{hex2(v)}H</span></div>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 8 }}>
                    Your program is run against {p.tests.length} different set{p.tests.length === 1 ? "" : "s"} of
                    values, so it has to work on the data rather than on these numbers.
                  </p>
                </div>
              )}
            </div>
          )}
          {tab === "hint" && <div>{p.hints.map((h, i) => <div className="hintb" key={i}>💡 <b>Hint {i + 1}:</b> {h}</div>)}</div>}
          {tab === "recap" && (
            <div><p dangerouslySetInnerHTML={{ __html: mdLite(p.recap || "Open this topic’s lesson and read it again.") }} />
              {p.lessonSlug && <Link className="link" style={{ margin: 0, color: "var(--teal)" }} href={`/learn/${p.lessonSlug}`}>↩ Open the full lesson</Link>}
            </div>
          )}
        </div>

        {/* editor */}
        <div className="editor-wrap">
          <div className="ed-bar">
            <span className="ed-lang">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>
              8085 Assembly
            </span>
            <span className="no-paste-badge" title="Copy-paste is off — type it yourself!">🔒 no paste</span>
            <div className="ed-actions">
              <button className="btn btn-run" onClick={() => doRun(false)} disabled={busy !== null}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {busy === "run" ? "Running…" : "Run"}
              </button>
              <button className="btn btn-submit" onClick={() => doRun(true)} disabled={busy !== null}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg>
                {busy === "submit" ? "Checking…" : "Submit"}
              </button>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <Editor
              height="260px" defaultLanguage="asm" theme="vs-dark" value={code}
              onChange={(v) => setCode(v ?? "")} onMount={handleMount}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12 }, tabSize: 8, contextmenu: false }}
              loading={<div style={{ color: "#8890A0", padding: 20, fontFamily: "var(--mono)", fontSize: 13 }}>Loading the editor…</div>}
            />
            {noPaste && <div className="paste-toast">✋ Paste is off — type it out, that is how it sticks!</div>}
          </div>

          <div className="results">
            <div className="res-tabs">
              <button className={`res-tab${resTab === "tests" ? " active" : ""}`} onClick={() => setResTab("tests")}>Test Cases</button>
              <button className={`res-tab${resTab === "machine" ? " active" : ""}`} onClick={() => setResTab("machine")}>Registers</button>
            </div>
            <div className="res-body">
              {needsLogin && (
                <div className="submit-note login">
                  ✅ Solved! <Link href="/signup">Create a free account</Link> or <Link href="/login">log in</Link> to save your progress and earn XP.
                </div>
              )}
              {submitNote && <div className="submit-note">⚠ {submitNote}</div>}

              {resTab === "tests" && (
                !result ? (
                  <div className="res-empty">▶ Press &quot;Run&quot;. The 8085 runs instantly — there is nothing to download.</div>
                ) : result.referenceBroken ? (
                  <>
                    <div className="verdict no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> This problem is broken, not your program</div>
                    <div className="console-out">{result.referenceBroken}</div>
                  </>
                ) : !result.compiled ? (
                  <>
                    <div className="verdict no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> That did not assemble</div>
                    <div className="console-out">{result.line ? `Line ${result.line}: ` : ""}{result.error}</div>
                  </>
                ) : (
                  <>
                    <div className={`verdict ${allPass ? "ok" : "no"}`}>
                      {allPass
                        ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg> All {result.total} test cases passed</>
                        : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> {result.passed} / {result.total} passed</>}
                    </div>
                    {result.cases.map((c, i) => (
                      <div key={i} className={`tcase ${c.pass ? "ok" : "no"}`}>
                        <span className="st">{c.pass ? "✓" : "✕"}</span>
                        <span className="io">
                          <b>test {i + 1}</b> → {c.error ? `⚠ ${c.error}` : c.got}
                        </span>
                        {!c.pass && !c.error && <span className="ms">expected {c.want}</span>}
                      </div>
                    ))}
                  </>
                )
              )}

              {resTab === "machine" && (
                !last || !last.ok ? (
                  <div className="res-empty">Press &quot;Run&quot; first — the registers after your program appear here.</div>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                      {REGS.map((r) => <Chip key={r} name={r} value={hex2(last.regs[r])} />)}
                      <Chip name="SP" value={hex4(last.regs.SP)} />
                      <Chip name="PC" value={hex4(last.regs.PC)} />
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {FLAGS.map((f) => <Chip key={f} name={f} value={last.flags[f] ? "1" : "0"} />)}
                      <Chip name="T-STATES" value={String(last.tStates)} />
                      <Chip name="STEPS" value={String(last.steps)} />
                    </div>
                    {Object.keys(last.memory).length > 0 && (
                      <div className="console-out" style={{ marginTop: 10 }}>
                        {Object.entries(last.memory)
                          .map(([a, v]) => `${hex4(Number(a))}: ${hex2(v)}`)
                          .join("    ")}
                      </div>
                    )}
                    <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 10 }}>
                      This is the state after the <b>last</b> test case ran. T-states is the clock count — the
                      number a delay calculation is built from.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {celebrate !== null && (
        <Celebrate
          xp={celebrate}
          onClose={() => setCelebrate(null)}
          onNext={() => router.push(p.nextSlug ? `/practice/${p.nextSlug}` : "/practice")}
          nextLabel={p.nextSlug ? "Next problem →" : "All problems →"}
        />
      )}
    </>
  );
}
