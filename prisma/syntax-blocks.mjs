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
};
