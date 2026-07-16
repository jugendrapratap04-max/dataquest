"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { runTests, type RunResult, type TestCase } from "@/lib/pyodide-runner";
import { Celebrate } from "@/components/Celebrate";

export type ProblemData = {
  id: string; title: string; difficulty: string; tags: string[];
  descriptionMd: string; examples: { input: string; output: string }[];
  starterCode: string; functionName: string; tests: TestCase[]; hints: string[];
  xp: number; recap: string; lessonSlug?: string;
};

function mdLite(md: string) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="kbd">$1</code>')
    .split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
}

const fmt = (v: unknown) => JSON.stringify(v);

export function PracticeWorkbench({ p }: { p: ProblemData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"desc" | "hint" | "recap">("desc");
  const [code, setCode] = useState(p.starterCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [resTab, setResTab] = useState<"tests" | "console">("tests");
  const [busy, setBusy] = useState<null | "run" | "submit">(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [noPaste, setNoPaste] = useState(false);

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
    setResTab("tests");
    try {
      const r = await runTests(code, p.functionName, p.tests);
      setResult(r);
      if (submit) {
        const passed = r.compiled && r.passed === r.total && r.total > 0;
        const res = await fetch("/api/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: p.id, code, passed }),
        }).then((x) => x.json()).catch(() => null);
        if (passed) setCelebrate(res?.awardedXp ?? p.xp);
      }
    } catch (e) {
      setResult({ compiled: false, error: String(e), stdout: "", cases: [], passed: 0, total: p.tests.length });
    } finally {
      setBusy(null);
    }
  }

  const allPass = result && result.compiled && result.passed === result.total && result.total > 0;

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
            <span className="ed-lang"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg> Python 3</span>
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
              height="300px" defaultLanguage="python" theme="vs-dark" value={code}
              onChange={(v) => setCode(v ?? "")} onMount={handleMount}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12 }, tabSize: 4, contextmenu: false }}
              loading={<div style={{ color: "#8890A0", padding: 20, fontFamily: "var(--mono)", fontSize: 13 }}>Editor load ho raha hai…</div>}
            />
            {noPaste && <div className="paste-toast">✋ Paste band hai — khud likho, tabhi yaad rahega!</div>}
          </div>

          <div className="results">
            <div className="res-tabs">
              <button className={`res-tab${resTab === "tests" ? " active" : ""}`} onClick={() => setResTab("tests")}>Test Cases</button>
              <button className={`res-tab${resTab === "console" ? " active" : ""}`} onClick={() => setResTab("console")}>Console</button>
            </div>
            <div className="res-body">
              {resTab === "tests" && (
                !result ? (
                  <div className="res-empty">▶ &quot;Run&quot; dabao — pehli baar Python load hone me thoda time (pandas/data problems me ~30 sec), phir turant chalega.</div>
                ) : !result.compiled ? (
                  <>
                    <div className="verdict no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> Code me error hai</div>
                    <div className="console-out">{result.error}</div>
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
                        <span className="io"><b>{p.functionName}({c.args.map(fmt).join(", ")})</b> → {c.error ? "⚠ " + c.error : fmt(c.got)}</span>
                        {!c.pass && !c.error && <span className="ms">expected {fmt(c.expected)}</span>}
                      </div>
                    ))}
                  </>
                )
              )}
              {resTab === "console" && (
                <div className="console-out">{result?.stdout ? result.stdout : "// print() ka output yahan dikhega…"}</div>
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
