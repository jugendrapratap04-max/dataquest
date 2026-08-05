// Practice problems for the eight Python topics added in the Etudo content push.
//
// Those lessons shipped at the FULL standard on every measure the scoreboard
// checks — notes, a visual, a quiz, drills, a debug task — and with zero
// practice problems, because `check-syllabus` does not count problems. The
// platform's own promise is "read it, then practise THAT topic", and for these
// eight it was broken from the day they went live.
//
// docs/LEARNING-SPEC.md §3 asks for at least two per topic. Three here, so the
// unlock gate (2 of the topic's problems) leaves a genuine choice.
//
// House rules, same as topic-problems.mjs and enforced by `npm run db:check`,
// which runs every reference solution in Pyodide before anything ships:
//   - return scalars, strings, booleans or lists. NEVER a dict: it arrives in
//     JS as a Map and JSON.stringify(Map) is "{}", so grading would silently
//     pass every wrong answer. Dicts as ARGUMENTS are fine.
//   - a set is not safe to return either — no guaranteed order. Return sorted().
//   - nothing random, nothing time-dependent, nothing with a memory address.
//   - DSA fits Pyodide perfectly: no threads, no files, no network needed.

const PP = (lessonSlug, difficulty, order, slug, title, functionName, desc, examples, starter, solution, tests, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "python",
  functionName, descriptionMd: desc, tagsCsv: tags.join(","),
  examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints), sqlSetup: "",
  xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

