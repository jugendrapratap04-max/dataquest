"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { runSql, type ResultSet, type SqlRunResult } from "@/lib/sql-runner";
import { Celebrate } from "@/components/Celebrate";

export type SqlProblemData = {
  id: string; title: string; difficulty: string; tags: string[];
  descriptionMd: string; examples: { input: string; output: string }[];
  starterCode: string; solutionCode: string; sqlSetup: string;
  hints: string[]; xp: number; recap: string; lessonSlug?: string;
};

function mdLite(md: string) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="kbd">$1</code>')
    .split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
}

/** Pull table names + columns out of the setup SQL so students can see what exists. */
function readSchema(setup: string): { name: string; cols: string[] }[] {
  const out: { name: string; cols: string[] }[] = [];
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(setup))) {
    const cols = m[2]
      .split(/,(?![^(]*\))/)
      .map((c) => c.trim().split(/\s+/).slice(0, 2).join(" "))
      .filter((c) => c && !/^(primary|foreign|unique|check|constraint)\b/i.test(c));
    out.push({ name: m[1], cols });
  }
  return out;
}

const cell = (v: unknown) =>
  v === null || v === undefined ? <span className="nul">NULL</span> : String(v);

function Grid({ rs, cap }: { rs: ResultSet; cap?: string }) {
  if (!rs.columns.length) return <div className="sqlt-empty">Koi column return nahi hua.</div>;
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
  const [sql, setSql] = useState(p.starterCode);
  const [result, setResult] = useState<SqlRunResult | null>(null);
  const [resTab, setResTab] = useState<"out" | "expected">("out");
  const [busy, setBusy] = useState<null | "run" | "submit">(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [noPaste, setNoPaste] = useState(false);
  // Shown when the server's re-check disagrees with the browser, or the submit
  // didn't save — so a rejected solve never reads as a silent 0 XP.
  const [submitNote, setSubmitNote] = useState<string | null>(null);

  const schema = readSchema(p.sqlSetup);

  function flashNoPaste() {
    setNoPaste(true);
    setTimeout(() => setNoPaste(false), 1900);
  }

  function handleMount(editor: any, monaco: any) {
    // No copy-paste — student ko khud likhna padega (tabhi seekhega).
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
    try {
      const r = await runSql(sql, p.sqlSetup, p.solutionCode);
      setResult(r);
      if (submit) {
        const res = await fetch("/api/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: p.id, code: sql, passed: r.pass }),
        }).then((x) => x.json()).catch(() => null);
        // Celebrate only when the server confirms — it re-runs the query itself.
        if (!r.pass) {
          // the output/expected panels already show the mismatch
        } else if (!res?.ok) {
          setSubmitNote("Submit save nahi hua — internet check karke dobara Submit karo.");
        } else if (res.verifyNote) {
          setSubmitNote(`Server pe verify nahi hua: ${res.verifyNote}`);
        } else {
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
        Practice / <b>{p.title}</b>
        {p.lessonSlug && <> · <Link href={`/learn/${p.lessonSlug}`} style={{ color: "var(--teal)" }}>lesson padho</Link></>}
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span className={`diff ${p.difficulty === "Medium" ? "medium" : p.difficulty === "Hard" ? "hard" : p.difficulty === "Super Hard" ? "superhard" : ""}`}>{p.difficulty}</span>
                {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
              <div dangerouslySetInnerHTML={{ __html: mdLite(p.descriptionMd) }} />
              {p.examples.map((ex, i) => (
                <div className="ex-box" key={i}>
                  <div className="elb">Example {i + 1}</div>
                  <div className="erow"><span>Input:</span> {ex.input}</div>
                  <div className="erow"><span>Output:</span> {ex.output}</div>
                </div>
              ))}

              <div className="sql-side">
                <h4>Tables jo available hain</h4>
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
            <div><p dangerouslySetInnerHTML={{ __html: mdLite(p.recap || "Is topic ka lesson kholo aur dobara padho.") }} />
              {p.lessonSlug && <Link className="link" style={{ margin: 0, color: "var(--teal)" }} href={`/learn/${p.lessonSlug}`}>↩ Poora lesson kholo</Link>}
            </div>
          )}
        </div>

        {/* editor */}
        <div className="editor-wrap">
          <div className="ed-bar">
            <span className="ed-lang"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg> SQLite</span>
            <span className="no-paste-badge" title="Copy-paste band hai — khud likho!">🔒 no paste</span>
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
              loading={<div style={{ color: "#8890A0", padding: 20, fontFamily: "var(--mono)", fontSize: 13 }}>Editor load ho raha hai…</div>}
            />
            {noPaste && <div className="paste-toast">✋ Paste band hai — khud likho, tabhi yaad rahega!</div>}
          </div>

          <div className="results">
            <div className="res-tabs">
              <button className={`res-tab${resTab === "out" ? " active" : ""}`} onClick={() => setResTab("out")}>Your Output</button>
              <button className={`res-tab${resTab === "expected" ? " active" : ""}`} onClick={() => setResTab("expected")}>Expected</button>
            </div>
            <div className="res-body">
              {submitNote && <div className="submit-note">⚠ {submitNote}</div>}
              {resTab === "out" && (
                !result ? (
                  <div className="res-empty">▶ &quot;Run&quot; dabao — pehli baar SQL engine load hone me 1-2 second lagega, phir turant chalega.</div>
                ) : result.error ? (
                  <>
                    <div className="verdict no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> Query me error hai</div>
                    <div className="console-out">{result.error}</div>
                  </>
                ) : (
                  <>
                    <div className={`verdict ${result.pass ? "ok" : "no"}`}>
                      {result.pass
                        ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg> Sahi hai — result exactly match kar gaya</>
                        : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> {result.reason}</>}
                    </div>
                    {result.got && <Grid rs={result.got} cap={`${result.got.rows.length} row${result.got.rows.length === 1 ? "" : "s"}${result.ordered ? " · order check on (ORDER BY)" : ""}`} />}
                  </>
                )
              )}
              {resTab === "expected" && (
                !result?.expected
                  ? <div className="res-empty">Pehle &quot;Run&quot; dabao — phir expected result yahan dikhega.</div>
                  : <Grid rs={result.expected} cap={`Aisa dikhna chahiye — ${result.expected.rows.length} row${result.expected.rows.length === 1 ? "" : "s"}`} />
              )}
            </div>
          </div>
        </div>
      </div>

      {celebrate !== null && (
        <Celebrate
          xp={celebrate}
          onClose={() => setCelebrate(null)}
          onNext={() => router.push("/practice")}
          nextLabel="Agla problem →"
        />
      )}
    </>
  );
}
