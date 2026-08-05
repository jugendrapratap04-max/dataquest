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

/* ---------------------------------------------------------------------------
 * Linked list positions and hash sets.
 *
 * A linked list cannot be an argument — the tests are JSON — so each of these
 * takes a plain list, builds the chain, does the pointer work, and walks it back
 * out. That is deliberate: the walk is what proves the links survived.
 * ------------------------------------------------------------------------- */
export const linkedListSetProblems = [
  PP("linked-list-shapes-sets", "Medium", 439, "insert-at-position", "Insert Without Losing The Tail", "insert_at_position",
    "Build a singly linked list from `values`, insert `value` so it ends up at index `pos`, then walk the list and return its values as a plain list.\n\nYou must build and rewire real nodes — the point is the two-line order that keeps the rest of the chain reachable. `pos` is always valid, and `pos == len(values)` means append.",
    [{ input: "values=[10,20,30], pos=1, value=15", output: "[10, 15, 20, 30]" }, { input: "values=[10,20,30], pos=0, value=5", output: "[5, 10, 20, 30]" }],
    "def insert_at_position(values, pos, value):\n    pass\n",
    "def insert_at_position(values, pos, value):\n    class Node:\n        def __init__(self, v):\n            self.value = v\n            self.next = None\n\n    head = None\n    tail = None\n    for v in values:\n        node = Node(v)\n        if head is None:\n            head = node\n        else:\n            tail.next = node\n        tail = node\n\n    def walk(node):\n        out = []\n        while node is not None:\n            out.append(node.value)\n            node = node.next\n        return out\n\n    fresh = Node(value)\n    if pos == 0:\n        fresh.next = head\n        return walk(fresh)\n\n    before = head\n    for _ in range(pos - 1):\n        before = before.next\n    fresh.next = before.next\n    before.next = fresh\n    return walk(head)\n",
    [{ args: [[10, 20, 30], 1, 15], expected: [10, 15, 20, 30] }, { args: [[10, 20, 30], 0, 5], expected: [5, 10, 20, 30] }, { args: [[10, 20, 30], 3, 40], expected: [10, 20, 30, 40] }, { args: [[], 0, 7], expected: [7] }, { args: [[9], 1, 8], expected: [9, 8] }],
    ["`fresh.next = before.next` comes FIRST. The next line destroys the only reference to the tail.", "Position 0 has no node in front of it, so the head itself changes — return a walk starting at the new node.", "Walk `pos - 1` steps to reach the node the new one goes AFTER."],
    ["linked-list", "insert"]),

  PP("linked-list-shapes-sets", "Medium", 440, "delete-at-position", "Route Around It", "delete_at_position",
    "Build a singly linked list from `values`, remove the node at index `pos`, then walk the list and return its values.\n\nNothing is erased — you make the node unreachable by pointing the one before it past it. `pos` is always valid.",
    [{ input: "values=[10,20,30], pos=1", output: "[10, 30]" }, { input: "values=[10,20,30], pos=0", output: "[20, 30]" }],
    "def delete_at_position(values, pos):\n    pass\n",
    "def delete_at_position(values, pos):\n    class Node:\n        def __init__(self, v):\n            self.value = v\n            self.next = None\n\n    head = None\n    tail = None\n    for v in values:\n        node = Node(v)\n        if head is None:\n            head = node\n        else:\n            tail.next = node\n        tail = node\n\n    def walk(node):\n        out = []\n        while node is not None:\n            out.append(node.value)\n            node = node.next\n        return out\n\n    if pos == 0:\n        return walk(head.next)\n\n    before = head\n    for _ in range(pos - 1):\n        before = before.next\n    before.next = before.next.next\n    return walk(head)\n",
    [{ args: [[10, 20, 30], 1], expected: [10, 30] }, { args: [[10, 20, 30], 0], expected: [20, 30] }, { args: [[10, 20, 30], 2], expected: [10, 20] }, { args: [[7], 0], expected: [] }],
    ["`before.next = before.next.next` skips the doomed node. There is nothing to delete.", "Deleting position 0 means the head moves — return a walk starting at `head.next`.", "Removing the only node leaves an empty list, so the walk returns `[]`."],
    ["linked-list", "delete"]),

  PP("linked-list-shapes-sets", "Medium", 441, "first-repeat", "The First One You Have Seen Before", "first_repeat",
    "Return the **first** value in `nums` that has already appeared earlier in the list. Return `-1` if every value is unique.\n\nDo it in one pass with a set. A nested loop gets the same answer and costs `O(n^2)` — the whole point of a hash set is that asking \"have I seen this?\" is one calculation, not a scan.",
    [{ input: "nums=[1,2,3,2,1]", output: "2" }, { input: "nums=[1,2,3]", output: "-1" }],
    "def first_repeat(nums):\n    pass\n",
    "def first_repeat(nums):\n    seen = set()\n    for n in nums:\n        if n in seen:\n            return n\n        seen.add(n)\n    return -1\n",
    [{ args: [[1, 2, 3, 2, 1]], expected: 2 }, { args: [[1, 2, 3]], expected: -1 }, { args: [[]], expected: -1 }, { args: [[5, 5]], expected: 5 }, { args: [[1, 2, 1, 2]], expected: 1 }],
    ["Check membership BEFORE adding, or every value looks like a repeat of itself.", "`n in seen` on a set is one hash and one lookup, however large the set gets.", "The answer is the first value whose second copy you reach — [1,2,1,2] gives 1, not 2."],
    ["set", "hashing"]),
];