export const dsaProblems = [
  /* ---------------------------------------- sets-dicts-deeper ---------- */
  PP("sets-dicts-deeper", "Easy", 400, "common-ids", "Ordered In Both", "common_ids",
    "Two lists of customer IDs are given. Return a **sorted list** of the IDs that appear in **both**.\n\nUse sets — do not write a nested loop.",
    [{ input: "a=[1,2,3,4], b=[3,4,5]", output: "[3, 4]" }, { input: "a=[1], b=[2]", output: "[]" }],
    "def common_ids(a, b):\n    pass\n",
    "def common_ids(a, b):\n    return sorted(set(a) & set(b))\n",
    [{ args: [[1, 2, 3, 4], [3, 4, 5]], expected: [3, 4] }, { args: [[1], [2]], expected: [] }, { args: [[5, 5, 7], [7, 7, 9]], expected: [7] }],
    ["`&` is intersection — the items present in both sets.", "Convert both lists with `set()` first.", "Wrap the answer in `sorted()`; a set has no reliable order."],
    ["set", "intersection"]),

  PP("sets-dicts-deeper", "Medium", 401, "skipped-second", "Did One, Skipped Two", "skipped_second",
    "`did_first` and `did_second` are lists of student names. Return a **sorted list** of the students who did the **first** assignment but **not** the second.\n\nMind the direction — difference is not symmetric.",
    [{ input: 'did_first=["priya","rahul"], did_second=["rahul"]', output: '["priya"]' }],
    "def skipped_second(did_first, did_second):\n    pass\n",
    "def skipped_second(did_first, did_second):\n    return sorted(set(did_first) - set(did_second))\n",
    [{ args: [["priya", "rahul"], ["rahul"]], expected: ["priya"] }, { args: [["a", "b"], ["a", "b"]], expected: [] }, { args: [["a"], ["b", "c"]], expected: ["a"] }],
    ["`a - b` means: in a, not in b.", "Say the sentence out loud before you write it — swapping the operands answers a different question.", "Return `sorted(...)`, not the set itself."],
    ["set", "difference"]),

  PP("sets-dicts-deeper", "Medium", 402, "nested-total", "Total From A Nested Dict", "nested_total",
    "`marks` is a dictionary of students, and each value is **another dictionary** of subject to mark:\n\n```\n{\"priya\": {\"maths\": 88, \"physics\": 74}}\n```\n\nReturn the **total of every mark**, across all students.",
    [{ input: '{"priya": {"maths": 88}, "rahul": {"maths": 12}}', output: "100" }],
    "def nested_total(marks):\n    pass\n",
    "def nested_total(marks):\n    total = 0\n    for subjects in marks.values():\n        for mark in subjects.values():\n            total += mark\n    return total\n",
    [{ args: [{ priya: { maths: 88 }, rahul: { maths: 12 } }], expected: 100 }, { args: [{ a: { x: 1, y: 2 }, b: { z: 3 } }], expected: 6 }, { args: [{}], expected: 0 }],
    ["`.values()` gives you the inner dictionaries.", "You need a loop inside a loop: students, then their subjects.", "Start the total at 0 outside both loops — an empty input must return 0."],
    ["dict", "nested"]),

  /* ---------------------------------------------- oop-advanced --------- */
  PP("oop-advanced", "Easy", 403, "separate-carts", "Two Carts, Two Lists", "separate_carts",
    "Write a class `Cart` that stores its own list of items, with an `add(item)` method.\n\nThen `separate_carts()` must create **two** carts, add one item to the first only, and return `[len(first.items), len(second.items)]`.\n\nIf you get `[1, 1]`, the list is on the class instead of in `__init__`.",
    [{ input: "separate_carts()", output: "[1, 0]" }],
    "class Cart:\n    def __init__(self):\n        pass\n\n    def add(self, item):\n        pass\n\ndef separate_carts():\n    pass\n",
    "class Cart:\n    def __init__(self):\n        self.items = []\n\n    def add(self, item):\n        self.items.append(item)\n\ndef separate_carts():\n    first = Cart()\n    second = Cart()\n    first.add(\"laptop\")\n    return [len(first.items), len(second.items)]\n",
    [{ args: [], expected: [1, 0] }, { args: [], expected: [1, 0] }, { args: [], expected: [1, 0] }],
    ["Create the list inside `__init__` with `self.items = []`.", "A list written in the class body is created once and shared by every object.", "`add` should append to `self.items`."],
    ["oop", "class-attribute"]),

  PP("oop-advanced", "Medium", 404, "mro-names", "Read The MRO", "mro_names",
    "Build the classic diamond: `A`, then `B(A)`, then `C(A)`, then `D(B, C)`.\n\nReturn the **method resolution order** of `D` as a list of class **names** (strings).",
    [{ input: "mro_names()", output: "['D', 'B', 'C', 'A', 'object']" }],
    "def mro_names():\n    pass\n",
    "def mro_names():\n    class A:\n        pass\n\n    class B(A):\n        pass\n\n    class C(A):\n        pass\n\n    class D(B, C):\n        pass\n\n    return [cls.__name__ for cls in D.__mro__]\n",
    [{ args: [], expected: ["D", "B", "C", "A", "object"] }, { args: [], expected: ["D", "B", "C", "A", "object"] }, { args: [], expected: ["D", "B", "C", "A", "object"] }],
    ["`D.__mro__` is the ordered tuple of classes.", "`cls.__name__` turns a class into its name as a string.", "The shared grandparent comes last, after both children."],
    ["oop", "mro"]),

  PP("oop-advanced", "Medium", 405, "first-parent-wins", "Which Parent Wins", "first_parent_wins",
    "Write two classes `Reader` and `Writer`, each with a `describe()` method returning `\"read\"` and `\"write\"` respectively.\n\nThen a class `Editor` that inherits from **both**, in that order, and adds nothing.\n\n`first_parent_wins()` must return what `Editor().describe()` gives.",
    [{ input: "first_parent_wins()", output: '"read"' }],
    "def first_parent_wins():\n    pass\n",
    "def first_parent_wins():\n    class Reader:\n        def describe(self):\n            return \"read\"\n\n    class Writer:\n        def describe(self):\n            return \"write\"\n\n    class Editor(Reader, Writer):\n        pass\n\n    return Editor().describe()\n",
    [{ args: [], expected: "read" }, { args: [], expected: "read" }, { args: [], expected: "read" }],
    ["Python searches the parents left to right.", "`class Editor(Reader, Writer)` — the first one listed wins a clash.", "`Editor` needs no body of its own; `pass` is enough."],
    ["oop", "inheritance"]),

  /* ----------------------------------------------------- big-o --------- */
  PP("big-o", "Easy", 406, "steps-linear", "Count Linear Steps", "steps_linear",
    "Return how many steps a **single loop** over `n` items takes — one step per item.\n\nCount them with a loop; do not just return `n`.",
    [{ input: "n=10", output: "10" }, { input: "n=0", output: "0" }],
    "def steps_linear(n):\n    pass\n",
    "def steps_linear(n):\n    steps = 0\n    for _ in range(n):\n        steps += 1\n    return steps\n",
    [{ args: [10], expected: 10 }, { args: [0], expected: 0 }, { args: [250], expected: 250 }],
    ["Start a counter at 0 before the loop.", "`for _ in range(n)` runs exactly n times.", "Return the counter after the loop, not inside it."],
    ["big-o", "complexity"]),

  PP("big-o", "Medium", 407, "steps-quadratic", "Count Quadratic Steps", "steps_quadratic",
    "Return how many steps a **loop inside a loop**, both over `n` items, takes.\n\nCount with real nested loops so you can see the shape.",
    [{ input: "n=10", output: "100" }, { input: "n=3", output: "9" }],
    "def steps_quadratic(n):\n    pass\n",
    "def steps_quadratic(n):\n    steps = 0\n    for _ in range(n):\n        for _ in range(n):\n            steps += 1\n    return steps\n",
    [{ args: [10], expected: 100 }, { args: [3], expected: 9 }, { args: [0], expected: 0 }],
    ["The inner loop runs n times for each pass of the outer loop.", "The counter goes outside both loops.", "n = 0 must give 0 — neither loop runs."],
    ["big-o", "complexity"]),

  PP("big-o", "Medium", 408, "halving-steps", "Count The Halvings", "halving_steps",
    "Return how many times `n` must be **halved** (integer division) before it reaches 1 or less.\n\nThis is what makes binary search `O(log n)`.",
    [{ input: "n=8", output: "3" }, { input: "n=1024", output: "10" }],
    "def halving_steps(n):\n    pass\n",
    "def halving_steps(n):\n    steps = 0\n    while n > 1:\n        n = n // 2\n        steps += 1\n    return steps\n",
    [{ args: [8], expected: 3 }, { args: [1024], expected: 10 }, { args: [1], expected: 0 }],
    ["Use a `while n > 1:` loop.", "`n = n // 2` — floor division, not `/`.", "n = 1 is already done, so the answer is 0 steps."],
    ["big-o", "logarithmic"]),

  /* ---------------------------------------------- stacks-queues -------- */
  PP("stacks-queues", "Easy", 409, "stack-order", "Empty A Stack", "stack_order",
    "Push every item of `items` onto a stack in order, then pop them all off.\n\nReturn the list of values **in the order they came off**.",
    [{ input: 'items=["a","b","c"]', output: '["c", "b", "a"]' }],
    "def stack_order(items):\n    pass\n",
    "def stack_order(items):\n    stack = []\n    for x in items:\n        stack.append(x)\n    out = []\n    while stack:\n        out.append(stack.pop())\n    return out\n",
    [{ args: [["a", "b", "c"]], expected: ["c", "b", "a"] }, { args: [[1]], expected: [1] }, { args: [[]], expected: [] }],
    ["`append` pushes, `pop()` with no argument takes from the end.", "Last in, first out — the order comes out reversed.", "`while stack:` keeps going until it is empty."],
    ["stack", "lifo"]),

  PP("stacks-queues", "Easy", 410, "queue-order", "Empty A Queue", "queue_order",
    "Add every item of `items` to a queue in order, then serve them all.\n\nReturn the list of values **in the order they were served** — first in, first out.",
    [{ input: 'items=["a","b","c"]', output: '["a", "b", "c"]' }],
    "def queue_order(items):\n    pass\n",
    "def queue_order(items):\n    from collections import deque\n    q = deque()\n    for x in items:\n        q.append(x)\n    out = []\n    while q:\n        out.append(q.popleft())\n    return out\n",
    [{ args: [["a", "b", "c"]], expected: ["a", "b", "c"] }, { args: [[1, 2]], expected: [1, 2] }, { args: [[]], expected: [] }],
    ["`popleft()` on a `deque` takes from the front.", "`pop()` would take from the end — that is a stack, and the order would be backwards.", "`from collections import deque` goes inside the function."],
    ["queue", "fifo", "deque"]),

  PP("stacks-queues", "Medium", 411, "balanced-brackets", "Balanced Brackets", "balanced",
    "Return `True` if every bracket in `text` is opened and closed correctly, otherwise `False`.\n\nHandle `()`, `[]` and `{}`. Any other character is ignored.\n\nThree things fail: a closing bracket with nothing open, one that does not match what is open, and anything still open at the end.",
    [{ input: 'text="(a[b]{c})"', output: "True" }, { input: 'text="(a[b)]"', output: "False" }, { input: 'text="(("', output: "False" }],
    "def balanced(text):\n    pass\n",
    "def balanced(text):\n    stack = []\n    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    for ch in text:\n        if ch in \"([{\":\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack\n",
    [{ args: ["(a[b]{c})"], expected: true }, { args: ["(a[b)]"], expected: false }, { args: ["(("], expected: false }, { args: [""], expected: true }, { args: [")("], expected: false }],
    ["Push every opening bracket onto a stack.", "On a closing bracket, pop and check it matches — and check the stack is not empty first.", "At the end, a non-empty stack means something was never closed."],
    ["stack", "matching"]),

  /* -------------------------------------- linked-lists-hashing --------- */
  PP("linked-lists-hashing", "Medium", 412, "chain-roundtrip", "Build And Walk A Chain", "chain_values",
    "Build a linked list from `values`, keeping the **same order**, then walk it from the head and return the values as a list.\n\nUse a `Node` class with `value` and `next`. Do not simply return the input.",
    [{ input: "values=[1,2,3]", output: "[1, 2, 3]" }],
    "def chain_values(values):\n    pass\n",
    "def chain_values(values):\n    class Node:\n        def __init__(self, value):\n            self.value = value\n            self.next = None\n\n    head = None\n    tail = None\n    for v in values:\n        node = Node(v)\n        if head is None:\n            head = node\n            tail = node\n        else:\n            tail.next = node\n            tail = node\n\n    out = []\n    node = head\n    while node is not None:\n        out.append(node.value)\n        node = node.next\n    return out\n",
    [{ args: [[1, 2, 3]], expected: [1, 2, 3] }, { args: [["a"]], expected: ["a"] }, { args: [[]], expected: [] }],
    ["Keep track of the tail so you can attach each new node to the end.", "Walking is `while node is not None: ... node = node.next`.", "An empty input must give an empty list — head stays None and the walk never runs."],
    ["linked-list", "nodes"]),

  PP("linked-lists-hashing", "Medium", 413, "push-front-order", "Push To The Front", "push_front_order",
    "Add every value of `values` to the **front** of a linked list, one at a time, then walk it and return the resulting order.\n\nPushing to the front reverses the order — that is the point.",
    [{ input: "values=[1,2,3]", output: "[3, 2, 1]" }],
    "def push_front_order(values):\n    pass\n",
    "def push_front_order(values):\n    class Node:\n        def __init__(self, value):\n            self.value = value\n            self.next = None\n\n    head = None\n    for v in values:\n        node = Node(v)\n        node.next = head\n        head = node\n\n    out = []\n    node = head\n    while node is not None:\n        out.append(node.value)\n        node = node.next\n    return out\n",
    [{ args: [[1, 2, 3]], expected: [3, 2, 1] }, { args: [[7]], expected: [7] }, { args: [[]], expected: [] }],
    ["Point the new node at the old head FIRST, then move the head.", "Do it the other way round and the node points at itself and the chain is lost.", "`node.next = head` then `head = node`."],
    ["linked-list", "insertion"]),

  PP("linked-lists-hashing", "Easy", 414, "toy-hash", "A Toy Hash Function", "toy_hash",
    "Return which slot `key` belongs in: add up the character codes of `key` with `ord()`, then take the remainder when divided by `slots`.\n\nAnagrams will collide — that is expected, and it is why real hash functions are more careful.",
    [{ input: 'key="abc", slots=8', output: "6" }, { input: 'key="pune", slots=8', output: "0" }],
    "def toy_hash(key, slots):\n    pass\n",
    "def toy_hash(key, slots):\n    total = 0\n    for ch in key:\n        total += ord(ch)\n    return total % slots\n",
    [{ args: ["abc", 8], expected: 6 }, { args: ["cba", 8], expected: 6 }, { args: ["pune", 8], expected: 0 }, { args: ["", 8], expected: 0 }],
    ["`ord(ch)` gives a character's numeric code.", "Add them all up, then use `%` to squeeze the total into range.", "An empty key totals 0, so it lands in slot 0."],
    ["hashing", "modulo"]),

  /* ------------------------------------------------ trees-graphs ------- */
  PP("trees-graphs", "Medium", 415, "bst-sorted", "A Tree That Sorts Itself", "bst_sorted",
    "Insert every value of `values` into a **binary search tree** (smaller goes left, otherwise right), then walk it **left, node, right** and return the values.\n\nThe result comes out sorted — without you sorting anything.",
    [{ input: "values=[50,30,70,20]", output: "[20, 30, 50, 70]" }],
    "def bst_sorted(values):\n    pass\n",
    "def bst_sorted(values):\n    class Node:\n        def __init__(self, value):\n            self.value = value\n            self.left = None\n            self.right = None\n\n    def insert(root, value):\n        if root is None:\n            return Node(value)\n        if value < root.value:\n            root.left = insert(root.left, value)\n        else:\n            root.right = insert(root.right, value)\n        return root\n\n    def walk(node, out):\n        if node is None:\n            return out\n        walk(node.left, out)\n        out.append(node.value)\n        walk(node.right, out)\n        return out\n\n    root = None\n    for v in values:\n        root = insert(root, v)\n    return walk(root, [])\n",
    [{ args: [[50, 30, 70, 20]], expected: [20, 30, 50, 70] }, { args: [[1, 2, 3]], expected: [1, 2, 3] }, { args: [[]], expected: [] }, { args: [[5]], expected: [5] }],
    ["`insert` returns the (possibly new) root, so write `root = insert(root, v)`.", "Every recursive function needs `if node is None` as its first line.", "Left, then append, then right — that order is what produces the sorted result."],
    ["tree", "bst", "recursion"]),

  PP("trees-graphs", "Medium", 416, "bst-contains", "Search A BST", "bst_contains",
    "Insert every value of `values` into a binary search tree, then search for `target`.\n\nReturn `True` or `False`. Go **left** when the target is smaller — getting this backwards returns False for values that are definitely there.",
    [{ input: "values=[50,30,70], target=30", output: "True" }, { input: "values=[50,30,70], target=99", output: "False" }],
    "def bst_contains(values, target):\n    pass\n",
    "def bst_contains(values, target):\n    class Node:\n        def __init__(self, value):\n            self.value = value\n            self.left = None\n            self.right = None\n\n    def insert(root, value):\n        if root is None:\n            return Node(value)\n        if value < root.value:\n            root.left = insert(root.left, value)\n        else:\n            root.right = insert(root.right, value)\n        return root\n\n    root = None\n    for v in values:\n        root = insert(root, v)\n\n    node = root\n    while node is not None:\n        if target == node.value:\n            return True\n        node = node.left if target < node.value else node.right\n    return False\n",
    [{ args: [[50, 30, 70], 30], expected: true }, { args: [[50, 30, 70], 99], expected: false }, { args: [[50, 30, 70, 20], 20], expected: true }, { args: [[], 1], expected: false }],
    ["Insert with the same rule you search with — they must agree.", "Smaller means left; anything else means right.", "An empty tree means root is None, so the loop never runs and the answer is False."],
    ["tree", "bst", "search"]),

  PP("trees-graphs", "Medium", 417, "reachable-nodes", "What Can You Reach", "reachable",
    "`graph` is a dictionary mapping each node to a list of the nodes it connects to.\n\nReturn a **sorted list** of every node reachable from `start`, including `start` itself.\n\nA graph can loop back on itself, so remember what you have already visited — otherwise this never finishes.",
    [{ input: 'graph={"A":["B"],"B":["A"]}, start="A"', output: '["A", "B"]' }],
    "def reachable(graph, start):\n    pass\n",
    "def reachable(graph, start):\n    todo = [start]\n    seen = []\n    while todo:\n        node = todo.pop()\n        if node in seen:\n            continue\n        seen.append(node)\n        for nxt in graph.get(node, []):\n            todo.append(nxt)\n    return sorted(seen)\n",
    [{ args: [{ A: ["B"], B: ["A"] }, "A"], expected: ["A", "B"] }, { args: [{ A: ["B", "C"], B: ["D"], C: ["D"], D: [] }, "A"], expected: ["A", "B", "C", "D"] }, { args: [{ A: [] }, "A"], expected: ["A"] }],
    ["Keep a list of nodes still to visit, and a list of nodes already seen.", "Skip a node you have already seen — that is what stops a cycle looping forever.", "Return `sorted(seen)` so the order is predictable."],
    ["graph", "traversal"]),

  /* -------------------------------------------- searching-sorting ------ */
  PP("searching-sorting", "Easy", 418, "linear-find", "Find It By Scanning", "linear_find",
    "Return the **index** of the first occurrence of `target` in `items`, or `-1` if it is not there.\n\nScan the list yourself — do not use `.index()`.",
    [{ input: "items=[5,3,9], target=9", output: "2" }, { input: "items=[5,3], target=9", output: "-1" }],
    "def linear_find(items, target):\n    pass\n",
    "def linear_find(items, target):\n    for i, x in enumerate(items):\n        if x == target:\n            return i\n    return -1\n",
    [{ args: [[5, 3, 9], 9], expected: 2 }, { args: [[5, 3], 9], expected: -1 }, { args: [[7], 7], expected: 0 }, { args: [[], 1], expected: -1 }],
    ["`enumerate` gives you the index and the value together.", "Return as soon as you find it — that is what makes it the FIRST occurrence.", "`-1` goes after the loop, once everything has been checked."],
    ["search", "linear"]),

  PP("searching-sorting", "Medium", 419, "binary-find", "Halve It Every Time", "binary_find",
    "`items` is **already sorted**. Return the index of `target`, or `-1`.\n\nUse binary search: look at the middle, throw away the half that cannot contain the answer, repeat.\n\nTwo details decide whether it works: `//` for the midpoint, and `while lo <= hi` — not `<`.",
    [{ input: "items=[1,3,5,7,9], target=7", output: "3" }, { input: "items=[1,3,5], target=4", output: "-1" }],
    "def binary_find(items, target):\n    pass\n",
    "def binary_find(items, target):\n    lo = 0\n    hi = len(items) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if items[mid] == target:\n            return mid\n        if items[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n",
    [{ args: [[1, 3, 5, 7, 9], 7], expected: 3 }, { args: [[1, 3, 5], 4], expected: -1 }, { args: [[1, 3, 5], 1], expected: 0 }, { args: [[1, 3, 5], 5], expected: 2 }, { args: [[], 1], expected: -1 }],
    ["`mid = (lo + hi) // 2` — floor division; `/` gives a float and indexing fails.", "Too small at the middle? The answer is to the right: `lo = mid + 1`.", "`while lo <= hi` — with `<` the last remaining item is never checked."],
    ["search", "binary"]),

  PP("searching-sorting", "Medium", 420, "merge-sorted", "Merge Two Sorted Lists", "merge_sorted",
    "`a` and `b` are each already sorted. Return one sorted list containing everything from both.\n\nWalk both together taking whichever front item is smaller — do not just concatenate and call `sorted()`. This is the merge step of merge sort.",
    [{ input: "a=[1,4], b=[2,3]", output: "[1, 2, 3, 4]" }],
    "def merge_sorted(a, b):\n    pass\n",
    "def merge_sorted(a, b):\n    out = []\n    i = 0\n    j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i])\n            i += 1\n        else:\n            out.append(b[j])\n            j += 1\n    out.extend(a[i:])\n    out.extend(b[j:])\n    return out\n",
    [{ args: [[1, 4], [2, 3]], expected: [1, 2, 3, 4] }, { args: [[], [1, 2]], expected: [1, 2] }, { args: [[1, 2], []], expected: [1, 2] }, { args: [[1, 1], [1]], expected: [1, 1, 1] }],
    ["Keep one position marker for each list.", "The loop stops when either list runs out — then append whatever is left of the other.", "`out.extend(a[i:])` adds the remainder in one go."],
    ["sorting", "merge"]),

  /* -------------------------------------------- python-reference ------- */
  PP("python-reference", "Easy", 421, "safe-lookup", "Read A Key Safely", "safe_lookup",
    "Return the value stored under `key` in the dictionary `d`, or `0` if that key is not there.\n\nIt must not raise — a missing key is normal here, not a bug.",
    [{ input: 'd={"a":5}, key="a"', output: "5" }, { input: 'd={"a":5}, key="z"', output: "0" }],
    "def safe_lookup(d, key):\n    pass\n",
    "def safe_lookup(d, key):\n    return d.get(key, 0)\n",
    [{ args: [{ a: 5 }, "a"], expected: 5 }, { args: [{ a: 5 }, "z"], expected: 0 }, { args: [{}, "x"], expected: 0 }],
    ["`d[key]` raises KeyError when the key is missing.", "`.get(key, default)` returns the default instead of raising.", "The default you want here is `0`, not `None`."],
    ["dict", "get"]),

  PP("python-reference", "Easy", 422, "tidy-name", "Tidy A Messy Name", "tidy_name",
    "`raw` is a name with stray spaces and inconsistent capitals. Return it trimmed and in Title Case.\n\nRemember that string methods return a **new** string — they never change the original.",
    [{ input: 'raw="  priya sharma  "', output: '"Priya Sharma"' }],
    "def tidy_name(raw):\n    pass\n",
    "def tidy_name(raw):\n    return raw.strip().title()\n",
    [{ args: ["  priya sharma  "], expected: "Priya Sharma" }, { args: ["RAHUL"], expected: "Rahul" }, { args: ["  om  "], expected: "Om" }],
    ["`.strip()` removes the spaces at both ends.", "`.title()` capitalises the first letter of each word.", "Chain them and return the result — writing `raw.strip()` on its own line changes nothing."],
    ["string", "cleaning"]),

  PP("python-reference", "Medium", 423, "position-of", "Where Is It, Really", "position_of",
    "Return the index of `needle` in `text`, or `-1` if it is not there.\n\nThe trap: `find` already returns `-1`, but `-1` is **truthy** and position `0` is **falsy** — so testing it with a bare `if` is wrong in both directions. Compare explicitly.",
    [{ input: 'text="Data", needle="D"', output: "0" }, { input: 'text="Data", needle="z"', output: "-1" }],
    "def position_of(text, needle):\n    pass\n",
    "def position_of(text, needle):\n    pos = text.find(needle)\n    if pos != -1:\n        return pos\n    return -1\n",
    [{ args: ["Data", "D"], expected: 0 }, { args: ["Data", "z"], expected: -1 }, { args: ["Data Science", "Sci"], expected: 5 }, { args: ["Data", "a"], expected: 1 }],
    ["`text.find(needle)` gives the position, or -1 when absent.", "Never write `if pos:` — -1 is truthy and 0 is falsy, so both ends are wrong.", "Compare with `!= -1` explicitly."],
    ["string", "find"]),
];

