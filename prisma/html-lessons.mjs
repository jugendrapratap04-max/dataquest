/* The HTML course — track definition and lessons.
 *
 * IN ITS OWN FILE ON PURPOSE. Lessons for the other ten subjects live inside
 * seed.mjs, which is now 1.9 MB and is the single worst thing about working in
 * this repo: two sessions cannot edit it without colliding, and splitting it is
 * on the list in AGENTS.md. A brand-new course is the one chance to not make
 * that worse, so nothing here goes into that file — seed.mjs imports this and
 * nothing more.
 *
 * ON THE BLUEPRINT THIS FOLLOWS. The course plan asks for a 20-point structure
 * per lesson. The platform's block vocabulary already covers most of it —
 * objectives, hook, think, def, analogy, syntax, code, note, mistakes, debug,
 * drills, recap, interview, quiz — and those are what a lesson is built from
 * here. Two of the twenty are NOT built and are not pretended: there is no AI
 * doubt assistant on this platform, and per-lesson downloadable notes do not
 * exist (the /book view is the closest thing). Writing them into a lesson would
 * be advertising something that is not there.
 */

export const htmlTrack = {
  slug: "html",
  order: 11,
  title: "HTML — the Structure of Every Web Page",
  subtitle: "start here if you have never built a page",
  icon: "<>",
  weeks: "~3 weeks",
  level: "Beginner",
  whyText:
    "Every website you have ever opened is HTML underneath. It is the first thing to learn because CSS and JavaScript both need something to attach to — and it is the only part of the web you can see the result of within a minute of starting.",
  milestone: "Build a multi-page site with forms, tables and semantic layout",
  toolsCsv: "VS Code,Chrome DevTools",
  skillsJson: JSON.stringify([
    "How the web actually works",
    "Elements, tags and attributes",
    "Text, links and images",
    "Lists and tables",
    "Forms and validation",
    "Semantic HTML",
    "Accessibility and SEO",
    "Metadata and performance",
  ]),
};

/* ---------------------------------------------------------------------------
 * MODULE 2 — HTML BASICS
 *
 * The course plan starts at Module 0 (how the internet works). That module is
 * written next; this one is first because it is where the grading engine gets
 * exercised, and a course whose practice cannot be graded is worth finding out
 * about before twenty modules are written rather than after.
 * ------------------------------------------------------------------------- */