/* ---------------------------------------------------------------------------
 * Cycle detection.
 *
 * The list problems take a `nxt` array rather than real nodes — nxt[i] is the
 * index of the next node and -1 is the end — because tests are JSON and a
 * cyclic object graph has no JSON form. The arithmetic is identical, and it
 * keeps the two-pointer logic exactly as it appears in the lesson.
 *
 * Note these are the first problems where a WRONG answer can hang rather than
 * fail. That is the topic: the runner's watchdog stops it, and experiencing the
 * hang is closer to the real lesson than a red X would be.
 * ------------------------------------------------------------------------- */
export const cycleProblems = [
  PP("cycle-detection", "Medium", 442, "detect-cycle", "Is It Going Round", "has_cycle",
    "`nxt` describes a linked list by position: `nxt[i]` is the index of the node after `i`, and `-1` means the end.\n\nReturn `True` if following the links from position 0 goes round forever, `False` if it reaches an end. An empty list has no cycle.\n\nUse two pointers — one stepping once, one stepping twice. Do not collect the positions you have seen; the point is to answer this in constant memory.",
    [{ input: "nxt=[1,2,3,4,5,2]", output: "True" }, { input: "nxt=[1,2,3,4,5,-1]", output: "False" }],
    "def has_cycle(nxt):\n    pass\n",
    "def has_cycle(nxt):\n    if not nxt:\n        return False\n    slow = 0\n    fast = 0\n    while True:\n        if fast == -1 or nxt[fast] == -1:\n            return False\n        fast = nxt[nxt[fast]]\n        slow = nxt[slow]\n        if slow == fast:\n            return True\n",
    [{ args: [[1, 2, 3, 4, 5, 2]], expected: true }, { args: [[1, 2, 3, 4, 5, -1]], expected: false }, { args: [[-1]], expected: false }, { args: [[0]], expected: true }, { args: [[1, -1]], expected: false }, { args: [[]], expected: false }],
    ["Check BOTH `fast == -1` and `nxt[fast] == -1` before stepping — fast moves twice, so it can fall off the end from either position.", "`nxt[-1]` is a valid index in Python and reads the LAST element, so guarding in the wrong order gives a wrong answer with no error.", "A node pointing at itself, `[0]`, is the shortest cycle there is."],
    ["cycle", "two-pointer"]),

  PP("cycle-detection", "Hard", 443, "cycle-length", "How Long Is The Loop", "cycle_length",
    "Same `nxt` array. Return how many nodes are **inside** the loop, or `0` if there is no loop.\n\nTwo phases: get the pointers to meet, then walk on from the meeting point counting steps until you arrive back at it. The meeting point is somewhere in the loop, which is all this phase needs — it does not have to be the entrance.",
    [{ input: "nxt=[1,2,3,4,5,2]", output: "4" }, { input: "nxt=[1,2,3,4,5,-1]", output: "0" }],
    "def cycle_length(nxt):\n    pass\n",
    "def cycle_length(nxt):\n    if not nxt:\n        return 0\n    slow = 0\n    fast = 0\n    while True:\n        if fast == -1 or nxt[fast] == -1:\n            return 0\n        fast = nxt[nxt[fast]]\n        slow = nxt[slow]\n        if slow == fast:\n            break\n    n = 1\n    node = nxt[slow]\n    while node != slow:\n        n += 1\n        node = nxt[node]\n    return n\n",
    [{ args: [[1, 2, 3, 4, 5, 2]], expected: 4 }, { args: [[1, 2, 3, 4, 5, -1]], expected: 0 }, { args: [[0]], expected: 1 }, { args: [[1, 0]], expected: 2 }, { args: [[-1]], expected: 0 }],
    ["Phase 1 is exactly the previous problem — stop at the meeting point instead of returning True.", "Phase 2: start the count at 1 and step from `nxt[meet]` until you are back at `meet`.", "In [1,2,3,4,5,2] the loop is positions 2,3,4,5 — four nodes, even though the list has six."],
    ["cycle", "two-pointer"]),

  PP("cycle-detection", "Hard", 444, "graph-cycle", "On The Route Or Just Seen Before", "graph_has_cycle",
    "`graph` maps each node to the list of nodes it points at. Return `True` if the graph contains a directed cycle.\n\nBeing reached twice is **not** a cycle — in `{\"A\": [\"B\",\"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}` you arrive at D by two different routes and nothing points backwards. A cycle means arriving at a node that is on the route you are standing on right now.\n\nThe graph may be in several disconnected pieces, so every node needs a chance to be a starting point.",
    [{ input: '{"A":["B","C"],"B":["D"],"C":["D"],"D":[]}', output: "False" }, { input: '{"A":["B"],"B":["C"],"C":["A"]}', output: "True" }],
    "def graph_has_cycle(graph):\n    pass\n",
    "def graph_has_cycle(graph):\n    visited = set()\n    path = set()\n\n    def walk(node):\n        visited.add(node)\n        path.add(node)\n        for nxt in graph[node]:\n            if nxt in path:\n                return True\n            if nxt not in visited and walk(nxt):\n                return True\n        path.remove(node)\n        return False\n\n    for node in sorted(graph):\n        if node not in visited and walk(node):\n            return True\n    return False\n",
    [{ args: [{ A: ["B", "C"], B: ["D"], C: ["D"], D: [] }], expected: false }, { args: [{ A: ["B"], B: ["C"], C: ["A"] }], expected: true }, { args: [{ A: ["A"] }], expected: true }, { args: [{ A: [], B: [] }], expected: false }, { args: [{ A: ["B"], B: [], C: ["D"], D: ["C"] }], expected: true }],
    ["Two sets, not one: `visited` stops you repeating work, `path` answers the question.", "`path.remove(node)` on the way out is the line that separates them. Without it every diamond reports a false cycle.", "Start a walk from every node that is still unvisited — the cycle may be in a piece you never reach from the first one."],
    ["graph", "cycle"]),
];

