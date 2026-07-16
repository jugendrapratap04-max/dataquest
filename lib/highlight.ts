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
