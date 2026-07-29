"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/duration";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { runSql, type ResultSet, type SqlRunResult } from "@/lib/sql-runner";
import { readSchema } from "@/lib/sql-schema";
import { Celebrate } from "@/components/Celebrate";

export type SqlProblemData = {
  id: string; title: string; difficulty: string; tags: string[];
  descriptionMd: string; examples: { input: string; output: string }[];
  starterCode: string; solutionCode: string; sqlSetup: string;
  hints: string[]; xp: number; recap: string; lessonSlug?: string; nextSlug?: string | null;
  // Same three as the Python workbench — a SQL problem is a problem, and a
  // student who solved one and came back deserves the same answer to "have I
  // done this?" that a Python one gives them.
  alreadySolved?: boolean;
  savedCode?: string | null;
  bestSeconds?: number | null;
};

function mdLite(md: string) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="kbd">$1</code>')
    .split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
}

const cell = (v: unknown) =>
  v === null || v === undefined ? <span className="nul">NULL</span> : String(v);

function Grid({ rs, cap }: { rs: ResultSet; cap?: string }) {
  if (!rs.columns.length) return <div className="sqlt-empty">No columns were returned.</div>;
  return (
    <>
      {cap && <div className="sqlt-cap">{cap}</div>}
      <div className="sqlt-wrap">
        <table className="sqlt">
          <thead>
            <tr>{rs.columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rs.rows.length === 0 ? (
              <tr><td colSpan={rs.columns.length} style={{ color: "#6B7688" }}>— 0 rows —</td></tr>
            ) : (
              rs.rows.slice(0, 50).map((r, i) => (
                <tr key={i}>{r.map((v, j) => <td key={j}>{cell(v)}</td>)}</tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rs.rows.length > 50 && <div className="sqlt-cap" style={{ marginTop: 6 }}>…aur {rs.rows.length - 50} rows</div>}
    </>
  );
}

export function SqlWorkbench({ p }: { p: SqlProblemData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"desc" | "hint" | "recap">("desc");
  const [sql, setSql] = useState(p.savedCode || p.starterCode);
  const [elapsed, setElapsed] = useState(0);
  const [bestSeconds, setBestSeconds] = useState<number | null>(p.bestSeconds ?? null);
  const [result, setResult] = useState<SqlRunResult | null>(null);
  const [resTab, setResTab] = useState<"out" | "expected">("out");
  const [busy, setBusy] = useState<null | "run" | "submit">(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [noPaste, setNoPaste] = useState(false);
  // Shown when the server's re-check disagrees with the browser, or the submit
  // didn't save — so a rejected solve never reads as a silent 0 XP.
  const [submitNote, setSubmitNote] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const schema = readSchema(p.sqlSetup);

  // Clock and autosave — see the longer notes on the same pair in
  // PracticeWorkbench. Identical behaviour on purpose: the student should not
  // have to learn which subjects remember their work.
  useEffect(() => {
    if (p.alreadySolved) return;
    const id = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [p.alreadySolved]);

  useEffect(() => {
    if (sql === p.starterCode && !p.savedCode) return;
    const id = setTimeout(() => {
      void fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: p.id, code: sql }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(id);
  }, [sql, p.id, p.starterCode, p.savedCode]);

  function flashNoPaste() {
    setNoPaste(true);
    setTimeout(() => setNoPaste(false), 1900);
  }

  function handleMount(editor: any, monaco: any) {
    // No copy-paste — the student has to type it, which is the point.
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
    setResTab("out");
    setSubmitNote(null);
    setNeedsLogin(false);
    try {
      const r = await runSql(sql, p.sqlSetup, p.solutionCode);
      setResult(r);
      if (submit) {
        const resp = await fetch("/api/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: p.id, code: sql, passed: r.pass }),
        }).catch(() => null);
        const res = resp ? await resp.json().catch(() => null) : null;
        // Celebrate only when the server confirms — it re-runs the query itself.
        if (!r.pass) {
          // the output/expected panels already show the mismatch
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
      setResult({ ok: false, pass: false, ordered: false, error: String(e) });
    } finally {
      setBusy(null);
    }
  }

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
                  query is loaded below. Solving it again earns no further XP — it is here to practise on.
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

              <div className="sql-side">
                <h4>Tables you can use</h4>
                {schema.map((t) => (
                  <div className="sql-tbl" key={t.name}>
                    <div className="nm">{t.name}</div>
                    <div className="cols">{t.cols.map((c, i) => {
                      const [n, ty] = c.split(" ");
                      return <div key={i}>{n} <span>{ty}</span></div>;
                    })}</div>
                  </div>
                ))}
              </div>
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
            <span className="ed-lang"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg> SQLite</span>
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
              height="240px" defaultLanguage="sql" theme="vs-dark" value={sql}
              onChange={(v) => setSql(v ?? "")} onMount={handleMount}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12 }, tabSize: 2, contextmenu: false }}
              loading={<div style={{ color: "#8890A0", padding: 20, fontFamily: "var(--mono)", fontSize: 13 }}>Loading the editor…</div>}
            />
            {noPaste && <div className="paste-toast">✋ Paste is off — type it out, that is how it sticks!</div>}
          </div>

          <div className="results">
            <div className="res-tabs">
              <button className={`res-tab${resTab === "out" ? " active" : ""}`} onClick={() => setResTab("out")}>Your Output</button>
              <button className={`res-tab${resTab === "expected" ? " active" : ""}`} onClick={() => setResTab("expected")}>Expected</button>
            </div>
            <div className="res-body">
              {needsLogin && (
                <div className="submit-note login">
                  ✅ Solved! <Link href="/signup">Create a free account</Link> or <Link href="/login">log in</Link> to save your progress and earn XP.
                </div>
              )}
              {submitNote && <div className="submit-note">⚠ {submitNote}</div>}
              {resTab === "out" && (
                !result ? (
                  <div className="res-empty">▶ Press &quot;Run&quot; — the SQL engine takes a second to load the first time, then it is instant.</div>
                ) : result.error ? (
                  <>
                    <div className="verdict no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> Your query has an error</div>
                    <div className="console-out">{result.error}</div>
                  </>
                ) : (
                  <>
                    <div className={`verdict ${result.pass ? "ok" : "no"}`}>
                      {result.pass
                        ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg> Correct — the result matches exactly</>
                        : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> {result.reason}</>}
                    </div>
                    {result.got && <Grid rs={result.got} cap={`${result.got.rows.length} row${result.got.rows.length === 1 ? "" : "s"}${result.ordered ? " · order check on (ORDER BY)" : ""}`} />}
                  </>
                )
              )}
              {resTab === "expected" && (
                !result?.expected
                  ? <div className="res-empty">Press &quot;Run&quot; first — the expected result appears here.</div>
                  : <Grid rs={result.expected} cap={`It should look like this — ${result.expected.rows.length} row${result.expected.rows.length === 1 ? "" : "s"}`} />
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