/* ---------------------------------------------------------------------------
 * Shortest paths with Dijkstra.
 *
 * `graph` arrives as a dict of node -> [[neighbour, weight], ...]. Dicts and
 * nested lists are fine as ARGUMENTS (it is returning a dict that breaks
 * grading), and `for nxt, w in graph[node]` unpacks a two-element list exactly
 * as it unpacks a tuple, so the lesson's code works here unchanged.
 * ------------------------------------------------------------------------- */
export const dijkstraProblems = [
  PP("shortest-path-dijkstra", "Medium", 445, "cheapest-cost", "What Does The Cheapest Route Cost", "cheapest_cost",
    "`graph` maps each node to a list of `[neighbour, weight]` pairs. All weights are positive.\n\nReturn the **total weight** of the cheapest route from `start` to `goal`, or `-1` if there is no route at all. The cost from a node to itself is 0.\n\nBFS will not do — it minimises hops, and the cheapest route here is often the one with more of them.",
    [{ input: 'graph={"A":[["B",10],["C",1]],"B":[],"C":[["D",1]],"D":[["B",1]]}, start="A", goal="B"', output: "3" }, { input: 'start="B", goal="A"', output: "-1" }],
    "def cheapest_cost(graph, start, goal):\n    pass\n",
    "def cheapest_cost(graph, start, goal):\n    import heapq\n    best = {start: 0}\n    frontier = [(0, start)]\n    done = set()\n    while frontier:\n        cost, node = heapq.heappop(frontier)\n        if node in done:\n            continue\n        done.add(node)\n        for nxt, w in graph[node]:\n            step = cost + w\n            if step < best.get(nxt, float(\"inf\")):\n                best[nxt] = step\n                heapq.heappush(frontier, (step, nxt))\n    return best.get(goal, -1)\n",
    [{ args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A", "B"], expected: 3 }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A", "D"], expected: 2 }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "B", "A"], expected: -1 }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A", "A"], expected: 0 }, { args: [{ A: [["B", 4], ["C", 2]], B: [["D", 1]], C: [["B", 1], ["D", 7]], D: [] }, "A", "D"], expected: 4 }],
    ["Use `heapq` — push `(cost, node)` so the cheapest comes out first.", "`best.get(nxt, float(\"inf\"))` makes an unreached node infinitely expensive, so no special case is needed for the first visit.", "Unreachable is an answer. Return -1, never 0 — 0 would claim the two nodes are adjacent and free."],
    ["graph", "dijkstra"]),

  PP("shortest-path-dijkstra", "Hard", 446, "cheapest-route", "Which Way Did It Go", "cheapest_route",
    "Same graph shape. Return the cheapest route from `start` to `goal` as a **list of nodes**, including both ends. Return `[]` if there is no route. A route from a node to itself is just `[node]`.\n\nRecord which node you arrived from each time a cost improves, then read the route back from the goal — and remember which direction that gives you.",
    [{ input: 'graph={"A":[["B",10],["C",1]],"B":[],"C":[["D",1]],"D":[["B",1]]}, start="A", goal="B"', output: '["A", "C", "D", "B"]' }],
    "def cheapest_route(graph, start, goal):\n    pass\n",
    "def cheapest_route(graph, start, goal):\n    import heapq\n    best = {start: 0}\n    came_from = {}\n    frontier = [(0, start)]\n    done = set()\n    while frontier:\n        cost, node = heapq.heappop(frontier)\n        if node in done:\n            continue\n        done.add(node)\n        for nxt, w in graph[node]:\n            step = cost + w\n            if step < best.get(nxt, float(\"inf\")):\n                best[nxt] = step\n                came_from[nxt] = node\n                heapq.heappush(frontier, (step, nxt))\n    if goal not in best:\n        return []\n    path = [goal]\n    while path[-1] != start:\n        path.append(came_from[path[-1]])\n    path.reverse()\n    return path\n",
    [{ args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A", "B"], expected: ["A", "C", "D", "B"] }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A", "D"], expected: ["A", "C", "D"] }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "B", "A"], expected: [] }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A", "A"], expected: ["A"] }, { args: [{ A: [["B", 4], ["C", 2]], B: [["D", 1]], C: [["B", 1], ["D", 7]], D: [] }, "A", "D"], expected: ["A", "C", "B", "D"] }],
    ["`came_from[nxt] = node` goes right next to the line that improves the cost — it is overwritten every time a cheaper route is found.", "Following came_from from the goal walks you towards the start, so the list comes out backwards. Reverse it.", "Start to start is `[start]`, and the while loop handles that on its own if you seed the path with the goal."],
    ["graph", "dijkstra"]),

  PP("shortest-path-dijkstra", "Medium", 447, "all-costs", "Cost To Everywhere", "all_costs",
    "Same graph shape. Return the cheapest cost from `start` to **every node it can reach**, as a list of `[node, cost]` pairs sorted by node name. `start` itself is included, at 0.\n\nUnreachable nodes are left out entirely — that is the honest answer, and it is why the result is a list rather than one entry per node in the graph.",
    [{ input: 'graph={"A":[["B",10],["C",1]],"B":[],"C":[["D",1]],"D":[["B",1]]}, start="A"', output: '[["A", 0], ["B", 3], ["C", 1], ["D", 2]]' }, { input: 'start="B"', output: '[["B", 0]]' }],
    "def all_costs(graph, start):\n    pass\n",
    "def all_costs(graph, start):\n    import heapq\n    best = {start: 0}\n    frontier = [(0, start)]\n    done = set()\n    while frontier:\n        cost, node = heapq.heappop(frontier)\n        if node in done:\n            continue\n        done.add(node)\n        for nxt, w in graph[node]:\n            step = cost + w\n            if step < best.get(nxt, float(\"inf\")):\n                best[nxt] = step\n                heapq.heappush(frontier, (step, nxt))\n    return sorted([node, cost] for node, cost in best.items())\n",
    [{ args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "A"], expected: [["A", 0], ["B", 3], ["C", 1], ["D", 2]] }, { args: [{ A: [["B", 10], ["C", 1]], B: [], C: [["D", 1]], D: [["B", 1]] }, "B"], expected: [["B", 0]] }, { args: [{ A: [["B", 1]], B: [] }, "A"], expected: [["A", 0], ["B", 1]] }, { args: [{ A: [["B", 4], ["C", 2]], B: [["D", 1]], C: [["B", 1], ["D", 7]], D: [] }, "A"], expected: [["A", 0], ["B", 3], ["C", 2], ["D", 4]] }],
    ["One run of Dijkstra already computes all of these — the goal was never needed.", "Return pairs as two-element LISTS, and sort them. A dict would arrive in JS as a Map and grade as empty.", "Only nodes that were actually reached belong in the answer."],
    ["graph", "dijkstra"]),
];

