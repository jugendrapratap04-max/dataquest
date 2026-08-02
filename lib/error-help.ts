/* Turn a raw Python error into an explanation a beginner can act on.
 *
 * Every other platform shows the student `TypeError: 'NoneType' object is not
 * subscriptable` and stops there. That message is accurate and useless: it names
 * the symptom in the vocabulary of someone who already knows the answer, at the
 * exact moment a beginner decides they cannot code.
 *
 * We are the only ones who can do better cheaply, because the explanations are
 * already written. Every lesson carries a `mistakes` block — roughly 160 of
 * them, each one a real beginner error with why it happens and what to do. This
 * file is the join: error text in, that explanation out, plus the lesson that
 * teaches it properly.
 *
 * No AI and no server call. It is a lookup table, so it is instant, free, and
 * cannot invent a wrong explanation the way a model can.
 *
 * Adding a case: put the more specific pattern ABOVE the general one — the
 * first match wins, and `AttributeError: 'tuple' object has no attribute
 * 'append'` has to be tested before the catch-all AttributeError.
 */

export type ErrorHelp = {
  /** One line, in plain words, naming what actually went wrong. */
  title: string;
  /** Why Python is complaining — the mental model, not the symptom. */
  what: string;
  /** What to do about it. */
  fix: string;
  /** Lesson slug that teaches this properly, linked as /learn/<slug>. */
  lesson?: string;
  lessonLabel?: string;
};

type Rule = {
  test: RegExp;
  build: (m: RegExpMatchArray) => ErrorHelp;
};

/** Escape a captured value before it goes near the DOM as text. */
const q = (s: string | undefined) => (s ?? "").trim();