/* ---------------------------------------------------------------------------
 * Tree traversals. Added with the lesson, because `npm run syllabus` now counts
 * practice — a lesson without it is reported below standard, which is the whole
 * reason that check exists.
 * ------------------------------------------------------------------------- */
export const treeTraversalProblems = [
  PP("tree-traversals", "Medium", 430, "preorder-values", "Save It Root First", "preorder_values",
    "Insert every value of `values` into a binary search tree, then return its **pre-order** walk: node, then left, then right.\n\nThis is the order you would save a tree in, because the root comes out first.",
    [{ input: "values=[50,30,70,20,40]", output: "[50, 30, 20, 40, 70]" }],
    "def preorder_values(values):\n    pass\n",
    "def preorder_values(values):\n    class N:\n        def __init__(self, v):\n            self.value = v\n            self.left = None\n            self.right = None\n\n    def insert(root, v):\n        if root is None:\n            return N(v)\n        if v < root.value:\n            root.left = insert(root.left, v)\n        else:\n            root.right = insert(root.right, v)\n        return root\n\n    def walk(node, out):\n        if node is None:\n            return out\n        out.append(node.value)\n        walk(node.left, out)\n        walk(node.right, out)\n        return out\n\n    root = None\n    for v in values:\n        root = insert(root, v)\n    return walk(root, [])\n",
    [{ args: [[50, 30, 70, 20, 40]], expected: [50, 30, 20, 40, 70] }, { args: [[1, 2, 3]], expected: [1, 2, 3] }, { args: [[]], expected: [] }, { args: [[5]], expected: [5] }],
    ["Append the node's value BEFORE recursing into either subtree.", "`if node is None: return out` must be the first line.", "Insert returns the root, so write `root = insert(root, v)`."],
    ["tree", "traversal"]),

  PP("tree-traversals", "Medium", 431, "postorder-values", "Children Before Parent", "postorder_values",
    "Same tree, but return the **post-order** walk: left, then right, then the node.\n\nThis is the order anything bottom-up needs — deleting a tree, or evaluating an expression.",
    [{ input: "values=[50,30,70,20,40]", output: "[20, 40, 30, 70, 50]" }],
    "def postorder_values(values):\n    pass\n",
    "def postorder_values(values):\n    class N:\n        def __init__(self, v):\n            self.value = v\n            self.left = None\n            self.right = None\n\n    def insert(root, v):\n        if root is None:\n            return N(v)\n        if v < root.value:\n            root.left = insert(root.left, v)\n        else:\n            root.right = insert(root.right, v)\n        return root\n\n    def walk(node, out):\n        if node is None:\n            return out\n        walk(node.left, out)\n        walk(node.right, out)\n        out.append(node.value)\n        return out\n\n    root = None\n    for v in values:\n        root = insert(root, v)\n    return walk(root, [])\n",
    [{ args: [[50, 30, 70, 20, 40]], expected: [20, 40, 30, 70, 50] }, { args: [[1, 2, 3]], expected: [3, 2, 1] }, { args: [[]], expected: [] }],
    ["The append goes AFTER both recursive calls.", "The root is always the last value in a post-order walk.", "Only the position of the append changes between the three traversals."],
    ["tree", "traversal"]),

  PP("tree-traversals", "Medium", 432, "tree-height", "How Tall Is It", "tree_height",
    "Insert every value into a binary search tree and return its **height** — the number of levels, counting the root as 1. An empty tree has height 0.\n\nA node's height depends on its children, so this has to be worked out bottom-up.",
    [{ input: "values=[50,30,70,20]", output: "3" }, { input: "values=[]", output: "0" }],
    "def tree_height(values):\n    pass\n",
    "def tree_height(values):\n    class N:\n        def __init__(self, v):\n            self.value = v\n            self.left = None\n            self.right = None\n\n    def insert(root, v):\n        if root is None:\n            return N(v)\n        if v < root.value:\n            root.left = insert(root.left, v)\n        else:\n            root.right = insert(root.right, v)\n        return root\n\n    def height(node):\n        if node is None:\n            return 0\n        return max(height(node.left), height(node.right)) + 1\n\n    root = None\n    for v in values:\n        root = insert(root, v)\n    return height(root)\n",
    [{ args: [[50, 30, 70, 20]], expected: 3 }, { args: [[]], expected: 0 }, { args: [[1]], expected: 1 }, { args: [[1, 2, 3, 4]], expected: 4 }],
    ["An empty node contributes 0 — that is the base case.", "A node's height is the taller of its two children, plus one.", "Sorted input builds a one-sided tree, so [1,2,3,4] has height 4."],
    ["tree", "recursion"]),
];