/* ---------------------------------------------------------------------------
 * Bellman-Ford and minimum spanning trees.
 *
 * Edges are [u, v, w] triples rather than an adjacency dict, which is how both
 * algorithms actually want them: Bellman-Ford sweeps the whole edge list, and
 * Kruskal sorts it.
 * ------------------------------------------------------------------------- */
export const bellmanMstProblems = [
  PP("bellman-ford-mst", "Medium", 448, "bellman-cost", "Cheapest, Even With Negative Edges", "bellman_ford_cost",
    "`nodes` is the list of node names and `edges` is a list of `[from, to, weight]` triples, **directed**. Weights may be negative; assume there is no negative cycle.\n\nReturn the cheapest total cost from `start` to `goal`, or `-1` if `goal` cannot be reached.\n\nDijkstra is not safe here — it marks a node final on the way past and a negative edge can improve it afterwards. Relax every edge instead, `len(nodes) - 1` times.",
    [{ input: 'nodes=["A","B","C","D"], edges=[["A","B",1],["A","C",2],["C","B",-2],["B","D",6]], start="A", goal="D"', output: "6" }, { input: 'goal unreachable', output: "-1" }],
    "def bellman_ford_cost(nodes, edges, start, goal):\n    pass\n",
    "def bellman_ford_cost(nodes, edges, start, goal):\n    best = {n: float(\"inf\") for n in nodes}\n    best[start] = 0\n    for _ in range(len(nodes) - 1):\n        changed = False\n        for u, v, w in edges:\n            if best[u] + w < best[v]:\n                best[v] = best[u] + w\n                changed = True\n        if not changed:\n            break\n    return -1 if best[goal] == float(\"inf\") else best[goal]\n",
    [{ args: [["A", "B", "C", "D"], [["A", "B", 1], ["A", "C", 2], ["C", "B", -2], ["B", "D", 6]], "A", "D"], expected: 6 }, { args: [["A", "B", "C", "D"], [["A", "B", 1], ["A", "C", 2], ["C", "B", -2], ["B", "D", 6]], "A", "B"], expected: 0 }, { args: [["A", "B", "C", "D"], [["A", "B", 1], ["A", "C", 2], ["C", "B", -2], ["B", "D", 6]], "A", "A"], expected: 0 }, { args: [["A", "B"], [], "A", "B"], expected: -1 }, { args: [["A", "B", "C"], [["A", "B", 5], ["B", "C", 5]], "A", "C"], expected: 10 }],
    ["Start every node at `float(\"inf\")` and the source at 0 — then `best[u] + w < best[v]` needs no special case, because infinity plus anything is still infinity.", "`len(nodes) - 1` rounds exactly. One fewer and the longest path never finishes forming, with nothing raised.", "A node still at infinity at the end was never reached — return -1, not the infinity."],
    ["graph", "bellman-ford"]),

  PP("bellman-ford-mst", "Hard", 449, "negative-cycle", "Is There No Answer At All", "has_negative_cycle",
    "Same `nodes` and directed `edges`. Return `True` if the part of the graph reachable from `start` contains a **negative cycle** — a loop whose weights sum below zero, so going round forever keeps making any total cheaper.\n\nA negative *edge* is not a negative *cycle*: `A→B 1, B→C -1, C→A 1` sums to +1 and is perfectly fine. Only the round trip decides.",
    [{ input: 'edges=[["A","B",1],["B","C",-3],["C","A",1]]', output: "True" }, { input: 'edges=[["A","B",1],["B","C",-1],["C","A",1]]', output: "False" }],
    "def has_negative_cycle(nodes, edges, start):\n    pass\n",
    "def has_negative_cycle(nodes, edges, start):\n    best = {n: float(\"inf\") for n in nodes}\n    best[start] = 0\n    for _ in range(len(nodes) - 1):\n        for u, v, w in edges:\n            if best[u] + w < best[v]:\n                best[v] = best[u] + w\n    for u, v, w in edges:\n        if best[u] + w < best[v]:\n            return True\n    return False\n",
    [{ args: [["A", "B", "C"], [["A", "B", 1], ["B", "C", -3], ["C", "A", 1]], "A"], expected: true }, { args: [["A", "B", "C"], [["A", "B", 1], ["B", "C", -1], ["C", "A", 1]], "A"], expected: false }, { args: [["A", "B"], [["A", "B", 3]], "A"], expected: false }, { args: [["A", "B", "C", "D"], [["A", "B", 1], ["A", "C", 2], ["C", "B", -2], ["B", "D", 6]], "A"], expected: false }],
    ["Run the ordinary `len(nodes) - 1` rounds first, then ONE more pass over the edges.", "After V-1 rounds nothing should still be improving. If an edge still relaxes, a loop is paying you to go round it.", "Do not test `any(w < 0 for ...)` — that rejects negative edges, which are legal. Only the round trip decides."],
    ["graph", "bellman-ford"]),

  PP("bellman-ford-mst", "Hard", 450, "mst-total", "Connect Everything, Cheaply", "mst_total",
    "`edges` is a list of `[u, v, weight]` triples, **undirected** this time. Return the total weight of the minimum spanning tree — the cheapest set of edges that keeps every node connected with no cycles.\n\nReturn `-1` if the graph cannot be connected at all. A single node with no edges has a tree of total 0.\n\nSort the edges by weight and take each one whose two ends are not already connected. A spanning tree of `n` nodes has exactly `n - 1` edges, which is also how you detect the disconnected case.",
    [{ input: 'nodes=["A","B","C","D"], edges=[["A","B",10],["B","C",10],["A","C",19],["C","D",5]]', output: "25" }, { input: 'nodes=["A","B","C"], edges=[["A","B",1]]', output: "-1" }],
    "def mst_total(nodes, edges):\n    pass\n",
    "def mst_total(nodes, edges):\n    parent = {n: n for n in nodes}\n\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    taken = 0\n    total = 0\n    for w, u, v in sorted((w, u, v) for u, v, w in edges):\n        ru, rv = find(u), find(v)\n        if ru == rv:\n            continue\n        parent[ru] = rv\n        taken += 1\n        total += w\n    return total if taken == len(nodes) - 1 else -1\n",
    [{ args: [["A", "B", "C", "D"], [["A", "B", 10], ["B", "C", 10], ["A", "C", 19], ["C", "D", 5]]], expected: 25 }, { args: [["A", "B"], [["A", "B", 3]]], expected: 3 }, { args: [["A"], []], expected: 0 }, { args: [["A", "B", "C"], [["A", "B", 1]]], expected: -1 }, { args: [["A", "B", "C"], [["A", "B", 1], ["B", "C", 2], ["A", "C", 5]]], expected: 3 }],
    ["Sort as `(w, u, v)` so the weight decides the order.", "Each node points at a parent; a group is named by whoever points at themselves. Join two groups by pointing one root at the other.", "Count the edges you take. Fewer than `len(nodes) - 1` means the graph was in more than one piece — return -1."],
    ["graph", "mst"]),
];

