/* The reference syllabus we measure ourselves against.
 *
 * Every topic W3Schools teaches in its core Python tutorial (plus its DSA and
 * Reference sections), mapped to the Etudo lesson that covers it. `covers: []`
 * means nothing covers it yet — that is the point of the file. Run
 * `npm run syllabus` to see the scoreboard.
 *
 * **W3Schools is the floor, not the target.** A `covers: []` filled in is a
 * deficiency closed, not an achievement. The achievement is the last group,
 * "Beyond W3Schools" — and anything we teach that they do not MUST be listed
 * there, because a scoreboard that only counts their topics reports our best
 * work as zero.
 *
 * The standing rule for every DSA lesson: teach where the algorithm BREAKS, not
 * only how to run it. W3Schools shows the happy path. A lesson earns a line in
 * the last group by showing the failure — plain BFS quietly returning the wrong
 * path on a weighted graph, naive fib measured in call counts, greedy coin
 * change on the one denomination set that defeats it, radix sort silently
 * collapsing when its inner pass is not stable.
 *
 * Sections that belong to other Etudo tracks (Matplotlib, MySQL, MongoDB,
 * Machine Learning, NumPy/Pandas) are deliberately not listed here — this file
 * is about the Python track only.
 */

export const SYLLABUS = [
  { group: "Getting started", topics: [
    { t: "Python Intro — what it is, why it is used", covers: ["getting-started"] },
    { t: "Get Started — running your first program", covers: ["getting-started"] },
    { t: "Syntax and indentation", covers: ["getting-started"] },
    { t: "Output / print()", covers: ["getting-started"] },
    { t: "Comments", covers: ["getting-started"] },
    { t: "User Input", covers: ["getting-started"] },
  ]},
  { group: "Variables and types", topics: [
    { t: "Variables — creating and reassigning", covers: ["variables-data-types"] },
    { t: "Variable names — rules and conventions", covers: ["variables-data-types"] },
    { t: "Assign multiple values / unpacking", covers: ["variables-data-types"] },
    { t: "Output variables", covers: ["variables-data-types"] },
    { t: "Global variables / global keyword", covers: ["scope"] },
    { t: "Data types overview", covers: ["variables-data-types"] },
    { t: "Numbers — int, float, complex", covers: ["numbers-math"] },
    { t: "Casting", covers: ["variables-data-types"] },
    { t: "None", covers: ["variables-data-types"] },
  ]},
  { group: "Strings", topics: [
    { t: "Strings — basics and quotes", covers: ["strings"] },
    { t: "Slicing strings", covers: ["strings"] },
    { t: "Modify strings — upper, lower, strip, replace", covers: ["strings"] },
    { t: "Concatenate strings", covers: ["strings"] },
    { t: "Format strings / f-strings", covers: ["string-formatting"] },
    { t: "Escape characters", covers: ["strings"] },
    { t: "String methods — full reference", covers: ["strings"] },
  ]},
  { group: "Booleans and operators", topics: [
    { t: "Booleans and truthiness", covers: ["booleans"] },
    { t: "Arithmetic operators", covers: ["operators"] },
    { t: "Assignment operators (+=, -=)", covers: ["operators"] },
    { t: "Comparison operators", covers: ["operators"] },
    { t: "Logical operators (and/or/not)", covers: ["operators"] },
    { t: "Identity operators (is / is not)", covers: ["more-operators"] },
    { t: "Membership operators (in / not in)", covers: ["more-operators"] },
    { t: "Bitwise operators", covers: ["more-operators"] },
    { t: "Ternary / shorthand if", covers: ["conditionals"] },
    { t: "Operator precedence", covers: ["operators"] },
  ]},
  { group: "Lists", topics: [
    { t: "Lists — basics", covers: ["lists-tuples"] },
    { t: "Access list items / indexing", covers: ["lists-tuples"] },
    { t: "Change list items", covers: ["lists-tuples"] },
    { t: "Add list items — append, insert, extend", covers: ["lists-tuples"] },
    { t: "Remove list items — remove, pop, del, clear", covers: ["lists-tuples"] },
    { t: "Loop through a list", covers: ["loops"] },
    { t: "List comprehension", covers: ["comprehensions"] },
    { t: "Sort lists", covers: ["lists-tuples", "lambda"] },
    { t: "Copy lists", covers: ["lists-tuples"] },
    { t: "Join lists", covers: ["lists-tuples"] },
    { t: "List methods — full reference", covers: ["lists-tuples"] },
  ]},
  { group: "Tuples, sets, dictionaries", topics: [
    { t: "Tuples — basics and immutability", covers: ["lists-tuples"] },
    { t: "Tuple unpacking", covers: ["lists-tuples", "advanced-functions"] },
    { t: "Tuple methods", covers: ["lists-tuples"] },
    { t: "Sets — basics", covers: ["dicts-sets"] },
    { t: "Add / remove set items", covers: ["dicts-sets"] },
    { t: "Join sets — union, intersection, difference", covers: ["sets-dicts-deeper"] },
    { t: "Frozenset", covers: ["sets-dicts-deeper"] },
    { t: "Set methods — full reference", covers: ["sets-dicts-deeper"] },
    { t: "Dictionaries — basics", covers: ["dicts-sets"] },
    { t: "Access / change / add / remove dict items", covers: ["dicts-sets"] },
    { t: "Loop through a dictionary", covers: ["dicts-sets"] },
    { t: "Copy a dictionary", covers: ["sets-dicts-deeper"] },
    { t: "Nested dictionaries", covers: ["sets-dicts-deeper"] },
    { t: "Dictionary methods — full reference", covers: ["sets-dicts-deeper"] },
  ]},
  { group: "Control flow", topics: [
    { t: "If / elif / else", covers: ["conditionals"] },
    { t: "Nested if", covers: ["conditionals"] },
    { t: "pass statement", covers: ["conditionals"] },
    { t: "match-case", covers: ["match-case"] },
    { t: "While loops", covers: ["loops"] },
    { t: "For loops", covers: ["loops"] },
    { t: "break / continue / else on loops", covers: ["loops"] },
    { t: "range()", covers: ["loops"] },
  ]},
  { group: "Functions", topics: [
    { t: "Functions — def and calling", covers: ["functions"] },
    { t: "Arguments and default values", covers: ["functions"] },
    { t: "*args and **kwargs", covers: ["advanced-functions"] },
    { t: "Return values", covers: ["functions"] },
    { t: "Scope — local, global, LEGB", covers: ["scope"] },
    { t: "Lambda", covers: ["lambda"] },
    { t: "Recursion", covers: ["advanced-functions"] },
    { t: "Decorators", covers: ["decorators"] },
    { t: "Generators and yield", covers: ["iterators-generators"] },
    { t: "Iterators — iter / next", covers: ["iterators-generators"] },
    { t: "Arrays (array module vs list)", covers: ["collections-itertools"] },
  ]},
  { group: "OOP", topics: [
    { t: "Classes and objects", covers: ["oop"] },
    { t: "__init__ constructor", covers: ["oop"] },
    { t: "self parameter", covers: ["oop"] },
    { t: "Class vs instance properties", covers: ["oop-advanced"] },
    { t: "Class methods and static methods", covers: ["dunder-methods"] },
    { t: "@property / getters and setters", covers: ["encapsulation"] },
    { t: "Inheritance", covers: ["inheritance"] },
    { t: "Multiple inheritance and MRO", covers: ["oop-advanced"] },
    { t: "Polymorphism", covers: ["encapsulation"] },
    { t: "Encapsulation — private attributes", covers: ["encapsulation"] },
    { t: "Dunder / magic methods", covers: ["dunder-methods"] },
    { t: "Inner classes", covers: ["oop-advanced"] },
  ]},
  { group: "Errors, files, modules", topics: [
    { t: "try / except / else / finally", covers: ["error-handling"] },
    { t: "raise and assert", covers: ["error-handling", "testing"] },
    { t: "Custom exception classes", covers: ["error-handling"] },
    { t: "File handling — open modes", covers: ["file-handling"] },
    { t: "Read files", covers: ["file-handling"] },
    { t: "Write / create files", covers: ["file-handling"] },
    { t: "Delete files", covers: ["file-handling"] },
    { t: "Modules — import, from, as", covers: ["modules"] },
    { t: "if __name__ == '__main__'", covers: ["project-git", "modules"] },
    { t: "Packages and __init__.py", covers: ["modules"] },
    { t: "PIP — installing packages", covers: ["modules"] },
    { t: "Virtual environments", covers: ["modules"] },
    { t: "Dates and time", covers: ["dates"] },
    { t: "Math module", covers: ["numbers-math"] },
    { t: "JSON", covers: ["json"] },
    { t: "RegEx", covers: ["regex"] },
    { t: "Random module", covers: ["numbers-math"] },
  ]},
  /* DSA, widened to W3Schools' actual DSA tutorial.
   *
   * This group used to hold thirteen topics chosen as "interview-critical", and
   * the scoreboard duly reported 134/134 — against a list we had written
   * ourselves. Checked against the real thing, W3Schools teaches roughly 45.
   * A reference syllabus that is smaller than what it claims to measure cannot
   * find a gap; it can only confirm the gap it was built around.
   *
   * `covers` is strict here: a topic counts as taught when it has its own
   * section, worked example or drill. A sentence mentioning it does not. So
   * pre-order and post-order are marked uncovered even though the in-order
   * section says how to get them, and AVL is uncovered even though the BST
   * lesson says balancing exists — otherwise this list would hide exactly what
   * it was widened to reveal.
   */
  { group: "DSA — foundations", topics: [
    { t: "Big-O / complexity", covers: ["big-o"] },
    { t: "Arrays and lists as data structures", covers: ["big-o", "lists-tuples"] },
    { t: "Stacks", covers: ["stacks-queues"] },
    { t: "Queues", covers: ["stacks-queues"] },
  ]},
  { group: "DSA — searching and sorting", topics: [
    { t: "Linear search", covers: ["searching-sorting"] },
    { t: "Binary search", covers: ["searching-sorting"] },
    { t: "Bubble / selection / insertion sort", covers: ["searching-sorting"] },
    { t: "Merge / quick sort", covers: ["searching-sorting"] },
    { t: "Counting sort", covers: ["counting-radix-sort"] },
    { t: "Radix sort", covers: ["counting-radix-sort"] },
  ]},
  { group: "DSA — linked structures and hashing", topics: [
    { t: "Linked lists — nodes and traversal", covers: ["linked-lists-hashing"] },
    { t: "Linked lists in memory — why no index", covers: ["linked-lists-hashing"] },
    { t: "Linked list types — singly, doubly, circular", covers: ["linked-list-shapes-sets"] },
    { t: "Linked list operations — insert and delete at a position", covers: ["linked-list-shapes-sets"] },
    { t: "Hash tables and hash functions", covers: ["linked-lists-hashing"] },
    { t: "Hash maps", covers: ["linked-lists-hashing"] },
    { t: "Hash sets", covers: ["linked-list-shapes-sets"] },
  ]},
  { group: "DSA — trees", topics: [
    { t: "Trees", covers: ["trees-graphs"] },
    { t: "Binary trees", covers: ["trees-graphs"] },
    { t: "Binary search trees", covers: ["trees-graphs"] },
    { t: "In-order traversal", covers: ["trees-graphs", "tree-traversals"] },
    { t: "Pre-order traversal", covers: ["tree-traversals"] },
    { t: "Post-order traversal", covers: ["tree-traversals"] },
    { t: "Trees stored in an array", covers: ["balanced-trees"] },
    { t: "Balanced trees / AVL", covers: ["balanced-trees"] },
  ]},
  { group: "DSA — graphs", topics: [
    { t: "Graphs", covers: ["trees-graphs"] },
    { t: "Graph representation — adjacency list", covers: ["trees-graphs"] },
    { t: "Graph traversal — depth-first and breadth-first", covers: ["trees-graphs"] },
    { t: "Cycle detection", covers: ["cycle-detection"] },
    { t: "Shortest path", covers: ["shortest-path-dijkstra"] },
    { t: "Dijkstra's algorithm", covers: ["shortest-path-dijkstra"] },
    { t: "Bellman-Ford", covers: ["bellman-ford-mst"] },
    { t: "Minimum spanning tree — Prim's and Kruskal's", covers: ["bellman-ford-mst"] },
    { t: "Maximum flow — Ford-Fulkerson / Edmonds-Karp", covers: [] },
  ]},
  { group: "DSA — algorithm design", topics: [
    { t: "Memoization", covers: ["memoization-tabulation"] },
    { t: "Tabulation", covers: ["memoization-tabulation"] },
    { t: "Dynamic programming", covers: [] },
    { t: "Greedy algorithms", covers: [] },
    { t: "0/1 knapsack", covers: [] },
    { t: "Euclidean algorithm", covers: [] },
    { t: "Huffman coding", covers: [] },
    { t: "The travelling salesman", covers: [] },
  ]},
  { group: "Reference (lookup pages)", topics: [
    { t: "Built-in functions reference", covers: ["python-reference"] },
    { t: "String methods reference", covers: ["python-reference"] },
    { t: "List / tuple methods reference", covers: ["python-reference"] },
    { t: "Dict / set methods reference", covers: ["python-reference"] },
    { t: "File methods reference", covers: ["python-reference"] },
    { t: "Keywords reference", covers: ["python-reference"] },
    { t: "Exceptions reference", covers: ["python-reference"] },
    { t: "Glossary", covers: [] },
    // Also on W3Schools' module reference: `requests`, which needs the network
    // and cannot run in Pyodide — a runtime limit, not a judgement about who
    // needs it. `cmath` is listed below and is a genuine gap.
    { t: "cmath module", covers: [] },
  ]},
  // Where a lesson goes past the floor. Two kinds of entry live here: whole
  // subjects W3Schools has no page for (testing, async, packaging), and the
  // "where does this BREAK" half of a DSA lesson — the part that separates
  // knowing an algorithm from being able to use one.
  { group: "Beyond W3Schools (our own edge)", topics: [
    { t: "Why comparison sorts cannot beat O(n log n)", covers: ["counting-radix-sort"] },
    { t: "Stability — the property radix sort silently dies without", covers: ["counting-radix-sort"] },
    { t: "Why a circular list breaks every `while node is not None` walk", covers: ["linked-list-shapes-sets"] },
    { t: "When a hash set silently merges keys — 1, True, and computed floats", covers: ["linked-list-shapes-sets"] },
    { t: "Why a `visited` set reports a false cycle on any diamond", covers: ["cycle-detection"] },
    { t: "Proving the fast pointer must catch the slow one", covers: ["cycle-detection"] },
    { t: "Why BFS returns a valid but wrong route once edges carry weights", covers: ["shortest-path-dijkstra"] },
    { t: "Why a settled node is final, and the one condition that makes it so", covers: ["shortest-path-dijkstra"] },
    { t: "A negative edge is legal; a negative cycle means there is no answer", covers: ["bellman-ford-mst"] },
    { t: "Why a minimum spanning tree is not a shortest-path tree", covers: ["bellman-ford-mst"] },
    { t: "Measuring naive recursion in calls — 29,860,703 against 69", covers: ["memoization-tabulation"] },
    { t: "Memoisation cuts the width of a call tree, never its depth", covers: ["memoization-tabulation"] },
    { t: "A memo key must name everything the answer depends on", covers: ["memoization-tabulation"] },
    { t: "Testing — unittest / pytest", covers: ["testing"] },
    { t: "Debugging and logging", covers: ["debugging-logging"] },
    { t: "Clean code, PEP 8, type hints", covers: ["clean-code"] },
    { t: "Project structure and git", covers: ["project-git"] },
    { t: "Concurrency — threads and processes", covers: ["concurrency"] },
    { t: "Async / asyncio", covers: ["async"] },
    { t: "collections, itertools, functools", covers: ["collections-itertools"] },
    { t: "os, sys, pathlib", covers: ["system-modules"] },
    { t: "CSV, pickle, SQLite", covers: ["data-persistence"] },
  ]},
];
