import { highlightPython } from "@/lib/highlight";

/* The book view of a lesson.
 *
 * Nothing here is written twice. A lesson is already a list of structured blocks,
 * so the book is a second reading of the same data: keep what belongs on paper
 * (definitions, explanations, code, mistakes, worked examples, exercises with
 * answers), drop what only works on a screen (hooks, guesses, interactive
 * widgets). That means the notes can never drift out of date with the lesson,
 * and every one of the 83 lessons gets a chapter for free. */

/* eslint-disable @typescript-eslint/no-explicit-any */
const html = (s: string) => ({ __html: s });

function Block({ b, n }: { b: any; n: number }) {
  switch (b.t) {
    case "h2":
      return <h3 className="bk-h" id={`s${n}`}>{b.n}. {b.text}</h3>;

    case "def":
      return (
        <div className="bk-def">
          <b>{b.term}</b> — {b.en}
          {b.hi && <div className="bk-def-hi" dangerouslySetInnerHTML={html(b.hi)} />}
        </div>
      );

    case "p":
    case "psoft":
      return <p dangerouslySetInnerHTML={html(b.html)} />;

    case "analogy":
      return (
        <p className="bk-analogy">
          <b>{b.concept} → {b.real}.</b> <span dangerouslySetInnerHTML={html(b.html)} />
        </p>
      );

    case "note":
      return <div className={`bk-note ${b.variant}`} dangerouslySetInnerHTML={html(b.html)} />;

    case "code":
      return (
        <div className="bk-code">
          {b.file && <div className="bk-file">{b.file}</div>}
          <pre dangerouslySetInnerHTML={html(highlightPython(b.code))} />
          {b.output && <div className="bk-out">Output:{"\n"}{b.output}</div>}
        </div>
      );

    case "dtypes":
      return (
        <table className="bk-table">
          <tbody>
            {b.items.map((d: any, i: number) => (
              <tr key={i}>
                <td className="bk-tag">{d.tag}</td>
                <td><b>{d.name}</b><br />{d.desc}</td>
                <td className="mono">{d.ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "worked":
      return (
        <div className="bk-worked">
          <h4>Worked example — {b.title}</h4>
          {b.goal && <p dangerouslySetInnerHTML={html(b.goal)} />}
          <ol>
            {b.steps.map((s: any, i: number) => (
              <li key={i}>
                <b>{s.label}</b>
                <pre dangerouslySetInnerHTML={html(highlightPython(s.code))} />
                {s.why && <p dangerouslySetInnerHTML={html(s.why)} />}
              </li>
            ))}
          </ol>
          {b.full && (
            <>
              <p><b>All together</b></p>
              <div className="bk-code"><pre dangerouslySetInnerHTML={html(highlightPython(b.full))} />
                {b.output && <div className="bk-out">Output:{"\n"}{b.output}</div>}</div>
            </>
          )}
        </div>
      );

    case "mistakes":
      return (
        <div className="bk-mistakes">
          <h4>Common mistakes</h4>
          {b.items.map((m: any, i: number) => (
            <div className="bk-mk" key={i}>
              <div><span className="bk-x">✗</span><pre>{m.bad}</pre></div>
              <p dangerouslySetInnerHTML={html(m.why)} />
              <div><span className="bk-tick">✓</span><pre>{m.fix}</pre></div>
            </div>
          ))}
        </div>
      );

    case "debug":
      return (
        <div className="bk-worked">
          <h4>Find the bug</h4>
          {b.intro && <p dangerouslySetInnerHTML={html(b.intro)} />}
          <div className="bk-code"><pre dangerouslySetInnerHTML={html(highlightPython(b.code))} /></div>
          {b.symptom && <p className="bk-symptom">{b.symptom}</p>}
          <p><b>The fix</b></p>
          <div className="bk-code"><pre dangerouslySetInnerHTML={html(highlightPython(b.fix))} /></div>
          {b.why && <p dangerouslySetInnerHTML={html(b.why)} />}
        </div>
      );

    case "trace":
      return (
        <div className="bk-ex">
          <h4>Trace the code</h4>
          <div className="bk-code"><pre dangerouslySetInnerHTML={html(highlightPython(b.code))} /></div>
          <ol>
            {b.steps.map((s: any, i: number) => (
              <li key={i}>
                <span dangerouslySetInnerHTML={html(s.q)} /> — <b>{s.answer}</b>
                {s.why && <div className="bk-why" dangerouslySetInnerHTML={html(s.why)} />}
              </li>
            ))}
          </ol>
        </div>
      );

    case "drills":
      return (
        <div className="bk-ex">
          <h4>Exercises</h4>
          <ol>
            {b.items.map((d: any, i: number) => (
              <li key={i}>
                <span dangerouslySetInnerHTML={html(d.task)} />
                <pre dangerouslySetInnerHTML={html(highlightPython(d.code))} />
                {d.out && <div className="bk-out">Output:{"\n"}{d.out}</div>}
              </li>
            ))}
          </ol>
        </div>
      );

    case "quiz":
      return (
        <div className="bk-ex">
          <h4>Check yourself</h4>
          <ol>
            {b.items.map((q: any, i: number) => (
              <li key={i}>
                <span dangerouslySetInnerHTML={html(q.q)} />
                <div className="bk-ans"><b>Answer:</b> {q.options[q.correct]} — <span dangerouslySetInnerHTML={html(q.why)} /></div>
              </li>
            ))}
          </ol>
        </div>
      );

    case "recap":
      return (
        <div className="bk-recap">
          <h4>Summary</h4>
          <ul>{b.items.map((it: string, i: number) => <li key={i} dangerouslySetInnerHTML={html(it)} />)}</ul>
        </div>
      );

    case "interview":
      return (
        <div className="bk-ex">
          <h4>Interview questions</h4>
          <ol>
            {b.items.map((q: any, i: number) => (
              <li key={i}>
                <span dangerouslySetInnerHTML={html(q.q)} /> <span className="bk-lvl">{q.level}</span>
                <div className="bk-ans" dangerouslySetInnerHTML={html(q.a)} />
              </li>
            ))}
          </ol>
        </div>
      );

    // Interactive-only blocks have no paper equivalent. The viz gets a pointer
    // back to the lesson rather than being silently dropped.
    case "viz":
      return <p className="bk-viz">↗ This part has an interactive visualisation — open the lesson online to use it.</p>;

    default:
      return null; // hook, think, faded, objectives handled separately
  }
}

export function BookChapter({ n, title, blocks, slug }: { n: number; title: string; blocks: any[]; slug: string }) {
  const objectives = blocks.find((b) => b.t === "objectives");
  const body = blocks.filter((b) => !["objectives", "hook", "think", "faded"].includes(b.t));

  return (
    <section className="bk-chapter" id={slug}>
      <h2 className="bk-title"><span className="bk-num">Chapter {n}</span>{title}</h2>
      {objectives && (
        <div className="bk-obj">
          <h4>In this chapter</h4>
          <ul>{objectives.items.map((it: string, i: number) => <li key={i} dangerouslySetInnerHTML={html(it)} />)}</ul>
        </div>
      )}
      {body.map((b, i) => <Block key={i} b={b} n={i} />)}
    </section>
  );
}
