/* The Syntax section, one entry per lesson slug.
 *
 * WHY THIS FILE EXISTS. Every lesson on the platform went from "here is the
 * idea" straight to a worked example. That reads fine to somebody who already
 * knows the shape of the statement and leaves a beginner copying punctuation
 * they cannot name — they can see the colon, they were never told it opens a
 * block, and they will not deduce it from an example that merely contains one.
 * An audit of all 121 written lessons found 0 with a Syntax section, because the
 * block type did not exist.
 *
 * WHY A SEPARATE FILE. seed.mjs is 1.9MB. Threading 58 insertions through it by
 * hand is 58 chances to land a block in the wrong lesson. Keyed by slug and
 * merged in lessonContent(), this is reviewable in one screen and re-runnable —
 * the same arrangement QUIZZES already uses.
 *
 * SHAPE:
 *   intro  optional, one line of prose before the form
 *   form   the SHAPE of the statement, with placeholders where real code goes.
 *          Never runnable, never highlighted — see the renderer's note.
 *   parts  every piece of `form`, named and explained. `npm run verify:lesson`
 *          checks both directions: no part may name something absent from the
 *          form, and no keyword in the form may go unexplained.
 *   note   optional, the one thing that catches people out
 */

export const SYNTAX = {
  /* ------------------------------------------------------------ 1-5: core -- */

  "getting-started": {
    intro: "Every Python program you write starts by asking Python to show you something.",
    form: "print(value)",
    parts: [
      { bit: "print", says: "The instruction. Python already knows this word — you are not defining it, you are using it." },
      { bit: "(", says: "Opens the list of things you are handing to <code>print</code>. Every opening bracket must be closed." },
      { bit: "value", says: "What you want shown. Text goes in quotes; numbers do not. You can pass several, separated by commas." },
      { bit: ")", says: "Closes the list. Forget it and Python keeps reading the next line as part of this one." },
    ],
    note: "Nothing is printed unless you ask. Python calculating something and Python showing you something are two different acts.",
  },

  "variables-data-types": {
    intro: "A variable is made by putting a name on the left of a single <code>=</code> and a value on the right.",
    form: "name = value",
    parts: [
      { bit: "name", says: "What you will call it later. Lowercase, words joined by underscores, and it may not start with a digit." },
      { bit: "=", says: "Assignment — \"put the value on the right into the name on the left\". It is not the maths <code>=</code>, and it is not a comparison." },
      { bit: "value", says: "The thing being stored. Python works out the type from the value itself; you never declare one." },
    ],
    note: "It reads right to left. <code>total = total + 5</code> is not a contradiction — the right side is worked out first, then stored back.",
  },

  operators: {
    intro: "An expression is values joined by operators. Python works it out and hands back a single result.",
    form: "result = left  operator  right",
    parts: [
      { bit: "left", says: "The first value — a literal, a variable, or another whole expression in brackets." },
      { bit: "operator", says: "What to do: <code>+ - * /</code> for arithmetic, <code>// %</code> for whole-number division and remainder, <code>**</code> for powers." },
      { bit: "right", says: "The second value. Both sides must be types the operator makes sense for — Python will not add text to a number." },
      { bit: "result", says: "Where the answer goes. Nothing is stored unless you assign it somewhere." },
    ],
    note: "Order matters: <code>**</code> first, then <code>* / // %</code>, then <code>+ -</code>. Brackets beat all of them, and are worth adding whenever you had to stop and think.",
  },

  conditionals: {
    intro: "A condition chooses which block of code runs. The shape is the same every time.",
    form: "if condition:\n    body\nelif other_condition:\n    body\nelse:\n    body",
    parts: [
      { bit: "if", says: "Starts the decision. Its block runs only when the condition is true." },
      { bit: "condition", says: "Anything that is true or false — usually a comparison like <code>marks &gt;= 40</code>." },
      { bit: ":", says: "Ends the line and opens a block. Missing it is the single commonest beginner error." },
      { bit: "body", says: "The indented lines that belong to this branch. Four spaces, and every line in the block at the same depth." },
      { bit: "elif", says: "\"Otherwise, if…\" — checked only when every test above it was false. You may have as many as you like, or none." },
      { bit: "else", says: "The catch-all. No condition, because it runs exactly when nothing above it did. Optional." },
    ],
    note: "The indent is what ends a block — there is no closing brace. Un-indent, and you have left the <code>if</code>.",
  },

  loops: {
    intro: "Python has two loops. <code>for</code> walks through things that already exist; <code>while</code> repeats until a condition stops being true.",
    form: "for item in sequence:\n    body\n\nwhile condition:\n    body",
    parts: [
      { bit: "for", says: "Walks a collection one item at a time and stops on its own when the items run out." },
      { bit: "item", says: "A name you choose. Each turn of the loop, the next value is put into it." },
      { bit: "in", says: "Reads literally — \"for each item in this collection\". Not the same <code>in</code> as the membership test, though it is spelt the same." },
      { bit: "sequence", says: "What is being walked: a list, a string, a dictionary, or <code>range(n)</code> when you just want to count." },
      { bit: "while", says: "Repeats as long as its condition is true. Nothing stops it for you — something inside the body must eventually make the condition false." },
      { bit: "condition", says: "Checked before every turn, including the first. If it is false at the start, the body never runs at all." },
      { bit: "body", says: "The indented lines repeated each turn." },
    ],
    note: "Reach for <code>for</code> when you know what you are walking, and <code>while</code> when you only know when to stop.",
  },

  /* ------------------------------------------------- 6-8: the collections -- */

  "lists-tuples": {
    intro: "A list is written in square brackets and read by position.",
    form: "names = [first, second, third]\nnames[0]\nnames[start:stop]",
    parts: [
      { bit: "[", says: "Opens a list when it stands after <code>=</code>, and opens an index when it stands right after a name." },
      { bit: "first", says: "The items, separated by commas. They may be of different types, and the order you write them is the order they keep." },
      { bit: "]", says: "Closes the list or the index." },
      { bit: "names[0]", says: "One item, by position. Counting starts at <b>0</b>, so the third item is <code>names[2]</code> and the last is <code>names[-1]</code>." },
      { bit: "start:stop", says: "A slice — a new list from <code>start</code> up to but <b>not including</b> <code>stop</code>. Leave either side blank to mean \"from the beginning\" or \"to the end\"." },
    ],
    note: "A tuple is the same idea in round brackets and cannot be changed afterwards. Use one when the contents are fixed.",
  },

  "dicts-sets": {
    intro: "A dictionary stores values under names you choose, instead of under positions Python chooses.",
    form: "student = {key: value, key: value}\nstudent[key]\nstudent.get(key, default)",
    parts: [
      { bit: "{", says: "Opens the dictionary." },
      { bit: "key", says: "What you look the value up by. Must be something unchangeable — text and numbers are safe, a list is not." },
      { bit: ":", says: "Separates each key from its value. Inside braces it pairs things up; it does not open a block here." },
      { bit: "value", says: "Anything at all, including another dictionary or a list." },
      { bit: "}", says: "Closes the dictionary." },
      { bit: "student[key]", says: "Fetches the value. If the key is not there, the program stops with a <code>KeyError</code>." },
      { bit: "student.get(key, default)", says: "Fetches it safely — hands back <code>default</code> instead of stopping when the key is missing." },
    ],
    note: "Use <code>[]</code> when a missing key means your data is wrong and you want to know at once; use <code>.get()</code> when missing is normal.",
  },

  "sets-dicts-deeper": {
    intro: "A set holds each value once, and answers \"is this in here?\" faster than a list can.",
    form: "unique = {value, value, value}\nempty = set()\na | b    a & b    a - b",
    parts: [
      { bit: "{", says: "Opens a set — the same braces as a dictionary, but with bare values instead of key-value pairs." },
      { bit: "value", says: "The members. Duplicates are dropped silently, and the order is not kept." },
      { bit: "}", says: "Closes it." },
      { bit: "set()", says: "The empty set. <code>{}</code> cannot mean this — it already means an empty dictionary." },
      { bit: "|", says: "Union: everything in either set." },
      { bit: "&", says: "Intersection: only what is in both." },
      { bit: "-", says: "Difference: what is in the left one and not the right." },
    ],
    note: "Because a set has no order, there is no <code>unique[0]</code>. If you need positions, turn it back into a list.",
  },

  /* --------------------------------------------- 9-12: structure and text -- */

  functions: {
    intro: "A function gives a name to a block of work so you can run it whenever you like.",
    form: "def name(parameter, parameter=default):\n    body\n    return value",
    parts: [
      { bit: "def", says: "\"Define\" — this creates the function. It does not run it." },
      { bit: "name", says: "What you will call it by later, written the same way as a variable name." },
      { bit: "(", says: "Opens the parameter list. It stays even when there are no parameters: <code>def greet():</code>." },
      { bit: "parameter", says: "A name for a value the caller must supply. Inside the function it behaves like an ordinary variable." },
      { bit: "default", says: "Makes that parameter optional — the caller may leave it out and this value is used instead." },
      { bit: ")", says: "Closes the parameter list." },
      { bit: ":", says: "Opens the function's block, exactly as it does for <code>if</code> and <code>for</code>." },
      { bit: "body", says: "The indented work. It runs only when somebody calls the function." },
      { bit: "return", says: "Hands a value back to whoever called, and stops the function there. Leave it out and the caller receives <code>None</code>." },
      { bit: "value", says: "What is handed back. It can be anything, including a list or another function." },
    ],
    note: "Defining and calling are separate. <code>def greet():</code> creates it; <code>greet()</code> runs it.",
  },

  strings: {
    intro: "Text is read by position and cut with the same slice syntax lists use.",
    form: "text[index]\ntext[start:stop:step]\ntext.method()",
    parts: [
      { bit: "text[index]", says: "One character, counting from 0. <code>text[-1]</code> is the last one." },
      { bit: "start", says: "Where the slice begins, included. Blank means the beginning." },
      { bit: "stop", says: "Where it ends, <b>not</b> included. Blank means the end." },
      { bit: "step", says: "How far to jump each time. Optional; <code>-1</code> walks backwards and is the usual way to reverse text." },
      { bit: "text.method()", says: "Methods like <code>.upper()</code>, <code>.strip()</code> and <code>.split()</code> hand back a <b>new</b> string." },
    ],
    note: "Strings cannot be changed in place. <code>text.upper()</code> does nothing unless you store the result.",
  },

  comprehensions: {
    intro: "A comprehension builds a whole list in one line, in the same order you would say it aloud.",
    form: "[expression for item in sequence if condition]",
    parts: [
      { bit: "[", says: "You are building a list, so it is written in list brackets." },
      { bit: "expression", says: "What goes <i>into</i> the new list for each item — the item itself, or something worked out from it. Written first, though it happens last." },
      { bit: "for", says: "The same loop as always, just written on one line." },
      { bit: "item", says: "The name each value takes as the loop walks. It exists only inside the brackets." },
      { bit: "in", says: "Reads as \"in\" — what is being walked follows." },
      { bit: "sequence", says: "The collection being walked." },
      { bit: "if", says: "Optional. Keeps only the items the condition is true for; everything else is skipped." },
      { bit: "condition", says: "The test applied to each item." },
      { bit: "]", says: "Closes it." },
    ],
    note: "Read it in this order: <code>for</code> first, then <code>if</code>, then the expression. That is the order Python runs it in.",
  },

  oop: {
    intro: "A class is a template. Each object made from it carries its own copy of the data.",
    form: "class Name:\n    def __init__(self, parameter):\n        self.attribute = parameter\n\n    def method(self):\n        return self.attribute",
    parts: [
      { bit: "class", says: "Defines the template. By convention the name starts with a capital letter." },
      { bit: "Name", says: "What you will call it. <code>Name(...)</code> later builds an object from it." },
      { bit: ":", says: "Opens the class body, exactly as it does everywhere else." },
      { bit: "def", says: "Functions defined inside a class are called methods. They belong to the objects, not to you." },
      { bit: "__init__", says: "Run automatically the moment an object is made. Its job is to store the starting data — it is not a function you call yourself." },
      { bit: "self", says: "The object this method was called on. Python passes it for you, so you write it in the definition and never in the call." },
      { bit: "parameter", says: "A value the caller supplies when building the object." },
      { bit: "self.attribute", says: "Data stored <i>on the object</i>. Drop the <code>self.</code> and it becomes an ordinary local that vanishes when the method ends." },
      { bit: "method", says: "Any other behaviour the object has. It takes <code>self</code> first, then whatever else it needs." },
      { bit: "return", says: "Hands a value back to the caller, as in any function." },
    ],
    note: "Every method takes <code>self</code> as its first parameter. Forgetting it produces \"takes 0 positional arguments but 1 was given\".",
  },

  /* ------------------------------------------- 13-16: when things go wrong -- */

  "error-handling": {
    intro: "You cannot stop a file from being missing. You can decide what happens when it is.",
    form: "try:\n    risky_work\nexcept ErrorType as err:\n    handle_it\nelse:\n    ran_clean\nfinally:\n    always_runs\n\nraise ErrorType(\"message\")",
    parts: [
      { bit: "try", says: "\"Attempt this.\" Put only the line that might fail inside it — a wide <code>try</code> hides which line actually broke." },
      { bit: "risky_work", says: "The thing that might raise: opening a file, converting text to a number, reaching a key." },
      { bit: "except", says: "Catches the failure and keeps the program alive. Without it, the error stops everything." },
      { bit: "ErrorType", says: "Which failure you are catching — <code>ValueError</code>, <code>FileNotFoundError</code>. Naming it matters: a bare <code>except</code> also swallows your own typos." },
      { bit: "as", says: "Optional. Puts the error object into a name so you can read what it actually said." },
      { bit: "err", says: "The error itself. <code>print(err)</code> gives Python's own message." },
      { bit: "handle_it", says: "What to do instead — a default value, a message, a retry. Not <code>pass</code>: silence is how bugs survive." },
      { bit: "else", says: "Runs only when <code>try</code> finished without raising. Optional, and the honest place for work that must not be inside the try." },
      { bit: "ran_clean", says: "The follow-on work that only makes sense if nothing failed." },
      { bit: "finally", says: "Runs either way — after success, after failure, even on the way out. For cleanup that must happen regardless." },
      { bit: "always_runs", says: "Closing a file, releasing a lock, stopping a timer." },
      { bit: "raise", says: "Throws an error on purpose — how you report that <i>your</i> function was given something it cannot work with." },
    ],
    note: "Catch the error you expected. Catching everything turns a crash you could have read into a program that quietly does the wrong thing.",
  },

  "file-handling": {
    intro: "A file has to be opened before it can be read and closed after. <code>with</code> does the closing for you.",
    form: "with open(path, mode) as file:\n    contents = file.read()",
    parts: [
      { bit: "with", says: "Opens something that must also be closed, and guarantees the closing — even if the block raises halfway through." },
      { bit: "open", says: "Finds the file and hands back a file object. It does not read anything yet." },
      { bit: "path", says: "Where the file is. A bare name means \"next to the program\", which is not always where you are running it from." },
      { bit: "mode", says: "<code>\"r\"</code> read, <code>\"w\"</code> write — which <b>empties</b> the file first — <code>\"a\"</code> append, <code>\"r+\"</code> both. Default is read." },
      { bit: "as", says: "Names the opened file so the block can use it." },
      { bit: "file", says: "The file object. <code>.read()</code> takes it all, <code>.readlines()</code> gives a list, and looping over it gives one line at a time." },
      { bit: "contents", says: "What you read, as text. Reading a file you have already read to the end gives an empty string — the position does not rewind." },
    ],
    note: "Always <code>with</code>. Opening without it works right up until an error skips your <code>.close()</code> and the write is never flushed to disk.",
  },

  modules: {
    intro: "Code somebody else wrote becomes yours with one line — but there are three ways to write it, and they do different things.",
    form: "import module\nimport module as alias\nfrom module import name",
    parts: [
      { bit: "import", says: "Loads the module. It runs the whole file once, the first time, and remembers it afterwards." },
      { bit: "module", says: "The name — from the standard library, from pip, or one of your own files sitting beside this one." },
      { bit: "as", says: "Gives it a shorter local name. <code>import pandas as pd</code> is a convention, not a rule, but follow it anyway." },
      { bit: "alias", says: "What you will type instead. The original name is then no longer available." },
      { bit: "from", says: "Takes one thing <i>out</i> of the module instead of the module itself, so you write <code>sqrt(9)</code> rather than <code>math.sqrt(9)</code>." },
      { bit: "name", says: "The specific function or class you want. Several may be listed, separated by commas." },
    ],
    note: "Avoid <code>from module import *</code>. It drops every name into your file at once, and when two modules both define <code>load</code> you will not be able to tell which one you are calling.",
  },

  "numbers-math": {
    intro: "Python does arithmetic on its own. The <code>math</code> module is for everything past arithmetic.",
    form: "import math\n\nmath.sqrt(value)\nround(value, digits)\nabs(value)",
    parts: [
      { bit: "import", says: "<code>math</code> is in the standard library — already installed, but not loaded until you ask." },
      { bit: "math", says: "The module. Everything inside is reached through it: <code>math.pi</code>, <code>math.floor</code>, <code>math.ceil</code>." },
      { bit: "math.sqrt(value)", says: "Square root. Always hands back a float, so <code>math.sqrt(9)</code> is <code>3.0</code> and not <code>3</code>." },
      { bit: "round(value, digits)", says: "Built in, no import needed. <code>digits</code> is optional and defaults to 0 — which gives a whole number." },
      { bit: "abs(value)", says: "Distance from zero, sign removed. Also built in." },
    ],
    note: "Floats are approximations: <code>0.1 + 0.2</code> is not exactly <code>0.3</code>. For money, use <code>decimal.Decimal</code> rather than rounding and hoping.",
  },

  /* --------------------------------------------- 17-20: text, truth, names -- */

  "string-formatting": {
    intro: "An f-string builds text with values dropped into it, in the place you want them to appear.",
    form: "f\"text {expression} text\"\nf\"{value:>10.2f}\"",
    parts: [
      { bit: "f", says: "The marker that makes it an f-string. Without it the braces are just braces and get printed literally." },
      { bit: "\"", says: "Ordinary quotes. Single or double, as long as they match." },
      { bit: "{", says: "Opens a slot. Everything up to the matching brace is Python, worked out and dropped in." },
      { bit: "expression", says: "Not only a variable — any expression: <code>{price * qty}</code>, <code>{name.upper()}</code>, <code>{len(items)}</code>." },
      { bit: "}", says: "Closes the slot." },
      { bit: ":", says: "Everything after it is formatting instructions, not part of the value." },
      { bit: ">10", says: "Width and alignment — 10 characters wide, pushed right. <code>&lt;</code> is left, <code>^</code> is centred. This is how columns line up." },
      { bit: ".2f", says: "Two decimal places, as a fixed-point number. <code>.2%</code> gives a percentage, <code>,</code> adds thousands separators." },
    ],
    note: "To print a literal brace, double it: <code>{{</code> gives one <code>{</code>.",
  },

  booleans: {
    intro: "Every condition ends up as one of two values, and Python has an answer for things that are not obviously either.",
    form: "value == other\nvalue is other\nnot value\na and b\na or b\nbool(value)",
    parts: [
      { bit: "==", says: "Are these two the same <b>value</b>? This is the one you want almost every time." },
      { bit: "is", says: "Are these two the same <b>object in memory</b>? Only for <code>None</code>, <code>True</code> and <code>False</code> — using it on numbers or text appears to work and then stops without warning." },
      { bit: "not", says: "Flips the answer. <code>not True</code> is <code>False</code>." },
      { bit: "and", says: "True only when both sides are. Stops as soon as it meets a false one and never looks at the rest." },
      { bit: "or", says: "True when either side is. Stops at the first true one." },
      { bit: "bool(value)", says: "What Python thinks a non-boolean is worth. <code>0</code>, <code>\"\"</code>, <code>[]</code>, <code>{}</code> and <code>None</code> are false; almost everything else is true." },
    ],
    note: "Because empty things are false, <code>if items:</code> already means \"if the list has anything in it\" — no need for <code>len(items) &gt; 0</code>.",
  },

  lambda: {
    intro: "A lambda is a function small enough to fit where it is used, so it never needs a name.",
    form: "lambda parameter, parameter: expression",
    parts: [
      { bit: "lambda", says: "Makes a function right here. It hands one back — it does not store it anywhere." },
      { bit: "parameter", says: "The inputs, comma-separated. Brackets are not used, unlike <code>def</code>." },
      { bit: ":", says: "Separates the inputs from the single expression that is the body." },
      { bit: "expression", says: "One expression, and its value is returned automatically. No <code>return</code> is written, and no statements are allowed." },
    ],
    note: "One expression is the whole limit. The moment you want an <code>if</code> on its own line or two steps, it needs to be a <code>def</code>.",
  },

  scope: {
    intro: "A name created inside a function belongs to that function, and disappears when it ends.",
    form: "name = value\n\ndef outer():\n    inner_name = value\n\n    def inner():\n        nonlocal inner_name\n        global name",
    parts: [
      { bit: "name", says: "Created at the top level, so every function can <b>read</b> it." },
      { bit: "def", says: "Each function opens a new scope. Names born inside it are invisible from outside." },
      { bit: "inner_name", says: "Local to <code>outer</code>. It ceases to exist the moment <code>outer</code> returns." },
      { bit: "nonlocal", says: "\"The one in the enclosing function, not a new one.\" Needed when an inner function must <b>change</b> an outer function's variable." },
      { bit: "global", says: "\"The one at the top level.\" Needed to assign to a module-level name from inside a function." },
    ],
    note: "Reading needs no declaration; assigning does. Assign to a name anywhere in a function and Python treats it as local for the <b>whole</b> function — which is what <code>UnboundLocalError</code> is telling you.",
  },

  /* ------------------------------------------ 21-24: data, time, decisions -- */

  json: {
    intro: "JSON is how programs send data to each other. Python turns it into dictionaries and back.",
    form: "import json\n\njson.loads(text)\njson.dumps(obj, indent=2)\njson.load(file)\njson.dump(obj, file)",
    parts: [
      { bit: "import", says: "<code>json</code> is in the standard library — nothing to install." },
      { bit: "json.loads(text)", says: "Load-<b>s</b>tring: JSON text in, Python object out. Objects become dictionaries, arrays become lists." },
      { bit: "json.dumps(obj, indent=2)", says: "Dump-<b>s</b>tring: Python object in, JSON text out. <code>indent</code> is optional and makes it readable by a human." },
      { bit: "json.load(file)", says: "The same, reading straight from an open file — no <code>s</code>, because there is no string involved." },
      { bit: "json.dump(obj, file)", says: "Writes straight to an open file." },
    ],
    note: "The <code>s</code> is the whole difference: with it, you are handling a string; without it, a file. Mixing them up gives \"expected str, got TextIOWrapper\".",
  },

  dates: {
    intro: "A date is not text. Store it as a date and Python can compare, subtract and format it for you.",
    form: "from datetime import datetime, timedelta\n\nnow = datetime.now()\nnow.strftime(\"%d-%m-%Y\")\ndatetime.strptime(text, \"%d-%m-%Y\")\nnow + timedelta(days=7)",
    parts: [
      { bit: "from", says: "The module is <code>datetime</code> and so is the class inside it — so it is taken out by name to avoid writing <code>datetime.datetime</code>." },
      { bit: "import", says: "Loads them. Both names are then used directly." },
      { bit: "datetime.now()", says: "This moment, as an object holding date and time together." },
      { bit: "strftime", says: "String-<b>f</b>rom-time: object → text, in the layout you describe. <code>%d</code> day, <code>%m</code> month, <code>%Y</code> four-digit year, <code>%H:%M</code> time." },
      { bit: "strptime", says: "String-<b>p</b>arse-time: text → object. The format must match the text exactly, or it raises." },
      { bit: "timedelta", says: "A length of time, not a point in one. Add or subtract it from a datetime to move." },
    ],
    note: "Subtracting two datetimes gives a <code>timedelta</code>, and <code>.days</code> reads the whole days out of it.",
  },

  "more-operators": {
    intro: "Three families that look like arithmetic and are not: membership, identity and bit-level work.",
    form: "value in collection\nvalue not in collection\na is b\na is not b\na & b    a | b    a ^ b    a << n",
    parts: [
      { bit: "in", says: "Membership — is this value inside that collection? Works on lists, strings, dictionaries (checks the keys) and sets." },
      { bit: "not", says: "Negates the test that follows it. <code>not in</code> and <code>is not</code> are read as single operators." },
      { bit: "is", says: "Identity — are these two names pointing at the <b>same object</b>? Reserve it for <code>None</code>." },
      { bit: "&", says: "Bitwise AND: a 1 wherever both numbers have a 1. Also set intersection." },
      { bit: "|", says: "Bitwise OR: a 1 wherever either has one. Also set union." },
      { bit: "^", says: "Bitwise XOR: a 1 where they <b>differ</b>. Applying it twice with the same value gives the original back." },
      { bit: "<<", says: "Shift the bits left, which doubles the number once per place. <code>&gt;&gt;</code> shifts right and halves." },
      { bit: "n", says: "How many places to shift by." },
    ],
    note: "On a set, <code>&</code> and <code>|</code> mean intersection and union. Same symbols, different meaning depending on what is either side of them.",
  },

  "match-case": {
    intro: "<code>match</code> compares one value against several shapes, and runs the first that fits.",
    form: "match subject:\n    case pattern:\n        body\n    case pattern if guard:\n        body\n    case _:\n        body",
    parts: [
      { bit: "match", says: "Names the value being examined. Available from Python 3.10." },
      { bit: "subject", says: "What is being matched — a value, a tuple, a list, or a whole object." },
      { bit: "case", says: "One shape to try. They are checked top to bottom and the <b>first</b> match wins; the rest are never looked at." },
      { bit: "pattern", says: "What the subject must look like. A literal matches exactly; a bare name captures whatever is there into that name." },
      { bit: "if", says: "An optional guard. The case matches only when the pattern fits <b>and</b> the condition is true." },
      { bit: "guard", says: "The extra condition, which may use anything the pattern just captured." },
      { bit: "_", says: "The catch-all, matching anything. Put it last — anything after it is unreachable." },
      { bit: "body", says: "The indented work for that case. There is no fall-through, so no <code>break</code> is needed." },
    ],
    note: "A bare name in a pattern does not compare — it captures. <code>case x:</code> matches everything and puts the value in <code>x</code>, which is rarely what a beginner means.",
  },

  /* ------------------------------------- 25-29: functions and objects, deeper -- */

  "advanced-functions": {
    intro: "Two things at once: a function that accepts any number of arguments, and a function that calls itself.",
    form: "def name(required, *args, **kwargs):\n    if base_case:\n        return value\n    return name(smaller_input)",
    parts: [
      { bit: "def", says: "The ordinary definition. Everything below is about what may go in the brackets." },
      { bit: "required", says: "A normal parameter. Named ones must come before the starred ones." },
      { bit: "*args", says: "Collects every extra positional argument into a <b>tuple</b>. The star does the collecting; <code>args</code> is only the conventional name." },
      { bit: "**kwargs", says: "Collects every extra keyword argument into a <b>dictionary</b>, keys being the names the caller used." },
      { bit: "if", says: "The base case has to be tested <b>first</b>, before any call to itself — otherwise there is nothing to stop the recursion." },
      { bit: "base_case", says: "The condition where the answer is already known and no further call is needed. Without one you get <code>RecursionError</code>." },
      { bit: "return", says: "Hands the answer back. In the base case a plain value; below it, the result of the smaller problem." },
      { bit: "smaller_input", says: "Each call must move <b>towards</b> the base case. Calling with the same input is an infinite loop with extra steps." },
    ],
    note: "Order in the brackets is fixed: normal, then <code>*args</code>, then keyword-only, then <code>**kwargs</code>. Python rejects any other arrangement.",
  },

  inheritance: {
    intro: "A class can start from another class and only describe what is different.",
    form: "class Child(Parent):\n    def __init__(self, extra):\n        super().__init__()\n        self.extra = extra",
    parts: [
      { bit: "class", says: "The usual definition — the brackets after the name are what make it inheritance." },
      { bit: "Child", says: "The new class. It gets every method the parent has, for free and without copying." },
      { bit: "Parent", says: "The class being built on. More than one may be listed, separated by commas." },
      { bit: "def", says: "Any method written here <b>replaces</b> the parent's method of the same name — that is overriding." },
      { bit: "__init__", says: "The child's own setup. Defining it stops the parent's from running automatically, which is why the next line exists." },
      { bit: "super()", says: "Reaches the parent. <code>super().__init__()</code> runs the parent's setup so its attributes exist before you add yours." },
      { bit: "self.extra", says: "Whatever the child has that the parent does not." },
    ],
    note: "Forget <code>super().__init__()</code> and the object is missing every attribute the parent would have set — which surfaces later as <code>AttributeError</code>, far from the cause.",
  },

  encapsulation: {
    intro: "Which parts of an object are for the outside world, and which are its own business.",
    form: "class Name:\n    def __init__(self):\n        self._internal = value\n        self.__private = value\n\n    @property\n    def reading(self):\n        return self.__private",
    parts: [
      { bit: "class", says: "The template, as always." },
      { bit: "def", says: "Methods. Which of them outsiders should call is what the naming below signals." },
      { bit: "self._internal", says: "One underscore: \"this is internal, please leave it alone\". A convention only — Python does not stop anyone." },
      { bit: "self.__private", says: "Two underscores: Python renames it behind the scenes so a subclass cannot collide with it by accident. Still not a security wall." },
      { bit: "@property", says: "Makes a method readable like an attribute — <code>obj.reading</code>, no brackets. Lets you compute a value while keeping the simple spelling." },
      { bit: "reading", says: "The name the outside world uses. What it does inside is free to change without breaking anybody." },
      { bit: "return", says: "What the property hands back when read." },
    ],
    note: "Python has no truly private data. The underscores are a message to the next programmer, and the next programmer is usually you.",
  },

  "dunder-methods": {
    intro: "Methods that belong to the class rather than to one object, and methods Python calls for you.",
    form: "class Name:\n    @staticmethod\n    def helper(argument):\n        return value\n\n    @classmethod\n    def build(cls, argument):\n        return cls(argument)\n\n    def __str__(self):\n        return text",
    parts: [
      { bit: "class", says: "The template." },
      { bit: "@staticmethod", says: "A plain function that happens to live in the class. Takes no <code>self</code> and no <code>cls</code> — it cannot see any object." },
      { bit: "def", says: "The definitions themselves. The decorator above each one changes what it receives." },
      { bit: "@classmethod", says: "Receives the <b>class</b> instead of an object. The usual use is an alternative constructor." },
      { bit: "cls", says: "The class itself. <code>cls(argument)</code> builds a new object of it — and keeps working in a subclass, where naming the class directly would not." },
      { bit: "__str__", says: "Called by <code>print()</code> and <code>str()</code>. Without it, printing an object gives <code>&lt;Name object at 0x7f…&gt;</code>." },
      { bit: "return", says: "<code>__str__</code> must return a string. Returning anything else raises." },
      { bit: "text", says: "The readable description — what a person should see, not what a debugger should. That second one is <code>__repr__</code>." },
    ],
    note: "The double underscores are how Python names its own hooks. You define them; you almost never call them — <code>len(obj)</code> is how you invoke <code>__len__</code>.",
  },

  "oop-advanced": {
    intro: "Data shared by every object of a class, and the order Python searches when several parents offer the same method.",
    form: "class Name(First, Second):\n    shared = value\n\n    def method(self):\n        return Name.shared\n\nName.__mro__",
    parts: [
      { bit: "class", says: "The definition. Two parents here, which is what makes the search order worth knowing." },
      { bit: "First", says: "Searched before <code>Second</code>. When both define the same method, this one wins." },
      { bit: "Second", says: "The fallback. Only reached for names <code>First</code> does not have." },
      { bit: "shared", says: "A <b>class</b> attribute — written outside any method, so one copy exists for the class and every object sees it." },
      { bit: "def", says: "An ordinary method. It can read <code>shared</code> either through the class or through <code>self</code>." },
      { bit: "self", says: "Reading <code>self.shared</code> finds the class attribute. <b>Assigning</b> to it does not: that quietly creates a new attribute on that one object." },
      { bit: "return", says: "Reaching it through the class name makes it obvious the value is shared." },
      { bit: "Name.__mro__", says: "Method Resolution Order — the exact list, in order, that Python searches. When a method comes from somewhere unexpected, this is what tells you where." },
    ],
    note: "A mutable class attribute is shared by every object. One list defined at class level, and appending in one object changes it for all of them.",
  },

  /* --------------------------------- 30-33: laziness, wrapping, patterns, parallel -- */

  "iterators-generators": {
    intro: "A generator produces values one at a time, on demand, instead of building the whole list first.",
    form: "def counter():\n    yield value\n\nfor item in counter():\n    body\n\nnext(iterator)",
    parts: [
      { bit: "def", says: "An ordinary definition. One <code>yield</code> anywhere inside is what turns it into a generator." },
      { bit: "yield", says: "Hands a value out and <b>freezes</b> the function exactly where it stands. The next request resumes from that line with every local intact." },
      { bit: "for", says: "The usual loop. It calls the generator repeatedly until the function ends." },
      { bit: "item", says: "Each yielded value in turn." },
      { bit: "in", says: "What is being walked follows — here, the generator." },
      { bit: "body", says: "Runs once per value. Only one value exists at a time, which is the whole point." },
      { bit: "next(iterator)", says: "Asks for one value by hand. When there are none left it raises <code>StopIteration</code> — which is exactly what <code>for</code> catches for you." },
    ],
    note: "A generator is used up once. Loop over it a second time and you get nothing — no error, just no values. To reuse it, build a list.",
  },

  decorators: {
    intro: "A decorator wraps a function in another function, without editing the one being wrapped.",
    form: "def decorator(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@decorator\ndef target():\n    body",
    parts: [
      { bit: "def", says: "Three definitions here. The outer takes a function, the inner replaces it, and the third is the one being decorated." },
      { bit: "decorator", says: "Takes the original function and hands back a replacement." },
      { bit: "func", says: "The original. It is still callable inside — nothing was destroyed, only wrapped." },
      { bit: "wrapper", says: "The replacement. Whatever you want to happen before or after goes here." },
      { bit: "*args", says: "Accepts any positional arguments so the wrapper fits any function." },
      { bit: "**kwargs", says: "Same for keyword arguments. Without both, the decorator only works on functions with one exact signature." },
      { bit: "return", says: "Twice, and they are different. The inner returns the original's result; the outer returns the <b>wrapper itself</b>, uncalled." },
      { bit: "@decorator", says: "Shorthand. It means exactly <code>target = decorator(target)</code>, run the moment the file loads." },
      { bit: "target", says: "The function being decorated. Callers still write <code>target()</code> and never see the wrapping." },
    ],
    note: "The outer <code>return wrapper</code> has no brackets. Write <code>return wrapper()</code> and you return its result once instead of a function, and every later call fails.",
  },

  regex: {
    intro: "A pattern describes the shape of the text you are looking for, rather than the text itself.",
    form: "import re\n\nre.search(pattern, text)\nre.findall(pattern, text)\nre.sub(pattern, replacement, text)\n\nr\"\\d+\"",
    parts: [
      { bit: "import", says: "<code>re</code> is in the standard library." },
      { bit: "re.search(pattern, text)", says: "Finds the <b>first</b> match anywhere and hands back a match object — or <code>None</code>, which is why it must be checked before use." },
      { bit: "re.findall(pattern, text)", says: "Every match, as a list of strings. An empty list when there are none, so no <code>None</code> check needed." },
      { bit: "re.sub(pattern, replacement, text)", says: "Find-and-replace, handing back a new string. The original is untouched." },
      { bit: "r", says: "A raw string. Without it Python reads the backslashes first and the pattern never reaches <code>re</code> intact — always write patterns as raw strings." },
      { bit: "\\d", says: "Any digit. <code>\\w</code> is a word character, <code>\\s</code> is whitespace, and the capitals invert them." },
      { bit: "+", says: "One or more of the thing before it. <code>*</code> is zero or more, <code>?</code> is optional, <code>{2,4}</code> is a count." },
    ],
    note: "Patterns are greedy: <code>.+</code> takes as much as it can. Add <code>?</code> to make it stop at the first opportunity instead.",
  },

  concurrency: {
    intro: "Doing several slow things at once — as long as the slow part is waiting, not computing.",
    form: "from concurrent.futures import ThreadPoolExecutor\n\nwith ThreadPoolExecutor(max_workers=4) as pool:\n    results = pool.map(function, items)",
    parts: [
      { bit: "from", says: "Takes the executor out of the module by name." },
      { bit: "import", says: "Loads it. <code>ProcessPoolExecutor</code> lives beside it and has the same interface." },
      { bit: "ThreadPoolExecutor", says: "A pool of threads. Right for waiting — downloads, files, database calls. Threads cannot speed up pure calculation in Python." },
      { bit: "with", says: "Guarantees the pool is shut down and every task finished before the block is left." },
      { bit: "max_workers", says: "How many run at once. More is not faster past a point, and each one costs memory." },
      { bit: "as", says: "Names the pool for the block." },
      { bit: "pool.map(function, items)", says: "Runs <code>function</code> on every item, spread across the workers. Results come back in the order of <code>items</code>, not the order they finished." },
    ],
    note: "Threads for waiting, processes for calculating. Choosing threads for heavy maths gives you all the complexity and none of the speed — that is the GIL.",
  },

  /* -------------------------------------- 34-36: async, batteries, the system -- */

  async: {
    intro: "One thread, many waits. While a coroutine waits, the loop runs somebody else instead of sitting idle.",
    form: "import asyncio\n\nasync def name():\n    result = await slow_thing()\n    return result\n\nasyncio.run(name())",
    parts: [
      { bit: "import", says: "<code>asyncio</code> is the standard library's event loop." },
      { bit: "async", says: "Marks the function as a coroutine. Calling it does not run it — it hands back an object waiting to be awaited." },
      { bit: "def", says: "The ordinary definition underneath. <code>async def</code> is one thing, not two." },
      { bit: "await", says: "\"Pause here and let others run until this finishes.\" It is only legal inside an <code>async def</code>." },
      { bit: "slow_thing()", says: "Must itself be awaitable. Awaiting an ordinary function is an error, and calling a blocking one inside async stalls <b>everything</b>." },
      { bit: "return", says: "Hands the value to whoever awaited this coroutine." },
      { bit: "asyncio.run(name())", says: "Starts the loop, runs the coroutine to the end, shuts the loop down. The one bridge from ordinary code into async." },
    ],
    note: "Forgetting <code>await</code> is the classic bug: you get a coroutine object instead of the value, and nothing runs. Python warns \"coroutine was never awaited\".",
  },

  "collections-itertools": {
    intro: "The containers and loops you were about to write by hand, already written and faster.",
    form: "from collections import Counter, defaultdict, deque\nfrom itertools import chain, groupby, combinations\n\nCounter(items)\ndefaultdict(list)\ndeque(items, maxlen=100)",
    parts: [
      { bit: "from", says: "Both are standard library modules — nothing to install." },
      { bit: "import", says: "Takes out only what you need, so the names are used directly." },
      { bit: "Counter(items)", says: "Counts everything in one pass. <code>.most_common(3)</code> gives the top three, already sorted." },
      { bit: "defaultdict(list)", says: "A dictionary that creates the value when a missing key is touched. The argument is what to build — <code>list</code>, <code>int</code>, <code>set</code>." },
      { bit: "deque(items, maxlen=100)", says: "A list that is fast at <b>both</b> ends. With <code>maxlen</code> it keeps only the newest N and drops the rest itself." },
      { bit: "chain", says: "Walks several sequences as though they were one, without joining them in memory." },
      { bit: "groupby", says: "Groups consecutive equal items. It only sees runs, so the data must be sorted first — the commonest surprise in this module." },
      { bit: "combinations", says: "Every way of choosing k items, order ignored. <code>permutations</code> is the same with order counted." },
    ],
    note: "<code>defaultdict(list)</code> takes the function, not a call: <code>list</code>, never <code>list()</code>. Passing the result gives every key the same shared list.",
  },

  "system-modules": {
    intro: "Where the program is, what it was given, and what is around it on disk.",
    form: "import os, sys\nfrom pathlib import Path\n\npath = Path(folder) / filename\npath.exists()\nos.environ.get(name)\nsys.argv",
    parts: [
      { bit: "import", says: "Several modules may be listed on one line, comma-separated." },
      { bit: "os", says: "The operating system — environment variables, folders, processes." },
      { bit: "sys", says: "The running interpreter itself — its arguments, its version, its exit." },
      { bit: "from", says: "<code>Path</code> is a class inside <code>pathlib</code>, so it is taken out by name." },
      { bit: "Path(folder)", says: "A path object rather than a string. It knows how paths are spelt on this machine, so the same code works on Windows and Linux." },
      { bit: "/", says: "Joins path parts. Not division — <code>Path</code> gives the slash this meaning, and it saves you guessing which separator to type." },
      { bit: "path.exists()", says: "Asks the disk. <code>.is_file()</code>, <code>.is_dir()</code>, <code>.mkdir()</code> and <code>.read_text()</code> live on the same object." },
      { bit: "os.environ.get(name)", says: "An environment variable, or <code>None</code> when unset. This is where API keys come from — never from a line in the source." },
      { bit: "sys.argv", says: "What the command line handed over. <code>sys.argv[0]</code> is the script's own name, so the real arguments start at 1." },
    ],
    note: "Prefer <code>Path</code> over string joining. <code>folder + \"/\" + name</code> breaks on Windows and doubles the slash when the folder already ends with one.",
  },

  /* ------------------------------------ 37-41: keeping it, proving it, shipping it -- */

  "data-persistence": {
    intro: "Three ways to make data outlive the program, each for a different job.",
    form: "import csv, sqlite3\n\nwith open(path, newline=\"\") as f:\n    for row in csv.DictReader(f):\n        body\n\nconn = sqlite3.connect(path)\nconn.execute(query, params)\nconn.commit()",
    parts: [
      { bit: "import", says: "All three — <code>csv</code>, <code>pickle</code>, <code>sqlite3</code> — are standard library. No database server to install." },
      { bit: "with", says: "Closes the file whatever happens, as always." },
      { bit: "newline", says: "Set to empty for CSV, and only for CSV. Leave it out and Windows writes a blank line between every row." },
      { bit: "as", says: "Names the open file for the block." },
      { bit: "for", says: "Reads one row at a time rather than loading the whole file — which matters the moment the file is bigger than memory." },
      { bit: "row", says: "One record. From <code>DictReader</code> it is a dictionary keyed by the header line." },
      { bit: "in", says: "What is being walked follows." },
      { bit: "csv.DictReader(f)", says: "Reads by column <b>name</b> instead of by position, so inserting a column upstream does not silently shift your data." },
      { bit: "body", says: "What you do with each row." },
      { bit: "sqlite3.connect(path)", says: "Opens the database, creating the file if it is not there. A whole SQL database in one file, no server." },
      { bit: "conn.execute(query, params)", says: "Runs SQL. <code>params</code> is a tuple filling the <code>?</code> placeholders." },
      { bit: "params", says: "Always pass values this way. Building the query by joining strings is how SQL injection happens." },
      { bit: "conn.commit()", says: "Writes changes to disk. Forget it and the program ends with the database unchanged and no error to explain why." },
    ],
    note: "CSV for anything a human or a spreadsheet will open, SQLite when you need to query it, pickle only for Python talking to itself — a pickle file will run code when loaded, so never open one you did not write.",
  },

  testing: {
    intro: "A test is an ordinary function that states what should be true and lets Python check it.",
    form: "def test_name():\n    result = function(given_input)\n    assert result == expected\n\nwith pytest.raises(ErrorType):\n    failing_call()",
    parts: [
      { bit: "def", says: "A plain function. Nothing special about it except the name." },
      { bit: "test_name", says: "Must start with <code>test_</code> — that prefix is how pytest finds it. Name it after the behaviour, not the function under test." },
      { bit: "result", says: "What actually happened. Work it out first so the comparison line reads cleanly." },
      { bit: "given_input", says: "The input for this case. One test, one case — a test asserting six things tells you nothing about which of them broke." },
      { bit: "assert", says: "\"This must be true.\" If it is, nothing happens; if it is not, the test fails and pytest shows both sides." },
      { bit: "expected", says: "What should have happened, written out by hand. Never computed by the same code you are testing." },
      { bit: "with", says: "Opens a block where an error is the <b>expected</b> outcome." },
      { bit: "pytest.raises(ErrorType)", says: "Passes only if the block raises that error. Testing that bad input is rejected is as important as testing that good input works." },
    ],
    note: "A test that never fails proves nothing. Break the code on purpose once and check the test goes red — otherwise you have only tested that it runs.",
  },

  "debugging-logging": {
    intro: "<code>print</code> tells you something today. Logging tells you what happened at 3am on a machine you cannot reach.",
    form: "import logging\n\nlogging.basicConfig(level=logging.INFO)\nlog = logging.getLogger(__name__)\n\nlog.info(message)\nlog.exception(message)\n\nbreakpoint()",
    parts: [
      { bit: "import", says: "Standard library. Nothing to install." },
      { bit: "logging.basicConfig(level=logging.INFO)", says: "Set up once, at the program's entry point. Anything below the level is dropped." },
      { bit: "level", says: "<code>DEBUG</code> → <code>INFO</code> → <code>WARNING</code> → <code>ERROR</code> → <code>CRITICAL</code>. Turning the dial changes how much you see without editing a single log line." },
      { bit: "logging.getLogger(__name__)", says: "One logger per module. <code>__name__</code> is the module's own name, so every line records where it came from." },
      { bit: "log.info(message)", says: "Normal progress. <code>.debug</code> for detail, <code>.warning</code> for suspicious, <code>.error</code> for broken." },
      { bit: "log.exception(message)", says: "Only inside <code>except</code>. Logs your message <b>and</b> the full traceback — which is what you will actually want at 3am." },
      { bit: "breakpoint()", says: "Stops the program and drops you into a debugger right there. <code>n</code> next line, <code>c</code> continue, and any variable name prints it." },
    ],
    note: "Never log passwords, tokens or card numbers. Logs get copied, emailed and shipped to third parties — treat everything you write as public.",
  },

  "clean-code": {
    intro: "Three things that cost one line each and tell the next reader what the code cannot.",
    // Prose inside a `form` is rare and has to avoid the reserved words, because
    // the verifier reads the form as code and cannot tell a docstring sentence
    // from a keyword. This one said "if it needs one" and tripped the check.
    form: "def name(param: int, other: str = \"\") -> bool:\n    \"\"\"One line saying what it does.\n\n    Longer explanation goes here.\n    \"\"\"\n    return True",
    parts: [
      { bit: "def", says: "An ordinary definition — everything else here is annotation on top of it." },
      { bit: "param: int", says: "A type hint. Python does not enforce it and will not stop you, but your editor will warn you and a reader stops having to guess." },
      { bit: "other: str = \"\"", says: "Hint and default together, in that order. Spaces around the <code>=</code> once a hint is present; none without one — that is PEP 8." },
      { bit: "->", says: "What the function hands back. <code>-&gt; None</code> is worth writing: it says the function works by side effect, on purpose." },
      { bit: "bool", says: "The return type." },
      { bit: "\"\"\"", says: "A docstring, and it must be the <b>first</b> statement in the function. A comment above the <code>def</code> looks the same and is invisible to <code>help()</code>." },
      { bit: "return", says: "The value, matching the annotated type." },
    ],
    note: "Say <i>why</i>, not <i>what</i>. The code already says what it does; a comment repeating it just becomes a lie the first time somebody edits one and not the other.",
  },

  "project-git": {
    intro: "The five commands that cover almost everything, in the order you meet them.",
    form: "git init\ngit status\ngit add path\ngit commit -m \"message\"\ngit log --oneline\n\ngit switch -c branch-name\ngit push origin branch-name",
    parts: [
      { bit: "git init", says: "Turns this folder into a repository. Once, at the start. It creates a hidden <code>.git</code> folder — delete that and the history is gone." },
      { bit: "git status", says: "What has changed and what is staged. Run it constantly; it is the cheapest way to never be surprised." },
      { bit: "git add path", says: "Stages a change — \"include this in the next commit\". <code>.</code> means everything, which is convenient and how secrets get committed." },
      { bit: "git commit -m \"message\"", says: "Saves the staged changes as one point in history. Only what was added is included." },
      { bit: "message", says: "Say <b>why</b>, in the present tense. \"fix\" is worthless in six months; \"reject empty marks instead of storing 0\" is not." },
      { bit: "git log --oneline", says: "The history, one commit per line. This is what your messages will actually be read as." },
      { bit: "git switch -c branch-name", says: "Creates a branch and moves to it. Work on a branch, not on main — it is the whole reason you can experiment safely." },
      { bit: "git push origin branch-name", says: "Sends your commits to the remote. Nothing leaves your machine until you do this." },
    ],
    note: "Add a <code>.gitignore</code> before your first commit. <code>.env</code>, <code>__pycache__/</code>, <code>venv/</code> — a key committed once stays in the history even after you delete the file.",
  },

  /* --------------------------------- 42-48: reading algorithms, not statements -- */

  "big-o": {
    intro: "Big-O is not measured, it is read off the shape of the loops.",
    form: "for i in range(n):        # runs n times      -> O(n)\n    for j in range(n):    # n times, per i     -> O(n²)\n        work              # O(1) each\n\nwhile size > 1:           # halves each turn   -> O(log n)\n    size = size // 2",
    parts: [
      { bit: "for", says: "One loop over n items is O(n). Count the loops, not the lines inside them." },
      { bit: "i", says: "The outer counter. Its own name means nothing to the complexity." },
      { bit: "in", says: "What is being walked — its <b>size</b> is the n in the answer." },
      { bit: "range(n)", says: "n turns. If the range were <code>range(10)</code> it would be a constant and would not appear in the answer at all." },
      { bit: "j", says: "The inner counter. Nested means <b>multiplied</b>: n outer turns × n inner turns = n²." },
      { bit: "work", says: "One step that does not depend on n — an assignment, a comparison, a list index. That is O(1)." },
      { bit: "while", says: "A loop whose counter is halved rather than decremented finishes in about log₂n turns, not n." },
      { bit: "size", says: "Halving is what makes it logarithmic. Binary search and balanced trees are both this shape." },
    ],
    note: "Drop constants and keep the biggest term: <code>3n² + 500n + 9</code> is O(n²). At n = 1,000,000 the n² is the only part that matters.",
  },

  "stacks-queues": {
    intro: "Same data, opposite rule about which end you are allowed to touch.",
    form: "stack = []\nstack.append(item)      # push, onto the end\nstack.pop()             # pop, off the end     -> LIFO\n\nfrom collections import deque\nqueue = deque()\nqueue.append(item)      # enqueue, at the back\nqueue.popleft()         # dequeue, from the front -> FIFO",
    parts: [
      { bit: "stack", says: "An ordinary list is already a stack — no class needed." },
      { bit: "stack.append(item)", says: "Push. Adds to the end, which is the only end a stack uses." },
      { bit: "stack.pop()", says: "Pop. Removes and returns the <b>last</b> item — last in, first out. Both operations are O(1)." },
      { bit: "from", says: "A queue needs <code>deque</code>, and it is worth the import line." },
      { bit: "import", says: "Standard library, nothing to install." },
      { bit: "deque", says: "Double-ended queue: fast at both ends. A plain list is not — <code>list.pop(0)</code> shuffles every remaining item along, turning an O(1) job into O(n)." },
      { bit: "queue.append(item)", says: "Enqueue, at the back." },
      { bit: "queue.popleft()", says: "Dequeue, from the front — first in, first out, and O(1) because it is a deque." },
    ],
    note: "Undo, back buttons and call stacks are LIFO. Print jobs, task queues and BFS are FIFO. Choosing the wrong one gives an answer that looks plausible and is in the wrong order.",
  },

  "linked-lists-hashing": {
    intro: "A list that stores where the next item is, and a table that computes where an item belongs.",
    form: "class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\n\nslot = hash(key) % table_size",
    parts: [
      { bit: "class", says: "One node of the chain. Python has no built-in linked list, so you build it." },
      { bit: "def", says: "The setup, storing the value and the link." },
      { bit: "self.value", says: "What this node holds." },
      { bit: "self.next", says: "The <b>next node</b>, not the next value. This reference is the entire structure — follow it and you have walked the list." },
      { bit: "None", says: "Marks the end. Reaching it is how a walk knows to stop." },
      { bit: "hash(key)", says: "Turns any hashable value into a number. The same key always gives the same number within one run." },
      { bit: "%", says: "Folds that number into the table's range, so it names an actual slot." },
      { bit: "table_size", says: "How many slots exist. Two keys landing in the same slot is a collision — normal, and handled by chaining a small list there." },
    ],
    note: "This is why dictionary keys must be immutable: the slot is computed from the value, so a key that changes after being stored is filed where nothing will ever look for it.",
  },

  "trees-graphs": {
    intro: "A graph is a dictionary of neighbours, and breadth-first search is the loop that walks it.",
    form: "graph = {node: [neighbour, neighbour]}\n\nqueue = deque([start])\nseen = {start}\nwhile queue:\n    current = queue.popleft()\n    for neighbour in graph[current]:\n        if neighbour not in seen:\n            seen.add(neighbour)\n            queue.append(neighbour)",
    parts: [
      { bit: "graph", says: "An adjacency list: each key is a node, each value the nodes it connects to. No class required." },
      { bit: "queue", says: "What to visit next. A queue gives breadth-first — nearest first. Swap it for a stack and the same loop becomes depth-first." },
      { bit: "start", says: "Where the walk begins. It goes into the queue and into <code>seen</code> at the same time." },
      { bit: "seen", says: "Every node already queued. A set, because this is checked once per edge and a list would make the whole walk O(n²)." },
      { bit: "while", says: "Keep going until nothing is left to visit. This ends on its own — every node enters the queue at most once." },
      { bit: "current", says: "The node being visited this turn." },
      { bit: "for", says: "Look at each neighbour of the current node." },
      { bit: "neighbour", says: "One connected node." },
      { bit: "in", says: "Walks the neighbour list, and — on the next line — tests membership of the set." },
      { bit: "if", says: "The guard that makes this terminate." },
      { bit: "not", says: "Only unseen nodes are queued. Drop this test and a graph with a cycle loops forever." },
    ],
    note: "Mark a node as seen when you <b>queue</b> it, not when you visit it. Marking on visit lets the same node be queued several times before its turn comes.",
  },

  "searching-sorting": {
    intro: "Binary search is three variables and one rule: throw away half.",
    form: "low, high = 0, len(items) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if items[mid] == target:\n        return mid\n    if items[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nreturn -1",
    parts: [
      { bit: "low", says: "First position still worth checking. Starts at 0." },
      { bit: "high", says: "Last position still worth checking. <code>len(items) - 1</code>, not <code>len(items)</code> — that is off the end." },
      { bit: "while", says: "Keep going while the window still holds something. <code>&lt;=</code>, not <code>&lt;</code>: with <code>&lt;</code> a one-item window is never examined." },
      { bit: "mid", says: "The middle. <code>//</code> is integer division, because a position must be a whole number." },
      { bit: "if", says: "Three outcomes: found it, went too low, went too high." },
      { bit: "return", says: "Hands back the position on a hit, and <code>-1</code> when the window closes empty." },
      { bit: "low = mid + 1", says: "Target is bigger, so discard <code>mid</code> and everything below it. The <code>+ 1</code> is what guarantees progress." },
      { bit: "else", says: "Target is smaller, so discard <code>mid</code> and everything above." },
      { bit: "high = mid - 1", says: "The mirror image. Miss either <code>± 1</code> and the window stops shrinking — an infinite loop, not a wrong answer." },
    ],
    note: "It only works on <b>sorted</b> data. Run it on an unsorted list and it returns confidently wrong answers rather than failing.",
  },

  "python-reference": {
    intro: "Four built-ins that answer \"what is this and what can it do?\" without leaving the interpreter.",
    form: "type(value)\nisinstance(value, Type)\ndir(object)\nhelp(object)",
    parts: [
      { bit: "type(value)", says: "What it actually is, as opposed to what you assumed. The first thing to run when a <code>TypeError</code> makes no sense." },
      { bit: "isinstance(value, Type)", says: "\"Is it this type, or a subclass of it?\" Use it for checks — <code>type(x) == int</code> says no to a subclass that should have passed." },
      { bit: "dir(object)", says: "Every name the object has. Skip the dunders and what remains is the list of things you can call on it." },
      { bit: "help(object)", says: "The docstring, in the terminal. Works on modules, classes, functions and methods — this is what writing docstrings buys you." },
    ],
    note: "These work on anything, including modules you just installed. <code>dir</code> then <code>help</code> is usually faster than searching the web for it.",
  },

  "tree-traversals": {
    intro: "One recursive shape. Moving a single line changes which order the tree comes out in.",
    form: "def walk(node):\n    if node is None:\n        return\n    walk(node.left)     # move this line to change the order\n    visit(node)\n    walk(node.right)",
    parts: [
      { bit: "def", says: "The function calls itself on each side, so the same three lines handle a tree of any depth." },
      { bit: "if", says: "The base case, and it must come first." },
      { bit: "is", says: "Identity, and the right operator for <code>None</code> — <code>== None</code> works but is not how it is written." },
      { bit: "None", says: "An empty branch. Reaching one means stop — that is what ends the recursion." },
      { bit: "return", says: "Backs out of this branch with nothing. No value is needed; the work happens in <code>visit</code>." },
      { bit: "walk(node.left)", says: "The whole left subtree, finished completely before this line returns." },
      { bit: "visit(node)", says: "The <b>position of this line</b> is the entire difference. Before both calls → pre-order. Between them → in-order. After both → post-order." },
      { bit: "walk(node.right)", says: "Then the whole right subtree." },
    ],
    note: "On a binary search tree, in-order comes out sorted. Pre-order is what you save to rebuild the tree later; post-order is for work that needs the children finished first.",
  },

  /* ------------------------------------------ 49-53: shape, buckets, chasing -- */

  "balanced-trees": {
    intro: "One number tells you whether a tree has gone lopsided, and three sums let a tree live inside a plain list.",
    form: "balance = height(node.left) - height(node.right)\nif balance > 1:\n    rotate_right(node)\n\nleft_child  = 2 * i + 1\nright_child = 2 * i + 2\nparent      = (i - 1) // 2",
    parts: [
      { bit: "balance", says: "Left height minus right height, at one node. Every node has its own." },
      { bit: "height(node.left)", says: "How deep that side goes. A leaf is 0; an empty branch counts as -1 so the arithmetic still works." },
      { bit: "if", says: "Anything outside -1, 0 or +1 means this node is unbalanced and must be rotated back." },
      { bit: "rotate_right(node)", says: "Lifts the left child into this node's place. A rotation reorders three links and leaves the sorted order untouched." },
      { bit: "2 * i + 1", says: "The left child of position i. No pointers — the position <b>is</b> the link." },
      { bit: "2 * i + 2", says: "The right child. Following from the root: 0 → 1, 2 → 3, 4, 5, 6." },
      { bit: "(i - 1) // 2", says: "Back to the parent. Integer division, so both children land on the same parent." },
    ],
    note: "Balancing is what keeps lookup at O(log n). Insert already-sorted data into an unbalanced tree and it degenerates into a linked list — O(n), with all the overhead of a tree.",
  },

  "counting-radix-sort": {
    intro: "Sorting without comparing anything: count how many of each value there are, then write them back out.",
    form: "counts = [0] * (max_value + 1)\nfor value in items:\n    counts[value] += 1\n\noutput = []\nfor value, n in enumerate(counts):\n    output.extend([value] * n)\n\ndigit = (value // place) % 10",
    parts: [
      { bit: "counts", says: "One slot per possible value, not per item. This is why the range matters more than the length." },
      { bit: "max_value", says: "The largest value present. The array is this big, so counting sort on values up to a million costs a million slots." },
      { bit: "for", says: "One pass to count, one pass to write out. Two passes total — O(n + k), never O(n log n)." },
      { bit: "value", says: "Each item, used directly as an index. That only works because the values are small whole numbers." },
      { bit: "in", says: "What is being walked follows." },
      { bit: "counts[value] += 1", says: "The whole comparison-free trick: the value tells you where to tally it, so nothing is ever compared." },
      { bit: "enumerate(counts)", says: "Walks slots with their positions, so the position is the value and the entry is how many of it there were." },
      { bit: "output.extend([value] * n)", says: "Writes that value out n times. Reading the slots in order is what produces sorted data." },
      { bit: "(value // place) % 10", says: "Radix sort's one digit: <code>//</code> shifts it into the units column, <code>%</code> reads it. Counting-sort by that digit, ones first, and after the last digit the whole list is sorted." },
    ],
    note: "The comparison lower bound of O(n log n) applies only to sorts that compare. These do not — which is also why they only work on integers or fixed-length keys.",
  },

  "linked-list-shapes-sets": {
    intro: "Three arrangements of the same node, and the structure that answers \"seen this already?\" instantly.",
    form: "node.next = other          # singly\nnode.prev = previous       # doubly\ntail.next = head           # circular\n\nseen = set()\nseen.add(value)\nvalue in seen",
    parts: [
      { bit: "node.next", says: "Forward link. On its own it makes a singly linked list — walkable one way only." },
      { bit: "node.prev", says: "Backward link. Adding it gives a doubly linked list: you can walk either way, at the cost of a second link per node to keep correct." },
      { bit: "tail.next = head", says: "Joins the end to the start. Now there is no <code>None</code> to stop at, so any walk needs its own stopping rule." },
      { bit: "seen", says: "A set. Membership is O(1) because the slot is computed from the value rather than searched for." },
      { bit: "seen.add(value)", says: "Adds it. Adding something already there does nothing and raises nothing." },
      { bit: "in", says: "The membership test. On a set it is one hash; on a list it walks every element, which turns an O(n) algorithm into O(n²) without changing a visible line." },
    ],
    note: "Reach for a set the moment you are about to write <code>if x in my_list</code> inside a loop. That single swap is the commonest real speed-up in beginner code.",
  },

  "cycle-detection": {
    intro: "Two pointers at different speeds. If there is a loop, the fast one laps the slow one.",
    form: "slow = head\nfast = head\nwhile fast is not None and fast.next is not None:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        return True\nreturn False",
    parts: [
      { bit: "slow", says: "The tortoise — one step per turn." },
      { bit: "fast", says: "The hare — two steps per turn. The gap closes by exactly one each turn, so inside a loop they must eventually land together." },
      { bit: "while", says: "Keeps going while the hare still has somewhere to go." },
      { bit: "is", says: "Identity, not equality. Two different nodes holding the same value are not the same node, and <code>==</code> would report a cycle that is not there." },
      { bit: "not", says: "Continue while the hare has <b>not</b> run off the end." },
      { bit: "and", says: "Both must be checked, in this order. Test only <code>fast</code> and the next line reads <code>fast.next.next</code> off a node whose <code>next</code> is <code>None</code>." },
      { bit: "fast.next.next", says: "Two hops at once — which is exactly why both it and its parent had to be checked above." },
      { bit: "if", says: "Same node, same turn: there is a cycle." },
      { bit: "return", says: "<code>True</code> on a meeting, <code>False</code> when the hare reaches the end — because a list that ends has no loop." },
    ],
    note: "Constant memory is the point. A set of visited nodes also finds the cycle and costs O(n) space; two pointers cost two.",
  },

  "shortest-path-dijkstra": {
    intro: "Breadth-first search always takes the nearest node. Dijkstra takes the <b>cheapest</b> one, which is not the same thing.",
    form: "import heapq\n\ndist = {node: infinity}\ndist[start] = 0\nheap = [(0, start)]\n\nwhile heap:\n    d, current = heapq.heappop(heap)\n    for neighbour, weight in graph[current]:\n        if d + weight < dist[neighbour]:\n            dist[neighbour] = d + weight\n            heapq.heappush(heap, (dist[neighbour], neighbour))",
    parts: [
      { bit: "import", says: "<code>heapq</code> is the standard library's priority queue. There is no separate class — it works on an ordinary list." },
      { bit: "dist", says: "Best known cost to each node. Everything starts at infinity, meaning \"no route found yet\"." },
      { bit: "start", says: "Costs 0 to reach itself. That single known value is what the rest is built out of." },
      { bit: "heap", says: "Nodes waiting to be examined, ordered by cost. Tuples, cost first, because that is what the ordering compares." },
      { bit: "while", says: "Keep going until nothing is left worth examining." },
      { bit: "heapq.heappop(heap)", says: "Takes the <b>cheapest</b> pending node, in O(log n). This is the whole difference from BFS, which takes the oldest." },
      { bit: "for", says: "Look at everything reachable from here." },
      { bit: "neighbour", says: "A connected node." },
      { bit: "weight", says: "The cost of that one edge. BFS assumes every weight is 1 — when they differ, BFS is quietly wrong." },
      { bit: "in", says: "Walks the neighbour list." },
      { bit: "if", says: "Relaxation: only record a route that is genuinely cheaper than the best already known." },
      { bit: "heapq.heappush", says: "Queues the improved route. A node may be pushed several times; the cheapest copy comes out first and the rest are harmless." },
    ],
    note: "Negative edges break it. Dijkstra assumes a settled node can never get cheaper, and a negative edge makes that false — that is what Bellman-Ford is for.",
  },

  /* --------------------------------- 54-58: relax, remember, choose, and give up -- */

  "bellman-ford-mst": {
    intro: "Relax every edge, over and over — and the greedy loop that builds a minimum spanning tree.",
    form: "for _ in range(n - 1):\n    for u, v, weight in edges:\n        if dist[u] + weight < dist[v]:\n            dist[v] = dist[u] + weight\n\nedges.sort(key=weight)\nfor u, v, weight in edges:\n    if find(u) != find(v):\n        union(u, v)",
    parts: [
      { bit: "for", says: "Two nested loops for Bellman-Ford, one flat loop for Kruskal. Neither needs a priority queue." },
      { bit: "_", says: "The counter is never used — only the number of repetitions matters, and an underscore says so." },
      { bit: "range(n - 1)", says: "A shortest path touches at most n-1 edges, so n-1 rounds is enough for every improvement to travel the whole graph." },
      { bit: "u", says: "The edge's start." },
      { bit: "v", says: "Its end." },
      { bit: "weight", says: "Its cost — and here it may be <b>negative</b>, which is exactly what Dijkstra cannot handle." },
      { bit: "in", says: "Walks the edge list. Bellman-Ford never asks which edges touch which node, which is why it is slower and simpler." },
      { bit: "if", says: "The same relaxation test: take the route only when it is cheaper." },
      { bit: "edges.sort(key=weight)", says: "Kruskal starts here — cheapest edge first. Sorting <b>is</b> the greedy choice." },
      { bit: "find(u)", says: "Which group this node is already in. Equal groups mean the two ends are connected, so adding this edge would close a cycle." },
      { bit: "union(u, v)", says: "Accept the edge and merge the two groups. Repeat until one group remains and you have the minimum spanning tree." },
    ],
    note: "Run the relaxation loop one extra time. If anything still improves, the graph has a negative cycle and no shortest path exists — that check is the reason to reach for Bellman-Ford at all.",
  },

  "memoization-tabulation": {
    intro: "The same answer twice: remember results as you recurse, or fill a table from the bottom up.",
    form: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\ntable = [0, 1]\nfor i in range(2, n + 1):\n    table.append(table[i - 1] + table[i - 2])",
    parts: [
      { bit: "from", says: "<code>functools</code> is standard library." },
      { bit: "import", says: "Loads the cache decorator." },
      { bit: "@lru_cache(maxsize=None)", says: "Memoisation in one line. It remembers what each argument returned and hands the stored answer back on a repeat call." },
      { bit: "maxsize", says: "<code>None</code> means remember everything. A number caps it and drops the least recently used." },
      { bit: "def", says: "The recursion is written exactly as it would be without a cache. Nothing inside changes." },
      { bit: "if", says: "The base case, first as always." },
      { bit: "return", says: "Twice — the known answer, then the sum of the two smaller ones." },
      { bit: "fib(n - 1)", says: "Uncached, <code>fib(35)</code> makes about 29 million calls because the same values are recomputed endlessly. Cached, it makes 35." },
      { bit: "table", says: "Tabulation, the other direction. Start from the answers you know and build upward — no recursion, so no stack to overflow." },
      { bit: "for", says: "Each entry is built from entries already filled in, which is what makes bottom-up possible at all." },
      { bit: "in", says: "Walks the positions in order." },
    ],
    note: "Memoisation is top-down and lazy — it only computes what is asked for. Tabulation is bottom-up and computes everything, but has no recursion limit and no call overhead.",
  },

  "dynamic-programming-knapsack": {
    intro: "A grid where every cell is the best you could do with that many items and that much room.",
    form: "table = [[0] * (capacity + 1) for _ in range(len(items) + 1)]\n\nfor i in range(1, len(items) + 1):\n    for c in range(capacity + 1):\n        weight, value = items[i - 1]\n        if weight > c:\n            table[i][c] = table[i - 1][c]\n        else:\n            table[i][c] = max(table[i - 1][c],\n                              table[i - 1][c - weight] + value)",
    parts: [
      { bit: "table", says: "Rows are items considered so far, columns are capacities from 0 upward. Every cell is a finished sub-answer." },
      { bit: "_", says: "One row per item plus a row of zeros for \"no items\", which is what stops the lookups below falling off the top." },
      { bit: "for", says: "Two loops, filling the grid row by row. No recursion anywhere." },
      { bit: "i", says: "How many items are on the table. Row i may use the first i items and no others." },
      { bit: "c", says: "The capacity this cell is answering for — every capacity is solved, not only the one you asked about." },
      { bit: "in", says: "Walks the ranges." },
      { bit: "weight", says: "What this item costs in room." },
      { bit: "value", says: "What it is worth. 0/1 means each item is taken whole or left — no halves." },
      { bit: "if", says: "Too heavy for this capacity, so it cannot be taken." },
      { bit: "table[i - 1][c]", says: "The answer without this item — copied straight down from the row above." },
      { bit: "else", says: "It fits, so there is a genuine choice." },
      { bit: "max", says: "The choice itself: leave it, or take it and add its value to the best answer for the room that remains." },
      { bit: "table[i - 1][c - weight]", says: "That remaining room, already solved in the row above. Every DP is this — a bigger answer assembled from smaller ones you have already written down." },
    ],
    note: "The last cell is the best total. To find <b>which</b> items were chosen, walk back up: a cell differing from the one above it means that row's item was taken.",
  },

  "greedy-algorithms": {
    intro: "Take the best-looking option now and never reconsider. Sometimes that is provably optimal; often it is not.",
    form: "while b:\n    a, b = b, a % b\nreturn a\n\ncandidates.sort(key=best_first)\nfor item in candidates:\n    if fits(item):\n        chosen.append(item)",
    parts: [
      { bit: "while", says: "Euclid's algorithm — the oldest one still in use. It stops when the remainder reaches 0." },
      { bit: "a, b = b, a % b", says: "One line, both assignments at once. The right side is worked out fully before anything is stored, so no temporary variable is needed." },
      { bit: "%", says: "The remainder. Replacing the pair with (b, a mod b) preserves the greatest common divisor and shrinks the numbers fast." },
      { bit: "return", says: "When <code>b</code> is 0, <code>a</code> is the answer." },
      { bit: "candidates.sort(key=best_first)", says: "The greedy choice lives in this line. Change what \"best\" means and you change the algorithm — for scheduling it is the earliest finishing time, for Huffman the two rarest symbols." },
      { bit: "for", says: "One pass, in that order. Nothing is ever revisited, which is why greedy is fast." },
      { bit: "item", says: "The current candidate." },
      { bit: "in", says: "Walks them in the sorted order." },
      { bit: "if", says: "Take it when it still fits alongside what has already been chosen." },
      { bit: "chosen.append(item)", says: "Committed, permanently. That refusal to reconsider is both the speed and the risk." },
    ],
    note: "Greedy needs a proof, not a hunch. It is optimal for Huffman coding and minimum spanning trees; on 0/1 knapsack, taking the best value-per-weight first gives an answer that looks reasonable and is wrong.",
  },

  "max-flow-tsp": {
    intro: "An algorithm that can take back its own decisions, and a problem where nothing can.",
    form: "while path_exists(source, sink):\n    bottleneck = min(capacity[u][v] for u, v in path)\n    for u, v in path:\n        capacity[u][v] -= bottleneck\n        capacity[v][u] += bottleneck\n\nbest = min(total(order) for order in permutations(cities))",
    parts: [
      { bit: "while", says: "Keep pushing flow while any route with spare capacity remains. It ends because every round fills at least one edge." },
      { bit: "path_exists(source, sink)", says: "Any route from start to finish with room left on every edge of it." },
      { bit: "bottleneck", says: "The narrowest edge on that route. A chain carries what its tightest link allows, and no more." },
      { bit: "min", says: "Picks that narrowest edge — and, at the end, the cheapest tour." },
      { bit: "for", says: "Adjust every edge along the route by the same amount." },
      { bit: "in", says: "Walks the route's edges, and the orders below." },
      { bit: "capacity[u][v] -= bottleneck", says: "Forward capacity used up." },
      { bit: "capacity[v][u] += bottleneck", says: "The <b>reverse</b> edge gains it. This is the undo: a later round can push flow back this way, cancelling an earlier choice that turned out to be wrong." },
      { bit: "permutations(cities)", says: "Every possible order of visiting. For 20 cities that is more orders than there are seconds since the Big Bang — which is the point of the lesson, not a suggestion." },
      { bit: "total(order)", says: "The length of one tour. Correct, complete, and unusable past about a dozen cities." },
    ],
    note: "Max flow is exact and fast because it can undo. TSP has no known way to do that, so real solvers return a good tour with a bound on how far off it might be — and that is the honest answer, not a failure.",
  },

  /* ============================================================ PANDAS ==== */

  "numpy-arrays": {
    intro: "An array is not a list. One operation applies to every element at once, without a loop.",
    form: "import numpy as np\n\narr = np.array([1, 2, 3])\narr * 2\narr[arr > 1]\narr.mean()",
    parts: [
      { bit: "import", says: "NumPy is not in the standard library — it comes with the practice environment here, and with pip anywhere else." },
      { bit: "as", says: "<code>np</code> is the universal alias. Every example you will ever read uses it, so follow it." },
      { bit: "np.array([1, 2, 3])", says: "Builds the array from a list. Every element must be the same type — mix text and numbers and NumPy quietly turns them all into text." },
      { bit: "arr * 2", says: "Vectorisation: the operation applies element by element, with no loop written and none run. This is the whole reason NumPy exists." },
      { bit: "arr[arr > 1]", says: "Boolean masking. The inside produces an array of True/False, and the outside keeps only the True positions." },
      { bit: "arr.mean()", says: "Aggregations run over the whole array in one call — <code>.sum()</code>, <code>.std()</code>, <code>.max()</code> and the rest." },
    ],
    note: "A NumPy loop written by hand is usually 10–100× slower than the vectorised form. If you are writing <code>for</code> over an array, there is nearly always a way not to.",
  },

  "series-dataframe": {
    intro: "Two shapes hold nearly everything in pandas: one labelled column, and a table of them.",
    form: "import pandas as pd\n\ns = pd.Series(values, index=labels)\ndf = pd.DataFrame({\"column\": values})\n\ndf.head()\ndf.info()\ndf.shape",
    parts: [
      { bit: "import", says: "pandas is built on NumPy, so importing it brings the array machinery with it." },
      { bit: "as", says: "<code>pd</code>, always. Same convention as <code>np</code>." },
      { bit: "pd.Series(values, index=labels)", says: "One column with a label on every row. The index is not a row number — it is a name, and it survives filtering and sorting." },
      { bit: "index", says: "The row labels. Left out, you get 0, 1, 2 — which looks like positions and is still an index." },
      { bit: "pd.DataFrame({\"column\": values})", says: "A table. From a dict, each key becomes a column name and each value that column's data." },
      { bit: "df.head()", says: "The first five rows. The first thing to run on any new data, before any assumption about it." },
      { bit: "df.info()", says: "Column names, types and how many non-null values each holds — where missing data announces itself." },
      { bit: "df.shape", says: "(rows, columns). No brackets: it is an attribute, not a method." },
    ],
    note: "A DataFrame column is a Series, and a Series has an index. Almost every confusing pandas error traces back to two objects whose indexes do not line up.",
  },

  "select-filter": {
    intro: "Four ways in, and choosing the wrong one is where most pandas confusion starts.",
    form: "df[\"column\"]\ndf[[\"col_a\", \"col_b\"]]\ndf.loc[row_label, column_label]\ndf.iloc[row_position, column_position]\ndf[df[\"column\"] > value]\ndf[(condition_a) & (condition_b)]",
    parts: [
      { bit: "df[\"column\"]", says: "One column, as a Series. Single brackets, single column." },
      { bit: "df[[\"col_a\", \"col_b\"]]", says: "Several columns, as a DataFrame. The inner brackets are a list — that is why there are two." },
      { bit: "df.loc[row_label, column_label]", says: "By <b>label</b>. The end of a <code>.loc</code> slice is <b>included</b>, unlike everywhere else in Python." },
      { bit: "df.iloc[row_position, column_position]", says: "By <b>position</b>, 0-based, end excluded — the ordinary Python rule. The <code>i</code> is for integer." },
      { bit: "df[df[\"column\"] > value]", says: "Boolean filtering. The inside makes a True/False Series; the outside keeps the True rows." },
      { bit: "&", says: "AND for two conditions. Not the word <code>and</code> — that compares whole Series and raises." },
      { bit: "(condition_a)", says: "Brackets around each condition are required. <code>&</code> binds tighter than <code>&gt;</code>, so without them the comparison happens in the wrong order." },
    ],
    note: "<code>.loc</code> includes its end, <code>.iloc</code> does not. Mixing them up silently returns a row too many or too few.",
  },

  "missing-data": {
    intro: "Missing values are not zeros. Deciding what they mean is your job; pandas only gives you the tools.",
    form: "df.isna().sum()\ndf.dropna(subset=[\"column\"])\ndf.fillna(value)\ndf[\"column\"].fillna(df[\"column\"].median())",
    parts: [
      { bit: "df.isna()", says: "True wherever a value is missing, same shape as the table." },
      { bit: "df.isna().sum()", says: "Counts them per column, because summing True/False counts the Trues. The first line to run on new data." },
      { bit: "df.dropna(subset=[\"column\"])", says: "Removes rows missing that column. Without <code>subset</code> it drops a row missing <b>anything</b>, which on wide data can take most of the table." },
      { bit: "df.fillna(value)", says: "Replaces them. Hands back a new frame — the original is untouched unless you assign the result." },
      { bit: "df[\"column\"].median()", says: "Filling with the median rather than the mean, because one extreme value drags a mean and leaves a median alone." },
    ],
    note: "Filling changes what the data says. A missing salary filled with the median becomes a real-looking salary nobody earns — record that you filled it, or you will forget.",
  },

  groupby: {
    intro: "Split the rows into groups, compute something per group, put the answers back together.",
    form: "df.groupby(\"column\")[\"value\"].mean()\ndf.groupby([\"col_a\", \"col_b\"]).agg({\"value\": [\"mean\", \"count\"]})\ndf.groupby(\"column\").size()",
    parts: [
      { bit: "df.groupby(\"column\")", says: "Splits by the distinct values in that column. On its own it computes nothing — it describes the split and waits." },
      { bit: "[\"value\"]", says: "Which column to aggregate. Leave it out and every numeric column is aggregated, which is usually more than you wanted." },
      { bit: ".mean()", says: "The aggregation. One number per group; the group values become the index of the result." },
      { bit: "[\"col_a\", \"col_b\"]", says: "Grouping by two columns gives one group per combination, and a two-level index on the result." },
      { bit: ".agg({\"value\": [\"mean\", \"count\"]})", says: "Several aggregations at once, per column. Almost always pair a mean with a count — a mean over three rows is not a fact." },
      { bit: ".size()", says: "How many rows per group, missing values included. <code>.count()</code> is the same but skips them, which is a different question." },
    ],
    note: "The grouped column becomes the index, not a column. <code>.reset_index()</code> turns it back into one when you need to keep working.",
  },

  "sorting-unique": {
    intro: "The cleaning steps that come between reading a file and trusting it.",
    form: "df.sort_values(\"column\", ascending=False)\ndf[\"column\"].unique()\ndf[\"column\"].value_counts()\ndf.drop_duplicates(subset=[\"column\"])\ndf.rename(columns={\"old\": \"new\"})",
    parts: [
      { bit: "df.sort_values(\"column\", ascending=False)", says: "Sorts by a column. Hands back a new frame — a very common mistake is sorting and then using the original." },
      { bit: "ascending", says: "<code>False</code> for largest first. A list of booleans when sorting by several columns." },
      { bit: "df[\"column\"].unique()", says: "The distinct values, in the order first seen. The fastest way to find that \"Delhi\", \"delhi\" and \"Delhi \" are three cities." },
      { bit: "df[\"column\"].value_counts()", says: "The distinct values <b>and</b> how often each appears, biggest first. Usually the more useful of the two." },
      { bit: "df.drop_duplicates(subset=[\"column\"])", says: "Keeps the first row per value of that column. Without <code>subset</code>, a row counts as duplicate only when <b>every</b> column matches." },
      { bit: "df.rename(columns={\"old\": \"new\"})", says: "Renames by mapping. Anything not in the dict is left alone." },
    ],
    note: "Nearly every one of these returns a new frame instead of changing yours. If nothing seems to happen, you probably forgot to assign the result.",
  },

  /* =============================================================== SQL ==== */

  "sql-intro": {
    intro: "Every query is the same skeleton. You start with two clauses and add the rest as you need them.",
    form: "SELECT column_a, column_b\nFROM table_name;",
    parts: [
      { bit: "SELECT", says: "Which columns you want back. <code>*</code> means every one — fine while exploring, and worth replacing with real names once you know what you need." },
      { bit: "column_a", says: "Column names, comma-separated. A missing comma is the commonest reason a query will not parse." },
      { bit: "FROM", says: "Which table they come from. SELECT names the columns; FROM is what decides they exist." },
      { bit: "table_name", says: "The table. Names here are exactly as the schema panel shows them — plural and singular are easy to mix up." },
      { bit: ";", says: "Ends the statement. One query does not need it; several in a row do." },
    ],
    note: "SQL says <b>what</b> you want, not how to get it. There is no loop to write — the database decides how to find the rows.",
  },

  "sql-where": {
    intro: "WHERE throws rows away before anything else looks at them.",
    form: "SELECT columns\nFROM table_name\nWHERE condition\n  AND other_condition\n  OR third_condition;",
    parts: [
      { bit: "WHERE", says: "Tested once per row, and only the rows that pass continue. It comes after FROM and before everything else." },
      { bit: "condition", says: "A comparison: <code>=</code> (not <code>==</code>), <code>&lt;&gt;</code> for not-equal, <code>BETWEEN</code>, <code>LIKE</code> for patterns, <code>IS NULL</code> for missing." },
      { bit: "AND", says: "Both must hold." },
      { bit: "OR", says: "Either will do. Mixing AND and OR without brackets is the classic silent bug — AND binds tighter, so the query means something you did not write." },
    ],
    note: "Text goes in single quotes: <code>'Delhi'</code>. Double quotes mean a column name, which is why a missing quote reports \"no such column\" rather than a syntax error.",
  },

  "sql-order": {
    intro: "Three clauses that shape what comes back rather than which rows do.",
    form: "SELECT DISTINCT column\nFROM table_name\nORDER BY column DESC\nLIMIT 10;",
    parts: [
      { bit: "DISTINCT", says: "Drops duplicate rows from the result. It applies to the whole selected row, not to one column." },
      { bit: "ORDER BY", says: "Sorts the result. Without it, row order is whatever the database found convenient — never assume it." },
      { bit: "DESC", says: "Largest first. <code>ASC</code> is the default and rarely written." },
      { bit: "LIMIT", says: "How many rows to return. Put it on every exploratory query — a SELECT on a million-row table with no limit is a slow way to learn that." },
    ],
    note: "LIMIT without ORDER BY gives you ten rows, not the top ten. Which ten is undefined and can change between runs.",
  },

  "sql-groupby": {
    intro: "Collapse many rows into one per group — and the clause order that makes it work.",
    form: "SELECT column, COUNT(*), AVG(value)\nFROM table_name\nWHERE row_condition\nGROUP BY column\nHAVING group_condition\nORDER BY COUNT(*) DESC;",
    parts: [
      { bit: "COUNT(*)", says: "Rows per group. <code>COUNT(column)</code> is different — it skips NULLs, which is sometimes what you want and never by accident." },
      { bit: "AVG(value)", says: "An aggregate: one number per group. <code>SUM</code>, <code>MIN</code>, <code>MAX</code> behave the same way." },
      { bit: "GROUP BY", says: "Which column defines a group. Every non-aggregated column in SELECT must appear here." },
      { bit: "WHERE", says: "Filters <b>rows</b>, before grouping. An aggregate cannot go here — at this point the groups do not exist yet." },
      { bit: "HAVING", says: "Filters <b>groups</b>, after aggregating. This is where a condition on COUNT or AVG belongs." },
      { bit: "ORDER BY", says: "Sorts the grouped result, and may sort by an aggregate." },
    ],
    note: "Written order is SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. <b>Run</b> order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT — which is why WHERE cannot see an alias SELECT has not created yet.",
  },

  "sql-joins": {
    intro: "One table rarely holds everything. A join lines two of them up on a shared value.",
    form: "SELECT a.column, b.column\nFROM table_a AS a\nJOIN table_b AS b\n  ON a.key = b.key;",
    parts: [
      { bit: "AS", says: "Gives the table a short alias. With two tables in play, prefixing columns stops \"ambiguous column name\" — and makes the query readable." },
      { bit: "a.column", says: "Which table each column comes from. Required whenever the name exists in both." },
      { bit: "JOIN", says: "Inner join: keeps only rows with a match on <b>both</b> sides. Rows with no partner disappear silently, which is the commonest way a join loses data." },
      { bit: "ON", says: "The condition that pairs the rows — normally a key on one side equalling a key on the other." },
      { bit: "a.key = b.key", says: "The link. Forget ON entirely and you get every row paired with every row: 1,000 × 1,000 = a million." },
    ],
    note: "<code>LEFT JOIN</code> keeps every row of the left table and fills the right with NULL where there is no match. Use it when \"no match\" is itself an answer worth seeing.",
  },

  "sql-advanced": {
    intro: "A query inside a query, and a way to rank rows without collapsing them.",
    form: "SELECT column,\n       ROW_NUMBER() OVER (PARTITION BY group_column ORDER BY sort_column) AS position\nFROM table_name\nWHERE column IN (SELECT column FROM other_table);",
    parts: [
      { bit: "ROW_NUMBER()", says: "A window function: numbers the rows. <code>RANK</code> and <code>DENSE_RANK</code> handle ties differently." },
      { bit: "OVER", says: "What makes it a window function. GROUP BY collapses rows into one; OVER computes per row and <b>keeps every row</b>." },
      { bit: "PARTITION BY", says: "Restarts the numbering per group — the window equivalent of GROUP BY." },
      { bit: "ORDER BY", says: "Inside the OVER brackets it decides what \"first\" means for the numbering, which is a different job from sorting the output." },
      { bit: "AS", says: "Names the computed column, so the result is readable." },
      { bit: "IN", says: "Membership against a list — or, here, against whatever the inner query returns." },
      { bit: "(SELECT column FROM other_table)", says: "A subquery. It runs first, and its result becomes the list the outer WHERE tests against." },
    ],
    note: "\"Top 3 per group\" needs a window function, not GROUP BY. GROUP BY gives you one row per group; you wanted three, with their detail intact.",
  },

  /* ======================================================== STATISTICS ==== */

  "descriptive-stats": {
    intro: "Three numbers that summarise a column, and they disagree on purpose.",
    form: "import numpy as np\nfrom scipy import stats\n\nnp.mean(data)      # the average\nnp.median(data)    # the middle value\nstats.mode(data)   # the commonest value",
    parts: [
      { bit: "import", says: "NumPy carries the everyday statistics; SciPy carries the rest." },
      { bit: "as", says: "<code>np</code> by convention, everywhere." },
      { bit: "from", says: "<code>stats</code> is a submodule, so it is taken out by name." },
      { bit: "np.mean(data)", says: "Add up, divide by the count. Moves when one extreme value does — which is exactly why it is not always the right summary." },
      { bit: "np.median(data)", says: "Sort, take the middle. One billionaire in a room of ten does not move it." },
      { bit: "stats.mode(data)", says: "The value appearing most often. The only one of the three that works on text." },
    ],
    note: "Report the mean and the median together. When they are far apart, that gap <b>is</b> the finding — the data is skewed, and one number was about to hide it.",
  },

  spread: {
    intro: "The average alone says nothing about how tightly the values sit around it.",
    form: "import numpy as np\n\nnp.var(data, ddof=1)\nnp.std(data, ddof=1)\nnp.max(data) - np.min(data)",
    parts: [
      { bit: "import", says: "NumPy again." },
      { bit: "as", says: "<code>np</code>." },
      { bit: "np.var(data, ddof=1)", says: "Variance: the average squared distance from the mean. Squared, so its units are not the data's units — which is why it is rarely reported directly." },
      { bit: "ddof", says: "Delta degrees of freedom. <code>1</code> for a <b>sample</b>, <code>0</code> for a whole population. NumPy defaults to 0 and most real data is a sample, so this is the argument people forget." },
      { bit: "np.std(data, ddof=1)", says: "Standard deviation: the square root of the variance, back in the data's own units. This is the one to report." },
      { bit: "np.max(data) - np.min(data)", says: "The range. Simple, and decided entirely by the two most extreme values — so it tells you about the tails and nothing about the middle." },
    ],
    note: "Two datasets can share a mean and be nothing alike. Spread is what tells them apart, and quoting a mean without it is half a sentence.",
  },

  "probability-basics": {
    intro: "Three rules, and almost every probability question is one of them in disguise.",
    form: "P(A)      = favourable / total\n\nP(A ∩ B)  = P(A) × P(B|A)\nP(A ∪ B)  = P(A) + P(B) − P(A ∩ B)\nP(A′)     = 1 − P(A)",
    parts: [
      { bit: "P(A)", says: "The probability of A: how many outcomes count as A, out of all equally likely outcomes. Always between 0 and 1." },
      { bit: "favourable", says: "Outcomes that count as A." },
      { bit: "total", says: "All possible outcomes. Getting this wrong is the usual mistake — count the whole sample space, not the interesting part of it." },
      { bit: "∩", says: "Both happen. Multiply — but by <code>P(B|A)</code>, not <code>P(B)</code>, unless the two are independent." },
      { bit: "P(B|A)", says: "The probability of B <b>given</b> A already happened. When knowing A changes nothing, this equals P(B) and the events are independent." },
      { bit: "∪", says: "Either happens. Add both, then subtract the overlap — otherwise the cases where both happen get counted twice." },
      { bit: "P(A′)", says: "The complement — \"A does not happen\". Often far easier than the direct count: \"at least one\" is nearly always solved as \"1 minus none\"." },
    ],
    note: "If your answer is below 0 or above 1, you have not made a rounding error — you have counted something twice or used the wrong total.",
  },

  "normal-distribution": {
    intro: "A z-score turns any value into \"how many standard deviations from average\", so unlike things become comparable.",
    form: "z = (value − mean) / std\n\nfrom scipy import stats\nstats.norm.cdf(z)\nstats.norm.ppf(probability)",
    parts: [
      { bit: "z", says: "The z-score. 0 is exactly average, +2 is two standard deviations above, −1.5 is one and a half below." },
      { bit: "value", says: "The raw observation." },
      { bit: "mean", says: "The centre it is measured from." },
      { bit: "std", says: "The unit it is measured in. Dividing by it is what removes the original units and makes two different scales comparable." },
      { bit: "from", says: "<code>stats</code> out of SciPy." },
      { bit: "import", says: "Loads it." },
      { bit: "stats.norm.cdf(z)", says: "The proportion of the distribution <b>below</b> that z. cdf(0) is 0.5 — half the data sits below average." },
      { bit: "stats.norm.ppf(probability)", says: "The inverse: give it a proportion, get the z that cuts there. ppf(0.95) ≈ 1.645, which is where confidence intervals come from." },
    ],
    note: "68 / 95 / 99.7 within one, two and three standard deviations — but only for data that is actually bell-shaped. Plot it before you trust the rule.",
  },

  "percentiles-iqr": {
    intro: "Cut the sorted data into quarters, and the middle half tells you what \"normal\" looks like.",
    form: "q1  = np.percentile(data, 25)\nq3  = np.percentile(data, 75)\niqr = q3 − q1\n\nlower = q1 − 1.5 × iqr\nupper = q3 + 1.5 × iqr",
    parts: [
      { bit: "np.percentile(data, 25)", says: "The value below which 25% of the data sits. The 50th percentile is the median." },
      { bit: "q1", says: "First quartile — the bottom quarter ends here." },
      { bit: "q3", says: "Third quartile — three quarters of the data sits below it." },
      { bit: "iqr", says: "Interquartile range: the span of the middle 50%. Immune to extremes, because it never looks at the tails." },
      { bit: "lower", says: "Anything below this counts as an outlier by the usual convention." },
      { bit: "upper", says: "And anything above it. This pair is exactly what a box plot's whiskers draw." },
      { bit: "1.5", says: "A convention, not a law. Widen it to 3 when you only want the extreme outliers." },
    ],
    note: "\"Outlier\" means unusual, not wrong. Look at each one before deleting it — the interesting rows in real data are often the ones this rule flags.",
  },

  correlation: {
    intro: "One number for how tightly two columns move together.",
    form: "np.corrcoef(x, y)[0, 1]\ndf.corr()\nstats.pearsonr(x, y)",
    parts: [
      { bit: "np.corrcoef(x, y)", says: "Returns a 2×2 matrix, not a number — every variable against every variable, itself included." },
      { bit: "[0, 1]", says: "Pulls the one cell you wanted: x against y. The diagonal is always 1, because everything correlates perfectly with itself." },
      { bit: "df.corr()", says: "Every numeric column against every other, in one table. The fastest first look at a new dataset." },
      { bit: "stats.pearsonr(x, y)", says: "The correlation <b>and</b> a p-value — how likely a correlation this strong is from chance alone on this much data." },
    ],
    note: "+1 and −1 are equally strong, in opposite directions; 0 means no <b>straight-line</b> relationship, which is not the same as no relationship. And correlation is not cause — the third thing driving both is usually the real story.",
  },

  bayes: {
    intro: "New evidence should update a belief, not replace it. This is the arithmetic for that.",
    form: "P(A|B) = P(B|A) × P(A) / P(B)",
    parts: [
      { bit: "P(A|B)", says: "The posterior — what you believe about A <b>after</b> seeing B. The thing you actually want." },
      { bit: "P(B|A)", says: "The likelihood — how often the evidence shows up when A is true. This is what a test's accuracy usually reports." },
      { bit: "P(A)", says: "The prior — how common A is <b>before</b> any evidence. Skipping this is the mistake the whole lesson exists for." },
      { bit: "P(B)", says: "How often the evidence appears at all, over every cause of it. It normalises the result so probabilities still sum to 1." },
    ],
    note: "A 99%-accurate test for a disease that 1 person in 10,000 has still gives mostly false positives. The prior is doing the work, and it is the term people leave out.",
  },

  distributions: {
    intro: "A distribution is a shape data tends to take. Naming the right one lets you answer questions without collecting more.",
    form: "from scipy import stats\n\nstats.norm(loc=mean, scale=std)\nstats.binom(n=trials, p=chance)\nstats.poisson(mu=rate)\n\ndist.pmf(k)   dist.pdf(x)   dist.cdf(x)   dist.rvs(size=n)",
    parts: [
      { bit: "from", says: "Every distribution lives in <code>scipy.stats</code> and shares the same interface." },
      { bit: "import", says: "Loads it." },
      { bit: "stats.norm(loc=mean, scale=std)", says: "The bell curve. <code>loc</code> is the centre, <code>scale</code> the standard deviation — the names are the same for every distribution." },
      { bit: "stats.binom(n=trials, p=chance)", says: "Counts of successes in a fixed number of independent yes/no trials." },
      { bit: "stats.poisson(mu=rate)", says: "Counts of events in a fixed window when they arrive independently — calls per hour, defects per batch." },
      { bit: "dist.pmf(k)", says: "Probability of exactly k, for <b>discrete</b> distributions." },
      { bit: "dist.pdf(x)", says: "Density at x, for <b>continuous</b> ones. Not a probability — the probability of exactly one real number is zero." },
      { bit: "dist.cdf(x)", says: "Probability of x <b>or less</b>. This is the one that answers most real questions." },
      { bit: "dist.rvs(size=n)", says: "Draws n random values from it — how you simulate when the maths gets awkward." },
    ],
    note: "Discrete counts things, continuous measures them. Reaching for <code>pdf</code> on a binomial or <code>pmf</code> on a normal is the commonest slip here.",
  },

  "sampling-clt": {
    intro: "You measure a sample and want to talk about the population. This is what makes that legal.",
    form: "sample = np.random.choice(population, size=n)\n\nmeans = [np.mean(np.random.choice(population, size=n)) for _ in range(1000)]\n\nstandard_error = np.std(population) / np.sqrt(n)",
    parts: [
      { bit: "np.random.choice(population, size=n)", says: "One sample of n. Every draw gives a different one — that variation is the whole subject." },
      { bit: "means", says: "The sampling distribution: what the sample mean does when you take the sample again and again." },
      { bit: "for", says: "One repetition per turn. A thousand is plenty to see the shape." },
      { bit: "_", says: "The counter is never used — only how many times matters." },
      { bit: "in", says: "Walks the repetitions." },
      { bit: "range(1000)", says: "How many samples to simulate." },
      { bit: "standard_error", says: "How much the sample mean itself varies. Not the spread of the data — the spread of the <b>estimate</b>." },
      { bit: "np.sqrt(n)", says: "Dividing by the square root of n is why precision is expensive: four times the data buys twice the accuracy, not four times." },
    ],
    note: "The central limit theorem says those sample means go bell-shaped even when the data is not — which is why the normal distribution turns up in tests on data that looks nothing like it.",
  },

  "hypothesis-testing": {
    intro: "A test answers one narrow question: could this difference plausibly be chance?",
    form: "from scipy import stats\n\nt_stat, p_value = stats.ttest_ind(group_a, group_b)\n\nif p_value < alpha:\n    reject_the_null",
    parts: [
      { bit: "from", says: "SciPy carries the standard tests." },
      { bit: "import", says: "Loads them." },
      { bit: "stats.ttest_ind(group_a, group_b)", says: "Independent two-sample t-test: are these two groups' means further apart than chance explains? <code>ttest_rel</code> is the paired version, for before-and-after on the same subjects." },
      { bit: "t_stat", says: "The size of the difference, in units of its own uncertainty." },
      { bit: "p_value", says: "The probability of seeing a difference this big <b>if the null were true</b>. It is not the probability the null is true — that is the misreading everything else here rests on." },
      { bit: "if", says: "The decision rule, and it must be fixed <b>before</b> looking at the data." },
      { bit: "alpha", says: "The threshold you agreed to accept, usually 0.05. It is a choice about how often you are willing to be wrong, not a property of the data." },
      { bit: "reject_the_null", says: "The only thing a test can do. Failing to reject is not proof there is no effect — often it means the sample was too small to see one." },
    ],
    note: "A significant p-value says the difference is probably real. It says nothing about whether it is <b>big enough to matter</b> — that is the effect size, and it is the number your stakeholder actually wants.",
  },

  "ab-testing": {
    intro: "The same test, applied to the one experiment every product team runs.",
    form: "from statsmodels.stats.proportion import proportions_ztest\n\ncount = [conversions_a, conversions_b]\nnobs  = [visitors_a, visitors_b]\n\nz_stat, p_value = proportions_ztest(count, nobs)",
    parts: [
      { bit: "from", says: "statsmodels carries the proportion tests SciPy does not." },
      { bit: "import", says: "Loads it." },
      { bit: "count", says: "Successes per group — conversions, signups, clicks. Not rates: the raw counts." },
      { bit: "nobs", says: "How many people were in each group. The pair (count, nobs) is what a proportion actually is." },
      { bit: "conversions_a", says: "Group A's successes. A is the control — the thing already running." },
      { bit: "visitors_a", says: "Group A's total. Both groups must be assigned at random, or the test measures your assignment rule instead of your change." },
      { bit: "proportions_ztest(count, nobs)", says: "Compares the two rates and reports whether the gap is bigger than chance." },
      { bit: "p_value", says: "Same meaning and the same trap as any other test." },
    ],
    note: "Decide the sample size and the end date <b>before</b> starting. Checking daily and stopping when it looks significant is how a coin flip becomes a 5% conversion lift.",
  },

  /* ====================================================== VISUALIZATION ==== */

  "viz-intro": {
    intro: "Two lines are the whole of plotting. Everything after this is refinement.",
    form: "import matplotlib.pyplot as plt\n\nplt.plot(x, y)\nplt.show()",
    parts: [
      { bit: "import", says: "matplotlib is the foundation. Seaborn and pandas plotting both sit on top of it." },
      { bit: "as", says: "<code>plt</code>, universally. <code>matplotlib.pyplot</code> is the drawing half of the library." },
      { bit: "plt.plot(x, y)", says: "Draws. It does not display — it adds to a figure being built up in the background." },
      { bit: "plt.show()", says: "Displays what has accumulated, and clears it. Forget it in a script and the window never appears; call it too early and later lines draw on a blank figure." },
    ],
    note: "Plot the data before summarising it. Four datasets can share a mean, a variance and a correlation and look completely different — that is Anscombe's quartet, and it is why this lesson comes first.",
  },

  "matplotlib-basics": {
    intro: "The explicit form: make a figure and an axes, then tell the axes what to draw.",
    form: "import matplotlib.pyplot as plt\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.plot(x, y, label=\"series\")\nax.set_xlabel(\"x\")\nax.set_title(\"title\")\nax.legend()\nplt.tight_layout()",
    parts: [
      { bit: "import", says: "Same import as the previous lesson — everything below is what to do once it is loaded." },
      { bit: "as", says: "<code>plt</code>, as always." },
      { bit: "plt.subplots(figsize=(8, 5))", says: "Creates the canvas and one axes on it, and hands both back. This is the form to learn — the <code>plt.plot</code> shortcut hides which figure it is drawing on." },
      { bit: "fig", says: "The whole canvas: size, saving, overall title." },
      { bit: "ax", says: "The plotting area: the data, the labels, the legend. Nearly everything you do is on <code>ax</code>." },
      { bit: "figsize", says: "Width and height in inches. The single biggest lever on whether a chart is readable." },
      { bit: "ax.plot(x, y, label=\"series\")", says: "Draws a line. <code>label</code> is what the legend will show — set it here, not later." },
      { bit: "ax.set_xlabel(\"x\")", says: "Axis labels. An unlabelled axis makes a chart undecipherable to everyone except the person who made it that morning." },
      { bit: "ax.legend()", says: "Draws the legend from the labels. With no labels set, it draws nothing and warns." },
      { bit: "plt.tight_layout()", says: "Stops labels being cut off at the edges. Call it last, once everything is drawn." },
    ],
    note: "<code>fig, ax = plt.subplots()</code> for anything you will keep. The stateful <code>plt.</code> calls are fine in a notebook and become impossible to follow the moment there are two charts.",
  },

  seaborn: {
    intro: "Seaborn takes a DataFrame and column names, and does the statistics for you.",
    form: "import seaborn as sns\n\nsns.histplot(data=df, x=\"column\", hue=\"group\")\nsns.boxplot(data=df, x=\"group\", y=\"value\")\nsns.scatterplot(data=df, x=\"a\", y=\"b\")\nsns.heatmap(df.corr(), annot=True)",
    parts: [
      { bit: "import", says: "Built on matplotlib, so every matplotlib adjustment still works on the result." },
      { bit: "as", says: "<code>sns</code> by convention." },
      { bit: "data", says: "The DataFrame. Every seaborn function takes this plus column <b>names</b> — you pass strings, not the columns themselves." },
      { bit: "x", says: "The column name for the horizontal axis, as a string." },
      { bit: "hue", says: "Splits by a third column, colouring each group separately. One argument, and a chart becomes a comparison." },
      { bit: "sns.histplot", says: "Distribution of one column — the shape a mean is hiding." },
      { bit: "sns.boxplot", says: "Median, quartiles and outliers per group. The IQR lesson, drawn." },
      { bit: "sns.heatmap(df.corr(), annot=True)", says: "A correlation matrix as colour. <code>annot=True</code> writes the numbers in, without which it is decoration." },
    ],
    note: "Seaborn returns a matplotlib axes. Anything it does not offer — a title, a limit, an annotation — you add with the <code>ax.</code> calls from the previous lesson.",
  },

  "choosing-charts": {
    intro: "The chart type is decided by the question, not by taste. This is the lookup.",
    form: "one value over time        ->  line\ncompare across categories  ->  bar\nshape of one column        ->  histogram\ntwo columns together       ->  scatter\nspread across groups       ->  box\nhow strongly all pairs move ->  heatmap",
    parts: [
      { bit: "line", says: "Time on the x-axis, and only for time or another ordered scale. A line between unordered categories implies a journey that does not exist." },
      { bit: "bar", says: "Comparing amounts across categories. Start the axis at zero — a truncated bar chart exaggerates every difference on it." },
      { bit: "histogram", says: "The distribution of one numeric column. Bin width changes the story, so try more than one." },
      { bit: "scatter", says: "Two numeric columns, one dot per row. The only chart that shows a relationship rather than a summary of one." },
      { bit: "box", says: "Comparing spread across groups. Shows the median, the middle half and the outliers at once." },
      { bit: "heatmap", says: "A matrix as colour — correlations, confusion matrices, anything with two categorical axes and a number." },
    ],
    note: "No pie charts past three slices. Human eyes compare lengths well and angles badly, which is why a bar chart beats a pie at almost everything a pie is used for.",
  },

  "eda-storytelling": {
    intro: "The same six lines, on every dataset, before any analysis. In this order.",
    form: "df.shape\ndf.info()\ndf.describe()\ndf.isna().sum()\ndf[\"column\"].value_counts()\ndf.corr()",
    parts: [
      { bit: "df.shape", says: "How much data there is. 200 rows and 50 columns is a different problem from 2 million and 5." },
      { bit: "df.info()", says: "Types and non-null counts. A number stored as text shows up here, before it breaks something later." },
      { bit: "df.describe()", says: "Count, mean, std and the quartiles per numeric column. Read the min and max first — that is where impossible values hide." },
      { bit: "df.isna().sum()", says: "Missing values per column, before deciding what to do about any of them." },
      { bit: "df[\"column\"].value_counts()", says: "For each categorical column. Where \"Delhi\", \"delhi\" and \"Delhi \" reveal themselves as three cities." },
      { bit: "df.corr()", says: "What moves with what. A first map of where to look, not an answer." },
    ],
    note: "EDA ends with a sentence, not a chart. If you cannot say what you found in one line without pointing at a plot, you have not finished looking.",
  },

  /* ====================================================== DEEP LEARNING ==== */

  "dl-intro": {
    intro: "A neural network is layers of weights with a bend between them. The bend is the whole trick.",
    form: "from sklearn.neural_network import MLPClassifier\n\nmodel = MLPClassifier(hidden_layer_sizes=(64,), max_iter=300)\nmodel.fit(X_train, y_train)\nmodel.score(X_test, y_test)",
    parts: [
      { bit: "from", says: "scikit-learn carries a small neural network. It is enough to learn on, and it trains in seconds." },
      { bit: "import", says: "Loads it." },
      { bit: "MLPClassifier", says: "Multi-layer perceptron: the plain fully-connected network. Everything fancier is a change to its shape, not to what it does." },
      { bit: "hidden_layer_sizes=(64,)", says: "One hidden layer of 64 neurons. A tuple — <code>(64, 32)</code> is two layers. The trailing comma matters: <code>(64)</code> is just a number." },
      { bit: "max_iter", says: "How many passes over the data. Too few and it stops before learning; the warning it prints when that happens is worth reading, not silencing." },
      { bit: "model.fit(X_train, y_train)", says: "Training: adjust every weight until the predictions stop improving." },
      { bit: "model.score(X_test, y_test)", says: "Accuracy on data it has never seen. The only number that means anything." },
    ],
    note: "Without a non-linearity between layers, stacked layers collapse into a single matrix — a hundred of them have the expressive power of a straight line. The bend is what makes depth worth anything.",
  },

  "dl-types": {
    intro: "Architectures exist because different data has different structure. Flattening throws that structure away.",
    form: "flat = image.reshape(-1)          # 8×8 grid becomes 64 numbers\n\nkernel = [[-1, 1],\n          [-1, 1]]                # slid across, multiplied, summed\n\noutput_width = n − k + 1",
    parts: [
      { bit: "image.reshape(-1)", says: "Flattens the grid into one long row. Which pixels sat next to which is now gone, and a fully-connected network never had it." },
      { bit: "-1", says: "\"Work the length out yourself.\" Convenient, and it is also the line where the spatial layout is discarded." },
      { bit: "kernel", says: "A small grid of weights, slid across the image. At each position it multiplies and sums — this one fires on a dark-to-light edge." },
      { bit: "n", says: "The image width." },
      { bit: "k", says: "The kernel width." },
      { bit: "output_width", says: "<code>n − k + 1</code>, because the window has to fit entirely inside. Stack a few and the image shrinks fast, which is what padding exists to prevent." },
    ],
    note: "The one experiment that settles it: shuffle every pixel position the same way and re-score. A plain network barely moves — it was never using the layout. A CNN collapses, because it was.",
  },

  "dl-nlp": {
    intro: "A model cannot read. Text has to become numbers first, and how you do it decides what the model can possibly learn.",
    form: "from sklearn.feature_extraction.text import CountVectorizer\n\nvec = CountVectorizer(ngram_range=(1, 2))\nX = vec.fit_transform(train_documents)\nvec.transform(new_documents)",
    parts: [
      { bit: "from", says: "scikit-learn's text feature extraction." },
      { bit: "import", says: "Loads it." },
      { bit: "CountVectorizer", says: "Bag of words: one column per vocabulary word, counts as the values. It is called a bag because a bag has no order." },
      { bit: "ngram_range=(1, 2)", says: "Single words <b>and</b> adjacent pairs. This is what gives the model somewhere to put \"not good\" — without it, \"not\" and \"good\" are two unrelated columns." },
      { bit: "vec.fit_transform(train_documents)", says: "Learns the vocabulary and converts in one step. Fit on the training documents only — it is a model, and fitting on everything leaks." },
      { bit: "vec.transform(new_documents)", says: "Converts using the vocabulary already learned. A word it has never seen is <b>silently dropped</b> — no error, no warning, no column." },
    ],
    note: "That silent drop is why \"not good food\" can score exactly what \"good food\" scores: the model literally received \"good food\". Print which incoming words are missing from the vocabulary and the bug stops being invisible.",
  },

  /* ================================================= BUSINESS INTELLIGENCE == */

  "bi-intro": {
    intro: "A dashboard is not a report. It answers a standing question, over and over, without anyone rerunning anything.",
    form: "question   ->  metric      ->  visual        ->  action\n\"are we growing?\"  ->  weekly signups  ->  line chart  ->  spend more here",
    parts: [
      { bit: "question", says: "Start here, always. A dashboard built from \"what data do we have\" ends up as a wall of charts nobody opens twice." },
      { bit: "metric", says: "One number that moves when the answer changes. If it can move without the answer changing, it is the wrong metric." },
      { bit: "visual", says: "The chart type follows from the metric — time series to a line, category comparison to a bar. Not from what looks impressive." },
      { bit: "action", says: "What somebody does differently because of it. A chart nobody can act on is decoration, however accurate it is." },
    ],
    note: "Test every tile with \"what would I do if this number doubled?\" No answer means the tile comes off the dashboard.",
  },

  "bi-tools": {
    intro: "Every BI tool works the same way underneath: connect, model, measure, visualise.",
    form: "connect  ->  the source table\nmodel    ->  relate tables on their keys\nmeasure  ->  Total Sales = SUM(Sales[Amount])\nvisual   ->  drag the measure onto a chart",
    parts: [
      { bit: "connect", says: "Point the tool at a database, a file or an API. This is the step everyone remembers." },
      { bit: "model", says: "Tell the tool how tables relate — the same keys a SQL JOIN would use. Skip it and every chart is stuck inside one table." },
      { bit: "measure", says: "A calculation defined once and reused everywhere. Power BI calls the language DAX; Tableau calls them calculated fields. The idea is identical." },
      { bit: "SUM(Sales[Amount])", says: "Aggregates a column. A measure is computed <b>in the context of the visual</b> — the same definition gives a total on one tile and a per-month figure on another." },
      { bit: "visual", says: "Drag the measure in and pick the chart. The work was the modelling; this part is minutes." },
    ],
    note: "If a number is wrong in two charts, the bug is in the model or the measure, not in the charts. Fix it once at the measure and both are right.",
  },

  "bi-kpis": {
    intro: "A KPI is a metric somebody is accountable for. Most numbers on a dashboard are not KPIs.",
    form: "KPI = metric + target + owner + period\n\n\"Monthly active users, 10,000 by March, owned by Growth\"\n\nrate  = numerator / denominator\ngrowth = (current − previous) / previous",
    parts: [
      { bit: "metric", says: "What is measured. Precisely — \"active\" needs a definition before it means anything." },
      { bit: "target", says: "What counts as good. A number with no target cannot be passed or failed, so nobody acts on it." },
      { bit: "owner", says: "Who is accountable. Without one, a KPI that goes red is a topic of conversation rather than a job." },
      { bit: "period", says: "By when. \"10,000 users\" with no date is a wish." },
      { bit: "rate", says: "Conversion, churn, retention — all the same shape. The denominator is where the argument always is: converted out of <b>whom</b>?" },
      { bit: "growth", says: "Change against the previous period. Watch the base: growth from 2 to 4 is +100% and means almost nothing." },
    ],
    note: "Pick few. Fifteen KPIs is no KPIs — nobody can hold fifteen priorities, so in practice they pick their own three and you have lost control of which.",
  },

  /* ========================================================== DEPLOYMENT == */

  "deploy-model": {
    intro: "A trained model in a notebook helps nobody. Two steps put it behind a URL.",
    form: "import joblib\n\njoblib.dump(pipeline, \"model.joblib\")\nmodel = joblib.load(\"model.joblib\")\n\n@app.post(\"/predict\")\ndef predict(payload):\n    return model.predict([payload.features]).tolist()",
    parts: [
      { bit: "import", says: "joblib is what scikit-learn recommends for saving models — faster than pickle on the large NumPy arrays inside them." },
      { bit: "joblib.dump(pipeline, \"model.joblib\")", says: "Saves the <b>whole pipeline</b>, not the estimator. Save only the model and the scaler it was trained with is gone, so live predictions are made on differently-scaled numbers." },
      { bit: "joblib.load(\"model.joblib\")", says: "Loads it once, when the process starts. Loading per request turns a 5ms prediction into a 500ms one." },
      { bit: "@app.post(\"/predict\")", says: "The route. POST rather than GET, because the input is data rather than an address." },
      { bit: "def", says: "The handler. Everything above it happens once; everything inside happens per request." },
      { bit: "payload", says: "The incoming JSON. Validate it — the model will happily predict from nonsense and return a confident number." },
      { bit: "return", says: "<code>.tolist()</code> because a NumPy array is not JSON-serialisable, which is the first error everyone hits here." },
    ],
    note: "The training environment and the serving environment must match. A model saved under one scikit-learn version and loaded under another may load, warn, and predict differently — pin the versions.",
  },

  "deploy-portfolio": {
    intro: "A portfolio project is judged on whether a stranger can understand it in two minutes.",
    form: "project/\n  README.md          <- what, why, result, how to run\n  notebooks/         <- the exploration\n  src/               <- the code that matters\n  requirements.txt   <- exact versions\n  .gitignore         <- data, secrets, venv",
    parts: [
      { bit: "README.md", says: "The only file most people will open. First line: what problem, what result. Not the dataset description." },
      { bit: "notebooks/", says: "Where the thinking happened. Keep them, but they are not the deliverable — nobody reads 400 cells." },
      { bit: "src/", says: "The reusable code, pulled out of the notebooks. This is what says you can write software rather than only explore." },
      { bit: "requirements.txt", says: "Pinned versions. \"It works on my machine\" is the single commonest reason a reviewer gives up." },
      { bit: ".gitignore", says: "Data, credentials, virtualenv. A key committed once stays in the git history even after the file is deleted." },
    ],
    note: "Three finished projects beat ten abandoned ones. Finished means: a README somebody else can follow, and a result stated in one sentence with a number in it.",
  },

  "deploy-interview": {
    intro: "A data interview answer has a shape. Using it stops good work sounding like a shrug.",
    form: "Situation  ->  Task  ->  Action  ->  Result\n\n\"Sales data was 30% missing.\"        (situation)\n\"Forecast monthly revenue.\"          (task)\n\"Compared median fill against drop.\" (action)\n\"Error: 18% down to 11%.\"            (result)",
    parts: [
      { bit: "Situation", says: "One line of context. Enough for the problem to make sense, and no more — this is where people spend three minutes and lose the room." },
      { bit: "Task", says: "What you specifically had to do. Not what the team did." },
      { bit: "Action", says: "What you tried, and <b>why that</b> rather than the obvious alternative. The reasoning is what is being assessed, not the tool." },
      { bit: "Result", says: "A number. \"It improved\" is not an answer; \"error went 18% down to 11%\" is. If the project failed, say what you learned — that answer is also fine." },
    ],
    note: "Prepare three stories in this shape and nearly every behavioural question maps onto one. Rehearse the numbers — they are the part that goes missing under pressure.",
  },

  /* =================================================== MACHINE LEARNING ==== */

  "ml-intro": {
    intro: "Every scikit-learn model is the same four calls. Learn them once and the library stops being a library.",
    form: "from sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\nmodel.score(X_test, y_test)",
    parts: [
      { bit: "from", says: "Everything here lives under <code>sklearn</code>, split into submodules by job." },
      { bit: "import", says: "Loads it." },
      { bit: "X", says: "The features — the inputs, one row per example, capital X by convention because it is a matrix." },
      { bit: "y", says: "The target — what you are trying to predict, one value per row, lowercase because it is a vector." },
      { bit: "train_test_split", says: "Splits the rows in two. The test rows are put aside and the model never sees them, which is the only way a score means anything." },
      { bit: "test_size=0.2", says: "20% held out. Enough to measure on, small enough to still have something to learn from." },
      { bit: "random_state=42", says: "Fixes the shuffle so the same split comes back every run. Without it your score changes each time and you cannot tell a real improvement from a lucky draw." },
      { bit: "model.fit(X_train, y_train)", says: "Learning. Only ever on the training half." },
      { bit: "model.predict(X_test)", says: "Applies what it learned to unseen rows." },
      { bit: "model.score(X_test, y_test)", says: "How often it was right. On the test half, always — a score on training data is a measure of memory, not of learning." },
    ],
    note: "Every estimator in scikit-learn has <code>.fit</code> and <code>.predict</code>. Swapping a LinearRegression for a RandomForest is one line, which is exactly why the library is shaped this way.",
  },

  "ml-regression": {
    intro: "Predicting a number rather than a category, and the three ways to say how wrong you were.",
    form: "from sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_absolute_error, r2_score\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\nmodel.coef_\nmodel.intercept_\nmean_absolute_error(y_test, predictions)\nr2_score(y_test, predictions)",
    parts: [
      { bit: "from", says: "Estimators and metrics live in different submodules." },
      { bit: "import", says: "Several names on one line, comma-separated." },
      { bit: "LinearRegression()", says: "Fits a straight line — or a flat plane, once there is more than one feature." },
      { bit: "model.coef_", says: "One weight per feature: how much the prediction moves per unit of that feature. The trailing underscore means \"learned during fit\" — it does not exist before." },
      { bit: "model.intercept_", says: "Where the line crosses zero. The prediction when every feature is 0, which is often a value that could never occur." },
      { bit: "mean_absolute_error", says: "Average miss, in the target's own units. If it says 12,000, you are typically 12,000 rupees out — the one metric a non-technical person can read." },
      { bit: "r2_score", says: "The share of the variation the model explains. 1.0 is perfect, 0 is no better than always guessing the mean, and it can go <b>negative</b> for a model worse than that." },
    ],
    note: "Read the coefficients. A weight with the wrong sign — more bedrooms lowering the price — usually means correlated features rather than a discovery about houses.",
  },

  "ml-regression-more": {
    intro: "When a straight line is not enough, and what stops the fix from overfitting.",
    form: "from sklearn.linear_model import Ridge, Lasso\nfrom sklearn.preprocessing import PolynomialFeatures\n\nPolynomialFeatures(degree=2)\nRidge(alpha=1.0)\nLasso(alpha=0.1)",
    parts: [
      { bit: "from", says: "Preprocessing and estimators, two submodules." },
      { bit: "import", says: "Loads them." },
      { bit: "PolynomialFeatures(degree=2)", says: "Adds squares and products of the existing features, so a linear model can fit a curve. The model is still linear — the <b>features</b> changed." },
      { bit: "degree", says: "How high to go. It explodes: degree 3 on 10 features gives 285 columns, and most of them are noise." },
      { bit: "Ridge(alpha=1.0)", says: "Linear regression with a penalty on large weights. It shrinks them towards zero without reaching it — the usual first choice when features are correlated." },
      { bit: "Lasso(alpha=0.1)", says: "The same idea with a penalty that drives some weights <b>exactly</b> to zero, which makes it a feature selector as well as a model." },
      { bit: "alpha", says: "How hard to penalise. 0 gives plain linear regression back; too high and every weight collapses and the model predicts the mean." },
    ],
    note: "Regularisation only works on scaled features — the penalty is on the size of the weight, and an unscaled feature gets a tiny weight for reasons that have nothing to do with importance.",
  },

  "ml-classification": {
    intro: "Predicting a class, and the threshold nobody tells you they chose.",
    form: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix, classification_report\n\nmodel.predict(X_test)\nprobabilities = model.predict_proba(X_test)[:, 1]\n(probabilities > 0.5).astype(int)\n\nconfusion_matrix(y_test, predictions)",
    parts: [
      { bit: "from", says: "Estimator and metrics again." },
      { bit: "import", says: "Loads them." },
      { bit: "LogisticRegression", says: "Despite the name, a classifier. It predicts a probability and then cuts it into a class." },
      { bit: "model.predict(X_test)", says: "The class. Convenient, and it silently applies a 0.5 cut-off you never agreed to." },
      { bit: "model.predict_proba(X_test)", says: "The probabilities — one column per class. This is the model's actual output." },
      { bit: "[:, 1]", says: "The positive class's column. Column 0 is the negative one, and they sum to 1." },
      { bit: "0.5", says: "The threshold. Move it: for fraud you want to catch nearly everything and tolerate false alarms, so 0.5 is the wrong cut and always was." },
      { bit: "confusion_matrix", says: "The four counts — true and false, positive and negative. Accuracy is a summary of this table, and the table is what tells you which mistake you are making." },
    ],
    note: "On imbalanced data accuracy is a trap. A model predicting \"not fraud\" every time scores 99.8% on data that is 0.2% fraud, and is worth nothing.",
  },

  "ml-roc-auc": {
    intro: "One number that judges a classifier at every threshold instead of one.",
    form: "from sklearn.metrics import roc_curve, roc_auc_score\n\nfpr, tpr, thresholds = roc_curve(y_test, probabilities)\nroc_auc_score(y_test, probabilities)",
    parts: [
      { bit: "from", says: "Both live in <code>sklearn.metrics</code>." },
      { bit: "import", says: "Loads them." },
      { bit: "roc_curve", says: "Sweeps every threshold and records what each one costs. Give it the <b>probabilities</b>, not the predicted classes — hand it classes and you get a three-point curve and a meaningless score." },
      { bit: "fpr", says: "False positive rate: how many negatives were wrongly flagged. The price." },
      { bit: "tpr", says: "True positive rate: how many positives were caught. The prize. Plot tpr against fpr and that is the ROC curve." },
      { bit: "thresholds", says: "The cut-off behind each point, which is how you pick one deliberately rather than accepting 0.5." },
      { bit: "roc_auc_score", says: "Area under that curve. 0.5 is a coin flip, 1.0 is perfect. Read it as: the chance the model scores a random positive above a random negative." },
    ],
    note: "AUC is threshold-free, which is its strength and its blind spot — it says the ranking is good and nothing about whether any single cut-off is usable for your problem.",
  },

  "ml-evaluation": {
    intro: "One split is one measurement. Nobody reports one measurement of anything that matters.",
    form: "from sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\npipe = Pipeline([(\"scale\", StandardScaler()), (\"model\", LogisticRegression())])\nscores = cross_val_score(pipe, X, y, cv=5)\nscores.mean()\nscores.std()",
    parts: [
      { bit: "from", says: "Three submodules, three lines." },
      { bit: "import", says: "Loads them." },
      { bit: "Pipeline", says: "Chains preprocessing to the model so they are fitted together. This is not tidiness — it is what keeps the scaler from ever seeing the validation rows." },
      { bit: "StandardScaler()", says: "Learns a mean and a standard deviation, which makes it a model with two parameters. Fit it outside the pipeline and test-set information reaches your training features." },
      { bit: "cross_val_score", says: "Splits the data <code>cv</code> ways and scores each fold, refitting the whole pipeline inside every one." },
      { bit: "cv=5", says: "Five folds. Every row is held out exactly once, so every row is measured on." },
      { bit: "scores.mean()", says: "The headline number." },
      { bit: "scores.std()", says: "The error bar, and the part people drop. A 3-point difference between two models means nothing when the folds swing 12 points." },
    ],
    note: "Anything fitted before the split leaks — a scaler, an imputer, a feature selector. The symptom is a score better than the problem deserves, which is the one result nobody investigates.",
  },

  "ml-neighbours": {
    intro: "A model that does not learn anything: it just remembers everything and asks the nearest examples.",
    form: "from sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.preprocessing import StandardScaler\n\nX_scaled = StandardScaler().fit_transform(X_train)\nKNeighborsClassifier(n_neighbors=5)",
    parts: [
      { bit: "from", says: "Estimator and scaler." },
      { bit: "import", says: "Loads them." },
      { bit: "KNeighborsClassifier", says: "To predict, it finds the k closest training rows and takes their majority vote. <code>fit</code> stores the data; the work all happens at predict time." },
      { bit: "n_neighbors=5", says: "How many neighbours vote. 1 follows every bit of noise; too many and every prediction drifts towards the commonest class. Odd numbers avoid ties in two-class problems." },
      { bit: "StandardScaler().fit_transform(X_train)", says: "Not optional here. \"Closest\" is a distance, so a feature measured in thousands drowns one measured in units — salary would decide every neighbour and age would never matter." },
    ],
    note: "It has no training cost and a large prediction cost, which is the opposite of most models. On a big dataset every single prediction searches the whole training set.",
  },

  "ml-unsupervised": {
    intro: "No labels. You ask for groups, and you always get exactly as many as you asked for.",
    form: "from sklearn.cluster import KMeans\n\nkm = KMeans(n_clusters=3, random_state=42, n_init=10)\nlabels = km.fit_predict(X)\nkm.inertia_\nkm.cluster_centers_",
    parts: [
      { bit: "from", says: "Clustering algorithms live in <code>sklearn.cluster</code>." },
      { bit: "import", says: "Loads it." },
      { bit: "KMeans", says: "Puts every point in one of k groups by moving k centres until they settle." },
      { bit: "n_clusters=3", says: "How many groups. <b>You</b> choose this, and the algorithm will happily split genuinely uniform data into three confident-looking clusters." },
      { bit: "n_init=10", says: "How many random starts to try, keeping the best. The result depends on where the centres began, so one start can settle somewhere poor." },
      { bit: "km.fit_predict(X)", says: "Fits and returns a group number per row. The numbers are arbitrary labels — cluster 0 is not below cluster 1." },
      { bit: "km.inertia_", says: "Total distance from points to their own centre. Plot it against k and look for the elbow — it always falls as k rises, so the lowest value is not the answer." },
      { bit: "km.cluster_centers_", says: "The centre of each group. Reading these is how a cluster gets a name a human can use." },
    ],
    note: "Clusters are not categories until somebody looks at them and says what they are. An unnamed cluster is a number, and it is very easy to be confidently wrong about it.",
  },

  "ml-hierarchical": {
    intro: "Clustering without committing to a number up front: build the whole tree, then cut it.",
    form: "from sklearn.cluster import AgglomerativeClustering\nfrom scipy.cluster.hierarchy import linkage, dendrogram\n\nAgglomerativeClustering(n_clusters=3, linkage=\"ward\")\ndendrogram(linkage(X, method=\"ward\"))",
    parts: [
      { bit: "from", says: "scikit-learn does the clustering; SciPy draws the tree." },
      { bit: "import", says: "Loads both." },
      { bit: "AgglomerativeClustering", says: "Starts with every point as its own cluster and merges the two nearest, over and over, until the count you asked for is left." },
      { bit: "linkage", says: "How the distance between two <b>clusters</b> is measured. <code>ward</code> merges the pair that adds least spread and is the sensible default." },
      { bit: "dendrogram", says: "Draws the merge history as a tree. The height of each join is how far apart the two groups were." },
      { bit: "method", says: "SciPy's name for the same linkage choice — keep it identical to the estimator's or the picture describes a different clustering." },
    ],
    note: "The dendrogram is the reason to use this: cut it at different heights and you see 2, 4 or 9 clusters from one run. K-means makes you decide before you have looked.",
  },

  "ml-workflow": {
    intro: "Searching for the settings, without the search itself leaking the answer.",
    form: "from sklearn.model_selection import GridSearchCV\n\ngrid = GridSearchCV(pipeline, param_grid={\"model__C\": [0.1, 1, 10]}, cv=5)\ngrid.fit(X_train, y_train)\n\ngrid.best_params_\ngrid.best_estimator_.score(X_test, y_test)",
    parts: [
      { bit: "from", says: "Same submodule as the splitters." },
      { bit: "import", says: "Loads it." },
      { bit: "GridSearchCV", says: "Tries every combination and cross-validates each. Cost is the product of the lists times <code>cv</code> — three values and 5 folds is 15 fits, and two parameters is 45." },
      { bit: "pipeline", says: "Pass the whole pipeline, not the bare model, so every fold re-fits the preprocessing too." },
      { bit: "param_grid", says: "What to try. <code>model__C</code> — double underscore — means \"the <code>C</code> of the step named <code>model</code>\", which is how a pipeline's inner settings are reached." },
      { bit: "grid.fit(X_train, y_train)", says: "On the <b>training</b> half only. The test rows must stay outside the search." },
      { bit: "grid.best_params_", says: "The winning combination. Landing on the edge of a list means the real best is outside it — widen and search again." },
      { bit: "grid.best_estimator_.score(X_test, y_test)", says: "The final, honest number: the winner scored once on data no part of the search ever touched." },
    ],
    note: "Every comparison you run against the validation folds fits your choices to them a little more. That is why the held-out set is spent once, at the end, and why a big gap between it and the search's best score is a warning.",
  },

  /* ------------------------------------------------------------ deploy 4 -- */

  "deploy-git": {
    intro: "Five commands cover almost everything, in the order you meet them.",
    form: "git init\ngit status\ngit add .\ngit commit -m \"message\"\ngit push origin main\n\ngit switch -c branch-name\ngit pull",
    parts: [
      { bit: "git init", says: "Turns this folder into a repository. Once, at the start — it creates a hidden <code>.git</code> folder, and deleting that deletes the history." },
      { bit: "git status", says: "What changed, what is staged. Run it constantly; it is the cheapest way never to be surprised by a commit." },
      { bit: "git add .", says: "Stages everything changed. Convenient, and exactly how credentials get committed — check <code>git status</code> first." },
      { bit: "git commit -m \"message\"", says: "Saves the staged changes as one point in history. Only what was staged goes in." },
      { bit: "git push origin main", says: "Sends your commits to GitHub. Nothing leaves your machine until you do this." },
      { bit: "git switch -c branch-name", says: "Creates a branch and moves onto it. Working on a branch is what makes experimenting safe." },
      { bit: "git pull", says: "Brings down what others pushed. Do it before you start, not after you have conflicting work." },
    ],
    note: "Write <code>.gitignore</code> before the first commit: <code>.env</code>, <code>__pycache__/</code>, <code>venv/</code>, data files. A key committed once stays in the history even after you delete the file.",
  },

  /* ====================================================== MICROPROCESSOR ==== */

  "mp-switches-and-numbers": {
    intro: "A wire is on or off. Eight of them side by side is every number a chip can hold.",
    form: "bit    ->  0 / 1         (one wire)\nnibble ->  4 bits         (one hex digit)\nbyte   ->  8 bits         (0 to 255)\n\n1011 0110  =  B6H  =  182",
    parts: [
      { bit: "bit", says: "One wire, one switch. Off is 0, on is 1. Everything else here is a way of grouping these." },
      { bit: "nibble", says: "Four bits. It matters because four bits is exactly one hexadecimal digit — which is the whole reason hex is used." },
      { bit: "byte", says: "Eight bits, so 2⁸ = 256 different patterns: 0 to 255 counting normally." },
      { bit: "1011 0110", says: "The eight wires. Split into two nibbles because each half converts to one hex digit on its own." },
      { bit: "B6H", says: "The same byte in hex. 1011 is B, 0110 is 6. The trailing H says hexadecimal — an 8085 program marks it this way." },
      { bit: "182", says: "The same byte in decimal. Three notations, one pattern of switches — the chip only ever has the switches." },
    ],
    note: "Convert by nibble, never by dividing the whole byte. 1011 0110 is B then 6, and you are done — the arithmetic route is slower and gets errors.",
  },

  "mp-memory-street": {
    intro: "Memory is a street of numbered boxes. Every box holds one byte and has one address.",
    form: "address     content\n2000H   ->  3EH\n2001H   ->  05H\n2002H   ->  32H\n\n16 address lines  ->  2^16 = 65536 boxes  ->  0000H to FFFFH",
    parts: [
      { bit: "address", says: "The box number. Nothing to do with what is inside it — a house number tells you nothing about the house." },
      { bit: "content", says: "The one byte stored there. Whether it is data or an instruction depends entirely on how the chip reaches it." },
      { bit: "2000H", says: "Written in hex because the address is really 16 wires, and four hex digits map onto them exactly." },
      { bit: "16 address lines", says: "The 8085's address bus. Each line is on or off, so the count of reachable boxes is 2 to the power of the line count." },
      { bit: "65536", says: "64K of memory. Add one address line and it doubles — that is why address bus width is quoted as a headline number." },
      { bit: "FFFFH", says: "The highest address, with all sixteen lines on. 0000H to FFFFH is the whole range the chip can name." },
    ],
    note: "The same byte is data or instruction depending only on whether the chip fetched it as one. A program that jumps into the middle of its own data executes it, and that is exactly what a crash usually is.",
  },

  "mp-what-is-a-program": {
    intro: "A program is bytes in consecutive boxes. The chip reads one, does it, and moves on.",
    form: "2000H  3E 05      MVI A, 05H     ; put 05 into A\n2002H  C6 03      ADI 03H        ; add 03 to A\n2004H  32 50 20   STA 2050H      ; store A at 2050H\n2007H  76         HLT            ; stop",
    parts: [
      { bit: "2000H", says: "Where this instruction sits. The next address is this one plus the instruction's length — which is why the column jumps by 2, 2 and 3." },
      { bit: "3E 05", says: "The machine code: what is actually in memory. 3E is the opcode, 05 is its data byte." },
      { bit: "MVI A, 05H", says: "The mnemonic — the same bytes written for humans. The chip never sees this; an assembler turns it into 3E 05." },
      { bit: ";", says: "Starts a comment. Everything after it on the line is ignored." },
      { bit: "STA 2050H", says: "Three bytes: opcode plus a 16-bit address, stored low byte first. That is why the listing shows 32 50 20 for address 2050H." },
      { bit: "HLT", says: "Stops the processor. Without it the chip carries on reading whatever bytes follow and executes them as instructions." },
    ],
    note: "Instruction length is 1, 2 or 3 bytes and you can read it off the operand: no operand is 1, an 8-bit value is 2, a 16-bit address is 3.",
  },

  "mp-carry-and-flags": {
    intro: "Eight bits run out at 255. What happens next is the whole reason flags exist.",
    form: "  1111 1111   (255)\n+ 0000 0001   (  1)\n-----------\n1 0000 0000   -> A = 00H, CY = 1\n\nCY  ->  the ninth bit — nowhere to put it",
    parts: [
      { bit: "1111 1111", says: "255 — every bit on, the largest a byte holds." },
      { bit: "0000 0001", says: "Adding one more." },
      { bit: "A", says: "The accumulator keeps the low eight bits: 0000 0000. On its own that says the answer is zero, which is wrong." },
      { bit: "CY", says: "The carry flag: the bit that did not fit. It is the only record that the answer was 256 and not 0." },
      { bit: "1", says: "Carry set. Check it after any addition that might overflow, because the accumulator alone cannot tell you." },
    ],
    note: "The chip does not warn you. It rolls over silently and sets a flag, and reading that flag is your job — this is the same wrap-around that makes an odometer go back to zero.",
  },

  "mp-what-is-a-microprocessor": {
    intro: "Fetch, decode, execute, repeat. Every processor ever built runs this loop.",
    form: "FETCH    ->  read the byte at PC, PC = PC + 1\nDECODE   ->  work out what that opcode means\nEXECUTE  ->  do it, update flags\nrepeat",
    parts: [
      { bit: "FETCH", says: "Put the program counter on the address bus and read the byte back. The chip has no idea yet what it is." },
      { bit: "PC", says: "The program counter: the address of the next instruction. Incrementing it is what makes a program run forwards." },
      { bit: "DECODE", says: "The instruction decoder turns the opcode into control signals. This is the only step that knows 3E means MVI A." },
      { bit: "EXECUTE", says: "The ALU or the registers actually do the work — and may fetch more bytes if the instruction is 2 or 3 long." },
      { bit: "repeat", says: "Forever, at the clock rate, until HLT or a reset. Nothing else is going on inside the chip." },
    ],
    note: "A jump instruction is nothing more special than writing a new value into PC. That single trick is loops, branches, functions and every control structure above them.",
  },

  "mp-evolution": {
    intro: "Four numbers describe any processor, and comparing generations is comparing these.",
    form: "data bus    ->  bits moved at once   (8085: 8)\naddress bus ->  memory reachable     (8085: 16 -> 64K)\nclock       ->  operations per second (8085: 3 MHz)\nregisters   ->  scratch space on chip (8085: 8-bit)",
    parts: [
      { bit: "data bus", says: "How many bits move in one go. Doubling it halves the transfers for the same data — the 8086's jump from 8 to 16 is exactly this." },
      { bit: "address bus", says: "How much memory can be named. 16 lines is 64K; the 8086's 20 lines is 1MB, and that is the same arithmetic as before." },
      { bit: "clock", says: "How many cycles per second. Faster is not proportionally faster overall — an instruction still takes several cycles." },
      { bit: "registers", says: "Working space inside the chip, which is far quicker to reach than memory. Wider and more of them means fewer trips out to RAM." },
    ],
    note: "The bus widths matter more than the clock. A faster chip that still moves 8 bits at a time and reaches 64K is doing the same work at the same shape, only sooner.",
  },

  "mp-inside-the-chip": {
    intro: "Three blocks, and every instruction is a conversation between them.",
    form: "ALU       ->  arithmetic, logic, sets the flags\nREGISTERS ->  A, B, C, D, E, H, L, PC, SP\nCONTROL   ->  decodes the opcode, raises the signals",
    parts: [
      { bit: "ALU", says: "The arithmetic and logic unit. It adds, subtracts, ANDs, ORs, rotates — and it is the only part that writes the flags." },
      { bit: "REGISTERS", says: "The chip's own scratch space. Reaching one takes no bus cycle at all, which is why good 8085 code keeps working values here." },
      { bit: "A", says: "The accumulator. One side of nearly every ALU operation is always A, and the answer always lands back in it." },
      { bit: "PC", says: "Program counter — the address of the next instruction." },
      { bit: "SP", says: "Stack pointer — the address of the top of the stack." },
      { bit: "CONTROL", says: "The timing and control unit. It reads the decoded opcode and raises the right signals in the right order — RD, WR, ALE and the rest." },
    ],
    note: "Nothing here is mysterious once you see the flow: control decides what happens, registers hold the operands, the ALU does the work and reports on it through the flags.",
  },

  "mp-three-buses": {
    intro: "Three groups of wires connect the chip to everything else, and each carries one kind of thing.",
    form: "ADDRESS  ->  16 lines, one way  (chip -> memory)\nDATA     ->   8 lines, two ways  (chip <-> memory)\nCONTROL  ->  RD, WR, ALE, IO/M   (what to do; when to do it)",
    parts: [
      { bit: "ADDRESS", says: "Which box. Sixteen lines, and the chip only ever drives them — memory never puts an address on this bus." },
      { bit: "DATA", says: "The byte itself. Eight lines, and both directions: out on a write, in on a read." },
      { bit: "two ways", says: "Which is why the control bus exists — the wires cannot say by themselves whether this is a read or a write." },
      { bit: "CONTROL", says: "The signals that give the other two meaning at a moment in time." },
      { bit: "RD", says: "Read: memory, put your byte on the data bus." },
      { bit: "WR", says: "Write: memory, take the byte that is on the data bus." },
      { bit: "ALE", says: "Address latch enable. The 8085's low address lines double as the data bus, so ALE is the pulse that says \"what is on these wires right now is an address\" — see the next lesson." },
      { bit: "IO/M", says: "Whether this cycle is talking to memory or to an I/O device. Same buses, two different worlds." },
    ],
    note: "The address bus is one-way and the data bus is two-way. Nearly every timing question comes down to knowing which bus is carrying what at that instant.",
  },

  "mp-register-set": {
    intro: "Six general registers that also work in pairs, plus two that hold addresses.",
    form: "A                 ->  accumulator, 8-bit\nB C   D E   H L   ->  general, 8-bit; pairs: BC DE HL\nHL                ->  the pair that holds a memory address, M\nSP                ->  stack pointer, 16-bit\nPC                ->  program counter, 16-bit",
    parts: [
      { bit: "A", says: "The accumulator. Not a general register — arithmetic, logic and every I/O instruction go through it specifically." },
      { bit: "B C", says: "Two 8-bit registers that join into the 16-bit pair BC. B is the high byte, C the low." },
      { bit: "pairs", says: "Pairing is what lets 8-bit registers hold a 16-bit address, which is the only way an 8-bit chip can point at 64K of memory." },
      { bit: "HL", says: "The pointer pair. It is special because of M." },
      { bit: "M", says: "Not a register: it means \"the memory byte at the address in HL\". <code>MOV A, M</code> is a memory read written to look like a register move." },
      { bit: "SP", says: "Points at the top of the stack. PUSH lowers it, POP raises it — the 8085 stack grows downwards." },
      { bit: "PC", says: "The address of the next instruction to fetch." },
    ],
    note: "M looks like a seventh register and is a memory access. That one disguise is where most confusion about 8085 instruction timing starts — anything touching M costs an extra machine cycle.",
  },

  "mp-flag-register": {
    intro: "One byte, five meaningful bits, each answering a yes/no question about the last ALU result.",
    form: "bit   7   6   5   4   3   2   1   0\n      S   Z   -   AC  -   P   -   CY",
    parts: [
      { bit: "S", says: "Sign: a copy of bit 7 of the result. 1 means negative when the byte is being read as a signed number." },
      { bit: "Z", says: "Zero: set when the result was exactly 00H. The flag almost every conditional jump is really testing." },
      { bit: "AC", says: "Auxiliary carry: a carry out of bit 3 into bit 4. Only DAA uses it, and that is its entire purpose." },
      { bit: "P", says: "Parity: set when the number of 1 bits is even. Rarely useful now; it was a cheap error check." },
      { bit: "CY", says: "Carry: the ninth bit that did not fit, or the borrow from a subtraction." },
      { bit: "-", says: "Unused bits. They are not zero and not reliable — never test them." },
    ],
    note: "Not every instruction writes the flags. Data-transfer instructions like MOV and MVI leave them completely untouched, so a jump can safely test a comparison made several instructions earlier.",
  },

  "mp-pins-and-signals": {
    intro: "The 8085 has 40 pins, and its most-asked exam question comes from a shortage of them.",
    form: "AD0-AD7  ->  address low byte AND data, on the same eight pins\nA8-A15   ->  address high byte\nALE      ->  pulse: AD0-AD7 currently carries an ADDRESS\nRD WR    ->  direction of this cycle\nIO/M     ->  memory / I/O",
    parts: [
      { bit: "AD0-AD7", says: "Multiplexed: the same eight pins carry the low address byte, then the data byte. Eight pins doing two jobs is how the chip fitted into 40." },
      { bit: "A8-A15", says: "The high address byte, on its own pins and stable for the whole cycle." },
      { bit: "ALE", says: "High only during the first clock state, while the address is on AD0-AD7. An external latch (the 74LS373) grabs it on the falling edge and holds it for the rest of the cycle." },
      { bit: "RD", says: "Active low: the chip is reading this cycle." },
      { bit: "WR", says: "Active low: the chip is writing." },
      { bit: "IO/M", says: "High for I/O, low for memory. Combined with RD and WR it names all four possible cycles." },
    ],
    note: "Demultiplexing is not optional. Without the latch, the low address byte is gone by the time memory is ready to answer — which is why every 8085 circuit diagram has that chip in it.",
  },

  "mp-memory-decoding": {
    intro: "Several chips share one bus. The decoder decides which one is allowed to answer.",
    form: "A15 A14 A13 | A12 ... A0\n 0   0   0  | ................  ->  chip 0 : 0000H - 1FFFH\n 0   0   1  | ................  ->  chip 1 : 2000H - 3FFFH\n\nhigh lines -> decoder -> CS\nlow lines  -> the chip's own address pins",
    parts: [
      { bit: "A15 A14 A13", says: "The high lines. They choose the chip and are never wired to it — they go to the decoder instead." },
      { bit: "A12 ... A0", says: "The low lines, wired straight to the memory chip. Thirteen lines is 2¹³ = 8K, which is that chip's size." },
      { bit: "decoder", says: "A 3-to-8 decoder (74LS138) turns three high lines into eight chip-select lines, exactly one of which is active." },
      { bit: "CS", says: "Chip select. A memory chip ignores the bus entirely unless its CS is active — which is what stops two chips answering at once." },
      { bit: "chip 0", says: "Its range starts where its high lines are all 0 and runs for as many addresses as its low lines can name." },
    ],
    note: "Leave a high address line out of the decoding and the same chip answers at several addresses — foldback. The memory appears to be larger than it is, and every copy is the same bytes.",
  },

  "mp-timing-diagrams": {
    intro: "One instruction is several machine cycles; one machine cycle is several T-states.",
    form: "instruction  ->  machine cycles  ->  T-states\n\nMVI A, 05H   ->  2 cycles        ->  7 T\n  opcode fetch  ->  4 T\n  memory read   ->  3 T\n\ntime = T-states x clock period",
    parts: [
      { bit: "instruction", says: "What you wrote. Its cost is the sum of its machine cycles, not a single number you memorise." },
      { bit: "machine cycles", says: "One bus operation each: one fetch, one read, one write. Count the memory accesses an instruction needs and you have counted its cycles." },
      { bit: "T-states", says: "Clock periods. The smallest unit of time the chip has — everything is measured in these." },
      { bit: "opcode fetch", says: "Always first, always 4 T-states. The extra state over a plain read is the chip decoding what it just fetched." },
      { bit: "memory read", says: "3 T-states. MVI needs one because its data byte sits in the next memory box." },
      { bit: "7 T", says: "4 + 3. The published figure for MVI, and now a number you can derive rather than look up." },
      { bit: "clock period", says: "1 / frequency. At 3 MHz one T-state is about 333 ns, so this instruction takes roughly 2.3 µs." },
    ],
    note: "Every instruction begins with a 4 T-state opcode fetch. Anything longer than 4 T is telling you the instruction went back to memory — and how many times.",
  },

  "mp-instruction-set": {
    intro: "Seventy-four instructions in five families. Knowing which family an instruction is in tells you most of what it does.",
    form: "DATA TRANSFER  ->  MOV MVI LXI LDA STA   ; move bytes, no flags\nARITHMETIC     ->  ADD ADI SUB INR DCR   ; ALU, sets flags\nLOGICAL        ->  ANA ORA XRA CMP RLC   ; ALU, sets flags\nBRANCHING      ->  JMP JZ CALL RET       ; changes PC\nCONTROL        ->  HLT NOP EI DI         ; the machine itself",
    parts: [
      { bit: "DATA TRANSFER", says: "Copies bytes between registers, memory and I/O. Copies — the source is unchanged. These leave the flags alone entirely." },
      { bit: "ARITHMETIC", says: "Add, subtract, increment, decrement. Goes through the ALU, so it writes the flags." },
      { bit: "LOGICAL", says: "AND, OR, XOR, compare, rotate. Also the ALU, also writes flags — and CMP is a subtraction whose answer is thrown away." },
      { bit: "BRANCHING", says: "Anything that writes PC: jumps, calls, returns. The conditional ones read the flags the previous two families wrote." },
      { bit: "CONTROL", says: "Halt, no-operation, interrupt enable and disable. They act on the processor rather than on data." },
      { bit: "INR", says: "Increment is the exception worth remembering: it sets every flag <b>except</b> carry, so a loop counter does not disturb an arithmetic carry you are still using." },
    ],
    note: "The split that matters is which families touch the flags. Data transfer never does, which is why you can move a result somewhere and still branch on the comparison that produced it.",
  },

  "mp-addressing-modes": {
    intro: "Five ways of saying where the operand is — and the mnemonic tells you which.",
    form: "MOV  B, C     ->  register     : operand sits inside a register\nMVI  A, 05H   ->  immediate    : operand sits inside the instruction\nLDA  2050H    ->  direct       : instruction holds the address\nMOV  A, M     ->  indirect     : HL holds the address\nHLT           ->  implicit     : operand implied by the opcode",
    parts: [
      { bit: "register", says: "Both operands are registers. Fastest — no memory access at all, so it is a single machine cycle." },
      { bit: "immediate", says: "The value is the next byte of the program itself. The <b>I</b> in MVI, ADI, LXI means exactly this." },
      { bit: "direct", says: "The address is written into the instruction, so it is fixed at assembly time. Three bytes long: opcode plus two address bytes." },
      { bit: "indirect", says: "The address is in HL, so it can change while the program runs — which is what makes walking through an array possible." },
      { bit: "M", says: "The marker for indirect. Any instruction mentioning M reaches memory through HL." },
      { bit: "implicit", says: "The instruction names no operand because there is only one thing it could act on." },
    ],
    note: "Immediate and direct look alike and are opposites: <code>MVI A, 50H</code> loads the number 50H, <code>LDA 0050H</code> loads whatever byte lives at address 0050H.",
  },

  "mp-data-transfer": {
    intro: "Moving bytes about. None of these touch the flags, which is what makes them safe to use mid-calculation.",
    form: "MOV  rd, rs   ->  register to register\nMOV  r,  M    ->  memory (via HL) to register\nMVI  r,  data ->  8-bit constant into a register\nLXI  rp, addr ->  16-bit constant into a pair\nLDA  addr     ->  memory to A\nSTA  addr     ->  A to memory\nXCHG          ->  swap HL, DE",
    parts: [
      { bit: "MOV", says: "Copy between registers. The destination is written first, the source second — <code>MOV B, C</code> puts C into B." },
      { bit: "rd", says: "Destination register." },
      { bit: "rs", says: "Source register, left unchanged. It is a copy, not a move, whatever the mnemonic says." },
      { bit: "M", says: "Memory through HL. Using it costs an extra machine cycle over a register-to-register move." },
      { bit: "MVI", says: "Move immediate: an 8-bit constant written into the instruction." },
      { bit: "LXI", says: "Load extended immediate: a 16-bit constant into a register pair. This is how HL gets set up before any indirect access." },
      { bit: "LDA", says: "Load A directly from a named address." },
      { bit: "STA", says: "Store A at a named address. LDA and STA are always about A specifically." },
      { bit: "XCHG", says: "Swaps HL and DE in one instruction. Cheaper than four MOVs, and the usual way to juggle two pointers." },
    ],
    note: "Set HL with LXI before any instruction that mentions M. Forgetting is the commonest 8085 bug: the code reads or writes whatever address HL happened to hold.",
  },

  "mp-arithmetic": {
    intro: "The ALU family. Every one of these writes the flags, and that is usually the point.",
    form: "ADD  r        ->  A = A + r\nADI  data     ->  A = A + data\nADC  r        ->  A = A + r + CY      ; multi-byte adds\nSUB  r        ->  A = A − r\nINR  r        ->  r = r + 1           ; all flags EXCEPT CY\nDCR  r        ->  r = r − 1\nDAA           ->  fix A back to BCD",
    parts: [
      { bit: "ADD", says: "One side is always A and the answer always lands in A. That is not a convention — the ALU is wired that way." },
      { bit: "ADI", says: "The immediate form: add a constant carried in the instruction." },
      { bit: "ADC", says: "Add with carry. Chaining it is how an 8-bit chip adds 16-bit numbers: add the low bytes, then ADC the high ones." },
      { bit: "SUB", says: "Subtract. Internally it adds the two's complement, which is why a borrow shows up as the carry flag." },
      { bit: "INR", says: "Increment by one, on any register — not only A. It writes every flag <b>except</b> carry, deliberately." },
      { bit: "CY", says: "Carry stays untouched by INR and DCR so a loop counter can tick without disturbing a multi-byte addition in progress." },
      { bit: "DCR", says: "Decrement. Pair it with JNZ and you have the standard 8085 counting loop." },
      { bit: "DAA", says: "Decimal adjust: corrects A after adding two BCD numbers. The only instruction that reads the auxiliary carry flag." },
    ],
    note: "16-bit addition is ADD then ADC, low bytes first. Doing it the other way round loses the carry, because the carry from the low half has not happened yet.",
  },

  "mp-logical": {
    intro: "Bit-level operations, and a comparison that works by subtracting and throwing the answer away.",
    form: "ANA  r    ->  A = A AND r     ; masking: keep chosen bits\nORA  r    ->  A = A OR  r     ; setting: force bits on\nXRA  r    ->  A = A XOR r     ; toggling; XRA A clears A\nCMP  r    ->  A − r, result discarded, flags kept\nRLC       ->  rotate A left; bit 7 -> bit 0, also CY\nRAL       ->  rotate A left THROUGH carry",
    parts: [
      { bit: "ANA", says: "AND. A 0 in the mask forces that bit to 0 and a 1 leaves it alone — the standard way to isolate part of a byte." },
      { bit: "ORA", says: "OR. A 1 in the mask forces that bit on. <code>ORA A</code> changes nothing and updates the flags, which is the cheapest way to test A." },
      { bit: "XRA", says: "XOR. <code>XRA A</code> clears A to zero and clears carry, in one byte — faster than MVI A, 00H." },
      { bit: "CMP", says: "Compare: subtracts, sets the flags, and discards the result. A is unchanged, which is what makes it a test rather than an operation." },
      { bit: "flags kept", says: "After CMP: Z set means equal, CY set means A was smaller. Those two flags are what the conditional jumps read." },
      { bit: "RLC", says: "Rotate left circular: bit 7 wraps round to bit 0 and is also copied into carry. A rotates, carry only observes." },
      { bit: "RAL", says: "Rotate left through carry: carry becomes part of the ring, so it is a 9-bit rotation. This is the one for shifting multi-byte values." },
    ],
    note: "CMP then a conditional jump is how every comparison in 8085 is written. There is no \"if\" — there is a subtraction you throw away and a flag you branch on.",
  },

  "mp-branching-stack": {
    intro: "Writing PC is a jump. Saving PC first and restoring it later is a subroutine.",
    form: "JMP  addr   ->  PC = addr\nJZ   addr   ->  jump when Z = 1     ; JNZ JC JNC ...\n\nCALL addr   ->  push PC, then PC = addr\nRET         ->  pop  PC\n\nPUSH rp     ->  SP = SP − 2, store pair\nPOP  rp     ->  load pair, SP = SP + 2",
    parts: [
      { bit: "JMP", says: "Unconditional: writes the address into PC and the next fetch happens there. Nothing else about it is special." },
      { bit: "JZ", says: "Conditional: taken only when the zero flag is set. There is one of these per flag condition, and each reads a flag some earlier instruction wrote." },
      { bit: "CALL", says: "Pushes the return address — the instruction <b>after</b> the CALL — onto the stack, then jumps. That saved address is the whole difference from JMP." },
      { bit: "RET", says: "Pops that address back into PC. Which is why every CALL needs exactly one RET on every path out of the subroutine." },
      { bit: "PUSH", says: "Stores a register pair on the stack, two bytes at a time. SP goes <b>down</b> — the 8085 stack grows towards lower addresses." },
      { bit: "POP", says: "The reverse, and it must be in the opposite order. Push BC then DE, pop DE then BC." },
      { bit: "SP", says: "Points at the top of the stack. Set it with LXI SP before the first PUSH or CALL, or bytes land somewhere unintended." },
    ],
    note: "Push and pop in reverse order, and balance them inside a subroutine. One unmatched PUSH and RET pops your data into PC — the program jumps into nowhere, which is exactly how a stack corruption crash looks.",
  },
};
