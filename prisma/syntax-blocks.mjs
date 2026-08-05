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
};