const RULES: Rule[] = [
  // ---------------------------------------------------------------- names ---
  {
    test: /NameError: name ['"]([^'"]+)['"] is not defined/,
    build: (m) => ({
      title: `Python has never seen the name “${q(m[1])}”`,
      what: `Nothing in your code has stored anything under that name before this line — so when Python reaches it, there is nothing to fetch. Almost always it is one of three things: a spelling that does not match where you created it, a name used before the line that creates it, or quotes missing from text (${q(m[1])} without quotes is a name, "${q(m[1])}" is a string).`,
      fix: `Check the spelling against the line where you created it — they must match exactly, capitals included. If you meant it as text, put quotes around it.`,
      lesson: "variables-data-types",
      lessonLabel: "Variables & Data Types",
    }),
  },
  {
    test: /UnboundLocalError/,
    build: () => ({
      title: "You changed a name inside a function that was created outside it",
      what: "Assigning to a name anywhere inside a function makes Python treat it as belonging to that function — for the whole function, including the lines before the assignment. So reading it first looks like reading something that does not exist yet.",
      fix: "If you meant to use the outer value, read it without assigning to it, or pass it in as an argument. If you really must change the outer one, declare it with `global`.",
      lesson: "scope",
      lessonLabel: "Variable Scope",
    }),
  },

  // ------------------------------------------------------------- the None ---
  {
    test: /TypeError: 'NoneType' object is not (subscriptable|iterable|callable)/,
    build: () => ({
      title: "You are using the result of something that did not return a result",
      what: "A function with no `return` hands back `None`. So do the methods that change something in place — `list.sort()`, `list.append()`, `random.shuffle()` all do their work and return `None`. If you wrote `marks = marks.sort()`, the sorted list was thrown away and `marks` is now `None`.",
      fix: "Find the line that produced this value. Either call the in-place method on its own line and assign nothing, or use the version that returns something — `sorted(marks)` instead of `marks.sort()`.",
      lesson: "lists-tuples",
      lessonLabel: "Lists & Tuples",
    }),
  },
  {
    test: /AttributeError: 'NoneType' object has no attribute/,
    build: () => ({
      title: "The thing you are calling a method on is None",
      what: "Something earlier returned `None` — a function with no `return`, or an in-place method like `.sort()` — and now you are asking that `None` to do something.",
      fix: "Work backwards to the line where the value came from and check what it actually returns.",
      lesson: "functions",
      lessonLabel: "Functions",
    }),
  },

  // ---------------------------------------------------------- indentation ---
  {
    test: /IndentationError: expected an indented block/,
    build: () => ({
      title: "A block was opened and left empty",
      what: "A line ending in `:` — `def`, `if`, `for`, `while`, `class` — promises an indented block underneath it. Python decides where a block starts and ends by indentation, so an empty one is not allowed.",
      fix: "Indent the next line by four spaces. If you genuinely have nothing to put there yet, write `pass`, which is the statement that does nothing.",
      lesson: "conditionals",
      lessonLabel: "Conditionals (if / else)",
    }),
  },
  {
    test: /IndentationError|TabError/,
    build: () => ({
      title: "The indentation does not line up",
      what: "Indentation is how Python knows which lines belong together, so it has to be consistent. Mixing tabs and spaces looks identical on screen and is not identical to Python.",
      fix: "Use four spaces per level, and make every line in the same block start at the same column.",
      lesson: "getting-started",
      lessonLabel: "Meet Python",
    }),
  },

  // --------------------------------------------------------------- syntax ---
  {
    test: /SyntaxError: expected ':'/,
    build: () => ({
      title: "A colon is missing",
      what: "`def`, `if`, `elif`, `else`, `for`, `while` and `class` all end with `:` before their indented block.",
      fix: "Add `:` at the end of that line.",
      lesson: "conditionals",
      lessonLabel: "Conditionals (if / else)",
    }),
  },
  {
    test: /SyntaxError: invalid syntax/,
    build: () => ({
      title: "Python could not read that line",
      what: "Usually something small and structural: a missing `:` at the end of a `def`/`if`/`for`, an unclosed bracket or quote, or `=` (assign) where `==` (compare) was meant. Python reports the line where it gave up, which is often the line *after* the real problem.",
      fix: "Check the line above the one reported first. Count your brackets and quotes, and make sure any `def`/`if`/`for` line ends in `:`.",
      lesson: "conditionals",
      lessonLabel: "Conditionals (if / else)",
    }),
  },
  {
    test: /SyntaxError: (unterminated string literal|EOL while scanning string literal)/,
    build: () => ({
      title: "A quote was opened and never closed",
      what: "A string has to start and end with the same kind of quote on the same line.",
      fix: "Add the closing quote. If the text itself contains a quote, either use the other kind outside it or escape it with a backslash.",
      lesson: "strings",
      lessonLabel: "String Methods & Slicing",
    }),
  },

  // ---------------------------------------------------------------- types ---
  {
    test: /TypeError: (unsupported operand type\(s\) for \+|can only concatenate str)/,
    build: () => ({
      title: "You are adding text to a number",
      what: "`+` means add for numbers and join for text, and Python refuses to guess which you wanted. `\"85\" + 5` is the classic — the 85 came in as text, most often from `input()`, which always hands back text even when it looks like a number.",
      fix: "Convert first: `int(\"85\") + 5` to add, or `\"Total: \" + str(5)` to join. Convert as early as you can, not deep inside a calculation.",
      lesson: "variables-data-types",
      lessonLabel: "Variables & Data Types",
    }),
  },
  {
    test: /ValueError: invalid literal for int\(\) with base 10: (.*)/,
    build: (m) => ({
      title: `That text (${q(m[1])}) is not a whole number`,
      what: "`int()` only accepts text that is entirely digits. A stray space is fine, but a decimal point, a comma, a currency symbol or an empty value is not — `int(\"12.5\")` fails even though the value is numeric.",
      fix: "Use `float()` if it has a decimal point. Clean the text first with `.strip()`, and check with `.isdigit()` before converting when the data might be messy.",
      lesson: "variables-data-types",
      lessonLabel: "Variables & Data Types",
    }),
  },
  {
    test: /TypeError: '(int|float|bool)' object is not iterable/,
    build: () => ({
      title: "You tried to loop over a single number",
      what: "`for` walks through a collection — a list, a string, a dictionary. A lone number has no items to walk through.",
      fix: "If you wanted to count, use `range(n)`. If you meant to walk a list, check you passed the list and not its length.",
      lesson: "loops",
      lessonLabel: "Loops (for / while)",
    }),
  },
  {
    test: /TypeError: string indices must be integers/,
    build: () => ({
      title: "You indexed a string as if it were a dictionary",
      what: "`text[\"name\"]` does not work — a string is indexed by position, so only numbers go in the brackets. This usually means a value you expected to be a dictionary arrived as text.",
      fix: "Print the value and its `type()` on the line before. If it is JSON text, it needs `json.loads()` before you can read keys from it.",
      lesson: "strings",
      lessonLabel: "String Methods & Slicing",
    }),
  },
  {
    test: /TypeError: unhashable type: '(list|dict|set)'/,
    build: (m) => ({
      title: `A ${q(m[1])} cannot be used as a dictionary key`,
      what: "Keys must be things that cannot change, because the slot a key lives in is calculated from its value. A list can be changed after it is stored, which would strand the value where nothing can find it.",
      fix: "Use a tuple instead of a list, or a `frozenset` instead of a set. Strings and numbers are always safe.",
      lesson: "dicts-sets",
      lessonLabel: "Dictionaries & Sets",
    }),
  },

  // ----------------------------------------------------------- attributes ---
  {
    test: /AttributeError: '(tuple|str|int|float)' object has no attribute '(append|add|sort|update)'/,
    build: (m) => ({
      title: `A ${q(m[1])} cannot be changed after it is made`,
      what: `${q(m[1])} is immutable, so it has no method that would modify it — that is not a missing feature, it is the point of the type. Methods on it hand back a new value instead of changing the original.`,
      fix: `If the data needs to change, it should be a list. If it should not change, that is the type doing its job — build a new value from it instead.`,
      lesson: "lists-tuples",
      lessonLabel: "Lists & Tuples",
    }),
  },
  {
    test: /AttributeError: '?([A-Za-z_][\w.]*)'? object has no attribute '([^']+)'/,
    build: (m) => ({
      title: `${q(m[1])} objects have nothing called “${q(m[2])}”`,
      what: `Either the name is spelled differently from where it was created, or the value is not the type you think it is. Inside a class, this often means \`__init__\` stored it under a different name — or stored it as a plain local instead of on \`self\`.`,
      fix: `Check the spelling against where it was set. In a class, make sure \`__init__\` wrote \`self.${q(m[2])} = ...\` and not just \`${q(m[2])} = ...\`, which vanishes when \`__init__\` ends.`,
      lesson: "oop",
      lessonLabel: "Classes & Objects (OOP)",
    }),
  },

  // ----------------------------------------------------------- containers ---
  {
    test: /IndexError: (list|string|tuple) index out of range/,
    build: (m) => ({
      title: `There is no item at that position`,
      what: `Positions start at 0, so a ${q(m[1])} of three items has positions 0, 1 and 2 — asking for 3 is one past the end. This is the commonest error a beginner ever sees.`,
      fix: `Use \`[-1]\` for the last item instead of counting, and check \`len()\` before reaching for a position you calculated.`,
      lesson: "lists-tuples",
      lessonLabel: "Lists & Tuples",
    }),
  },
  {
    test: /KeyError: (.*)/,
    build: (m) => ({
      title: `The dictionary has no key ${q(m[1])}`,
      what: "Reading a key that is not there stops the program — it does not hand back an empty value. On a large file that means the whole job dies partway through, on the first row that happens to be missing something.",
      fix: "Use `.get(key)` when the key might be absent — it returns `None`, or a default you choose, instead of stopping. Use `key in d` when you only want to check.",
      lesson: "dicts-sets",
      lessonLabel: "Dictionaries & Sets",
    }),
  },

  // ------------------------------------------------------------- function ---
  {
    test: /TypeError: (\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/,
    build: (m) => ({
      title: `${q(m[1])}() was given ${q(m[3])} values but expects ${q(m[2])}`,
      what: `The number of values in the call has to match the number of names in the \`def\` line. Inside a class there is one extra thing to know: Python passes the object itself as the first argument, so a method must list \`self\` first — and if it does, you do not pass it yourself.`,
      fix: `Compare the call with the \`def\` line and count both. In a class, add \`self\` as the first name in the method's brackets.`,
      lesson: "functions",
      lessonLabel: "Functions",
    }),
  },
  {
    test: /TypeError: (\w+)\(\) missing (\d+) required positional argument/,
    build: (m) => ({
      title: `${q(m[1])}() was not given everything it needs`,
      what: `The \`def\` line lists names that the caller must supply, and one or more of them arrived empty.`,
      fix: `Pass the missing value, or give that name a default in the \`def\` line — \`def greet(name="there"):\` — so it becomes optional.`,
      lesson: "functions",
      lessonLabel: "Functions",
    }),
  },
  {
    test: /RecursionError/,
    build: () => ({
      title: "A function kept calling itself and never stopped",
      what: "Recursion needs a base case — a condition where it returns without calling itself again. Without one, or if the calls never move toward it, it goes until Python gives up.",
      fix: "Check that the base case exists, is checked first, and that each call is getting closer to it.",
      lesson: "advanced-functions",
      lessonLabel: "Advanced Functions",
    }),
  },

  // --------------------------------------------------------------- others ---
  {
    test: /ZeroDivisionError/,
    build: () => ({
      title: "Something was divided by zero",
      what: "Usually the divisor is a count that turned out to be 0 — an average of an empty list is the classic case.",
      fix: "Check the divisor before dividing: `if len(items) > 0:` , or return 0 early when there is nothing to average.",
      lesson: "numbers-math",
      lessonLabel: "Numbers & the Math Module",
    }),
  },
  {
    test: /ModuleNotFoundError: No module named '([^']+)'/,
    build: (m) => ({
      title: `There is no module called “${q(m[1])}” here`,
      what: `Either the name is misspelled, or that package is not available in this environment. The practice editor runs Python inside your browser, so only the packages we ship are present — numpy, pandas, matplotlib and seaborn among them.`,
      fix: `Check the spelling first. If the package genuinely is not available here, the exercise can be solved with the standard library.`,
      lesson: "modules",
      lessonLabel: "Modules, pip & venv",
    }),
  },
  {
    test: /ValueError: not enough values to unpack|ValueError: too many values to unpack/,
    build: () => ({
      title: "The number of names does not match the number of values",
      what: "`a, b = something` needs `something` to have exactly two items. One too few or one too many and Python refuses rather than guessing.",
      fix: "Print the value first and count what is actually in it.",
      lesson: "lists-tuples",
      lessonLabel: "Lists & Tuples",
    }),
  },
];

/**
 * Explain a raw Python error. Returns null when we have nothing useful to add —
 * showing a vague guess would be worse than showing the real message alone.
 */
export function explainError(raw: string | undefined): ErrorHelp | null {
  if (!raw) return null;
  for (const rule of RULES) {
    const m = raw.match(rule.test);
    if (m) return rule.build(m);
  }
  return null;
}

/** Exposed for the test in scripts/test-error-help.mjs. */
export const RULE_COUNT = RULES.length;
