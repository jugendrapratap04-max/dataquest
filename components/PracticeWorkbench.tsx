"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { runTests, type RunResult, type TestCase } from "@/lib/pyodide-runner";
import { formatDuration } from "@/lib/duration";
import { Celebrate } from "@/components/Celebrate";
import { ErrorHelp } from "@/components/ErrorHelp";
import { play as playCue } from "@/lib/sound";

export type ProblemData = {
  id: string; title: string; difficulty: string; tags: string[];
  descriptionMd: string; examples: { input: string; output: string }[];
  starterCode: string; functionName: string; tests: TestCase[]; hints: string[];
  xp: number; recap: string; lessonSlug?: string; nextSlug?: string | null;
  /** Editor language id, from the problem — not assumed. Etudo is a
   *  multi-subject platform, so the day a JavaScript or C++ problem exists the
   *  editor must already be reading this rather than being pinned to Python. */
  language?: string;
  /** What the editor bar calls it. Same reason as `language`. */
  languageLabel?: string;
  /** Has this student passed this problem before? Read from Submission. */
  alreadySolved?: boolean;
  /** Their autosaved editor content, or null if they have never typed here. */
  savedCode?: string | null;
  /** Seconds taken on the first successful solve, if we recorded one. */
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

// Pyodide hands Python's None back as `undefined`, and JSON.stringify(undefined)
// is undefined — which React renders as nothing at all. So the single most common
// beginner mistake, forgetting to `return`, showed up as "add_marks("85", "5") → "
// with a blank where the answer goes. Say None, the way Python would.
const fmt = (v: unknown) => (v === undefined || v === null ? "None" : JSON.stringify(v));

export function PracticeWorkbench({ p }: { p: ProblemData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"desc" | "hint" | "recap">("desc");
  // Reopen on what they last wrote, not on the starter template. The `||` rather
  // than `??` is deliberate: an empty saved draft means they cleared the editor,
  // and handing them a blank screen would be worse than handing back the starter.
  const [code, setCode] = useState(p.savedCode || p.starterCode);
  const [elapsed, setElapsed] = useState(0);
  const [bestSeconds, setBestSeconds] = useState<number | null>(p.bestSeconds ?? null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [resTab, setResTab] = useState<"tests" | "console" | "chart">("tests");
  const [busy, setBusy] = useState<null | "run" | "submit">(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [noPaste, setNoPaste] = useState(false);
  // Shown when the server's re-check disagrees with the browser, or the submit
  // didn't save. Without it, a rejected solve looked like a silent 0 XP.
  const [submitNote, setSubmitNote] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  // The clock. It counts this sitting, not the stored total — the authoritative
  // time is stamped server-side from ProblemAttempt.startedAt, and this is only
  // so the student can see it moving.
  useEffect(() => {
    if (p.alreadySolved) return;
    const id = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [p.alreadySolved]);

  // Autosave, debounced. Runs a second after typing stops rather than on every
  // keystroke, so a fast typist writes one row per pause instead of forty.
  //
  // The first save is also what stamps startedAt server-side, which is why the
  // timer above and the recorded time can differ slightly — the recorded one
  // starts at the first character typed, not at page load. That is the more
  // honest of the two: it does not charge you for reading the question.
  useEffect(() => {
    if (code === p.starterCode && !p.savedCode) return;   // nothing written yet
    const id = setTimeout(() => {
      void fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: p.id, code }),
      }).catch(() => {});   // a lost draft save is not worth interrupting anyone
    }, 1000);
    return () => clearTimeout(id);
  }, [code, p.id, p.starterCode, p.savedCode]);

  function flashNoPaste() {
    setNoPaste(true);
    setTimeout(() => setNoPaste(false), 1900);
  }

  // Always the CURRENT doRun, for the keyboard shortcuts registered at mount.
  // No dependency array on purpose: it has to be rewritten on every render, or
  // the shortcut runs against whatever `code` existed when the editor loaded.
  const runRef = useRef<(submit: boolean) => void>(() => {});
  useEffect(() => {
    runRef.current = (submit: boolean) => { if (busy === null) void doRun(submit); };
  });

  // ⌘ on a Mac, Ctrl everywhere else. Read after mount because `navigator` does
  // not exist on the server, and rendering the wrong one then correcting it is a
  // visible flicker on the busiest button in the app. null renders no hint.
  const [isMac, setIsMac] = useState<boolean | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent)); }, []);
  const mod = isMac === null ? null : isMac ? "⌘" : "Ctrl";

  function handleMount(editor: any, monaco: any) {
    // No copy-paste — the student has to type it, which is the point.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, flashNoPaste);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV, flashNoPaste);

    // Run and Submit without leaving the keyboard. Reaching for the mouse after
    // every edit is dozens of interruptions in one sitting, and it is the single
    // most common reason a code editor feels like a toy rather than a tool.
    //
    // Both go through a ref, not through `doRun` directly: this registers ONCE
    // at mount, so a direct reference would capture the `code` and `busy` of
    // that first render and keep running the starter template forever.
    //
    // `addAction` rather than `addCommand`, for two reasons: it also lists the
    // shortcut in Monaco's own command palette (F1), so it is discoverable
    // without reading the button; and it has an id, which means it can be
    // triggered — and therefore tested — without synthesising a key press.
    editor.addAction({
      id: "etudo-run",
      label: "Run code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => runRef.current(false),
    });
    editor.addAction({
      id: "etudo-submit",
      label: "Submit solution",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
      run: () => runRef.current(true),
    });
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
      const r = await runTests(code, p.functionName, p.tests);
      setResult(r);

      const ok = r.compiled && r.passed === r.total && r.total > 0;

      // Cue the outcome, not the click. `fail` is the softer of the two on
      // purpose — see lib/sound.ts.
      //
      // A passing SUBMIT stays silent here, because the celebration that follows
      // plays `solve` and two reward cues landing half a second apart muddy each
      // other instead of feeling bigger. The success branches below cue `pass`
      // themselves when no celebration is coming — a solve that saved nothing
      // should still be heard.
      if (!ok) playCue("fail");
      else if (!submit) playCue("pass");

      if (submit) {
        const passed = ok;
        const resp = await fetch("/api/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: p.id, code, passed }),
        }).catch(() => null);
        const res = resp ? await resp.json().catch(() => null) : null;
        // Celebrate only when the server confirms. It re-runs the solution before
        // paying XP, so the browser's verdict alone isn't enough.
        if (!passed) {
          // the test panel already shows which cases failed
        } else if (resp?.status === 401) {
          // Not logged in — a "connection" message would send them into a retry
          // loop. Tell them plainly what to do.
          setNeedsLogin(true);
          playCue("pass");   // they did solve it; no celebration is coming
        } else if (!res?.ok) {
          setSubmitNote("Submission did not save — check your connection and press Submit again.");
          playCue("pass");
        } else if (res.verifyNote) {
          setSubmitNote(`The server could not verify this: ${res.verifyNote}`);
          playCue("pass");
        } else {
          // The server's time, not the browser's — it is measured from the
          // first character typed and survives a reload, which the local
          // counter does not.
          if (typeof res.solvedSeconds === "number") setBestSeconds(res.solvedSeconds);
          setCelebrate(res.awardedXp ?? 0);
        }
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
                {/* Everything needed to answer "have I done this, and how did it
                    go?" — the question a returning student was left to guess at,
                    which is what made a solved problem feel like a repeat. */}
                {p.alreadySolved && <span className="solved-pill">✓ Solved</span>}
                {bestSeconds !== null && (
                  <span className="time-pill">⏱ {formatDuration(bestSeconds)}</span>
                )}
                {!p.alreadySolved && elapsed > 0 && (
                  <span className="time-pill live">⏱ {formatDuration(elapsed)}</span>
                )}
              </div>
              {p.alreadySolved && (
                <div className="note tip" style={{ marginBottom: 14 }}><span className="i">✓</span><div>
                  You already solved this{bestSeconds !== null ? <> in <b>{formatDuration(bestSeconds)}</b></> : null}, and your last
                  version of the code is loaded below. Solving it again earns no further XP — it is here to practise on.
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
            <span className="ed-lang"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg> {p.languageLabel ?? "Python 3"}</span>
            <span className="no-paste-badge" title="Copy-paste is off — type it yourself!">🔒 no paste</span>
            <div className="ed-actions">
              <button className="btn btn-run" onClick={() => doRun(false)} disabled={busy !== null}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {busy === "run" ? "Running…" : "Run"}
                {/* A shortcut nobody is told about is a shortcut nobody uses. */}
                {mod && busy === null && <kbd className="kb">{mod}↵</kbd>}
              </button>
              <button className="btn btn-submit" onClick={() => doRun(true)} disabled={busy !== null}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg>
                {busy === "submit" ? "Checking…" : "Submit"}
                {mod && busy === null && <kbd className="kb">{mod}⇧↵</kbd>}
              </button>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <Editor
              height="300px" defaultLanguage={p.language ?? "python"} theme="vs-dark" value={code}
              onChange={(v) => setCode(v ?? "")} onMount={handleMount}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12 }, tabSize: 4, contextmenu: false }}
              loading={<div style={{ color: "#8890A0", padding: 20, fontFamily: "var(--mono)", fontSize: 13 }}>Loading the editor…</div>}
            />
            {noPaste && <div className="paste-toast">✋ Paste is off — type it out, that is how it sticks!</div>}
          </div>

          <div className="results">
            <div className="res-tabs">
              <button className={`res-tab${resTab === "tests" ? " active" : ""}`} onClick={() => setResTab("tests")}>Test Cases</button>
              <button className={`res-tab${resTab === "console" ? " active" : ""}`} onClick={() => setResTab("console")}>Console</button>
              {/* Only for problems that drew something. A visualization problem is
                  still graded on values — heights, limits, the label it set — because
                  those are what can be compared; the picture is here so the student
                  is not writing a chart they never get to look at. */}
              {result?.figure && (
                <button className={`res-tab${resTab === "chart" ? " active" : ""}`} onClick={() => setResTab("chart")}>📊 Chart</button>
              )}
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
                  <div className="res-empty">▶ Press &quot;Run&quot; — Python takes a moment to load the first time (~30s for pandas problems), then it is instant.</div>
                ) : !result.compiled ? (
                  <>
                    <div className="verdict no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg> Your code has an error</div>
                    <div className="console-out">{result.error}</div>
                    <ErrorHelp error={result.error} problemId={p.id} />
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
                    {/* The commoner path: the code compiled, then a test case
                        raised. Explain the first one — several cases usually
                        fail for the same single reason, so repeating it per
                        case would bury the tests under identical panels. */}
                    <ErrorHelp error={result.cases.find((c) => c.error)?.error} problemId={p.id} />
                  </>
                )
              )}
              {resTab === "console" && (
                <div className="console-out">{result?.stdout ? result.stdout : "// output from print() appears here…"}</div>
              )}
              {resTab === "chart" && (
                result?.figure
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img className="fig-out" src={result.figure} alt="The chart your code drew" />
                  // The tab can outlive the figure: the student edits the code so it
                  // no longer plots, presses Run, and this pane is the one open.
                  : <div className="res-empty">This run drew no figure — nothing called a plotting function.</div>
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