/* ---------------------------------------------------------------------------
 * Memoisation and tabulation.
 *
 * `climb_ways` is the debug task's function done correctly — a fresh cache per
 * top-level call. Left deliberately as the first problem, because a student who
 * just watched it return the wrong answer has the reason to get it right.
 * ------------------------------------------------------------------------- */
export const dpBasicsProblems = [
  PP("memoization-tabulation", "Medium", 451, "climb-ways", "Ways Up The Stairs", "climb_ways",
    "There are `n` stairs and `steps` lists the step sizes allowed. Return how many different ways there are to reach the top. Order matters — 1 then 2 is a different climb from 2 then 1.\n\n`n = 0` has exactly one way: stand still. A step that overshoots contributes nothing.\n\nMemoise it. And be careful what the cache is keyed on — the answer depends on `steps` as well as on `n`.",
    [{ input: "n=4, steps=[1,2]", output: "5" }, { input: "n=4, steps=[1,2,3]", output: "7" }],
    "def climb_ways(n, steps):\n    pass\n",
    "def climb_ways(n, steps):\n    seen = {}\n\n    def ways(k):\n        if k == 0:\n            return 1\n        if k < 0:\n            return 0\n        if k in seen:\n            return seen[k]\n        total = 0\n        for s in steps:\n            total += ways(k - s)\n        seen[k] = total\n        return total\n\n    return ways(n)\n",
    [{ args: [4, [1, 2]], expected: 5 }, { args: [4, [1, 2, 3]], expected: 7 }, { args: [0, [1, 2]], expected: 1 }, { args: [1, [2]], expected: 0 }, { args: [10, [1, 2]], expected: 89 }, { args: [7, [1, 3, 5]], expected: 12 }],
    ["Build the cache INSIDE the function. A `seen={}` default argument is created once and shared by every call the program ever makes.", "Base cases first: 0 stairs is one way (stand still), a negative overshoot is zero ways.", "If you cache across calls instead, the key must be `(n, tuple(steps))` — keying on n alone answers the previous question."],
    ["dp", "memoisation"]),

  PP("memoization-tabulation", "Medium", 452, "naive-call-count", "How Many Calls Would That Have Been", "naive_call_count",
    "Return how many calls naive recursive Fibonacci would make to compute `fib(n)` — **without making them**. `fib(35)` is 29,860,703 calls, so actually running it to count is not an option past about 35.\n\nThe count has its own recurrence: computing `n` costs one call, plus whatever `n-1` cost, plus whatever `n-2` cost. `n = 0` and `n = 1` cost one call each.\n\nWhich means the answer is itself a tabulation — build it bottom-up.",
    [{ input: "n=5", output: "15" }, { input: "n=35", output: "29860703" }],
    "def naive_call_count(n):\n    pass\n",
    "def naive_call_count(n):\n    if n < 2:\n        return 1\n    counts = [1, 1]\n    for i in range(2, n + 1):\n        counts.append(1 + counts[i - 1] + counts[i - 2])\n    return counts[n]\n",
    [{ args: [0], expected: 1 }, { args: [1], expected: 1 }, { args: [2], expected: 3 }, { args: [5], expected: 15 }, { args: [10], expected: 177 }, { args: [25], expected: 242785 }, { args: [35], expected: 29860703 }],
    ["`counts[i] = 1 + counts[i-1] + counts[i-2]` — the Fibonacci recurrence with a 1 added, which is why the cost grows like fib itself.", "Handle n = 0 and n = 1 before building the list, or the seed values are wrong.", "Do not solve this by actually recursing. That is the joke the problem is making."],
    ["dp", "tabulation"]),

  PP("memoization-tabulation", "Hard", 453, "min-path-sum", "Cheapest Way Down The Grid", "min_path_sum",
    "`grid` is a list of rows of numbers. Starting at the top-left and moving only **right or down**, return the smallest possible total of the cells you land on, counting both the first and the last.\n\nTabulate it: each cell's best total is its own value plus the cheaper of the cell above and the cell to its left. Fill top-left to bottom-right so both of those are already known when you need them.\n\nAn empty grid totals 0.",
    [{ input: "grid=[[1,3,1],[1,5,1],[4,2,1]]", output: "7" }, { input: "grid=[[1,2],[1,1]]", output: "3" }],
    "def min_path_sum(grid):\n    pass\n",
    "def min_path_sum(grid):\n    if not grid or not grid[0]:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    table = [[0] * cols for _ in range(rows)]\n    table[0][0] = grid[0][0]\n    for c in range(1, cols):\n        table[0][c] = table[0][c - 1] + grid[0][c]\n    for r in range(1, rows):\n        table[r][0] = table[r - 1][0] + grid[r][0]\n    for r in range(1, rows):\n        for c in range(1, cols):\n            table[r][c] = grid[r][c] + min(table[r - 1][c], table[r][c - 1])\n    return table[rows - 1][cols - 1]\n",
    [{ args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 }, { args: [[[1, 2], [1, 1]]], expected: 3 }, { args: [[[5]]], expected: 5 }, { args: [[[1, 2, 3]]], expected: 6 }, { args: [[[1], [2], [3]]], expected: 6 }, { args: [[]], expected: 0 }],
    ["The first row and first column have no choice — there is only one way to reach them, so fill those separately first.", "Every other cell: `grid[r][c] + min(above, left)`.", "Fill in increasing order of row and column. Reverse the direction and every cell reads slots that are still zero, with no error at all."],
    ["dp", "tabulation"]),
];