export const htmlLessons = [
  {
    slug: "html-what-it-is",
    order: 1,
    title: "What HTML Actually Is",
    minutes: 14,
    content: [
      { t: "objectives", items: [
        "Say what HTML is for, and what it is <b>not</b> for",
        "Point at any part of a web page and name what is holding it there",
        "Explain why a browser needs to be told the structure at all",
        "Write your first page and see it render",
      ] },

      { t: "hook",
        q: "Open any news site and turn off its styling. Everything goes grey and stacks into one column — but the headline is still bigger than the paragraph, the links are still links, and the list is still a list. Why does <i>any</i> of that survive?",
        why: "Because none of it came from the styling. Something underneath already said \"this is a heading\" and \"this is a list\", and that something is HTML." },

      { t: "think",
        q: "You are handing a page to someone who cannot see it — a screen reader, a search engine, a browser on a watch. What do they need to be told?",
        a: "Not the colours or the spacing. They need to know what each piece of text <b>is</b>: a heading, a paragraph, a link, a list item. That is the entire job of HTML, and it is why a page built with the right elements works in places nobody tested it." },

      { t: "def",
        term: "HTML",
        en: "HyperText Markup Language — a way of labelling the parts of a document so a browser knows what each piece of content is." },

      { t: "h2", n: "1", text: "It is a labelling language, not a programming language" },
      { t: "p", html: "HTML has no variables, no <code>if</code>, no loops and no arithmetic. It cannot make a decision. Everything it does is put a label around a piece of content and say what that content <b>is</b>." },
      { t: "p", html: "That sounds like a limitation and it is the reason the web works. Because the labels are fixed and public, a browser written in 1998 and a screen reader written last week both understand the same page — nobody has to agree on anything beyond the label." },

      { t: "analogy",
        concept: "HTML tags",
        real: "labels on moving boxes",
        html: "Nothing about a label changes what is inside the box. It tells whoever picks it up what they are holding, so \"FRAGILE — GLASS\" gets carried differently from \"BOOKS\". <code>&lt;h1&gt;</code> and <code>&lt;p&gt;</code> work the same way: they do not change the words, they tell the browser what the words are for." },

      { t: "syntax",
        intro: "One label wrapped around some content. This is the whole shape, and everything in the course is a variation of it.",
        form: "<tagname>content</tagname>",
        parts: [
          { bit: "<tagname>", says: "The opening tag. It marks where this piece of content starts." },
          { bit: "tagname", says: "Which label — <code>h1</code> for a top heading, <code>p</code> for a paragraph, <code>a</code> for a link. There are about 100 and you will use perhaps 25." },
          { bit: "content", says: "What is being labelled: text, or other elements, or both." },
          { bit: "</tagname>", says: "The closing tag. The slash is what makes it a closing tag, and forgetting it is how the rest of the page ends up inside this element." },
        ],
        note: "Tag names are case-insensitive, so <code>&lt;H1&gt;</code> works — but everyone writes them lowercase, and a file that mixes both reads as careless.",
      },

      { t: "code", file: "first.html", code: "<h1>My first page</h1>\n<p>This is a paragraph. It is smaller than the heading.</p>\n<p>This is a second paragraph.</p>", output: "A large \"My first page\", then two normal-sized lines of text." },
      { t: "psoft", html: "No styling anywhere, and the heading is still large and bold. That is the browser's default for <code>h1</code> — it was told this is the most important heading on the page, so it made it look like one." },

      { t: "note", variant: "tip", html: "<b>Try it now.</b> Make a file called <code>index.html</code>, paste those three lines in, and open it in your browser. That is a website. It is on your computer rather than the internet, and the difference between the two is Module 1." },

      { t: "h2", n: "2", text: "The browser is guessing until you tell it" },
      { t: "p", html: "Give a browser plain text with no tags and it shows you one grey wall of words. It has no way to know which line was a title. HTML removes the guessing — and when you leave it out, the guessing comes back." },

      { t: "code", file: "wrong.html", code: "<p>Chapter One</p>\n<p>It was a dark and stormy night.</p>", output: "Two identical-looking paragraphs." },
      { t: "psoft", html: "\"Chapter One\" is a heading, and it was labelled a paragraph. It looks nearly right — and a screen reader will not announce it as a heading, a search engine will not weight it as one, and \"jump to next heading\" will skip straight past it. The page looks fine and is wrong." },

      { t: "mistakes", items: [
        { bad: "<p>My heading</p>", why: "Using the wrong element because it <i>looks</i> acceptable. The look can be changed with one line of CSS later; the meaning cannot be recovered.", fix: "<h1>My heading</h1>" },
        { bad: "<p>Some text<p>", why: "The second tag opens a new paragraph rather than closing the first — a closing tag needs the slash.", fix: "<p>Some text</p>" },
        { bad: "<H1>Title</h1>", why: "Not an error, and inconsistent. Pick lowercase and stay there.", fix: "<h1>Title</h1>" },
      ] },

      { t: "recap", items: [
        "HTML <b>labels</b> content — it says what each piece is, not how it looks",
        "It has no logic at all: no variables, no conditions, no loops",
        "The shape is always <code>&lt;tag&gt;content&lt;/tag&gt;</code>",
        "The closing tag carries a slash; without it the element never ends",
        "Choosing the wrong element is invisible on screen and breaks everything that is not a screen",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "Is HTML a programming language?", a: "No. It is a markup language — it labels content and has no logic, no variables and no control flow. The distinction matters because it is why HTML alone can never make a decision or respond to anything." },
        { level: "medium", q: "Why does it matter which element you use if CSS can make anything look like anything?", a: "Because everything that is not a pair of eyes reads the element, not the styling: screen readers, search engines, browser reader modes, keyboard navigation. Styling changes the appearance for sighted users on that one page; the element is what everything else has to go on." },
      ] },
    ],
  },

  {
    slug: "html-document-structure",
    order: 2,
    title: "The Shape of Every Page",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Write the skeleton every HTML file starts with, from memory",
        "Say what <code>head</code> is for and why it is not visible",
        "Explain what <code>&lt;!DOCTYPE html&gt;</code> is actually doing",
        "Recognise which parts are required and which are habit",
      ] },

      { t: "hook",
        q: "Every HTML file on the internet starts with roughly the same six lines. Why does a language with no logic need boilerplate at all?",
        why: "Because a browser has to answer three questions before it can draw anything: which version of HTML is this, what language is it in, and how is the text encoded. The skeleton answers all three before the content starts." },

      { t: "def",
        term: "Document structure",
        en: "The fixed outer shape of an HTML file: a doctype, an <code>html</code> element, and inside it a <code>head</code> for information about the page and a <code>body</code> for the page itself." },

      { t: "analogy",
        concept: "head and body",
        real: "an envelope and the letter inside it",
        html: "The envelope carries the address, the postmark and the stamp — everything the postal system needs and the reader never reads. The letter is what the person actually opens. <code>head</code> is the envelope; <code>body</code> is the letter." },

      { t: "syntax",
        intro: "The skeleton. Every page you write for the rest of this course starts here.",
        form: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Page title</title>\n</head>\n<body>\n  page content\n</body>\n</html>",
        parts: [
          { bit: "<!DOCTYPE html>", says: "Says \"this is modern HTML\". Not a tag and not part of the page — an instruction to the browser, and it must be the very first thing in the file." },
          { bit: "<html", says: "The root. Everything else lives inside it, and there is exactly one per file." },
          { bit: "lang", says: "Which human language the page is in. Screen readers pick a pronunciation from it and browsers offer translation on it — two lines of value for one attribute." },
          { bit: "<head>", says: "Information <b>about</b> the page. Nothing here is drawn on screen." },
          { bit: "<meta charset=\"UTF-8\">", says: "How the bytes map to characters. Leave it out and accented letters, rupee signs and emoji arrive as garbage — put it first in the head so the browser knows before it reads anything else." },
          { bit: "<title>", says: "The browser tab, the bookmark name, and the blue line in Google's results. The most-read line of any page." },
          { bit: "<body>", says: "The page itself. Everything a visitor sees is in here." },
        ],
        note: "The browser will render a file with none of this. It guesses, guesses differently from other browsers, and drops into a compatibility mode written for 1999 — which is a slow way to find out you needed the doctype.",
      },

      { t: "code", file: "index.html", code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Jugendra Pratap</title>\n</head>\n<body>\n  <h1>Jugendra Pratap</h1>\n  <p>Learning to build for the web.</p>\n</body>\n</html>", output: "Tab reads \"Jugendra Pratap\". Page shows the heading and one line." },
      { t: "psoft", html: "The name appears twice and they are doing different jobs. The one in <code>title</code> is for the tab and the search result; the one in <code>h1</code> is for the page. Changing one does not change the other." },

      { t: "h2", n: "1", text: "Why head content is invisible" },
      { t: "p", html: "It is not hidden by a rule you could turn off — the browser simply does not draw anything in <code>head</code>. That is what the element means. Put a <code>&lt;p&gt;</code> in there and it will not appear, and you will spend twenty minutes wondering why." },

      { t: "note", variant: "warn", html: "If text you wrote is nowhere on the page, check first that it is inside <code>&lt;body&gt;</code>. It is the commonest first-week bug and it produces no error at all." },

      { t: "debug",
        intro: "This page shows nothing but its title. Read it and decide what is wrong before opening the fix.",
        code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My page</title>\n  <h1>Welcome</h1>\n</head>\n<body>\n</body>\n</html>",
        symptom: "The tab says \"My page\". The page itself is blank.",
        q: "Every tag is spelled correctly and every one is closed. So where did the heading go?",
        fix: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My page</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n</body>\n</html>",
        why: "The heading was inside <code>head</code>, and nothing in <code>head</code> is drawn — that is what the element means. It was parsed, kept in the document, and never shown. There is no error because nothing is wrong syntactically; the markup is valid and in the wrong half of the page. Moving the line into <code>body</code> is the whole fix." },

      { t: "mistakes", items: [
        { bad: "<html>\n<head>...</head>\n</html>\n<body>...</body>", why: "The body is outside the html element. Browsers will silently repair this and you should not rely on that.", fix: "<html>\n<head>...</head>\n<body>...</body>\n</html>" },
        { bad: "<head>\n  <title>A</title>\n  <title>B</title>\n</head>", why: "Two titles. The first wins and the second is ignored, so a stale title can survive an edit.", fix: "<head>\n  <title>B</title>\n</head>" },
        { bad: "<html>", why: "No <code>lang</code>. Costs nothing to add and a screen reader has to guess the pronunciation without it.", fix: "<html lang=\"en\">" },
      ] },

      { t: "recap", items: [
        "<code>&lt;!DOCTYPE html&gt;</code> first, always — it selects modern rendering",
        "<code>html</code> is the root; <code>lang</code> belongs on it",
        "<code>head</code> is information about the page and is never drawn",
        "<code>meta charset=\"UTF-8\"</code> goes near the top of the head",
        "<code>title</code> is the tab, the bookmark and the search result",
        "<code>body</code> holds everything a visitor sees",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What does the doctype do?", a: "It tells the browser to use standards mode. Without it the browser falls back to quirks mode, which emulates 1990s bugs — layouts measure differently and CSS behaves in ways nothing modern expects." },
        { level: "medium", q: "Why does charset need to be near the top of the head?", a: "The browser has to decode bytes into characters before it can read anything, so it starts with a guess and re-parses if the declaration contradicts it. Declaring it in the first bytes avoids that re-parse and the flash of broken characters that can come with it." },
      ] },
    ],
  },

  {
    slug: "html-elements-attributes",
    order: 3,
    title: "Elements, Attributes and Nesting",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Tell an element, a tag and an attribute apart, precisely",
        "Add attributes to any element with the right quoting",
        "Nest elements without breaking them",
        "Recognise which elements have no closing tag, and why",
      ] },

      { t: "hook",
        q: "<code>&lt;a&gt;click here&lt;/a&gt;</code> is a link that goes nowhere. What is missing is not a tag — so what is it?",
        why: "A destination. The tag says \"this is a link\"; where it goes is extra information, and extra information rides on the tag as an attribute." },

      { t: "def",
        term: "Attribute",
        en: "Extra information written inside an element's opening tag, as <code>name=\"value\"</code>, that configures what the element does." },

      { t: "analogy",
        concept: "attributes",
        real: "the settings on an appliance",
        html: "A kettle is a kettle whatever you do to it — that is the element. The temperature dial does not change what it is, it changes how it behaves. <code>href</code>, <code>src</code> and <code>alt</code> are dials on elements." },

      { t: "syntax",
        intro: "Attributes go in the opening tag only, never in the closing one.",
        form: "<tagname attribute=\"value\" other=\"value\">content</tagname>\n\n<img src=\"cat.jpg\" alt=\"A cat asleep\">",
        parts: [
          { bit: "attribute", says: "The name of the setting. Lowercase, and each element accepts a specific set — <code>href</code> means nothing on an <code>img</code>." },
          { bit: "=", says: "Joins the name to its value. No spaces around it." },
          { bit: "\"value\"", says: "The value, in quotes. They can be left out for simple values and should not be — one space in an unquoted value silently ends it early." },
          { bit: "other", says: "Several attributes, separated by spaces. Order never matters." },
          { bit: "<img", says: "An empty element: it has no content, so it has no closing tag. There is nothing to wrap — the image <i>is</i> the element." },
          { bit: "src", says: "Which file to show. Without it the element exists and there is nothing to draw." },
          { bit: "alt", says: "What the image says, in words, for anyone who cannot see it — and for everyone when the file fails to load." },
        ],
        note: "About a dozen elements are empty: <code>img</code>, <code>br</code>, <code>hr</code>, <code>input</code>, <code>meta</code>, <code>link</code>. Writing <code>&lt;/img&gt;</code> is not an error and is not a thing.",
      },

      { t: "code", file: "attrs.html", code: "<a href=\"https://example.com\">Visit example</a>\n<img src=\"logo.png\" alt=\"Company logo\">\n<p id=\"intro\" class=\"lead\">Two attributes on one element.</p>", output: "A link, an image, and a paragraph." },

      { t: "h2", n: "1", text: "Nesting: last opened, first closed" },
      { t: "p", html: "Elements go inside elements, and the order they close in is not free. Whatever you opened last has to close first — the same rule as brackets in maths." },

      { t: "code", file: "nesting.html", code: "<p>This is <strong>very <em>important</em></strong> indeed.</p>", output: "This is very important indeed. — with \"very important\" bold and \"important\" also italic." },
      { t: "psoft", html: "<code>em</code> opened last, so it closes first. Cross them over — <code>&lt;strong&gt;&lt;em&gt;text&lt;/strong&gt;&lt;/em&gt;</code> — and the browser will repair it silently, differently from how you meant, and the bug will surface three elements later." },

      { t: "note", variant: "tip", html: "Indent one level per nesting level. It is not decoration: a mismatched tag is nearly impossible to spot in a flat file and obvious in an indented one." },

      { t: "drills", intro: "Write these out. Reading them is not the same as typing them.", items: [
        { task: "A paragraph containing a bold word.", code: "<p>This is <strong>bold</strong> text.</p>" },
        { task: "A link that opens example.com.", code: "<a href=\"https://example.com\">Example</a>" },
        { task: "An image with alt text.", code: "<img src=\"photo.jpg\" alt=\"A street at night\">" },
        { task: "A paragraph with both an id and a class.", code: "<p id=\"first\" class=\"note\">Text</p>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<img src=\"my photo.jpg\">", why: "Unquoted values end at the first space, so this reads as src=\"my\" and a stray attribute called photo.jpg. Quote every value.", fix: "<img src=\"my photo.jpg\" alt=\"...\">" },
        { bad: "<strong><em>text</strong></em>", why: "Crossed nesting. The browser repairs it silently and not the way you intended.", fix: "<strong><em>text</em></strong>" },
        { bad: "<img src=\"cat.jpg\"></img>", why: "An empty element has no closing tag — there is no content to wrap.", fix: "<img src=\"cat.jpg\" alt=\"A cat\">" },
        { bad: "<a href=https://example.com>Link</a>", why: "Works here and stops working the moment the URL contains a space or the value is anything less tidy. Quote it always, not sometimes.", fix: "<a href=\"https://example.com\">Link</a>" },
      ] },

      { t: "recap", items: [
        "A <b>tag</b> is the marker; an <b>element</b> is the tag plus its content",
        "Attributes are <code>name=\"value\"</code>, in the opening tag only",
        "Quote every value — unquoted ones break on the first space",
        "Empty elements (<code>img</code>, <code>br</code>, <code>input</code>) have no closing tag",
        "Nesting closes in reverse order: last opened, first closed",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between a tag and an element?", a: "The tag is the marker — <code>&lt;p&gt;</code>. The element is the whole thing: opening tag, content and closing tag. People use them interchangeably in conversation and the distinction matters when reading a spec." },
        { level: "medium", q: "Why do empty elements have no closing tag?", a: "Because a closing tag exists to mark where content ends, and these elements have no content. An image is not a wrapper around something — the element itself is the whole thing." },
      ] },
    ],
  },
];
