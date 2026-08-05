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
};