/* ---------------------------------------------------------------------------
 * Dynamic programming and the knapsack family.
 *
 * The first two problems are the SAME algorithm with the capacity loop running
 * in opposite directions, and they are deliberately adjacent — writing both is
 * the fastest way to stop confusing them.
 * ------------------------------------------------------------------------- */
export const knapsackProblems = [
  PP("dynamic-programming-knapsack", "Hard", 454, "knapsack-01", "Fill The Bag Once", "knapsack",
    "`items` is a list of `[weight, value]` pairs and `capacity` is what the bag holds. Return the greatest total value that fits.\n\n**Each item may be taken at most once.** Weights and the capacity are whole numbers.\n\nValue-per-kilo will not do: with a bag of 10 and items `[[6,30],[5,20],[5,20]]` the best ratio is the 6kg item, and taking it strands 4 kilos. The answer is 40, not 30.",
    [{ input: "capacity=10, items=[[6,30],[5,20],[5,20]]", output: "40" }, { input: "capacity=9, items=[[3,20],[4,25]]", output: "45" }],
    "def knapsack(capacity, items):\n    pass\n",
    "def knapsack(capacity, items):\n    best = [0] * (capacity + 1)\n    for w, v in items:\n        for c in range(capacity, w - 1, -1):\n            if best[c - w] + v > best[c]:\n                best[c] = best[c - w] + v\n    return best[capacity]\n",
    [{ args: [10, [[6, 30], [5, 20], [5, 20]]], expected: 40 }, { args: [9, [[3, 20], [4, 25]]], expected: 45 }, { args: [0, [[1, 1]]], expected: 0 }, { args: [5, []], expected: 0 }, { args: [3, [[5, 100]]], expected: 0 }, { args: [7, [[3, 4], [4, 5]]], expected: 9 }],
    ["One row of `capacity + 1` slots is enough — each row of the full table only ever reads the one above it.", "Sweep the capacity BACKWARDS: `range(capacity, w - 1, -1)`. Forwards lets `best[c - w]` already contain this item, so it gets taken again.", "An item weighing exactly the remaining capacity fits — the test is `w <= c`, not `w < c`."],
    ["dp", "knapsack"]),

  PP("dynamic-programming-knapsack", "Medium", 455, "knapsack-unbounded", "Take It As Often As You Like", "unbounded_knapsack",
    "Same arguments, one rule changed: **each item may be taken any number of times**.\n\nWith a bag of 9 and items `[[3,20],[4,25]]` the answer is 60 — three copies of the first item — where the 0/1 answer was 45.\n\nThe code is the previous problem's with one loop running the other way. Work out which way, and why that is the whole difference.",
    [{ input: "capacity=9, items=[[3,20],[4,25]]", output: "60" }, { input: "capacity=7, items=[[3,4]]", output: "8" }],
    "def unbounded_knapsack(capacity, items):\n    pass\n",
    "def unbounded_knapsack(capacity, items):\n    best = [0] * (capacity + 1)\n    for w, v in items:\n        for c in range(w, capacity + 1):\n            if best[c - w] + v > best[c]:\n                best[c] = best[c - w] + v\n    return best[capacity]\n",
    [{ args: [9, [[3, 20], [4, 25]]], expected: 60 }, { args: [10, [[6, 30], [5, 20], [5, 20]]], expected: 40 }, { args: [0, [[1, 1]]], expected: 0 }, { args: [7, [[3, 4]]], expected: 8 }, { args: [5, []], expected: 0 }],
    ["Sweep the capacity FORWARDS this time: `range(w, capacity + 1)`.", "Going forwards, `best[c - w]` was already updated in this pass and may include the current item — which is exactly what \"take it again\" means.", "Note the second test: on that set the two answers agree at 40. Two algorithms matching on one input proves nothing."],
    ["dp", "knapsack"]),

  PP("dynamic-programming-knapsack", "Hard", 456, "coin-change-min", "Fewest Coins", "coin_change_min",
    "Given a `target` amount and a list of `coins` (unlimited supply of each), return the **fewest coins** that add up to exactly `target`. Return `-1` if it cannot be made at all. A target of 0 needs 0 coins.\n\nTabulate it: the best way to make `t` is one coin plus the best way to make `t` minus that coin, taking the smallest over every coin that fits.\n\nWorth trying by hand first: `target=30, coins=[25,10,1]`. Taking the largest coin that fits, repeatedly, gives 25 then five 1s — six coins. The real answer is three.",
    [{ input: "target=11, coins=[1,2,5]", output: "3" }, { input: "target=3, coins=[2]", output: "-1" }],
    "def coin_change_min(target, coins):\n    pass\n",
    "def coin_change_min(target, coins):\n    unreachable = target + 1\n    best = [0] + [unreachable] * target\n    for t in range(1, target + 1):\n        for c in coins:\n            if c <= t and best[t - c] + 1 < best[t]:\n                best[t] = best[t - c] + 1\n    return -1 if best[target] == unreachable else best[target]\n",
    [{ args: [11, [1, 2, 5]], expected: 3 }, { args: [3, [2]], expected: -1 }, { args: [0, [1]], expected: 0 }, { args: [6, [1, 3, 4]], expected: 2 }, { args: [30, [25, 10, 1]], expected: 3 }, { args: [7, [2, 4]], expected: -1 }],
    ["Seed the table with an impossible value — `target + 1` works, since no valid answer can need more coins than that.", "Fill amounts from 1 upwards so `best[t - c]` is always already computed.", "An amount left at the impossible value was never reachable. Return -1, not the sentinel."],
    ["dp", "tabulation"]),
];

