/* Practice problems for the HTML course.
 *
 * These are graded by lib/html-check.ts: the student's markup is parsed and
 * asserted against, in the browser and again on the server. Every test carries
 * a `says` line because that line is what a student reads when it goes red —
 * a bare red cross teaches nothing.
 *
 * The assertions are deliberately loose about everything except the point of
 * the exercise. Whitespace, attribute order and how the file is indented are
 * never checked; two people who both produced a heading and three list items
 * have both solved it.
 */

const P = (lessonSlug, order, slug, title, difficulty, descriptionMd, starterCode, solutionCode, tests, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty,
  kind: "html",
  functionName: "",
  descriptionMd,
  tagsCsv: tags,
  examplesJson: "[]",
  starterCode,
  solutionCode,
  testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints),
  sqlSetup: "",
  xp: 20,
});

export const htmlProblems = [
  /* ---------------------------------------------- html-what-it-is ---- */
  P("html-what-it-is", 601, "html-first-page", "Your First Page", "Easy",
    "Write a page with **one heading** and **two paragraphs**.\n\nThe heading should say `My First Page`. The paragraphs can say anything you like — what matters is that there are two of them and that they are paragraphs rather than more headings.\n\nThe preview updates as you type.",
    "<!-- one h1 and two p elements -->\n",
    "<h1>My First Page</h1>\n<p>I am learning HTML.</p>\n<p>This is my second paragraph.</p>\n",
    [
      { find: "h1", count: 1, says: "exactly one <h1> on the page" },
      { find: "h1", text: true, contains: "My First Page", says: "the heading reads \"My First Page\"" },
      { find: "p", count: 2, says: "exactly two <p> paragraphs" },
      { find: "p", text: true, notEmpty: true, says: "the paragraphs are not empty" },
    ],
    [
      "A heading is `<h1>text</h1>` — opening tag, content, closing tag.",
      "A paragraph uses `p` instead of `h1`, and you need two of them.",
      "Watch the closing tags: `</p>` has the slash, `<p>` starts a new one.",
    ],
    "html,basics"),

  P("html-what-it-is", 602, "html-right-element", "Use the Right Element", "Easy",
    "Here is a recipe page where **everything is a paragraph**, including the title and the two section headings.\n\nFix it so the page says what it means:\n\n- `Chocolate Cake` is the page title — an `h1`\n- `Ingredients` and `Method` are section headings — `h2`\n- the remaining lines stay paragraphs\n\nNothing will look dramatically different, and that is the lesson: the meaning was wrong even while the page looked acceptable.",
    "<p>Chocolate Cake</p>\n<p>Ingredients</p>\n<p>Flour, sugar, cocoa, eggs.</p>\n<p>Method</p>\n<p>Mix everything. Bake for 40 minutes.</p>\n",
    "<h1>Chocolate Cake</h1>\n<h2>Ingredients</h2>\n<p>Flour, sugar, cocoa, eggs.</p>\n<h2>Method</h2>\n<p>Mix everything. Bake for 40 minutes.</p>\n",
    [
      { find: "h1", count: 1, says: "one <h1> for the page title" },
      { find: "h1", text: true, contains: "Chocolate Cake", says: "the <h1> is \"Chocolate Cake\"" },
      { find: "h2", count: 2, says: "two <h2> section headings" },
      { find: "p", count: 2, says: "only the two real paragraphs are left as <p>" },
    ],
    [
      "Three of the five `<p>` tags are actually headings.",
      "The page title is the `h1`. Sections under it are `h2`.",
      "Change both the opening and the closing tag on each line you convert.",
    ],
    "html,basics,semantics"),

  /* --------------------------------------- html-document-structure ---- */
  P("html-document-structure", 603, "html-skeleton", "The Full Skeleton", "Easy",
    "Write a **complete** HTML document from scratch — not a fragment.\n\nIt needs:\n\n- the doctype\n- an `html` element with `lang=\"en\"`\n- a `head` containing a UTF-8 charset declaration and a `title` of `My Portfolio`\n- a `body` containing an `h1`\n\nThis is the skeleton every page you write from now on starts with. Type it rather than pasting it — you want it in your fingers.",
    "<!-- the full skeleton: doctype, html, head, body -->\n",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Portfolio</title>\n</head>\n<body>\n  <h1>My Portfolio</h1>\n</body>\n</html>\n",
    [
      { find: "html", attr: "lang", equals: "en", says: "<html> carries lang=\"en\"" },
      { find: "head meta[charset]", exists: true, says: "a charset <meta> inside <head>" },
      { find: "head title", text: true, contains: "My Portfolio", says: "<title> in the head reads \"My Portfolio\"" },
      { find: "body h1", exists: true, says: "an <h1> inside <body>" },
    ],
    [
      "Start with `<!DOCTYPE html>` on its own line.",
      "`lang` is an attribute on the `html` tag: `<html lang=\"en\">`.",
      "`meta` and `title` go inside `head`; the `h1` goes inside `body`.",
    ],
    "html,structure"),

  P("html-document-structure", 604, "html-fix-placement", "Nothing Is Showing", "Medium",
    "This page renders **completely blank**, though the tab title is right.\n\nThe content is all there — it is in the wrong half of the document. Move what belongs on screen into the part of the page that gets drawn, and leave the rest where it is.\n\nDo not delete anything.",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>About Me</title>\n  <h1>About Me</h1>\n  <p>I am learning to build websites.</p>\n</head>\n<body>\n</body>\n</html>\n",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>About Me</title>\n</head>\n<body>\n  <h1>About Me</h1>\n  <p>I am learning to build websites.</p>\n</body>\n</html>\n",
    [
      { find: "body h1", exists: true, says: "the <h1> is inside <body>" },
      { find: "body p", exists: true, says: "the paragraph is inside <body>" },
      { find: "head title", text: true, contains: "About Me", says: "<title> is still in the head" },
      { find: "head meta[charset]", exists: true, says: "the charset <meta> is still in the head" },
      { find: "head h1", count: 0, says: "no heading left in the head" },
    ],
    [
      "Nothing inside `head` is ever drawn — that is what the element means.",
      "The `h1` and the `p` belong in `body`.",
      "`title` and `meta` are page information and stay in `head`.",
    ],
    "html,structure,debugging"),

  /* --------------------------------------- html-elements-attributes ---- */
  P("html-elements-attributes", 605, "html-link-and-image", "A Link and an Image", "Easy",
    "Add two things to this page:\n\n- a link to `https://developer.mozilla.org` with the text `MDN Web Docs`\n- an image with `src` of `photo.jpg` and alt text describing it\n\nThe image file does not exist, so the preview will show a broken-image icon and your alt text. That is exactly what a real visitor sees on a slow connection — which is why the alt text is part of the exercise and not an extra.",
    "<h1>Useful Links</h1>\n\n<!-- add a link and an image below -->\n",
    "<h1>Useful Links</h1>\n<a href=\"https://developer.mozilla.org\">MDN Web Docs</a>\n<img src=\"photo.jpg\" alt=\"A photo of my desk\">\n",
    [
      { find: "a", attr: "href", equals: "https://developer.mozilla.org", says: "a link pointing at developer.mozilla.org" },
      { find: "a", text: true, contains: "MDN Web Docs", says: "the link text reads \"MDN Web Docs\"" },
      { find: "img", attr: "src", equals: "photo.jpg", says: "an image with src=\"photo.jpg\"" },
      { find: "img", attr: "alt", notEmpty: true, says: "the image has alt text that is not blank" },
    ],
    [
      "A link is `<a href=\"...\">text</a>` — the destination is an attribute, the text is the content.",
      "`img` is empty: `<img src=\"...\" alt=\"...\">` with no closing tag.",
      "Alt text should describe the image, not say \"image\".",
    ],
    "html,attributes,links"),

  /* NOTE FOR ANYONE ADDING PROBLEMS HERE.
   *
   * A DOM assertion cannot see crossed nesting, a missing closing tag, or a
   * stray `</img>`. The parser silently repairs all three before the grader
   * ever runs, so a problem built around them grades as already-solved. The
   * first version of this exercise promised four bugs and could only detect
   * one — the unquoted attribute.
   *
   * So: only set an exercise on something that changes the parsed tree.
   * Wrong element, missing attribute, wrong attribute value, wrong nesting
   * ORDER between different elements — those are all visible. "Tidy up the
   * markup" is not, however much it looks like an exercise. */
  P("html-elements-attributes", 606, "html-fix-attributes", "Three Broken Attributes", "Medium",
    "This product card has three attribute problems. Every tag is spelled correctly and every one is closed — the markup is valid and the page is still wrong.\n\n- the link goes nowhere\n- the image's `src` was written unquoted and contains a space, so it lost half its value\n- the image has no alt text, so anyone who cannot see it is told nothing\n\nFix all three. Point the link at `https://example.com/product`, and make `src` read `blue shirt.jpg` in full.",
    "<h2>Blue Shirt</h2>\n<img src=blue shirt.jpg>\n<a>Buy now</a>\n",
    "<h2>Blue Shirt</h2>\n<img src=\"blue shirt.jpg\" alt=\"A blue cotton shirt\">\n<a href=\"https://example.com/product\">Buy now</a>\n",
    [
      { find: "a", attr: "href", equals: "https://example.com/product", says: "the link points at the product page" },
      { find: "a", text: true, contains: "Buy now", says: "the link still reads \"Buy now\"" },
      { find: "img", attr: "src", equals: "blue shirt.jpg", says: "src is quoted and keeps the whole filename" },
      { find: "img", attr: "alt", notEmpty: true, says: "the image has alt text describing it" },
      { find: "h2", text: true, contains: "Blue Shirt", says: "the heading is unchanged" },
    ],
    [
      "A link with no `href` is not a link — it is text the browser draws like one.",
      "An unquoted value ends at the first space, so `src=blue shirt.jpg` reads as `src=\"blue\"`.",
      "Alt text should describe what the image shows, not say the word \"image\".",
    ],
    "html,attributes,debugging"),

  /* ------------------------------------ html-headings-paragraphs ---- */
  P("html-headings-paragraphs", 607, "html-outline", "Give It an Outline", "Easy",
    "Turn this flat page into a structured one.\n\n`Study Notes` is the page title. `Biology` and `Chemistry` are its two sections, and `Cell Structure` is a subsection under Biology.\n\nUse the right heading level for each — and do not skip a level on the way down. Leave the two body lines as paragraphs.",
    "<p>Study Notes</p>\n<p>Biology</p>\n<p>Cell Structure</p>\n<p>Every cell has a membrane.</p>\n<p>Chemistry</p>\n<p>Atoms bond to form molecules.</p>\n",
    "<h1>Study Notes</h1>\n<h2>Biology</h2>\n<h3>Cell Structure</h3>\n<p>Every cell has a membrane.</p>\n<h2>Chemistry</h2>\n<p>Atoms bond to form molecules.</p>\n",
    [
      { find: "h1", count: 1, says: "exactly one <h1> for the page title" },
      { find: "h1", text: true, contains: "Study Notes", says: "the <h1> is \"Study Notes\"" },
      { find: "h2", count: 2, says: "two <h2> sections" },
      { find: "h3", count: 1, says: "one <h3> subsection under Biology" },
      { find: "h3", text: true, contains: "Cell Structure", says: "the <h3> is \"Cell Structure\"" },
      { find: "p", count: 2, says: "only the two body lines remain as <p>" },
    ],
    [
      "One h1 per page — it answers \"what is this page about\".",
      "Biology and Chemistry sit at the same level, so they take the same tag.",
      "Cell Structure is inside Biology, so it goes one level deeper — h3, not h4.",
    ],
    "html,text,semantics"),

  /* Added later than the rest of Module 3: this lesson was the only one in the
   * course sitting on a single problem, which is below the bar `npm run
   * syllabus` enforces (two, for FULL standard). Caught by counting problems
   * per lesson rather than by reading. */
  P("html-headings-paragraphs", 636, "html-spacing-not-breaks", "Spacing Is Not a Line Break", "Medium",
    "This page has the two commonest heading-and-paragraph mistakes at once:\n\n- **two `h1` elements** — two answers to \"what is this page about\", which is none. `Study Notes` is the page; `Biology` is a section under it\n- **empty `<br>` tags used to push things apart**. Paragraphs already carry their own spacing, and each of those breaks tells everything reading the page that there is a meaningful line break there\n\nFix both: one `h1`, `Biology` becomes an `h2`, and every `<br>` goes. The two body lines stay as paragraphs, and no words change.",
    "<h1>Study Notes</h1>\n<br><br>\n<h1>Biology</h1>\n<p>Every cell has a membrane.</p>\n<br><br>\n<p>Mitochondria release energy.</p>\n",
    "<h1>Study Notes</h1>\n<h2>Biology</h2>\n<p>Every cell has a membrane.</p>\n<p>Mitochondria release energy.</p>\n",
    [
      { find: "h1", count: 1, says: "exactly one <h1> — the page has one subject" },
      { find: "h1", text: true, contains: "Study Notes", says: "and it is \"Study Notes\"" },
      { find: "h2", count: 1, says: "\"Biology\" is now an <h2> section under it" },
      { find: "h2", text: true, contains: "Biology", says: "with its wording unchanged" },
      { find: "br", count: 0, says: "no <br> left — paragraphs bring their own spacing" },
      { find: "p", count: 2, says: "the two body lines are still paragraphs" },
    ],
    [
      "One `h1` per page. Biology sits under Study Notes, so it is one level down.",
      "`<br>` is for a break that belongs to the text — an address, a verse — never for a gap.",
      "Deleting the breaks changes nothing visible, because `<p>` already has space above and below it.",
    ],
    "html,text,semantics"),

  /* ------------------------------------------ html-text-meaning ---- */
  P("html-text-meaning", 608, "html-emphasis", "Mean What You Mark", "Medium",
    "This safety notice is styled by hand and says nothing to anything that is not a pair of eyes.\n\nRewrite it so the markup carries the meaning:\n\n- `Do not` is genuinely important — use the element that says so\n- `Cell Structure` here is a **term being introduced**, not something important — use the element for that\n- the deadline `2026-09-01` should be machine-readable, shown as `1 September`\n\nKeep all the visible words the same.",
    "<p><span style=\"font-weight:bold\">Do not</span> submit after\n<span style=\"font-style:italic\">Cell Structure</span> closes on 1 September.</p>\n",
    "<p><strong>Do not</strong> submit after\n<i>Cell Structure</i> closes on <time datetime=\"2026-09-01\">1 September</time>.</p>\n",
    [
      { find: "strong", text: true, contains: "Do not", says: "\"Do not\" is marked with <strong>" },
      { find: "i", text: true, contains: "Cell Structure", says: "\"Cell Structure\" is marked with <i> as a term" },
      { find: "time", attr: "datetime", equals: "2026-09-01", says: "<time> carries datetime=\"2026-09-01\"" },
      { find: "time", text: true, contains: "1 September", says: "the visible date still reads \"1 September\"" },
      { find: "span[style]", count: 0, says: "no hand-styled <span> left" },
    ],
    [
      "`strong` means important. `b` only means bold.",
      "A term being introduced is `i`, not `em` — `em` is stress you would hear.",
      "`<time datetime=\"2026-09-01\">1 September</time>` — machine form in the attribute, human form in the text.",
    ],
    "html,text,semantics"),

  P("html-text-meaning", 609, "html-code-block", "Show Some Code", "Medium",
    "Write a short page documenting a shortcut:\n\n- an `h2` reading `Saving your work`\n- a paragraph telling the reader to press **Ctrl** and **S** — each key marked as a keyboard key, separately\n- a code block showing these two lines exactly, with the indentation preserved:\n\n```\nfunction save() {\n  return true;\n}\n```\n\nRemember which pair of elements a code block needs.",
    "<h2>Saving your work</h2>\n\n<!-- a paragraph with two <kbd> keys, then a code block -->\n",
    "<h2>Saving your work</h2>\n<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>\n<pre><code>function save() {\n  return true;\n}</code></pre>\n",
    [
      { find: "h2", text: true, contains: "Saving your work", says: "an <h2> reading \"Saving your work\"" },
      { find: "kbd", count: 2, says: "two <kbd> elements — one per key" },
      { find: "pre code", exists: true, says: "a <code> inside a <pre> for the code block" },
      { find: "pre code", text: true, contains: "function save()", says: "the code block contains the function" },
      { find: "pre code", text: true, contains: "return true", says: "the second line is there too" },
    ],
    [
      "Mark each key on its own: `<kbd>Ctrl</kbd> + <kbd>S</kbd>`.",
      "A code block needs both: `pre` keeps the shape, `code` says what it is.",
      "Do not indent the lines inside `pre` to match your HTML — that indentation would show on screen.",
    ],
    "html,text,code"),

  /* ------------------------------------------------- html-links ---- */
  P("html-links", 610, "html-nav-links", "Wire the Site Together", "Easy",
    "This is the home page of a three-page site. The other two files — `about.html` and `contact.html` — sit in the **same folder**, and nothing links to them yet.\n\nAdd three links to the paragraph area:\n\n- one to `about.html`, reading `About`\n- one to `contact.html`, reading `Contact`\n- one to `https://developer.mozilla.org`, reading `MDN`\n\nUse a relative path for your own pages and the full URL for the external one — that split is the whole point of the exercise.",
    "<h1>My Site</h1>\n<p>Welcome. There is an about page and a contact page, but no way to reach them.</p>\n\n<!-- add the three links below -->\n",
    "<h1>My Site</h1>\n<p>Welcome. There is an about page and a contact page, but no way to reach them.</p>\n\n<a href=\"about.html\">About</a>\n<a href=\"contact.html\">Contact</a>\n<a href=\"https://developer.mozilla.org\">MDN</a>\n",
    [
      { find: "a", attr: "href", equals: "about.html", says: "a relative link to about.html" },
      { find: "a", attr: "href", equals: "contact.html", says: "a relative link to contact.html" },
      { find: "a", attr: "href", equals: "https://developer.mozilla.org", says: "an absolute link to developer.mozilla.org, scheme included" },
      { find: "a", text: true, contains: "About", says: "one link reads \"About\"" },
      { find: "a", text: true, contains: "MDN", says: "the external link reads \"MDN\"" },
    ],
    [
      "A file in the same folder needs only its name: `href=\"about.html\"`.",
      "The external link needs the whole address, `https://` included — without a scheme it becomes a relative path.",
      "Each link is `<a href=\"...\">text</a>` — destination in the attribute, words in the content.",
    ],
    "html,links,paths"),

  P("html-links", 611, "html-fix-the-address", "Three Links, Three Wrong Addresses", "Medium",
    "Every link on this page is broken, and each one differently:\n\n- the Wikipedia link has no scheme, so the browser treats it as a **relative path** and 404s on this site\n- the About link is a **disk path from the author's own computer** — it cannot work for any visitor; the file is just `about.html`, next to this page\n- the Contact link has **no destination at all**, so it is not a link — it should go to `contact.html`\n\nFix all three. The link text is already right — only the addresses are wrong.",
    "<h2>Footer</h2>\n<a href=\"www.wikipedia.org\">Wikipedia</a>\n<a href=\"C:\\Users\\ravi\\site\\about.html\">About</a>\n<a>Contact</a>\n",
    "<h2>Footer</h2>\n<a href=\"https://www.wikipedia.org\">Wikipedia</a>\n<a href=\"about.html\">About</a>\n<a href=\"contact.html\">Contact</a>\n",
    [
      { find: "a", attr: "href", equals: "https://www.wikipedia.org", says: "the Wikipedia link carries its scheme" },
      { find: "a", attr: "href", equals: "about.html", says: "the About link is a relative path to about.html" },
      { find: "a", attr: "href", equals: "contact.html", says: "the Contact link now has a destination" },
      { find: "a[href]", count: 3, says: "all three anchors have an href" },
      { find: "h2", text: true, contains: "Footer", says: "the heading is unchanged" },
    ],
    [
      "No scheme means relative — `www.wikipedia.org` needs `https://` in front to be an external link.",
      "A `C:\\` path exists on one computer in the world. The page and about.html share a folder, so the file name alone is the address.",
      "An `<a>` without `href` is not a link at all — add `href=\"contact.html\"`.",
    ],
    "html,links,debugging"),

  /* ------------------------------------------ html-link-targets ---- */
  P("html-link-targets", 612, "html-toc", "A Table of Contents", "Easy",
    "This guide has two long sections and no way to jump to them.\n\n- give the `Setup` heading an id of `setup`, and the `FAQ` heading an id of `faq`\n- at the top, where the comment is, add two fragment links — `Setup` and `FAQ` — that jump to them\n\nRemember the case rule: fragments match ids exactly, so keep everything lowercase.",
    "<h1>The Guide</h1>\n<!-- the two jump links go here -->\n\n<h2>Setup</h2>\n<p>Imagine several screens of text here.</p>\n\n<h2>FAQ</h2>\n<p>And several more here.</p>\n",
    "<h1>The Guide</h1>\n<a href=\"#setup\">Setup</a>\n<a href=\"#faq\">FAQ</a>\n\n<h2 id=\"setup\">Setup</h2>\n<p>Imagine several screens of text here.</p>\n\n<h2 id=\"faq\">FAQ</h2>\n<p>And several more here.</p>\n",
    [
      { find: "h2#setup", exists: true, says: "the Setup heading carries id=\"setup\"" },
      { find: "h2#faq", exists: true, says: "the FAQ heading carries id=\"faq\"" },
      { find: "a[href=\"#setup\"]", exists: true, says: "a link jumping to #setup" },
      { find: "a[href=\"#faq\"]", exists: true, says: "a link jumping to #faq" },
      { find: "a", text: true, contains: "Setup", says: "the first jump link reads \"Setup\"" },
    ],
    [
      "The id goes on the heading itself: `<h2 id=\"setup\">Setup</h2>`.",
      "A fragment link is an anchor whose href starts with #: `<a href=\"#setup\">Setup</a>`.",
      "The `#` appears in the link, never in the id.",
    ],
    "html,links,fragments"),

  P("html-link-targets", 613, "html-link-manners", "Links, Behaving Properly", "Medium",
    "This page has two problems a visitor would actually feel:\n\n- the guide link says `here` — meaningless in a screen reader's links list, so move the anchor onto the words `the guide`. It leaves this site, so make it open in a **new tab**, with the attribute that politely goes along with that\n- the email address is plain text — turn it into a link that opens the visitor's mail program addressed to `hi@example.com`\n\nKeep every visible word on the page the same.",
    "<p>Click <a href=\"https://example.com/guide\">here</a> to read the guide.</p>\n<p>Questions? Email hi@example.com any time.</p>\n",
    "<p>Click here to read <a href=\"https://example.com/guide\" target=\"_blank\" rel=\"noopener\">the guide</a>.</p>\n<p>Questions? Email <a href=\"mailto:hi@example.com\">hi@example.com</a> any time.</p>\n",
    [
      { find: "a[href=\"https://example.com/guide\"]", text: true, contains: "guide", says: "the link text names the destination — it contains \"guide\"" },
      { find: "a[href=\"https://example.com/guide\"]", attr: "target", equals: "_blank", says: "the external link opens in a new tab" },
      { find: "a[href=\"https://example.com/guide\"]", attr: "rel", contains: "noopener", says: "rel=\"noopener\" rides along with target=\"_blank\"" },
      { find: "a", attr: "href", equals: "mailto:hi@example.com", says: "the email address is a mailto: link" },
      { find: "a", text: true, contains: "hi@example.com", says: "the visible address is the link's text" },
    ],
    [
      "Move the anchor, not the words: wrap `the guide` instead of `here`.",
      "`target=\"_blank\"` opens a new tab; `rel=\"noopener\"` belongs beside it.",
      "A mail link is a scheme, like https: `<a href=\"mailto:hi@example.com\">hi@example.com</a>`.",
    ],
    "html,links,accessibility"),

  /* ------------------------------------------------ html-images ---- */
  P("html-images", 614, "html-first-image", "A Real Picture, Rendered", "Easy",
    "The practice area ships its own image folder at `/img-lab/` — so this time the picture will genuinely appear in the preview.\n\nAdd two images under the heading:\n\n- the cat, from `/img-lab/cat.svg`, with alt text that mentions the **cat** and describes what you see\n- below it, the decorative divider from `/img-lab/divider.svg` — decoration a screen reader should skip, so give it the alt value the lesson taught for exactly that\n\nWatch the preview as you type the paths: the moment each one is right, the picture appears.",
    "<h2>Meet Mochi</h2>\n<p>The office cat reviews every page before it ships.</p>\n\n<!-- the cat, then the divider -->\n",
    "<h2>Meet Mochi</h2>\n<p>The office cat reviews every page before it ships.</p>\n\n<img src=\"/img-lab/cat.svg\" alt=\"A grey cat curled up asleep\">\n<img src=\"/img-lab/divider.svg\" alt=\"\">\n",
    [
      { find: "img[src=\"/img-lab/cat.svg\"]", exists: true, says: "the cat image, src exactly /img-lab/cat.svg" },
      { find: "img[src=\"/img-lab/cat.svg\"]", attr: "alt", contains: "cat", says: "the cat's alt text describes it — it mentions the cat" },
      { find: "img[src=\"/img-lab/divider.svg\"]", exists: true, says: "the divider image, from /img-lab/divider.svg" },
      { find: "img[src=\"/img-lab/divider.svg\"][alt=\"\"]", exists: true, says: "the divider's alt is present and empty — decoration, deliberately skipped" },
      { find: "h2", text: true, contains: "Meet Mochi", says: "the heading is unchanged" },
    ],
    [
      "An image is `<img src=\"...\" alt=\"...\">` — empty element, no closing tag.",
      "The paths start with `/` — the root-relative form from the links lesson.",
      "Decorative images get `alt=\"\"` — the attribute present, the value empty. That is different from leaving alt off.",
    ],
    "html,images,accessibility"),

  P("html-images", 615, "html-fix-the-image", "Broken on Every Machine but Yours", "Medium",
    "This page has two image problems, and the preview shows you both:\n\n- the cat is a **broken icon** — its path was written with capital letters, and this server (like almost every real one) is case-sensitive. The file is `/img-lab/cat.svg`, all lowercase. It also has **no alt at all**, so while it is broken, a visitor is told nothing\n- the divider has alt text that a screen reader would read out — `\"decorative divider graphic\"` — which is noise. It is pure decoration; give it the empty alt that says so\n\nFix both. The moment the cat's path is right, it appears.",
    "<h2>My Cat</h2>\n<img src=\"/img-lab/CAT.svg\">\n<p>She sleeps eighteen hours a day.</p>\n<img src=\"/img-lab/divider.svg\" alt=\"decorative divider graphic\">\n",
    "<h2>My Cat</h2>\n<img src=\"/img-lab/cat.svg\" alt=\"A grey cat curled up asleep\">\n<p>She sleeps eighteen hours a day.</p>\n<img src=\"/img-lab/divider.svg\" alt=\"\">\n",
    [
      { find: "img[src=\"/img-lab/cat.svg\"]", exists: true, says: "the cat's src is exactly /img-lab/cat.svg — lowercase, as the file is named" },
      { find: "img[src=\"/img-lab/cat.svg\"]", attr: "alt", contains: "cat", says: "the cat now has alt text describing it" },
      { find: "img[src=\"/img-lab/divider.svg\"][alt=\"\"]", exists: true, says: "the divider's alt is empty — decoration, skipped aloud" },
      { find: "img", count: 2, says: "still exactly two images" },
      { find: "p", text: true, contains: "eighteen hours", says: "the paragraph is unchanged" },
    ],
    [
      "Case matters on servers: `CAT.svg` and `cat.svg` are different files everywhere except Windows.",
      "A missing alt is worse than an empty one — screen readers may read the filename aloud. Describe the cat.",
      "Decoration gets `alt=\"\"` — present, empty, deliberate.",
    ],
    "html,images,debugging"),

  /* ----------------------------------------- html-image-figures ---- */
  P("html-image-figures", 616, "html-figure", "A Figure With Its Caption", "Easy",
    "The sunset photo at `/img-lab/photo.png` needs a caption that stays attached to it.\n\nBuild a **figure**:\n\n- the image inside it, with alt text that mentions the **sun** or the **sea** — what the picture shows\n- a **figcaption** reading `Sunset from the harbour wall` — why it is here\n\nRemember these are two different jobs: the alt describes, the caption comments. Do not write the same words in both.",
    "<h2>From the Photo Diary</h2>\n\n<!-- a figure: the photo, then its caption -->\n",
    "<h2>From the Photo Diary</h2>\n\n<figure>\n  <img src=\"/img-lab/photo.png\" alt=\"The sun low over a dark sea\">\n  <figcaption>Sunset from the harbour wall</figcaption>\n</figure>\n",
    [
      { find: "figure img", exists: true, says: "an image inside a <figure>" },
      { find: "figure img", attr: "src", equals: "/img-lab/photo.png", says: "the image is the sunset photo from /img-lab/" },
      { find: "figure img", attr: "alt", notEmpty: true, says: "the image has alt text of its own" },
      { find: "figure figcaption", text: true, contains: "harbour wall", says: "the caption reads \"Sunset from the harbour wall\", inside the figure" },
    ],
    [
      "The wrapper is `<figure> ... </figure>`; both the image and the caption live inside it.",
      "The caption element is `<figcaption>`, not a paragraph.",
      "Alt says what the picture shows; the caption says why it is on the page.",
    ],
    "html,images,semantics"),

  P("html-image-figures", 617, "html-image-manners", "Stop the Page Jumping", "Medium",
    "This article loads, then lurches — neither image declares its size, so the text moves twice as they arrive. And both images load immediately, though the sunset sits several screens down.\n\nFix three things:\n\n- the banner is `640 × 160` — declare its `width` and `height`\n- the photo is `320 × 200` — declare its too\n- the photo is far below the first screen, so give it `loading=\"lazy\"` — and leave the banner alone: it is the first thing a visitor sees, and the hero image must never wait\n\nThe numbers are the files' real pixels — that is always where they come from.",
    "<img src=\"/img-lab/banner.svg\" alt=\"The Practice Site banner\">\n<p>Imagine several screens of article here.</p>\n<img src=\"/img-lab/photo.png\" alt=\"Sunset over a dark sea\">\n",
    "<img src=\"/img-lab/banner.svg\" alt=\"The Practice Site banner\" width=\"640\" height=\"160\">\n<p>Imagine several screens of article here.</p>\n<img src=\"/img-lab/photo.png\" alt=\"Sunset over a dark sea\" width=\"320\" height=\"200\" loading=\"lazy\">\n",
    [
      { find: "img[src=\"/img-lab/banner.svg\"]", attr: "width", equals: "640", says: "the banner declares width=\"640\"" },
      { find: "img[src=\"/img-lab/banner.svg\"]", attr: "height", equals: "160", says: "the banner declares height=\"160\"" },
      { find: "img[src=\"/img-lab/photo.png\"]", attr: "width", equals: "320", says: "the photo declares width=\"320\"" },
      { find: "img[src=\"/img-lab/photo.png\"]", attr: "height", equals: "200", says: "the photo declares height=\"200\"" },
      { find: "img[src=\"/img-lab/photo.png\"]", attr: "loading", equals: "lazy", says: "the photo, far below the fold, is lazy" },
      { find: "img[src=\"/img-lab/banner.svg\"][loading=\"lazy\"]", count: 0, says: "the banner — the hero — is NOT lazy" },
    ],
    [
      "Bare numbers, no units: `width=\"640\" height=\"160\"`.",
      "The values are the file's true pixels — wrong numbers reserve the wrong shape and the page jumps anyway.",
      "`loading=\"lazy\"` goes on the below-the-fold photo only. The banner loads normally.",
    ],
    "html,images,performance"),

  /* ------------------------------------------------- html-lists ---- */
  P("html-lists", 618, "html-two-lists", "One of Each", "Easy",
    "A recipe page needs both kinds of list.\n\n- under `What to buy`, an **unordered** list of exactly three ingredients — buying them in any order changes nothing\n- under `How to cook it`, an **ordered** list of exactly three steps — doing those in any order changes dinner\n\nThe words are yours. What is being graded is that you picked the right container for each, and that the items are list items rather than anything else.",
    "<h3>What to buy</h3>\n<!-- the shopping list -->\n\n<h3>How to cook it</h3>\n<!-- the steps -->\n",
    "<h3>What to buy</h3>\n<ul>\n  <li>Onions</li>\n  <li>Rice</li>\n  <li>Yoghurt</li>\n</ul>\n\n<h3>How to cook it</h3>\n<ol>\n  <li>Heat the oil</li>\n  <li>Add the onions</li>\n  <li>Add the rice and water</li>\n</ol>\n",
    [
      { find: "ul", count: 1, says: "one unordered list for the shopping" },
      { find: "ul > li", count: 3, says: "three items in it" },
      { find: "ol", count: 1, says: "one ordered list for the steps" },
      { find: "ol > li", count: 3, says: "three steps in it" },
      { find: "li", text: true, notEmpty: true, says: "the items are not empty" },
    ],
    [
      "`<ul>` when reordering the items loses nothing; `<ol>` when it does.",
      "Every item is `<li>text</li>` — the only element allowed directly inside a list.",
      "Three items in each. Close each `<li>`.",
    ],
    "html,lists"),

  P("html-lists", 619, "html-fix-nesting", "The Sub-List That Belongs to Nothing", "Medium",
    "This list looks right on screen — Mangoes and Bananas are indented under Fruit. The structure underneath is wrong, and a screen reader announces the outer list as having **two** items with the fruits belonging to neither.\n\nThe inner `<ul>` is a **sibling** of the list items instead of living inside one. Move the `</li>` so that Fruit is not finished until everything belonging to Fruit has been written.\n\nDo not change any of the words. This is the one markup-tidying bug that genuinely changes the parsed page — most do not, which is why the preview looks unchanged when you fix it.",
    "<h3>Shopping</h3>\n<ul>\n  <li>Fruit</li>\n  <ul>\n    <li>Mangoes</li>\n    <li>Bananas</li>\n  </ul>\n  <li>Vegetables</li>\n</ul>\n",
    "<h3>Shopping</h3>\n<ul>\n  <li>Fruit\n    <ul>\n      <li>Mangoes</li>\n      <li>Bananas</li>\n    </ul>\n  </li>\n  <li>Vegetables</li>\n</ul>\n",
    [
      { find: "li ul", exists: true, says: "the inner list is inside a list item" },
      { find: "ul > ul", count: 0, says: "no list is a direct child of another list" },
      { find: "li ul > li", count: 2, says: "Mangoes and Bananas are items of the inner list" },
      { find: "ul > li", count: 4, says: "four list items in total — two outer, two inner" },
      { find: "li", text: true, contains: "Mangoes", says: "the words are unchanged" },
    ],
    [
      "Only `<li>` may sit directly inside a `<ul>`. The inner list currently is not inside one.",
      "Move `</li>` from after the word Fruit to after the inner `</ul>`.",
      "The item is not finished until everything belonging to it has been written.",
    ],
    "html,lists,debugging"),

  /* ------------------------------------- html-description-lists ---- */
  P("html-description-lists", 620, "html-spec-list", "A Spec Sheet", "Easy",
    "Write a phone's specifications as a **description list** — pairs of a name and its value, which is neither a table nor prose.\n\nThree pairs, exactly these:\n\n- `Screen` → `6.1 inches`\n- `Battery` → `3200 mAh`\n- `Weight` → `174 g`\n\nRemember the pairing is by order: every description belongs to the term above it.",
    "<h3>Specifications</h3>\n\n<!-- a dl with three term-and-description pairs -->\n",
    "<h3>Specifications</h3>\n\n<dl>\n  <dt>Screen</dt>\n  <dd>6.1 inches</dd>\n\n  <dt>Battery</dt>\n  <dd>3200 mAh</dd>\n\n  <dt>Weight</dt>\n  <dd>174 g</dd>\n</dl>\n",
    [
      { find: "dl", count: 1, says: "one description list" },
      { find: "dl > dt", count: 3, says: "three terms" },
      { find: "dl > dd", count: 3, says: "three descriptions" },
      { find: "dt", text: true, contains: "Battery", says: "one of the terms is \"Battery\"" },
      { find: "dd", text: true, contains: "3200 mAh", says: "its description reads \"3200 mAh\"" },
    ],
    [
      "The container is `<dl>`; inside it, `<dt>` for the name and `<dd>` for the value.",
      "Term first, then its description — the pairing is by order, not by wrapping.",
      "Three of each, alternating.",
    ],
    "html,lists,semantics"),

  P("html-description-lists", 621, "html-nav-list", "A Menu That Says It Is One", "Medium",
    "This navigation is three loose links separated by pipe characters. On screen it reads as a menu; to a screen reader it is three unrelated links with no count, no grouping and no way to skip past.\n\nRebuild it as an **unordered list** — one `<li>` per link, with the anchor **inside** the item.\n\nKeep the same three destinations (`index.html`, `about.html`, `contact.html`) and the same words. Drop the `|` characters: the list does the separating now, and CSS decides how it looks.",
    "<h3>My Site</h3>\n<p>\n  <a href=\"index.html\">Home</a> |\n  <a href=\"about.html\">About</a> |\n  <a href=\"contact.html\">Contact</a>\n</p>\n",
    "<h3>My Site</h3>\n<ul>\n  <li><a href=\"index.html\">Home</a></li>\n  <li><a href=\"about.html\">About</a></li>\n  <li><a href=\"contact.html\">Contact</a></li>\n</ul>\n",
    [
      { find: "ul", count: 1, says: "the menu is an unordered list" },
      { find: "ul > li", count: 3, says: "three list items, one per link" },
      { find: "li > a", count: 3, says: "each anchor sits inside its list item" },
      { find: "li > a", attr: "href", equals: "about.html", says: "the About link kept its destination" },
      { find: "li a", text: true, contains: "Contact", says: "the words are unchanged" },
      { find: "p a", count: 0, says: "the links are no longer loose in a paragraph" },
    ],
    [
      "One `<li>` per menu entry: `<li><a href=\"index.html\">Home</a></li>`.",
      "The anchor goes inside the item, never the other way round.",
      "Delete the `|` characters — the list structure replaces them.",
    ],
    "html,lists,accessibility"),

  /* ------------------------------------------------ html-tables ----
   *
   * ⚠️ NEVER ASSERT ON AN IMPLICIT <tbody> IN A TABLE PROBLEM.
   *
   * The browser's DOMParser inserts a <tbody> around loose <tr>s. linkedom does
   * not. Grading runs in both — the workbench parses with DOMParser, db:check
   * and lib/verify.ts parse with linkedom — so a test written as `tbody tr`
   * against markup with no explicit <tbody> PASSES in the workbench and FAILS
   * when the student presses Submit. Verified in both engines before these
   * problems were written.
   *
   * So: NO TEST BELOW ASSERTS ON `tbody` AT ALL, even where the exercise tells
   * the student to write one. "Require it and check for it" is the tempting
   * middle ground and it is the broken one: a student who writes thead and
   * caption but forgets tbody gets `tbody td` = 2 from the browser (green,
   * "press Submit") and 0 from linkedom (rejected on submit). An assertion that
   * cannot be made consistently is better not made — the lesson still teaches
   * tbody, and `thead` IS safe to assert, because only tbody is auto-inserted.
   *
   * Everything here uses descendant selectors (`table tr`, `table td`) or
   * elements the parser never invents (`caption`, `thead`, `th[scope]`).
   * Engine parity for all four problems was checked by running every selector
   * through both engines and diffing the counts. */
  P("html-tables", 622, "html-first-table", "A Table Worth Reading Aloud", "Easy",
    "Build the results table properly — the structure, not just the grid.\n\nIt needs:\n\n- a `caption` reading `Term results`\n- a `thead` with one row of **three** header cells: `Name`, `Physics`, `Maths`, each with `scope=\"col\"`\n- a `tbody` with **two** rows, and in each one the student's name is a **row header** (`scope=\"row\"`) followed by two ordinary cells of marks\n\nUse Ravi (82, 91) and Meera (88, 79). The caption goes first — it is the table's title, and it must be the table's first child.",
    "<table>\n  <!-- caption, thead, tbody -->\n</table>\n",
    "<table>\n  <caption>Term results</caption>\n  <thead>\n    <tr>\n      <th scope=\"col\">Name</th>\n      <th scope=\"col\">Physics</th>\n      <th scope=\"col\">Maths</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope=\"row\">Ravi</th>\n      <td>82</td>\n      <td>91</td>\n    </tr>\n    <tr>\n      <th scope=\"row\">Meera</th>\n      <td>88</td>\n      <td>79</td>\n    </tr>\n  </tbody>\n</table>\n",
    [
      { find: "table > caption", text: true, contains: "Term results", says: "a <caption> reading \"Term results\", as the table's first child" },
      { find: "thead th[scope=\"col\"]", count: 3, says: "three column headers in <thead>, each with scope=\"col\"" },
      { find: "table tr", count: 3, says: "three rows in all — one of headers, two of results" },
      { find: "th[scope=\"row\"]", count: 2, says: "each result row starts with a row header — scope=\"row\"" },
      { find: "table td", count: 4, says: "four ordinary cells of marks" },
      { find: "th", text: true, contains: "Physics", says: "one of the column headers is \"Physics\"" },
    ],
    [
      "Order inside the table: `<caption>`, then `<thead>`, then `<tbody>`.",
      "A header cell is `<th>`; scope=\"col\" labels the column below, scope=\"row\" the row beside.",
      "The names are row headers, the marks are `<td>`.",
    ],
    "html,tables"),

  P("html-tables", 623, "html-fix-headers", "A Grid Nobody Can Read Aloud", "Medium",
    "This table lines up perfectly on screen and is unreadable to a screen reader: **every cell is a `<td>`**, so nothing in it is a label. The number 82 is announced as \"82\", with no column and no name attached.\n\nFix the structure without changing a single word:\n\n- the first row's cells are column labels — make them header cells with `scope=\"col\"`, and put that row in a `thead`\n- each person's name labels its own row — make it a header cell with `scope=\"row\"`\n- put the two data rows in a `tbody`\n- add a `caption` reading `Term results`\n\nThe page will barely change. That is the point: everything that was wrong was invisible.",
    "<table>\n  <tr>\n    <td>Name</td>\n    <td>Physics</td>\n  </tr>\n  <tr>\n    <td>Ravi</td>\n    <td>82</td>\n  </tr>\n  <tr>\n    <td>Meera</td>\n    <td>88</td>\n  </tr>\n</table>\n",
    "<table>\n  <caption>Term results</caption>\n  <thead>\n    <tr>\n      <th scope=\"col\">Name</th>\n      <th scope=\"col\">Physics</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope=\"row\">Ravi</th>\n      <td>82</td>\n    </tr>\n    <tr>\n      <th scope=\"row\">Meera</th>\n      <td>88</td>\n    </tr>\n  </tbody>\n</table>\n",
    [
      { find: "table > caption", text: true, contains: "Term results", says: "a caption titles the table" },
      { find: "thead th[scope=\"col\"]", count: 2, says: "two column headers in <thead> with scope=\"col\"" },
      { find: "th[scope=\"row\"]", count: 2, says: "each name is a row header with scope=\"row\"" },
      { find: "table td", count: 2, says: "only the two marks are left as ordinary cells" },
      { find: "th", text: true, contains: "Physics", says: "\"Physics\" is now a header, not a data cell" },
      { find: "td", text: true, contains: "82", says: "the marks are unchanged" },
    ],
    [
      "A label is `<th>`, a value is `<td>` — change both the opening and closing tag.",
      "`scope=\"col\"` on the top row, `scope=\"row\"` on each name.",
      "The caption must be the table's first child, before `<thead>`.",
    ],
    "html,tables,accessibility"),

  /* ------------------------------------------ html-table-layout ---- */
  P("html-table-layout", 624, "html-spanning", "Make the Cells Span", "Medium",
    "This three-column table has two problems, and both are arithmetic.\n\n- Ravi has two subjects and his name is written twice. Write it **once**, in the first row, and have it span **both** rows — then delete it from the second row, because that position is already filled\n- the note at the bottom sits in one narrow cell. It should span all **three** columns\n\nEvery row must still total three columns, counting a spanned cell as the number it spans. Do not change any words.",
    "<table>\n  <caption>Results by subject</caption>\n  <tr>\n    <th scope=\"row\">Ravi</th>\n    <td>Physics</td>\n    <td>82</td>\n  </tr>\n  <tr>\n    <th scope=\"row\">Ravi</th>\n    <td>Maths</td>\n    <td>91</td>\n  </tr>\n  <tr>\n    <td>Averages published Friday</td>\n  </tr>\n</table>\n",
    "<table>\n  <caption>Results by subject</caption>\n  <tr>\n    <th scope=\"row\" rowspan=\"2\">Ravi</th>\n    <td>Physics</td>\n    <td>82</td>\n  </tr>\n  <tr>\n    <td>Maths</td>\n    <td>91</td>\n  </tr>\n  <tr>\n    <td colspan=\"3\">Averages published Friday</td>\n  </tr>\n</table>\n",
    [
      { find: "th[rowspan=\"2\"]", count: 1, says: "one row header spanning two rows" },
      { find: "th[rowspan=\"2\"]", text: true, contains: "Ravi", says: "the spanning header is Ravi's name" },
      { find: "th", count: 1, says: "the name is written once, not twice" },
      { find: "td[colspan=\"3\"]", count: 1, says: "the note spans all three columns" },
      { find: "td[colspan=\"3\"]", text: true, contains: "Averages published Friday", says: "the note's words are unchanged" },
      { find: "table td", count: 5, says: "five data cells left — two subjects, two marks, one note" },
    ],
    [
      "`rowspan=\"2\"` on Ravi's cell in the FIRST row, then delete the duplicate below.",
      "`colspan=\"3\"` on the note's cell.",
      "Both attributes count cells. After the fix every row is three columns wide.",
    ],
    "html,tables,layout"),

  P("html-table-layout", 625, "html-untable-layout", "Undo a 2003 Layout", "Medium",
    "This is how pages were built before CSS could place anything: a table holding content that has no rows or columns at all. It is a heading, a paragraph and an image — none of which is tabular data.\n\nRewrite it **without any table**. Keep exactly the same content:\n\n- the `About us` heading as an `h2`\n- the sentence as a `p`\n- the logo as an `img` with `src` `/img-lab/logo.svg` and alt text of `Home`\n\nNothing else changes. The page will look a little different, and every part of it will finally say what it is.",
    "<table>\n  <tr>\n    <td>\n      <h2>About us</h2>\n      <p>We have been building things since 2003.</p>\n    </td>\n    <td>\n      <img src=\"/img-lab/logo.svg\" alt=\"Home\">\n    </td>\n  </tr>\n</table>\n",
    "<h2>About us</h2>\n<p>We have been building things since 2003.</p>\n<img src=\"/img-lab/logo.svg\" alt=\"Home\">\n",
    [
      { find: "table", count: 0, says: "no table left — this was never tabular data" },
      { find: "td", count: 0, says: "and no table cells either" },
      { find: "h2", text: true, contains: "About us", says: "the heading is an <h2>" },
      { find: "p", text: true, contains: "since 2003", says: "the sentence is a paragraph" },
      { find: "img", attr: "src", equals: "/img-lab/logo.svg", says: "the logo is still there" },
      { find: "img", attr: "alt", equals: "Home", says: "its alt text still reads \"Home\"" },
    ],
    [
      "Delete the table, the row and both cells — keep everything that was inside them.",
      "The content already has the right elements: an h2, a p and an img.",
      "Positioning the logo beside the text is CSS's job, and not part of this exercise.",
    ],
    "html,tables,semantics"),

  /* ------------------------------------------------- html-forms ----
   *
   * Every selector below was checked in linkedom AND the browser's DOMParser
   * before these were written — including [required], [checked], `label > input`
   * and `select > option`, all 12 identical. Also confirmed in both: `type` and
   * `method` match case-INSENSITIVELY (the HTML spec's attribute list), while
   * `name`, `id` and `for` are case-sensitive. So a student writing TYPE="EMAIL"
   * passes either way, and one writing name="Email" for name="email" fails in
   * both — which is the correct behaviour in each case. */
  P("html-forms", 626, "html-first-form", "A Form That Actually Sends", "Easy",
    "Build a signup form that posts to `/signup`.\n\nIt needs:\n\n- a `form` with `action=\"/signup\"` and `method=\"post\"`\n- a text field for the username: label reading `Username`, `id` of `user`, `name` of `username`\n- an email field: label reading `Email`, `id` of `mail`, `name` of `email`, and `type=\"email\"`\n- a submit button reading `Create account`\n\nEach label must be attached to its field with `for` — and remember that `name` is the one that decides whether the value is sent at all.",
    "<form>\n  <!-- two labelled fields and a submit button -->\n</form>\n",
    "<form action=\"/signup\" method=\"post\">\n  <label for=\"user\">Username</label>\n  <input type=\"text\" id=\"user\" name=\"username\">\n\n  <label for=\"mail\">Email</label>\n  <input type=\"email\" id=\"mail\" name=\"email\">\n\n  <button type=\"submit\">Create account</button>\n</form>\n",
    [
      { find: "form", attr: "action", equals: "/signup", says: "the form posts to /signup" },
      { find: "form", attr: "method", equals: "post", says: "it uses method=\"post\"" },
      { find: "label[for=\"user\"]", text: true, contains: "Username", says: "a label reading \"Username\", attached with for=\"user\"" },
      { find: "input#user", attr: "name", equals: "username", says: "the username field carries name=\"username\"" },
      { find: "label[for=\"mail\"]", text: true, contains: "Email", says: "a label reading \"Email\", attached with for=\"mail\"" },
      { find: "input#mail[name=\"email\"]", attr: "type", equals: "email", says: "the email field is type=\"email\" with name=\"email\"" },
      { find: "button", text: true, contains: "Create account", says: "a button reading \"Create account\"" },
    ],
    [
      "`<form action=\"/signup\" method=\"post\">` — both attributes on the form itself.",
      "A label points at its field: `<label for=\"user\">` matches `<input id=\"user\">`.",
      "`id` is for the label; `name` is what the server receives. Both are needed.",
    ],
    "html,forms"),

  P("html-forms", 627, "html-form-not-sending", "Everything Works and Nothing Arrives", "Medium",
    "This login form looks and behaves perfectly. It has three real problems:\n\n- the **username never arrives** at the server, though the visitor filled it in — the field is missing the one attribute that decides whether a value is sent. It should be `name=\"username\"`\n- the **password label is attached to nothing** — its `for` does not match any field. The password input's `id` is `pw`\n- the form uses **`method=\"get\"`**, which puts the typed password in the URL, and from there into browser history, server logs and the referrer sent to the next site. It should post\n\nChange nothing else — the words, ids and action stay as they are.",
    "<form action=\"/login\" method=\"get\">\n  <label for=\"user\">Username</label>\n  <input type=\"text\" id=\"user\">\n\n  <label for=\"password\">Password</label>\n  <input type=\"password\" id=\"pw\" name=\"password\">\n\n  <button type=\"submit\">Log in</button>\n</form>\n",
    "<form action=\"/login\" method=\"post\">\n  <label for=\"user\">Username</label>\n  <input type=\"text\" id=\"user\" name=\"username\">\n\n  <label for=\"pw\">Password</label>\n  <input type=\"password\" id=\"pw\" name=\"password\">\n\n  <button type=\"submit\">Log in</button>\n</form>\n",
    [
      { find: "form", attr: "method", equals: "post", says: "the form posts rather than putting the password in the URL" },
      { find: "input#user", attr: "name", equals: "username", says: "the username field now has name=\"username\", so it is sent" },
      { find: "label[for=\"pw\"]", text: true, contains: "Password", says: "the password label points at the field's real id, pw" },
      { find: "label[for=\"password\"]", count: 0, says: "no label left pointing at an id that does not exist" },
      { find: "input#pw", attr: "type", equals: "password", says: "the password field is unchanged" },
      { find: "form", attr: "action", equals: "/login", says: "the action still reads /login" },
    ],
    [
      "A field with no `name` is not submitted at all — it is not even sent empty.",
      "`for` must match the field's `id` exactly. The input's id is `pw`.",
      "A password in a GET request ends up in the URL. Passwords post.",
    ],
    "html,forms,debugging"),

  /* ------------------------------------------- html-input-types ---- */
  P("html-input-types", 628, "html-right-types", "The Right Field for the Question", "Easy",
    "Every field on this booking form is `type=\"text\"`. On a phone that means a full QWERTY keyboard for all of them, and no help from the browser anywhere.\n\nGive each one the type that says what it is actually asking for:\n\n- `email` → an email address\n- `phone` → a phone number (the type that brings up a number pad and does **not** try to validate the format)\n- `guests` → a real quantity, so it takes `min` and `max`. Set `min=\"1\"` and `max=\"9\"`\n- `arrives` → a calendar date\n\nDo not touch the labels, ids or names.",
    "<form action=\"/book\" method=\"post\">\n  <label for=\"e\">Email</label>\n  <input type=\"text\" id=\"e\" name=\"email\">\n\n  <label for=\"p\">Phone</label>\n  <input type=\"text\" id=\"p\" name=\"phone\">\n\n  <label for=\"g\">Guests</label>\n  <input type=\"text\" id=\"g\" name=\"guests\">\n\n  <label for=\"a\">Arrival date</label>\n  <input type=\"text\" id=\"a\" name=\"arrives\">\n</form>\n",
    "<form action=\"/book\" method=\"post\">\n  <label for=\"e\">Email</label>\n  <input type=\"email\" id=\"e\" name=\"email\">\n\n  <label for=\"p\">Phone</label>\n  <input type=\"tel\" id=\"p\" name=\"phone\">\n\n  <label for=\"g\">Guests</label>\n  <input type=\"number\" id=\"g\" name=\"guests\" min=\"1\" max=\"9\">\n\n  <label for=\"a\">Arrival date</label>\n  <input type=\"date\" id=\"a\" name=\"arrives\">\n</form>\n",
    [
      { find: "input[name=\"email\"]", attr: "type", equals: "email", says: "the email field is type=\"email\"" },
      { find: "input[name=\"phone\"]", attr: "type", equals: "tel", says: "the phone field is type=\"tel\", not number" },
      { find: "input[name=\"guests\"]", attr: "type", equals: "number", says: "the guest count is type=\"number\"" },
      { find: "input[name=\"guests\"]", attr: "min", equals: "1", says: "guests has min=\"1\"" },
      { find: "input[name=\"guests\"]", attr: "max", equals: "9", says: "guests has max=\"9\"" },
      { find: "input[name=\"arrives\"]", attr: "type", equals: "date", says: "the arrival is type=\"date\"" },
      { find: "input[type=\"text\"]", count: 0, says: "no field is left as plain text" },
    ],
    [
      "A phone number is a string of digits, not a quantity — `tel`, never `number`.",
      "`number` is the one that takes `min` and `max`.",
      "The date field gets a calendar and submits YYYY-MM-DD.",
    ],
    "html,forms,inputs"),

  P("html-input-types", 629, "html-radio-group", "Three Sizes, All Selectable at Once", "Medium",
    "These three radio buttons should be one choice — pick a size — and instead all three can be selected together. They also submit nothing useful when they are.\n\nTwo fixes:\n\n- what makes radios **one group** is a shared `name`. Give all three `name=\"size\"`\n- a tick has nothing to submit but the fact that it was ticked, so each needs its own `value`: `s`, `m` and `l`\n\nThen make **Medium** the one that starts selected.\n\nThe visible words stay exactly as they are.",
    "<p>Size</p>\n<label><input type=\"radio\" name=\"small\"> Small</label>\n<label><input type=\"radio\" name=\"medium\"> Medium</label>\n<label><input type=\"radio\" name=\"large\"> Large</label>\n",
    "<p>Size</p>\n<label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n<label><input type=\"radio\" name=\"size\" value=\"m\" checked> Medium</label>\n<label><input type=\"radio\" name=\"size\" value=\"l\"> Large</label>\n",
    [
      { find: "input[name=\"size\"]", count: 3, says: "all three radios share name=\"size\" — that is what groups them" },
      { find: "input[name=\"size\"][value=\"s\"]", count: 1, says: "Small carries value=\"s\"" },
      { find: "input[name=\"size\"][value=\"m\"]", count: 1, says: "Medium carries value=\"m\"" },
      { find: "input[name=\"size\"][value=\"l\"]", count: 1, says: "Large carries value=\"l\"" },
      { find: "input[checked]", count: 1, says: "exactly one option starts selected" },
      { find: "input[checked]", attr: "value", equals: "m", says: "and the preselected one is Medium" },
      { find: "label > input", count: 3, says: "each radio is still inside its label" },
    ],
    [
      "Radios are grouped by a shared `name` — proximity in the markup does nothing.",
      "`value` is what identifies which option was chosen, since the name is shared.",
      "`checked` takes no value: it is either present or absent.",
    ],
    "html,forms,inputs"),

  /* -------------------------------------- html-form-validation ---- */
  P("html-form-validation", 630, "html-add-validation", "Let the Browser Check It", "Easy",
    "This form sends whatever it is given. Add the browser's own checks — no script, no library:\n\n- `username` must not be empty, and must be at least **3** characters: add `required` and `minlength=\"3\"`\n- `qty` must be between **1** and **10**: add `min` and `max`\n- `pin` must be exactly six digits: add `pattern=\"[0-9]{6}\"` and a `title` of `Six digits`\n\nThe `title` is not decoration — without it the browser can only say the format is wrong, which tells the visitor nothing about what would work.",
    "<form action=\"/order\" method=\"post\">\n  <label for=\"u\">Username</label>\n  <input type=\"text\" id=\"u\" name=\"username\">\n\n  <label for=\"q\">Quantity</label>\n  <input type=\"number\" id=\"q\" name=\"qty\">\n\n  <label for=\"pin\">PIN code</label>\n  <input type=\"text\" id=\"pin\" name=\"pin\">\n\n  <button type=\"submit\">Order</button>\n</form>\n",
    "<form action=\"/order\" method=\"post\">\n  <label for=\"u\">Username</label>\n  <input type=\"text\" id=\"u\" name=\"username\" required minlength=\"3\">\n\n  <label for=\"q\">Quantity</label>\n  <input type=\"number\" id=\"q\" name=\"qty\" min=\"1\" max=\"10\">\n\n  <label for=\"pin\">PIN code</label>\n  <input type=\"text\" id=\"pin\" name=\"pin\" pattern=\"[0-9]{6}\" title=\"Six digits\">\n\n  <button type=\"submit\">Order</button>\n</form>\n",
    [
      { find: "input[name=\"username\"][required]", count: 1, says: "the username is required" },
      { find: "input[name=\"username\"]", attr: "minlength", equals: "3", says: "and must be at least 3 characters" },
      { find: "input[name=\"qty\"]", attr: "min", equals: "1", says: "quantity has min=\"1\"" },
      { find: "input[name=\"qty\"]", attr: "max", equals: "10", says: "quantity has max=\"10\"" },
      { find: "input[name=\"pin\"]", attr: "pattern", equals: "[0-9]{6}", says: "the PIN has a six-digit pattern" },
      { find: "input[name=\"pin\"]", attr: "title", notEmpty: true, says: "and a title explaining what the pattern wants" },
    ],
    [
      "`required` and `checked` take no value — they are present or absent.",
      "`minlength` counts characters; `min`/`max` bound a number.",
      "`pattern` without `title` produces an error message that helps nobody.",
    ],
    "html,forms,validation"),

  P("html-form-validation", 631, "html-labels-and-groups", "Give It Back Its Labels", "Medium",
    "This form was tidied by deleting the labels and putting each field's name in a `placeholder`. It looks cleaner and is worse in four ways — the text vanishes on typing, it is too faint to read, screen readers announce the fields as unnamed, and there is nothing to click.\n\nTwo jobs:\n\n- give the email field a real `label` reading `Email`, attached with `for` to its id `e`. **Keep the placeholder**, but as what it is for: an example of the format\n- the two radios are one question and nothing says so. Wrap them in a `fieldset` whose `legend` reads `Size` — and the legend must be the fieldset's first child\n\nThe radios already share a name and have values. Leave them alone.",
    "<form action=\"/order\" method=\"post\">\n  <input type=\"email\" id=\"e\" name=\"email\" placeholder=\"Email\">\n\n  <label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n  <label><input type=\"radio\" name=\"size\" value=\"m\"> Medium</label>\n\n  <button type=\"submit\">Order</button>\n</form>\n",
    "<form action=\"/order\" method=\"post\">\n  <label for=\"e\">Email</label>\n  <input type=\"email\" id=\"e\" name=\"email\" placeholder=\"you@example.com\">\n\n  <fieldset>\n    <legend>Size</legend>\n    <label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n    <label><input type=\"radio\" name=\"size\" value=\"m\"> Medium</label>\n  </fieldset>\n\n  <button type=\"submit\">Order</button>\n</form>\n",
    [
      { find: "label[for=\"e\"]", text: true, contains: "Email", says: "a real label reading \"Email\", attached to the field" },
      { find: "input#e", attr: "placeholder", notEmpty: true, says: "the placeholder is still there — now showing an example, not the name" },
      { find: "fieldset > legend", text: true, contains: "Size", says: "a <legend> reading \"Size\", as the fieldset's first child" },
      { find: "fieldset input[name=\"size\"]", count: 2, says: "both radios are inside the fieldset" },
      { find: "fieldset input[value=\"m\"]", count: 1, says: "Medium kept its value" },
      { find: "button", text: true, contains: "Order", says: "the button is unchanged" },
    ],
    [
      "`<label for=\"e\">Email</label>` goes before the input; the id it points at is `e`.",
      "A placeholder should show the format — `you@example.com` — not repeat the field's name.",
      "`<legend>` must be the first thing inside `<fieldset>`, before the radios.",
    ],
    "html,forms,accessibility"),

  /* ---------------------------------------------- html-semantic ----
   *
   * Parity checked in linkedom and DOMParser before writing: 12 of 12 identical
   * across header/nav/main/article/section/aside/footer and their nesting. The
   * one that decides whether 633 is possible at all: a SECOND <main> survives
   * parsing in both engines (neither repairs or drops it), so "there should be
   * exactly one" is a real assertion rather than one the parser has already
   * satisfied. */
  P("html-semantic", 632, "html-landmarks", "Give the Page Its Landmarks", "Easy",
    "This page is built entirely from `div`s with class names. It renders correctly and tells nothing that is not a pair of eyes what any part of it is — a screen reader's landmark menu is empty.\n\nReplace each `div` with the element that says what it holds:\n\n- `class=\"header\"` → the site banner\n- `class=\"nav\"` → the major navigation\n- `class=\"main\"` → the page's own content\n- `class=\"footer\"` → the closing content\n\nDrop the class attributes as you go — the element names carry the meaning now. Change nothing else; the page should look exactly the same afterwards, and that is the point.",
    "<div class=\"header\">\n  <h1>Mochi's Kitchen</h1>\n  <div class=\"nav\">\n    <ul>\n      <li><a href=\"index.html\">Home</a></li>\n      <li><a href=\"about.html\">About</a></li>\n    </ul>\n  </div>\n</div>\n\n<div class=\"main\">\n  <h2>Poha Chivda</h2>\n  <p>Twenty minutes, one pan.</p>\n</div>\n\n<div class=\"footer\">\n  <p>Written by Ravi</p>\n</div>\n",
    "<header>\n  <h1>Mochi's Kitchen</h1>\n  <nav>\n    <ul>\n      <li><a href=\"index.html\">Home</a></li>\n      <li><a href=\"about.html\">About</a></li>\n    </ul>\n  </nav>\n</header>\n\n<main>\n  <h2>Poha Chivda</h2>\n  <p>Twenty minutes, one pan.</p>\n</main>\n\n<footer>\n  <p>Written by Ravi</p>\n</footer>\n",
    [
      { find: "header", count: 1, says: "a <header> for the site banner" },
      { find: "header nav", exists: true, says: "the <nav> is inside the header, where the menu was" },
      { find: "nav ul li a", atLeast: 2, says: "the menu links are still a list inside the nav" },
      { find: "main", count: 1, says: "exactly one <main> for the page's own content" },
      { find: "main h2", text: true, contains: "Poha Chivda", says: "the recipe heading is inside <main>" },
      { find: "footer", count: 1, says: "a <footer> for the closing content" },
      { find: "div", count: 0, says: "no meaningless <div> left — every box now says what it is" },
    ],
    [
      "Each `div` becomes the element that names what it holds: header, nav, main, footer.",
      "The nav stays inside the header, and the list stays inside the nav.",
      "Remove the class attributes — the element name is the meaning now.",
    ],
    "html,semantic,accessibility"),

  P("html-semantic", 633, "html-two-mains", "Skip to the Wrong Content", "Medium",
    "This page renders perfectly and its \"skip to main content\" link lands on the **logo and menu** instead of the recipe. A landmark list shows **two identical \"main\" entries**.\n\nThe banner was wrapped in a `main` of its own — but the banner is the part repeated on every page, which is exactly what `main` is supposed to exclude.\n\nFix it so the page has **one** `main`, holding only the recipe, and the banner sits in a `header` instead. Do not delete any content and do not touch the words.",
    "<main>\n  <header>\n    <h1>Mochi's Kitchen</h1>\n    <nav><ul><li><a href=\"index.html\">Home</a></li></ul></nav>\n  </header>\n</main>\n\n<main>\n  <h2>Poha Chivda</h2>\n  <p>Twenty minutes, one pan.</p>\n</main>\n",
    "<header>\n  <h1>Mochi's Kitchen</h1>\n  <nav><ul><li><a href=\"index.html\">Home</a></li></ul></nav>\n</header>\n\n<main>\n  <h2>Poha Chivda</h2>\n  <p>Twenty minutes, one pan.</p>\n</main>\n",
    [
      { find: "main", count: 1, says: "exactly one <main> on the page" },
      { find: "main h2", text: true, contains: "Poha Chivda", says: "the one <main> holds the recipe" },
      { find: "main h1", count: 0, says: "the site title is no longer inside <main>" },
      { find: "main nav", count: 0, says: "and neither is the menu" },
      { find: "header h1", text: true, contains: "Mochi's Kitchen", says: "the site title sits in a <header>" },
      { find: "header nav ul li a", exists: true, says: "the menu is still in the header, unchanged" },
    ],
    [
      "Only one thing can be the main content — and the banner appears on every page.",
      "Delete the outer `<main>` tags around the header; keep everything inside them.",
      "The recipe's `<main>` stays exactly as it is.",
    ],
    "html,semantic,debugging"),

  /* --------------------------------------- html-article-section ---- */
  P("html-article-section", 634, "html-articles-in-section", "Posts in a Named Group", "Easy",
    "A listing page: two recipes under the heading `Latest recipes`.\n\nEach recipe is **self-contained** — it would still make sense on its own in a feed reader — so each one is an `article`. The group around them has a name, so it is a `section` carrying that heading.\n\nInside `main`, build:\n\n- one `section` whose first thing is an `h2` reading `Latest recipes`\n- inside it, **two** `article` elements, each with an `h3` for its title (`Poha Chivda` and `Masala Peanuts`) and a `p` of description\n\nThe words are already written below — they just need the right boxes.",
    "<main>\n  <!-- a section headed \"Latest recipes\", holding two articles -->\n\n  <!-- Poha Chivda — Twenty minutes, one pan. -->\n  <!-- Masala Peanuts — Ten minutes, no oven. -->\n</main>\n",
    "<main>\n  <section>\n    <h2>Latest recipes</h2>\n\n    <article>\n      <h3>Poha Chivda</h3>\n      <p>Twenty minutes, one pan.</p>\n    </article>\n\n    <article>\n      <h3>Masala Peanuts</h3>\n      <p>Ten minutes, no oven.</p>\n    </article>\n  </section>\n</main>\n",
    [
      { find: "main section", count: 1, says: "one <section> inside <main>" },
      { find: "section h2", text: true, contains: "Latest recipes", says: "the section is headed \"Latest recipes\"" },
      { find: "section article", count: 2, says: "two <article> elements inside it — one per recipe" },
      { find: "article h3", count: 2, says: "each article has its own <h3> title" },
      { find: "article h3", text: true, contains: "Masala Peanuts", says: "one of them is \"Masala Peanuts\"" },
      { find: "article p", count: 2, says: "each article has a paragraph of description" },
    ],
    [
      "A recipe would make sense on its own, so each is an `article`.",
      "The group has a name, so it is a `section` — and a section needs its heading.",
      "Heading levels do not restart inside a section: h2 for the group, h3 for each post.",
    ],
    "html,semantic"),

  P("html-article-section", 635, "html-section-or-div", "One Is Not a Section", "Medium",
    "Two problems here, and they pull in opposite directions.\n\n- the `div` around the recipe's method is a genuine **named part** of the recipe — it should be a `section`, and it needs an `h3` heading reading `Method`\n- the `div` with `class=\"layout\"` is a **layout wrapper**. Somebody made it a `section` to be \"more semantic\", and a section nobody can name is noise in the outline. Turn it back into a `div`\n\nThe rule that settles both: **if you cannot write the heading, it is a `div`.**\n\nKeep the article, its `h2` and all the words exactly as they are.",
    "<article>\n  <h2>Poha Chivda</h2>\n\n  <section class=\"layout\">\n    <div>\n      <p>Heat the oil, fry the peanuts, fold in the poha.</p>\n    </div>\n  </section>\n</article>\n",
    "<article>\n  <h2>Poha Chivda</h2>\n\n  <div class=\"layout\">\n    <section>\n      <h3>Method</h3>\n      <p>Heat the oil, fry the peanuts, fold in the poha.</p>\n    </section>\n  </div>\n</article>\n",
    [
      { find: "article > h2", text: true, contains: "Poha Chivda", says: "the article keeps its <h2> title" },
      { find: "div.layout", count: 1, says: "the layout wrapper is a <div> again" },
      { find: "section.layout", count: 0, says: "and is no longer claiming to be a section" },
      { find: "section", count: 1, says: "exactly one <section> — the method, which has a name" },
      { find: "section h3", text: true, contains: "Method", says: "that section carries an <h3> heading reading \"Method\"" },
      { find: "section p", text: true, contains: "fry the peanuts", says: "the method text is inside it, unchanged" },
    ],
    [
      "A section needs a heading. The method has one you can write: `Method`.",
      "A box that exists only for CSS has no name — that is a `div`.",
      "Keep the class on the wrapper; only the element name changes.",
    ],
    "html,semantic,structure"),

  /* ---------------------------------------------- html-metadata ----
   *
   * ⚠️ EVERY TEST BELOW USES A BARE SELECTOR — `meta[name="viewport"]`, never
   * `head meta[name="viewport"]`. The browser's DOMParser hoists a stray <meta>
   * or <title> into an implicit <head>; linkedom leaves it where it sits.
   * Measured on `<meta name="description">…` with no skeleton: `head meta` is 1
   * in the browser and 0 in linkedom. The workbench grades with DOMParser and
   * submit grades with linkedom, so a head-scoped assertion could go green and
   * then be rejected. With an explicit <head> the two agree 9 of 9 — the
   * starters here supply the whole skeleton for that reason, and the bare
   * selectors mean the divergence cannot be reached even if a student deletes
   * it. Where the exercise is about placement, assert the SKELETON separately
   * (`html[lang]`, `body h1`) instead of scoping the meta test to it. */
  P("html-metadata", 637, "html-head-basics", "The Six Lines Every Page Needs", "Easy",
    "The skeleton is here and the head is nearly empty. Add the four things every page you ever build should carry:\n\n- the **viewport** line that makes the page render at the phone's real width: `name=\"viewport\"`, `content=\"width=device-width, initial-scale=1\"`\n- a `title` of `Poha Chivda Recipe | Mochi's Kitchen` — the specific part first, because a search result and a tab both cut the end off\n- a **description**: `name=\"description\"`, with any sentence describing the page\n- a **canonical** link pointing at `https://mochis.example/poha-chivda`\n\nNone of it appears on the page. All of it decides how the page behaves on a phone and how it looks in a search result.",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <!-- viewport, title, description, canonical -->\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta name=\"description\" content=\"A twenty-minute Maharashtrian snack made in one pan.\">\n  <link rel=\"canonical\" href=\"https://mochis.example/poha-chivda\">\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    [
      { find: "meta[name=\"viewport\"]", attr: "content", contains: "width=device-width", says: "a viewport meta with width=device-width" },
      { find: "meta[name=\"viewport\"]", attr: "content", contains: "initial-scale=1", says: "and initial-scale=1, so the phone does not zoom out" },
      { find: "title", text: true, contains: "Poha Chivda Recipe", says: "a <title> starting with the specific part" },
      { find: "meta[name=\"description\"]", attr: "content", notEmpty: true, says: "a description meta that is not blank" },
      { find: "link[rel=\"canonical\"]", attr: "href", equals: "https://mochis.example/poha-chivda", says: "a canonical link with the page's real URL" },
      { find: "meta[charset]", exists: true, says: "the charset declaration is still there" },
      { find: "body h1", text: true, contains: "Poha Chivda", says: "the visible page is unchanged" },
    ],
    [
      "`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` — one line, and it is what makes a page mobile.",
      "The canonical is a `<link rel=\"canonical\" href=\"...\">`, not a meta.",
      "All four go inside `<head>`; nothing here renders on the page.",
    ],
    "html,metadata,seo"),

  P("html-metadata", 638, "html-head-fix", "A Head Full of Bad Advice", "Medium",
    "Every line in this head was copied from an old tutorial, and three of them are actively harmful:\n\n- the viewport carries **`user-scalable=no`**, which takes pinch-zoom away from the visitor. For anyone with low vision that makes the page unusable. The content should be exactly `width=device-width, initial-scale=1`\n- there is a **`keywords`** meta. Search engines stopped reading it decades ago because it was abused immediately — delete it\n- **`robots` is set to `noindex`**, left over from staging. On a live page that means it never appears in search at all. It should be `index, follow`\n\nLeave the charset, the title and the description exactly as they are.",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, user-scalable=no\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta name=\"description\" content=\"A twenty-minute Maharashtrian snack made in one pan.\">\n  <meta name=\"keywords\" content=\"recipe, snack, poha, indian, easy\">\n  <meta name=\"robots\" content=\"noindex\">\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta name=\"description\" content=\"A twenty-minute Maharashtrian snack made in one pan.\">\n  <meta name=\"robots\" content=\"index, follow\">\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    [
      { find: "meta[name=\"viewport\"]", attr: "content", equals: "width=device-width, initial-scale=1", says: "the viewport no longer disables zoom" },
      { find: "meta[name=\"keywords\"]", count: 0, says: "the dead keywords meta is gone" },
      { find: "meta[name=\"robots\"]", attr: "content", contains: "index", says: "robots allows indexing" },
      { find: "meta[name=\"robots\"][content*=\"noindex\"]", count: 0, says: "and noindex is gone — the page can appear in search" },
      { find: "title", text: true, contains: "Poha Chivda Recipe", says: "the title is untouched" },
      { find: "meta[name=\"description\"]", attr: "content", contains: "twenty-minute", says: "the description is untouched" },
    ],
    [
      "`user-scalable=no` removes pinch-zoom — never ship it. The content is just the two settings.",
      "Delete the whole keywords line; nothing reads it.",
      "`noindex` keeps a page out of search entirely. On a live page it should be `index, follow`.",
    ],
    "html,metadata,accessibility"),

  /* -------------------------------------------- html-social-meta ---- */
  P("html-social-meta", 639, "html-open-graph", "Make the Link a Card", "Easy",
    "Pasted into a chat app, this page becomes a bare blue URL. Give it a share card.\n\nAdd five Open Graph tags to the head — and remember Open Graph uses **`property`**, not `name`:\n\n- `og:title` → `Poha Chivda Recipe`\n- `og:description` → any short line about the page\n- `og:image` → `https://mochis.example/img/poha-card.jpg` — an **absolute** URL, because the crawler is on another machine and will not resolve a relative one\n- `og:url` → `https://mochis.example/poha-chivda`\n- `og:type` → `article`\n\nThen one Twitter tag for the wide card: `twitter:card` set to `summary_large_image` — and that one uses `name`, because the two systems genuinely disagree.",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <!-- five og: tags, then twitter:card -->\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta property=\"og:title\" content=\"Poha Chivda Recipe\">\n  <meta property=\"og:description\" content=\"A twenty-minute snack made in one pan.\">\n  <meta property=\"og:image\" content=\"https://mochis.example/img/poha-card.jpg\">\n  <meta property=\"og:url\" content=\"https://mochis.example/poha-chivda\">\n  <meta property=\"og:type\" content=\"article\">\n  <meta name=\"twitter:card\" content=\"summary_large_image\">\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    [
      { find: "meta[property=\"og:title\"]", attr: "content", contains: "Poha Chivda Recipe", says: "og:title, written with property=" },
      { find: "meta[property=\"og:description\"]", attr: "content", notEmpty: true, says: "og:description is present and not blank" },
      { find: "meta[property=\"og:image\"]", attr: "content", equals: "https://mochis.example/img/poha-card.jpg", says: "og:image is the absolute URL" },
      { find: "meta[property=\"og:url\"]", attr: "content", equals: "https://mochis.example/poha-chivda", says: "og:url is the page's real address" },
      { find: "meta[property=\"og:type\"]", attr: "content", equals: "article", says: "og:type is article" },
      { find: "meta[name=\"twitter:card\"]", attr: "content", equals: "summary_large_image", says: "twitter:card uses name= and asks for the wide card" },
    ],
    [
      "All five Open Graph tags are `<meta property=\"og:...\" content=\"...\">`.",
      "`og:image` must start with `https://` — a relative path fetches nothing for a crawler.",
      "The Twitter tag is the odd one out: `name=\"twitter:card\"`.",
    ],
    "html,metadata,social"),

  P("html-social-meta", 640, "html-og-property", "Tags That Look Right and Do Nothing", "Medium",
    "This page has Open Graph tags and still previews as a bare link. Three reasons, and none of them produce a warning anywhere:\n\n- the two `og:` tags use **`name=`**. Open Graph reads **`property=`**, so both are valid, ignored, and silently fall back to guessing\n- `og:image` is a **relative path**. The crawler runs on another machine and does not resolve it — the card comes back with no picture. Make it `https://mochis.example/img/poha-card.jpg`\n- the `twitter:card` tag uses `property=`, which is backwards: Twitter's tags use `name=`\n\nFix all three. Keep every `content` value except the image path.",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta name=\"og:title\" content=\"Poha Chivda Recipe\">\n  <meta name=\"og:image\" content=\"/img/poha-card.jpg\">\n  <meta property=\"twitter:card\" content=\"summary_large_image\">\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta property=\"og:title\" content=\"Poha Chivda Recipe\">\n  <meta property=\"og:image\" content=\"https://mochis.example/img/poha-card.jpg\">\n  <meta name=\"twitter:card\" content=\"summary_large_image\">\n</head>\n<body>\n  <h1>Poha Chivda</h1>\n</body>\n</html>\n",
    [
      { find: "meta[property=\"og:title\"]", attr: "content", contains: "Poha Chivda Recipe", says: "og:title now uses property=" },
      { find: "meta[property=\"og:image\"]", attr: "content", equals: "https://mochis.example/img/poha-card.jpg", says: "og:image uses property= and an absolute URL" },
      { find: "meta[name=\"og:title\"]", count: 0, says: "no og: tag left on the name attribute" },
      { find: "meta[name=\"og:image\"]", count: 0, says: "including the image one" },
      { find: "meta[name=\"twitter:card\"]", attr: "content", equals: "summary_large_image", says: "twitter:card is back on name=, where Twitter reads it" },
      { find: "meta[property=\"twitter:card\"]", count: 0, says: "and no longer on property=" },
    ],
    [
      "Open Graph: `property=`. Twitter: `name=`. Memorise it as a pair — half the snippets online get one wrong.",
      "A crawler on another machine cannot resolve `/img/...` — give it the full https:// URL.",
      "Only the attribute names and the image path change; every content value stays.",
    ],
    "html,metadata,debugging"),
];
