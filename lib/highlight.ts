// Tiny Python syntax highlighter -> HTML string (used in lesson code blocks).
const KEYWORDS = new Set([
  "def", "return", "if", "elif", "else", "for", "while", "in", "import", "from",
  "as", "class", "and", "or", "not", "pass", "with", "lambda", "try", "except",
  "finally", "raise", "yield", "break", "continue", "global", "nonlocal", "is",
]);
const CONSTS = new Set(["True", "False", "None"]);
const BUILTINS = new Set([
  "print", "int", "float", "str", "bool", "len", "range", "list", "dict", "set",
  "tuple", "type", "input", "sum", "min", "max", "abs", "round", "sorted", "map",
  "filter", "zip", "enumerate", "open",
]);

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlightPython(code: string): string {
  const src = esc(code);
  // token: comment | string | word | number
  const re = /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_]\w*)|(\d+\.?\d*)/g;
  return src.replace(re, (m, comment, str, word, num) => {
    if (comment) return `<span class="c-com">${comment}</span>`;
    if (str) return `<span class="c-str">${str}</span>`;
    if (num) return `<span class="c-num">${num}</span>`;
    if (word) {
      if (KEYWORDS.has(word) || CONSTS.has(word)) return `<span class="c-kw">${word}</span>`;
      if (BUILTINS.has(word)) return `<span class="c-fn">${word}</span>`;
      return word;
    }
    return m;
  });
}

/* Markup highlighter, for the HTML course.
 *
 * WHY THIS EXISTS. Every snippet on this platform went through highlightPython,
 * including all of the HTML track — its live `code` blocks, its drills and its
 * debug tasks. Nothing was unsafe, because esc() runs first and the tags render
 * literally either way. It was simply reading the wrong language, and in
 * production that looked like:
 *
 *   <label for="email">   ->  `for` painted as a Python keyword
 *   <input type="email">  ->  `input` a builtin, `type` a builtin
 *   <p>The Kestrel 300 is the model we tested.</p>
 *                         ->  `is` a KEYWORD and `300` a NUMBER, in prose
 *   <time datetime="2026-08-06">6 August 2026</time>
 *                         ->  the visible date coloured as two numbers
 *
 * The last two are the ones that matter: the Python highlighter colours a
 * snippet's TEXT CONTENT, and markup is mostly text content. English sentences
 * inside a paragraph came out spotted with keyword and number colours.
 *
 * So this one paints the markup and leaves the words alone — tag names, the
 * attribute names, the quoted values and comments, and nothing else. It reuses
 * the same five colour classes, so no stylesheet changes with it.
 */
export function highlightHtml(code: string): string {
  const src = esc(code);
  // comment | doctype | tag. Everything the tag pattern does not match is text
  // content, and text content is deliberately left uncoloured.
  const re = /(&lt;!--[\s\S]*?--&gt;)|(&lt;!DOCTYPE[\s\S]*?&gt;)|(&lt;\/?)([a-zA-Z][\w:-]*)([\s\S]*?)(\/?&gt;)/g;
  return src.replace(re, (m, comment, doctype, open, name, attrs, close) => {
    if (comment) return `<span class="c-com">${comment}</span>`;
    if (doctype) return `<span class="c-com">${doctype}</span>`;
    // A quoted value is consumed whole, so an `=` or a stray word inside one is
    // never mistaken for another attribute.
    const painted = attrs.replace(
      /([a-zA-Z_:][\w:.-]*)(\s*=\s*("[^"]*"|'[^']*'|[^\s"'&]+))?/g,
      (_full: string, an: string, assign: string | undefined, av: string | undefined) =>
        `<span class="c-fn">${an}</span>` +
        (assign ? assign.replace(av as string, `<span class="c-str">${av}</span>`) : "")
    );
    return `<span class="c-kw">${open}${name}</span>${painted}<span class="c-kw">${close}</span>`;
  });
}

/** Which highlighter a track's snippets are written in. */
export function highlightFor(track?: string) {
  return track === "html" ? highlightHtml : highlightPython;
}
