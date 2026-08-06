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
];
