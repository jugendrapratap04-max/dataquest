"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gradeHtml, type HtmlTest, type HtmlResult } from "@/lib/html-check";
import { play as playCue } from "@/lib/sound";

/* The practice workbench for HTML.
 *
 * WHY A FOURTH ONE. The other three grade by running code and comparing a
 * value. HTML produces a document, not a value, so this one renders what the
 * student wrote and asks questions of the result — see lib/html-check.ts.
 *
 * WHY THE PREVIEW IS SANDBOXED WITH NOTHING ALLOWED. `sandbox=""` is the most
 * restrictive setting there is: no scripts, no forms, no navigation, and a
 * unique opaque origin, so the frame cannot reach this page, its cookies or
 * its storage. On an HTML course that costs nothing — there is no lesson here
 * that needs to run JavaScript — and it means a student pasting something they
 * found on the internet cannot be attacked by it.
 *
 * WHY THE GRADER READS A PARSED COPY, NOT THE IFRAME. Reading the frame's DOM
 * would need same-origin access, which is exactly what the sandbox removes.
 * DOMParser gives an inert document off the same string: no requests, no
 * scripts, nothing rendered, and identical structure. The preview and the
 * grading stay independent, which is also why a broken preview cannot silently
 * pass a test.
 */

export type HtmlProblemData = {
  id: string; title: string; difficulty: string; tags: string[];
  descriptionMd: string; examples: { input: string; output: string }[];
  starterCode: string; solutionCode: string;
  tests: HtmlTest[];
  hints: string[]; xp: number; lessonSlug?: string; nextSlug?: string | null;
  alreadySolved?: boolean;
  savedCode?: string | null;
  bestSeconds?: number | null;
};