/* ---------------------------------------------------------------------------
 * Greedy algorithms — the two that are proved, and the scheduling rule that is.
 *
 * There is deliberately no "greedy coin change" problem here. The lesson's whole
 * point is that the rule is wrong, and the correct version is already the
 * coin-change problem on the previous lesson.
 * ------------------------------------------------------------------------- */
export const greedyProblems = [
  PP("greedy-algorithms", "Medium", 457, "gcd-of-list", "The Largest Divisor They All Share", "gcd_of_list",
    "Return the greatest common divisor of every number in `nums`, using Euclid's algorithm.\n\nRun it pairwise: the gcd of a whole list is the gcd of the running answer with the next number. An empty list gives 0, and `gcd(0, n)` is `n` because everything divides 0.\n\nDo not factorise anything. `(a, b)` and `(b, a % b)` have exactly the same common divisors, so keep replacing until the remainder is 0.",
    [{ input: "nums=[12,18,24]", output: "6" }, { input: "nums=[1071,462]", output: "21" }],
    "def gcd_of_list(nums):\n    pass\n",
    "def gcd_of_list(nums):\n    if not nums:\n        return 0\n    result = nums[0]\n    for n in nums[1:]:\n        a, b = result, n\n        while b:\n            a, b = b, a % b\n        result = a\n    return result\n",
    [{ args: [[48, 18]], expected: 6 }, { args: [[1071, 462]], expected: 21 }, { args: [[12, 18, 24]], expected: 6 }, { args: [[7]], expected: 7 }, { args: [[0, 5]], expected: 5 }, { args: [[13, 17]], expected: 1 }, { args: [[]], expected: 0 }],
    ["The whole of Euclid is `while b: a, b = b, a % b`, then return `a`.", "Fold across the list: start with the first number and combine it with each of the rest.", "No special cases are needed for 0 or for coprime pairs — the loop handles both. gcd(13, 17) is 1."],
    ["greedy", "euclid"]),

  PP("greedy-algorithms", "Hard", 458, "max-meetings", "Fit The Most Into One Room", "max_meetings",
    "`meetings` is a list of `[start, finish]` pairs for one room. Nothing can be moved or shortened. Return the **largest number** of meetings that can be held.\n\nTwo meetings touching exactly at a boundary — one ending at 4, the next starting at 4 — do **not** clash.\n\nSort by the right thing. Earliest start loses to a single long early booking; shortest first loses to a brief meeting sitting across a boundary. Only one of the three obvious rules is provably optimal.",
    [{ input: "meetings=[[1,4],[3,5],[0,6],[5,7],[8,9],[5,9]]", output: "3" }, { input: "meetings=[[0,10],[9,11],[10,20]]", output: "2" }],
    "def max_meetings(meetings):\n    pass\n",
    "def max_meetings(meetings):\n    count = 0\n    end = None\n    for s, f in sorted(meetings, key=lambda m: m[1]):\n        if end is None or s >= end:\n            count += 1\n            end = f\n    return count\n",
    [{ args: [[[1, 4], [3, 5], [0, 6], [5, 7], [8, 9], [5, 9]]], expected: 3 }, { args: [[[0, 10], [9, 11], [10, 20]]], expected: 2 }, { args: [[]], expected: 0 }, { args: [[[1, 2]]], expected: 1 }, { args: [[[1, 3], [2, 4], [3, 5]]], expected: 2 }, { args: [[[1, 2], [2, 3], [3, 4]]], expected: 3 }],
    ["Sort by FINISH time — `key=lambda m: m[1]`. That is the rule with an exchange proof behind it.", "Track only the finish time of the last meeting taken; anything starting at or after it fits.", "Use `s >= end`, not `s > end`. The last test is three meetings that touch at every boundary and all three fit."],
    ["greedy", "scheduling"]),

  PP("greedy-algorithms", "Medium", 459, "huffman-bits", "How Small Can It Get", "huffman_bits",
    "`freqs` is how often each distinct symbol appears. Return the **total number of bits** an optimal prefix code needs for the whole text.\n\nHuffman's rule: repeatedly take the two smallest weights, merge them, and push the total back. Each merge pushes everything inside it one level deeper, so the merge costs its own combined weight — add those costs up and you have the answer.\n\nOne symbol needs no code at all, so the answer there is 0.",
    [{ input: "freqs=[5,2,2,1,1]   (from 'abracadabra')", output: "23" }, { input: "freqs=[1,1,1,1]", output: "8" }],
    "def huffman_bits(freqs):\n    pass\n",
    "def huffman_bits(freqs):\n    import heapq\n    heap = list(freqs)\n    heapq.heapify(heap)\n    total = 0\n    while len(heap) > 1:\n        a = heapq.heappop(heap)\n        b = heapq.heappop(heap)\n        total += a + b\n        heapq.heappush(heap, a + b)\n    return total\n",
    [{ args: [[5, 2, 2, 1, 1]], expected: 23 }, { args: [[1, 1]], expected: 2 }, { args: [[5]], expected: 0 }, { args: [[1, 1, 1, 1]], expected: 8 }, { args: [[10, 1, 1]], expected: 14 }],
    ["A heap gives you the two smallest in O(log n) — `heapq.heapify` then two `heappop`s per round.", "Push the merged weight back on; it competes with the rest from then on.", "Stop when one item is left. The running total of the merges IS the encoded size — you never have to build the tree."],
    ["greedy", "huffman"]),
];
