// The language registry.
//
// `Problem.kind` started life as a two-value flag ("python" | "sql") because
// those were the only two runtimes. DataMarg is a multi-subject platform
// (docs/ARCHITECTURE.md), so the editor, the label and the runner have to read a
// problem's language from data rather than assume Python — otherwise every new
// subject means hunting down another hardcoded string.
//
// Adding a subject's language is one entry here. Whether its code can actually
// RUN in the browser is a separate question, answered by `runnable`.

export type Language = {
  /** Monaco's language id. */
  monaco: string;
  /** What the editor bar shows. */
  label: string;
  /** Plain name for prose and page titles ("Python", not "Python 3"). */
  name: string;
  /** Can a student execute this in the browser today? */
  runnable: boolean;
};

export const LANGUAGES: Record<string, Language> = {
  python: { monaco: "python", label: "Python 3", name: "Python", runnable: true },
  sql: { monaco: "sql", label: "SQL", name: "SQL", runnable: true },
  // Monaco has no 8085 mode, and "asm" is close enough that labels, numbers and
  // comments highlight correctly. The runtime is ours: lib/asm8085.ts.
  asm8085: { monaco: "asm", label: "8085 Assembly", name: "8085 Assembly", runnable: true },
  // Ready for the subjects nearest to hand. JavaScript needs no new runtime at
  // all; the rest are content-only until their runtime exists, and marking that
  // honestly here is better than shipping a Run button that cannot run.
  javascript: { monaco: "javascript", label: "JavaScript", name: "JavaScript", runnable: false },
  html: { monaco: "html", label: "HTML", name: "HTML", runnable: false },
  css: { monaco: "css", label: "CSS", name: "CSS", runnable: false },
  java: { monaco: "java", label: "Java", name: "Java", runnable: false },
  c: { monaco: "c", label: "C", name: "C", runnable: false },
  cpp: { monaco: "cpp", label: "C++", name: "C++", runnable: false },
};

const FALLBACK: Language = LANGUAGES.python;

/** Never throws: an unknown language falls back rather than blanking the editor. */
export function languageOf(kind: string | null | undefined): Language {
  return (kind && LANGUAGES[kind]) || FALLBACK;
}