/* ---------------------------------------------------------------------------
 * Balanced trees and array-stored trees.
 * ------------------------------------------------------------------------- */
export const balancedTreeProblems = [
  PP("balanced-trees", "Medium", 433, "balance-factor", "How Lopsided Is It", "balance_factor",
    "Insert every value of `values` into a binary search tree, then return the **balance factor of the root**: the height of its left subtree minus the height of its right.\n\n0 means even, positive means left-heavy, negative means right-heavy. An empty tree gives 0.",
    [{ input: "values=[10,20,30,40,50]", output: "-4" }, { input: "values=[30,20,40]", output: "0" }],
    "def balance_factor(values):\n    pass\n",
    "def balance_factor(values):\n    class N:\n        def __init__(self, v):\n            self.value = v\n            self.left = None\n            self.right = None\n\n    def insert(root, v):\n        if root is None:\n            return N(v)\n        if v < root.value:\n            root.left = insert(root.left, v)\n        else:\n            root.right = insert(root.right, v)\n        return root\n\n    def height(n):\n        if n is None:\n            return 0\n        return max(height(n.left), height(n.right)) + 1\n\n    root = None\n    for v in values:\n        root = insert(root, v)\n    if root is None:\n        return 0\n    return height(root.left) - height(root.right)\n",
    [{ args: [[10, 20, 30, 40, 50]], expected: -4 }, { args: [[30, 20, 40]], expected: 0 }, { args: [[]], expected: 0 }, { args: [[5]], expected: 0 }],
    ["The height of None is 0 — that is the base case.", "Balance factor is left height MINUS right height, in that order.", "Sorted input sends everything right, so the factor goes negative."],
    ["tree", "balance"]),

  PP("balanced-trees", "Hard", 434, "rotate-left-root", "Rotate Without Losing Anything", "rotate_left_root",
    "Build a right-leaning chain from `values` by linking each one as the right child of the last. Then perform **one left rotation at the root** and return the in-order walk.\n\nThe walk must be unchanged by the rotation — that is the whole guarantee. If a value goes missing, the rehoming line is the one you skipped.",
    [{ input: "values=[10,20,30]", output: "[10, 20, 30]" }],
    "def rotate_left_root(values):\n    pass\n",
    "def rotate_left_root(values):\n    class N:\n        def __init__(self, v):\n            self.value = v\n            self.left = None\n            self.right = None\n\n    if not values:\n        return []\n\n    root = N(values[0])\n    node = root\n    for v in values[1:]:\n        node.right = N(v)\n        node = node.right\n\n    def ino(n, out):\n        if n is None:\n            return out\n        ino(n.left, out)\n        out.append(n.value)\n        ino(n.right, out)\n        return out\n\n    if root.right is None:\n        return ino(root, [])\n\n    pivot = root.right\n    root.right = pivot.left\n    pivot.left = root\n    return ino(pivot, [])\n",
    [{ args: [[10, 20, 30]], expected: [10, 20, 30] }, { args: [[1, 2, 3, 4]], expected: [1, 2, 3, 4] }, { args: [[7]], expected: [7] }, { args: [[]], expected: [] }],
    ["Rehome the pivot's left subtree onto the old root's right BEFORE overwriting pivot.left.", "The three lines are: save the pivot, rehome, then hang the old root off it.", "A single node has no right child — return it unrotated."],
    ["tree", "rotation"]),

  PP("balanced-trees", "Medium", 435, "array-tree-path", "Walk A Tree With Arithmetic", "array_tree_path",
    "`tree` is a complete binary tree stored in a plain list: the children of index `i` sit at `2i+1` and `2i+2`.\n\nStarting at the root, follow `steps` — each one is `\"L\"` or `\"R\"` — and return the list of values visited, including the root. Stop early if a step would fall off the end of the list.",
    [{ input: 'tree=[50,30,70,20,40,60,80], steps="LL"', output: "[50, 30, 20]" }],
    "def array_tree_path(tree, steps):\n    pass\n",
    "def array_tree_path(tree, steps):\n    if not tree:\n        return []\n    i = 0\n    out = [tree[0]]\n    for s in steps:\n        i = 2 * i + 1 if s == \"L\" else 2 * i + 2\n        if i >= len(tree):\n            break\n        out.append(tree[i])\n    return out\n",
    [{ args: [[50, 30, 70, 20, 40, 60, 80], "LL"], expected: [50, 30, 20] }, { args: [[50, 30, 70, 20, 40, 60, 80], "RR"], expected: [50, 70, 80] }, { args: [[50, 30, 70], "LLL"], expected: [50, 30] }, { args: [[], "L"], expected: [] }],
    ["Left is 2i+1, right is 2i+2. No nodes and no pointers — the arithmetic is the tree.", "Check the index against len(tree) before reading it.", "The root is always in the answer, even when steps is empty."],
    ["tree", "array"]),
];