export function HtmlWorkbench({ p }: { p: HtmlProblemData }) {
  const router = useRouter();
  const [code, setCode] = useState(p.savedCode || p.starterCode);
  const [results, setResults] = useState<HtmlResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [hintsOpen, setHintsOpen] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const dirty = code !== (p.savedCode || p.starterCode);
  const allPass = !!results && results.length > 0 && results.every((r) => r.pass);

  /* The preview redraws on a debounce, not on every keystroke.
   * Rewriting srcDoc tears down and rebuilds the whole frame, so doing it per
   * character makes typing feel heavy on a long document — and half-typed
   * markup is not worth rendering anyway. */
  const [preview, setPreview] = useState(code);
  useEffect(() => {
    const id = setTimeout(() => setPreview(code), 250);
    return () => clearTimeout(id);
  }, [code]);

  /* Autosave, same contract as every other workbench: a draft is not a
   * submission, nothing is graded and no XP moves. */
  useEffect(() => {
    if (!dirty) return;
    const id = setTimeout(() => {
      void fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: p.id, code }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(id);
  }, [code, dirty, p.id]);

  const run = () => {
    // Parsed here rather than read out of the frame — see the note at the top.
    const doc = new DOMParser().parseFromString(code, "text/html");
    const { results: r } = gradeHtml(doc, p.tests);
    setResults(r);
    playCue(r.every((x) => x.pass) ? "pass" : "fail");
  };

  async function submit() {
    const doc = new DOMParser().parseFromString(code, "text/html");
    const { results: r } = gradeHtml(doc, p.tests);
    setResults(r);
    const passed = r.length > 0 && r.every((x) => x.pass);
    if (!passed) {
      setNote("Not yet — the failing checks are listed below.");
      playCue("fail");
      return;
    }
    setBusy(true);
    setNote(null);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: p.id, code, passed: true }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);

    if (!res?.ok) { setNote("Could not save that — check your connection."); playCue("fail"); return; }
    if (res.verifyNote) { setNote(res.verifyNote); playCue("fail"); return; }
    playCue(res.firstSolve ? "solve" : "pass");
    if (!res.firstSolve) setNote("Solved already — no XP this time, but the answer still works.");
    router.refresh();
  }

  /* Tab indents instead of leaving the editor. Same reasoning as LiveCode:
   * nesting is how HTML structure is read, so a Tab that jumps to the next
   * button makes the editor useless for the language it is teaching. */
  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); return; }
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: en, value } = el;
    if (e.shiftKey) {
      const line = value.lastIndexOf("\n", s - 1) + 1;
      if (value.slice(line, line + 2) === "  ") {
        setCode(value.slice(0, line) + value.slice(line + 2));
        requestAnimationFrame(() => el.setSelectionRange(Math.max(line, s - 2), Math.max(line, en - 2)));
      }
      return;
    }
    setCode(value.slice(0, s) + "  " + value.slice(en));
    requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
  }

  const passedCount = results ? results.filter((r) => r.pass).length : 0;

  // A full document is left alone; a fragment gets a wrapper so the preview has
  // a charset and sane defaults instead of inheriting the browser's.
  const srcDoc = useMemo(() => {
    if (/<html[\s>]/i.test(preview)) return preview;
    return `<!doctype html><html><head><meta charset="utf-8">
<style>body{font:15px/1.6 system-ui,sans-serif;margin:16px;color:#1a1a1a;background:#fff}</style>
</head><body>${preview}</body></html>`;
  }, [preview]);

  return (
    <div className="hw">
      <div className="hw-head">
        <div>
          <h1>{p.title}</h1>
          <div className="hw-meta">
            <span className={`pill ${p.difficulty.toLowerCase().replace(/\s+/g, "-")}`}>{p.difficulty}</span>
            <span className="hw-xp">{p.xp} XP</span>
            {p.alreadySolved && <span className="hw-solved">✓ solved</span>}
            {p.tags.map((t) => <span className="hw-tag" key={t}>{t}</span>)}
          </div>
        </div>
        {p.lessonSlug && <Link className="link" href={`/learn/${p.lessonSlug}`}>← back to the lesson</Link>}
      </div>

      <div className="hw-grid">
        <section className="card pad hw-brief">
          <div className="hw-desc" dangerouslySetInnerHTML={{ __html: mdLite(p.descriptionMd) }} />

          <div className="hw-checks">
            <h2>What this checks</h2>
            {/* The tests are shown BEFORE the student writes anything. Hiding
                them would turn the exercise into guessing what the grader
                wants — which is the opposite of the skill being taught. */}
            <ul>
              {p.tests.map((t, i) => {
                const r = results?.[i];
                return (
                  <li key={i} className={r ? (r.pass ? "ok" : "no") : ""}>
                    <span className="hw-mark">{r ? (r.pass ? "✓" : "✕") : "•"}</span>
                    <span className="hw-says">{t.says}</span>
                    {r && !r.pass && <span className="hw-detail">{r.detail}</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          {p.hints.length > 0 && (
            <div className="hw-hints">
              <h2>Hints</h2>
              {p.hints.slice(0, hintsOpen).map((h, i) => (
                <p className="hw-hint" key={i} dangerouslySetInnerHTML={{ __html: mdLite(h) }} />
              ))}
              {hintsOpen < p.hints.length && (
                <button className="btn btn-ghost" onClick={() => setHintsOpen(hintsOpen + 1)}>
                  {hintsOpen === 0 ? "Show a hint" : "Another hint"} ({p.hints.length - hintsOpen} left)
                </button>
              )}
            </div>
          )}
        </section>

        <section className="hw-work">
          <div className="hw-editor">
            <div className="hw-bar">
              <span className="hw-file">index.html</span>
              <span className="hw-acts">
                <button className="lc-run" onClick={run} disabled={busy}>Run checks</button>
                <button className="lc-reset" onClick={() => { setCode(p.starterCode); setResults(null); setNote(null); areaRef.current?.focus(); }} disabled={busy || code === p.starterCode}>Reset</button>
                <button className="btn btn-primary hw-submit" onClick={submit} disabled={busy}>{busy ? "Saving…" : "Submit"}</button>
              </span>
            </div>
            <textarea
              ref={areaRef}
              className="hw-area"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              aria-label={`HTML editor for ${p.title}`}
            />
          </div>

          <div className="hw-preview">
            <div className="hw-bar"><span className="hw-file">Preview</span></div>
            {/* sandbox="" — nothing allowed. See the note at the top of the file. */}
            <iframe title="Live preview of your page" sandbox="" srcDoc={srcDoc} />
          </div>
        </section>
      </div>

      {results && (
        <div className={`hw-verdict ${allPass ? "ok" : "no"}`}>
          {allPass
            ? <>All {results.length} checks passed — press Submit to save it.</>
            : <>{passedCount} of {results.length} checks passed.</>}
        </div>
      )}
      {note && <p className="hw-note">{note}</p>}

      {p.nextSlug && allPass && (
        <Link className="btn btn-primary hw-next" href={`/practice/${p.nextSlug}`}>Next problem →</Link>
      )}
    </div>
  );
}

/* The same tiny markdown the other workbenches use, copied rather than
 * reinvented. Fenced blocks come out FIRST because the inline-code rule below
 * matches any pair of backticks and would otherwise eat a fence.
 *
 * The placeholder is a bracketed token, not a bare number: a bare number would
 * collide with any number the prose happens to contain. And a <pre> nested
 * inside a <p> is invalid HTML, so the paragraph a placeholder ended up alone
 * in is unwrapped before the plain swap. */
function mdLite(md: string) {
  const blocks: string[] = [];
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const pre = (i: string) => `<pre class="md-pre"><code>${esc(blocks[Number(i)])}</code></pre>`;

  return md
    .replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, (_m, body: string) => {
      blocks.push(body.replace(/\n$/, ""));
      return `[[FENCE${blocks.length - 1}]]`;
    })
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="kbd">$1</code>')
    .split(/\n\n+/).map((s) => `<p>${s.replace(/\n/g, "<br/>")}</p>`).join("")
    .replace(/<p>\s*\[\[FENCE(\d+)\]\]\s*<\/p>/g, (_m, i: string) => pre(i))
    .replace(/\[\[FENCE(\d+)\]\]/g, (_m, i: string) => pre(i));
}