/* ---------------------------------------------------------------------------
 * Counting sort and radix sort — the two sorts that never compare anything.
 * ------------------------------------------------------------------------- */
export const countingRadixProblems = [
  PP("counting-radix-sort", "Medium", 436, "counting-sort-tally", "Sort By Tally", "counting_sort",
    "Sort a list of **non-negative integers** without comparing any two of them.\n\nTally how many times each value appears — using the value itself as an index — then read the tally back out in order. An empty list returns `[]`.",
    [{ input: "nums=[4,2,2,8,3,3,1]", output: "[1, 2, 2, 3, 3, 4, 8]" }, { input: "nums=[]", output: "[]" }],
    "def counting_sort(nums):\n    pass\n",
    "def counting_sort(nums):\n    if not nums:\n        return []\n    counts = [0] * (max(nums) + 1)\n    for n in nums:\n        counts[n] += 1\n    out = []\n    for value, times in enumerate(counts):\n        out.extend([value] * times)\n    return out\n",
    [{ args: [[4, 2, 2, 8, 3, 3, 1]], expected: [1, 2, 2, 3, 3, 4, 8] }, { args: [[]], expected: [] }, { args: [[0, 0]], expected: [0, 0] }, { args: [[7]], expected: [7] }, { args: [[3, 1, 2]], expected: [1, 2, 3] }],
    ["The tally needs `max(nums) + 1` slots — the largest value has to be a valid index.", "`counts[n] += 1` files each value under itself. There is no comparison anywhere in this.", "`enumerate(counts)` hands you (value, times); extend the output by `[value] * times`."],
    ["sorting", "counting"]),

  PP("counting-radix-sort", "Medium", 437, "digit-pass", "One Digit, Order Kept", "digit_pass",
    "One **stable** counting pass by a single digit.\n\n`place` is 1 for the ones digit, 10 for the tens, 100 for the hundreds. Return `nums` reordered by the digit at that place — and values whose digit is equal **must stay in the order they arrived**.\n\nThat stability is the entire point: it is what lets radix sort stack these passes without each one destroying the last.\n\nThe digit of `n` at `place` is `(n // place) % 10`.",
    [{ input: "nums=[170,45,75,90,802,24,2,66], place=1", output: "[170, 90, 802, 2, 24, 45, 75, 66]" }, { input: "nums=[21,12], place=10", output: "[12, 21]" }],
    "def digit_pass(nums, place):\n    pass\n",
    "def digit_pass(nums, place):\n    counts = [0] * 10\n    for n in nums:\n        counts[(n // place) % 10] += 1\n    for d in range(1, 10):\n        counts[d] += counts[d - 1]\n    out = [0] * len(nums)\n    for n in reversed(nums):\n        d = (n // place) % 10\n        counts[d] -= 1\n        out[counts[d]] = n\n    return out\n",
    [{ args: [[170, 45, 75, 90, 802, 24, 2, 66], 1], expected: [170, 90, 802, 2, 24, 45, 75, 66] }, { args: [[170, 90, 802, 2, 24, 45, 75, 66], 10], expected: [802, 2, 24, 45, 66, 170, 75, 90] }, { args: [[], 1], expected: [] }, { args: [[5], 1], expected: [5] }, { args: [[21, 12], 10], expected: [12, 21] }],
    ["Tally the ten digits, then turn the tally into a running total: `counts[d] += counts[d - 1]`.", "After the running total, `counts[d]` is where digit d's block ENDS, not how many there are.", "Place walking BACKWARDS through the input, decrementing before each write — that is the one thing keeping equal digits in order."],
    ["sorting", "radix"]),

  PP("counting-radix-sort", "Hard", 438, "radix-sort-digits", "Sort Without Comparing", "radix_sort",
    "Sort non-negative integers with one **stable** pass per digit: ones, then tens, then hundreds, and so on until the digits run out.\n\nNo two values are ever compared. Keep going while `max(nums) // place > 0`, multiplying `place` by 10 each round.",
    [{ input: "nums=[170,45,75,90,802,24,2,66]", output: "[2, 24, 45, 66, 75, 90, 170, 802]" }, { input: "nums=[9,10,1]", output: "[1, 9, 10]" }],
    "def radix_sort(nums):\n    pass\n",
    "def radix_sort(nums):\n    if not nums:\n        return []\n    out = list(nums)\n    place = 1\n    while max(out) // place > 0:\n        counts = [0] * 10\n        for n in out:\n            counts[(n // place) % 10] += 1\n        for d in range(1, 10):\n            counts[d] += counts[d - 1]\n        nxt = [0] * len(out)\n        for n in reversed(out):\n            d = (n // place) % 10\n            counts[d] -= 1\n            nxt[counts[d]] = n\n        out = nxt\n        place *= 10\n    return out\n",
    [{ args: [[170, 45, 75, 90, 802, 24, 2, 66]], expected: [2, 24, 45, 66, 75, 90, 170, 802] }, { args: [[]], expected: [] }, { args: [[0]], expected: [0] }, { args: [[5, 3, 5]], expected: [3, 5, 5] }, { args: [[9, 10, 1]], expected: [1, 9, 10] }],
    ["Each round is a stable counting sort on the digit `(n // place) % 10`.", "`place` starts at 1 and multiplies by 10; stop when `max(...) // place` reaches 0. A list of just [0] does no passes at all.", "If the inner pass is unstable the result comes out wrong with nothing raised — place backwards, from a running total."],
    ["sorting", "radix"]),
];
