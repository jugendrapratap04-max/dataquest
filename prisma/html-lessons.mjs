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
 *
 * ⚠️ QUIZ OPTIONS CARRY NO ANGLE BRACKETS, AND THAT IS A DELIBERATE HOUSE RULE.
 * A quiz `q` and `why` are rendered with dangerouslySetInnerHTML, so markup in
 * them works and <code>&lt;p&gt;</code> is the right way to name an element. An
 * `option` is rendered as {o} — plain text — and db:check rejects a dozen tag
 * names in it (`p`, `code`, `b`, `i`, `em`, `strong`, `pre`, `br`, `span`,
 * `ul`, `li`, `div`) because in every other track markup there prints
 * literally. The trap is that the ban is PARTIAL: `<table>`, `<a>` and
 * `<figure>` sail through the same check, so an author following the checker
 * alone ends up with "the &lt;table&gt; element" beside "the p element" in one
 * quiz. So: in options, name elements in bare words — "the p element", "an li
 * inside a ul". Attribute syntax with no brackets (`target="_blank"`,
 * `scope="col"`) is fine and reads well.
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
 * MODULE 0 — INTERNET & WEB FOUNDATIONS
 *
 * Five lessons covering the plan's twenty-three topics. No HTML is written in
 * this module, and that is the point: a student who does not know what a server
 * is will write markup without ever understanding where it goes or who reads it.
 *
 * NO GRADED PRACTICE HERE, AND NOT BY OVERSIGHT. Every other lesson on this
 * platform carries at least two practice problems. There is nothing to practise
 * yet — the first line of HTML is written in Module 2 — so these lessons carry
 * a quiz instead, and inventing code exercises to satisfy a rule would teach
 * nothing. Graded practice starts the moment there is something to write.
 * ------------------------------------------------------------------------- */

export const htmlLessons = [
  {
    slug: "web-before-the-web",
    order: 1,
    title: "Before the Web: How Any of This Happened",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Say what changed when the Internet arrived, in one sentence",
        "Tell the <b>Internet</b> and the <b>Web</b> apart — they are not the same thing",
        "Explain who wrote HTML, and the specific problem they were stuck on",
        "Say why HTML looks the way it does, given what it was for",
      ] },

      { t: "hook",
        q: "You want to read a research paper written by someone in another country. It is 1985. How long does that take?",
        why: "Weeks. You write to the university, they post a photocopy, it arrives. Every question you have after reading it starts that cycle again. That delay is what the Web removed — and understanding that it was the <i>problem</i> is what makes the rest of this make sense." },

      { t: "think",
        q: "The Internet existed for about twenty years before the Web. So what were people doing with it?",
        a: "Email, file transfer, message boards. It moved data between machines perfectly well — but every kind of thing you wanted to do needed its own program and its own address, and nothing linked to anything else. The wires were there. What was missing was a way to <b>connect documents to each other</b>." },

      { t: "def",
        term: "The Internet",
        en: "A global network of connected computers — the physical wires, satellites and agreed rules that let any machine send data to any other." },

      { t: "def",
        term: "The World Wide Web",
        en: "One of the things that runs on the Internet: a system of documents that link to each other, reached through a browser." },

      { t: "analogy",
        concept: "Internet vs Web",
        real: "roads vs the postal service",
        html: "Roads are the Internet: the physical thing everything travels on. The postal service is the Web — one particular system running on those roads, with its own addresses and rules. Email, video calls and online games are other services using the same roads. Saying \"the Internet\" when you mean \"the Web\" is like saying \"roads\" when you mean \"the post\"." },

      { t: "h2", n: "1", text: "1989: one man with a filing problem" },
      { t: "p", html: "Tim Berners-Lee worked at CERN, a physics lab where thousands of scientists came and went. Every one of them left behind documents on their own machine, in their own format. Finding out whether an experiment had already been done meant knowing who had done it, what machine it was on, and how to read their file." },
      { t: "p", html: "He wrote a proposal for a system where a document could point directly at another document, anywhere, and you could follow that pointer by clicking it. His manager's note on the proposal read: <i>\"Vague but exciting.\"</i>" },
      { t: "p", html: "To build it he needed three things, and he made all three: a way to <b>write</b> the documents (HTML), a way to <b>fetch</b> them (HTTP), and a way to <b>address</b> them (the URL). Those three are still what you are using right now." },

      { t: "note", variant: "key", html: "<b>HTML was invented to solve exactly one problem: linking documents together.</b> Everything else it does — images, forms, video — was added later, on top. That is why the link element is called <code>&lt;a&gt;</code>, for <b>anchor</b>: it was the original idea." },

      { t: "h2", n: "2", text: "Why HTML looks like that" },
      { t: "p", html: "Berners-Lee did not invent the angle brackets. He borrowed the shape from SGML, a document-markup system already in use at CERN for technical reports. That is why HTML looks like a document format rather than a programming language — because it <b>is</b> one." },
      { t: "p", html: "It also explains a design choice that frustrates beginners: a browser never refuses to render a broken page. Berners-Lee was building for scientists, not programmers, and a system that showed an error instead of the paper would have gone unused. So browsers repair what they can and show you something. Thirty-five years later that is still true, and it is why a missing closing tag produces a strange page rather than a clear error." },

      { t: "h2", n: "3", text: "The versions, briefly" },
      { t: "p", html: "HTML has been revised roughly every few years. The dates matter far less than the direction: each version added ways to say what content <b>means</b>, and took away ways to say how it should <b>look</b>." },

      { t: "note", variant: "tip", html: "<b>HTML 1 (1993)</b> — headings, paragraphs, links. About 20 elements.<br><b>HTML 4 (1997)</b> — the appearance tags (<code>&lt;font&gt;</code>, <code>&lt;center&gt;</code>) start being discouraged; CSS takes that job.<br><b>XHTML (2000)</b> — a strict version that refused to render broken pages. It lost, for the reason above.<br><b>HTML5 (2014)</b> — the current one. Adds <code>&lt;video&gt;</code>, <code>&lt;audio&gt;</code>, forms that validate themselves, and elements that say what a region <i>is</i>: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;article&gt;</code>." },

      { t: "p", html: "There will not be an HTML6. The specification is now a \"living standard\" — it is amended continuously rather than released in numbered versions, which is why nobody has to wait five years for a new element." },

      { t: "h2", n: "4", text: "Website, webpage, web app" },
      { t: "p", html: "A <b>webpage</b> is one document. A <b>website</b> is a collection of them under one domain. A <b>web app</b> is a website that behaves like a program — it changes what it shows in response to you rather than serving a fixed document. The line between the last two is blurry and nobody polices it." },

      { t: "mistakes", items: [
        { bad: "\"Tim Berners-Lee invented the Internet.\"", why: "The Internet already existed and was about twenty years old. He invented the Web — the documents-and-links system that runs on it.", fix: "\"Tim Berners-Lee invented the World Wide Web.\"" },
        { bad: "\"HTML is a programming language.\"", why: "It has no logic, no variables, no conditions. It was built from a document format, and it labels content rather than computing anything.", fix: "\"HTML is a markup language.\"" },
        { bad: "\"I need to learn HTML5 specifically.\"", why: "HTML5 is just what HTML has meant since 2014. There is no separate older HTML to learn instead.", fix: "\"I need to learn HTML.\"" },
      ] },

      { t: "recap", items: [
        "The <b>Internet</b> is the network; the <b>Web</b> is one service running on it",
        "The Web was invented in 1989 by Tim Berners-Lee, to link documents at CERN",
        "He built three things at once: HTML to write, HTTP to fetch, URL to address",
        "HTML came from a document format, which is why it labels rather than computes",
        "Browsers repair broken pages rather than refuse them — by original design",
        "HTML5 is a living standard now; there will be no HTML6",
      ] },

      { t: "quiz", items: [
        { level: "easy", q: "What is the difference between the Internet and the Web?", options: ["The Internet is the network of connected machines; the Web is one service running on it","They are two words for the same thing","The Web is older than the Internet","The Internet is for email and the Web is for browsing"], correct: 0, why: "The Internet is the roads. The Web is one thing that travels on them — email, video calls and games are others using the same infrastructure." },
        { level: "easy", q: "What problem was HTML invented to solve?", options: ["Making documents look attractive","Letting one document point directly at another so you could follow it","Storing scientific data efficiently","Running programs inside a browser"], correct: 1, why: "Linking. That is why the link element is <a>, for anchor — it was the whole original idea, and everything else was added on top of it." },
        { level: "easy", q: "Why does a browser render a page with a missing closing tag instead of showing an error?", options: ["Because browsers cannot detect the error","Because the specification does not define closing tags","Because it was built for scientists, not programmers, and refusing to show the document would have made it useless","Because HTML5 removed error reporting"], correct: 2, why: "It was a deliberate choice at the start and it has never been reversed. XHTML tried the strict approach in 2000 and lost." },
        { level: "medium", q: "What does it mean that HTML is now a \"living standard\"?", options: ["It changes differently in each browser","It is maintained by volunteers rather than a standards body","Old elements stop working after a few years","It is amended continuously rather than released as numbered versions"], correct: 3, why: "Which is why there will be no HTML6 — new elements arrive when they are ready instead of waiting for a version number." },
        { level: "medium", q: "Which three things did Berners-Lee have to invent together?", options: ["HTML to write documents, HTTP to fetch them, and the URL to address them","HTML, CSS and JavaScript","A browser, a server and a search engine","TCP, IP and DNS"], correct: 0, why: "None of the three is any use alone: a document nobody can fetch, a fetching rule with no address, or an address pointing at nothing." },
        { level: "medium", q: "In which direction has HTML changed across its versions?", options: ["Towards more control over appearance","Towards saying what content means, and away from saying how it looks","Towards stricter rules that reject invalid pages","Towards fewer elements overall"], correct: 1, why: "The appearance tags were handed to CSS, and the elements added since describe meaning — header, nav, article, figure." },
        { level: "medium", q: "What is the difference between a webpage and a website?", options: ["A webpage is static and a website is dynamic","A webpage has no links","A webpage is one document; a website is a collection of them under one domain","A website must have a database"], correct: 2, why: "And a web app is a website that responds to you rather than serving a fixed document — a blurry line nobody polices." },
        { level: "hard", q: "XHTML refused to render a page containing an error. Why did that approach fail?", options: ["It was too slow for the machines of the time","Browsers never implemented it","It could not express links","One typo anywhere took the whole page down, and the web is written largely by people who are not programmers"], correct: 3, why: "Strictness sounds like quality and in this case it moved the cost onto every author of every page. The forgiving parser won because the web is written by everyone." },
        { level: "hard", q: "Why does HTML use angle brackets and a document-like shape rather than looking like a programming language?", options: ["Because it was borrowed from SGML, a document markup system already in use at CERN","Because angle brackets are faster to parse","Because programming languages had not been invented yet","Because the first browsers could not read other characters"], correct: 0, why: "It looks like a document format because it is one. That inheritance explains both the shape and the forgiving behaviour." },
        { level: "hard", q: "You are told a company needs \"a website, not a web app\". What is actually being asked for?", options: ["Something with no JavaScript at all","Pages that mostly serve fixed content, rather than software that changes what it shows in response to the user","A single page","A site without a database"], correct: 1, why: "The distinction is about behaviour, not technology. A marketing site can carry plenty of JavaScript and still be a website in this sense." },
      ] },
    ],
  },

  {
    slug: "web-client-and-server",
    order: 2,
    title: "Client and Server: Who Is Asking, Who Is Answering",
    minutes: 14,
    content: [
      { t: "objectives", items: [
        "Name the two sides of every web interaction and what each does",
        "Say what a server actually is, in physical terms",
        "Tell a static site from a dynamic one, and why it matters to you",
        "Explain what hosting buys you and why your file on your laptop is not a website yet",
      ] },

      { t: "hook",
        q: "An HTML file sitting on your own computer opens perfectly in your browser. Why can nobody else on earth see it?",
        why: "Because your browser opened a file from your disk. Nothing asked anyone for it and nothing sent it anywhere. A website is a file that some machine, somewhere, is willing to hand to anybody who asks — and that machine is not your laptop." },

      { t: "def",
        term: "Client",
        en: "The machine doing the asking — your browser. It requests things and displays what comes back." },

      { t: "def",
        term: "Server",
        en: "A machine that waits for requests and answers them. It is an ordinary computer whose distinguishing feature is that it is always on and always listening." },

      { t: "analogy",
        concept: "client and server",
        real: "ordering at a restaurant",
        html: "You do not go into the kitchen. You ask, and something comes back. You do not know how many cooks there are, whether the dish was made fresh or reheated, or whether the kitchen is in this building. The whole arrangement works because the request and the answer are the only agreed part — which is exactly how the web works, and why a browser can talk to a server written in a language it has never heard of." },

      { t: "h2", n: "1", text: "A server is not a special kind of machine" },
      { t: "p", html: "\"Server\" is a job, not a category of hardware. Your own laptop can be one — you will make it one in the next module with a Live Server extension. What real servers have that yours does not is a permanent address, a fast connection, and somebody keeping them switched on." },
      { t: "p", html: "This is why <b>hosting</b> exists. You are renting a machine that is already always-on and already reachable, so that your files can be somewhere other people's requests can arrive." },

      { t: "note", variant: "tip", html: "Look at your address bar right now. A page you opened from your own disk starts <code>file:///</code>. A page from a server starts <code>http://</code> or <code>https://</code>. That prefix is the whole difference between a document and a website." },

      { t: "h2", n: "2", text: "Static and dynamic" },
      { t: "p", html: "A <b>static</b> site sends the same file to everybody. The server does no thinking — it finds the file and posts it. A <b>dynamic</b> site builds the page when the request arrives, so two people asking for the same address can get different pages: your name at the top, your orders, your language." },

      { t: "code", file: "static-vs-dynamic.html", code: "<!-- static: this file is sent to everyone, unchanged -->\n<h1>Welcome</h1>\n\n<!-- dynamic: the server fills the name in before sending -->\n<h1>Welcome, Jugendra</h1>", output: "Two pages that look almost identical and are produced completely differently." },
      { t: "psoft", html: "The HTML that arrives at the browser is the same shape either way. The browser cannot tell, and does not need to — the difference is entirely on the server's side of the conversation." },

      { t: "p", html: "Everything you write in this course is static, and that is not a limitation to apologise for. Static sites are faster, cheaper, harder to break into and simpler to host. A great many real, professional sites are static on purpose." },

      { t: "h2", n: "3", text: "What a browser actually does" },
      { t: "p", html: "A browser is four jobs in one program: it <b>asks</b> for files, it <b>parses</b> the HTML into a tree, it <b>renders</b> that tree into pixels, and it <b>runs</b> any JavaScript it was sent. When you write HTML, you are writing an instruction for step two — and steps three and four follow from what step two produced." },

      { t: "note", variant: "warn", html: "A <b>search engine</b> is not part of this. It is another program that visits sites, reads their HTML, and builds an index — it is a very well-organised visitor, not part of the browser or the server. That distinction matters in the SEO module, where the whole subject is what that visitor can and cannot understand." },

      { t: "mistakes", items: [
        { bad: "\"I made a website\" — after opening index.html from the desktop", why: "Nothing was served and nobody could reach it. It is a document that a browser can open.", fix: "It becomes a website once a server is handing it out at an address." },
        { bad: "\"Dynamic sites are better than static ones.\"", why: "They solve a different problem and cost more in every direction — speed, hosting, security, complexity. Dynamic is what you use when the page genuinely must differ per visitor.", fix: "\"Dynamic sites are for pages that must differ per visitor.\"" },
        { bad: "\"The server sends the page to the browser to display.\"", why: "Close, and it hides the important part: the browser asked first. Servers never send anything unrequested.", fix: "\"The browser requests it, and the server answers.\"" },
      ] },

      { t: "recap", items: [
        "The <b>client</b> asks; the <b>server</b> answers. Nothing is sent unrequested",
        "A server is an ordinary machine that is always on and always listening",
        "Hosting is renting one of those, so your files are reachable",
        "<code>file:///</code> means your disk; <code>http(s)://</code> means a server",
        "Static sends everyone the same file; dynamic builds it per request",
        "A browser asks, parses, renders and runs — HTML is the input to parsing",
      ] },

      { t: "quiz", items: [
        { level: "easy", q: "What makes a computer a server?", options: ["That it waits for requests and answers them","Special server hardware","That it has no screen","That it runs Linux"], correct: 0, why: "It is a job, not a category of machine. Your laptop becomes one the moment it starts listening for requests." },
        { level: "easy", q: "Your address bar shows file:///C:/site/index.html. What does that tell you?", options: ["The page came from a server on your network","The browser opened a file from your own disk — nothing was served","The page is not secure","The site is static"], correct: 1, why: "No request left your machine. That prefix is the difference between having a document and having a website." },
        { level: "easy", q: "What does a hosting company actually sell you?", options: ["A domain name","A copy of your website","A machine that is always on and reachable, to keep your files on","Faster internet"], correct: 2, why: "Your laptop could serve the same files. What it does not have is a permanent address, a fast connection, and someone keeping it switched on." },
        { level: "medium", q: "What is the difference between a static and a dynamic site?", options: ["Static sites have no JavaScript","Dynamic sites are always faster","Static sites cannot have images","Static sends everyone the same file; dynamic builds the page per request"], correct: 3, why: "The HTML that arrives looks the same either way. The difference is entirely on the server's side." },
        { level: "medium", q: "Which of these is NOT one of the browser's four jobs?", options: ["Indexing the page so it can be searched for later","Requesting files","Parsing HTML into a tree","Rendering the tree into pixels"], correct: 0, why: "Indexing is what a search engine does — a separate program that visits sites and reads their HTML. It is a well-organised visitor, not part of the browser." },
        { level: "medium", q: "Why is \"static\" a reasonable choice for a real professional site?", options: ["It is the only option without a paid host","Faster, cheaper, harder to attack and simpler to host","It ranks better in search by default","It supports more HTML elements"], correct: 1, why: "Dynamic solves a specific problem — pages that must differ per visitor — and costs more in every direction. Plenty of serious sites are static on purpose." },
        { level: "hard", q: "A page shows your name at the top when you are logged in. What does that tell you about how it was produced?", options: ["It must use JavaScript","It cannot be cached","Either the server built it per request, or something ran in the browser after loading — the page could not have been one fixed file for everyone","It is not a real website"], correct: 2, why: "Both routes exist and the question is only whether the personalisation happened before the file was sent or after it arrived. What is ruled out is one fixed file served to all." },
        { level: "hard", q: "Why can a browser talk to a server written in a language it has never heard of?", options: ["Browsers ship with every language runtime","The server translates itself first","Servers must be written in C","Only the request and the response are agreed; how each side produces them is nobody else's business"], correct: 3, why: "The same reason you never enter the restaurant kitchen. That narrow agreement is what has let the web survive thirty-five years of both sides being rewritten." },
      ] },
    ],
  },

  {
    slug: "web-addresses",
    order: 3,
    title: "Addresses: IP, Domains, DNS and the URL",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Explain what an IP address is and why you never type one",
        "Describe what DNS does, in one sentence",
        "Break a URL into its parts and name each one",
        "Say what you are actually buying when you buy a domain",
      ] },

      { t: "hook",
        q: "Machines find each other by number. You have never typed one. Something is doing that translation on every single request — what?",
        why: "DNS. It is the piece of the web nobody thinks about until it breaks, and then it is the only thing anyone talks about." },

      { t: "def",
        term: "IP address",
        en: "The number that identifies a machine on a network, such as 142.250.4.100. Every device that talks to the Internet has one." },

      { t: "def",
        term: "DNS",
        en: "The Domain Name System — the service that turns a name a human can remember into the IP address a machine needs." },

      { t: "analogy",
        concept: "DNS",
        real: "the contacts app on your phone",
        html: "You do not remember phone numbers any more; you remember names, and something looks the number up in the instant before the call connects. DNS is that lookup for the whole Internet. And like a contacts app, when it holds the wrong number you do not get an error saying so — you reach the wrong place, or nowhere." },

      { t: "h2", n: "1", text: "The lookup, step by step" },
      { t: "p", html: "You type <code>example.com</code>. Before anything else can happen, your machine has to turn that into a number. It checks, in order: its own memory of recent lookups, then the operating system's, then a DNS server — usually your internet provider's, or a public one like <code>8.8.8.8</code>." },
      { t: "p", html: "That answer comes back with a <b>time to live</b> — how long it may be remembered before asking again. This is why a domain change can take hours to reach everybody: machines all over the world are still using an answer they were told was good for another day." },

      { t: "note", variant: "key", html: "When somebody says a site \"has not propagated yet\", this is what they mean. Nothing is travelling anywhere — old answers are simply still inside their time to live, and there is no way to reach into other people's machines and clear them." },

      { t: "h2", n: "2", text: "What a domain actually is" },
      { t: "p", html: "You do not buy a domain. You <b>rent</b> the right to point a name at an address, usually a year at a time, from a registrar. Stop paying and the name goes back on the market — which is how companies lose domains they have used for a decade." },

      { t: "syntax",
        intro: "A domain reads right to left, from the broadest part to the most specific.",
        form: "blog.example.co.in\n |     |     |  |\n |     |     |  +-- country\n |     |     +----- kind of organisation\n |     +----------- the name that was registered\n +----------------- subdomain, added by the owner",
        parts: [
          { bit: "blog", says: "A subdomain. The owner creates as many as they like, free, at any time — <code>shop</code>, <code>mail</code>, <code>docs</code> are all just this." },
          { bit: "example", says: "The part that was actually registered and paid for. This is the domain in everyday speech." },
          { bit: "co", says: "A second-level suffix used in some countries to say what kind of organisation it is." },
          { bit: "in", says: "The top-level domain. <code>.com</code>, <code>.org</code>, <code>.in</code> — read last but sorted first, because the system resolves names from right to left." },
        ],
        note: "A subdomain costs nothing and is yours to create. A new domain has to be registered and paid for. That is the entire practical difference, and it decides how most sites are organised.",
      },

      { t: "h2", n: "3", text: "The URL, part by part" },
      { t: "syntax",
        intro: "Everything a browser needs to fetch one specific thing, in one string.",
        form: "https://shop.example.com:443/products/shoes?size=9&colour=blue#reviews",
        parts: [
          { bit: "https", says: "The scheme — which rules to use. <code>https</code> is HTTP with encryption; <code>file</code> means your own disk." },
          { bit: "://", says: "Separator. No meaning of its own, and it has to be exactly this." },
          { bit: "shop.example.com", says: "The host. This is the part DNS turns into an IP address." },
          { bit: ":443", says: "The port — which door on that machine. Almost always left out, because 443 for https and 80 for http are assumed." },
          { bit: "/products/shoes", says: "The path — which resource on that host. It looks like folders and often is not; a server can interpret it however it likes." },
          { bit: "?size=9&colour=blue", says: "The query string. <code>?</code> starts it, <code>&</code> joins pairs. Extra instructions for the server, and visible to anyone watching the address bar." },
          { bit: "#reviews", says: "The fragment — which part of the page to scroll to. Handled entirely by the browser and <b>never sent to the server</b>." },
        ],
        note: "The fragment never leaves your machine. That is why linking to a heading is instant and needs no request, and also why a server can never log which section of a page you jumped to.",
      },

      { t: "note", variant: "warn", html: "Because the query string is part of the address, it is stored in browser history, in server logs, and in the referrer header sent to the next site. Never put a password or a token in one — that mistake ends up in three places you do not control." },

      { t: "mistakes", items: [
        { bad: "\"I bought the domain, so it is mine forever.\"", why: "It is rented, normally a year at a time. Registrations lapse and get taken.", fix: "\"I have registered it until next March.\"" },
        { bad: "\"DNS changes are still travelling to other countries.\"", why: "Nothing travels. Machines elsewhere are still using a cached answer until its time to live expires.", fix: "\"Old answers are still cached and have not expired yet.\"" },
        { bad: "example.com/login?password=hunter2", why: "The query string is logged by the server, kept in browser history and passed on in the referrer.", fix: "Send secrets in the body of a POST request — the Forms module covers this." },
      ] },

      { t: "recap", items: [
        "Machines route by <b>IP address</b>; humans use names",
        "<b>DNS</b> translates one into the other before any request is made",
        "Cached DNS answers have a time to live — that is what \"propagation\" means",
        "A domain is <b>rented</b>, not owned; subdomains are free and yours",
        "A URL is scheme, host, port, path, query and fragment",
        "The fragment never reaches the server; the query string reaches everything",
      ] },

      { t: "quiz", items: [
        { level: "easy", q: "What does DNS do?", options: ["Turns a domain name into the IP address a machine needs","Encrypts the connection","Stores your website's files","Decides which server is fastest"], correct: 0, why: "It happens before any request is made — there is nothing to connect to until the name has become a number." },
        { level: "easy", q: "In https://example.com/shop?id=5#top, which part is the host?", options: ["https","example.com","/shop","#top"], correct: 1, why: "That is the part DNS resolves. Everything after it tells the server which resource, and the fragment never gets there at all." },
        { level: "easy", q: "What do you get when you buy a domain?", options: ["Permanent ownership of the name","A server to put your files on","The right to point that name somewhere, rented for a fixed period","An SSL certificate"], correct: 2, why: "Stop paying and it returns to the market. Companies have lost long-held domains exactly this way." },
        { level: "medium", q: "Which part of a URL is never sent to the server?", options: ["The query string","The path","The port","The fragment after #"], correct: 3, why: "The browser keeps it. That is why jumping to a heading is instant, and why a server cannot log which section you read." },
        { level: "medium", q: "You changed your domain's IP but some people still reach the old server. Why?", options: ["Their machines are using a cached DNS answer that has not yet expired","The change is still travelling across the network","Their browsers are broken","The old server is refusing to release the name"], correct: 0, why: "Nothing travels. Every cached answer carries a time to live, and there is no way to clear other people's caches." },
        { level: "medium", q: "What is the practical difference between a subdomain and a domain?", options: ["Subdomains cannot have their own pages","A subdomain is free and you create it yourself; a domain must be registered and paid for","Subdomains are less secure","Search engines ignore subdomains"], correct: 1, why: "That one difference decides how most large sites are organised — shop, blog and docs are usually subdomains for exactly this reason." },
        { level: "hard", q: "Why is it dangerous to put a token in a query string?", options: ["Query strings have a length limit","Query strings are not encrypted even over HTTPS","It is stored in browser history, in server logs, and passed to the next site in the referrer header","Search engines index them"], correct: 2, why: "HTTPS does encrypt it in transit, which is what makes this trap easy to miss — the leak is at both ends and in the logs, not on the wire." },
        { level: "hard", q: "Why does a domain resolve from right to left?", options: ["Because it reads faster that way","Because of a limitation in early DNS software","It does not — it resolves left to right","Because the system is a hierarchy, and the rightmost part says which authority to ask next"], correct: 3, why: "Ask who is responsible for .in, then who is responsible for example within it. Each step narrows the search, which is why one machine never has to hold the whole Internet's names." },
      ] },
    ],
  },

  {
    slug: "web-http-and-https",
    order: 4,
    title: "HTTP, HTTPS and the Padlock",
    minutes: 14,
    content: [
      { t: "objectives", items: [
        "Describe what a request and a response actually contain",
        "Read a status code and know roughly what went wrong",
        "Say what HTTPS protects and — just as important — what it does not",
        "Explain cookies and caching well enough to reason about them",
      ] },

      { t: "hook",
        q: "A browser and a server have never met, run different software, and sit on different continents. They agree on nothing except one thing. What is it?",
        why: "The shape of the conversation. HTTP is not a program — it is the agreed format for asking and answering, and that agreement is the only reason any of this works." },

      { t: "def",
        term: "HTTP",
        en: "HyperText Transfer Protocol — the agreed format for a client's request and a server's response." },

      { t: "analogy",
        concept: "an HTTP request",
        real: "a filled-in order form",
        html: "The form has fixed boxes: what you want, where from, who is asking, what formats you can accept. The person reading it does not need to know you — they only need to read the boxes. And every reply comes back on a matching form, with a code at the top saying how it went." },

      { t: "syntax",
        intro: "A request and its response, with everything a browser sends every time.",
        form: "GET /products/shoes HTTP/1.1\nHost: example.com\nAccept: text/html\n\n---\n\nHTTP/1.1 200 OK\nContent-Type: text/html\nSet-Cookie: session=abc123\n\n<html>...</html>",
        parts: [
          { bit: "GET", says: "The method — what kind of action. <code>GET</code> fetches something, <code>POST</code> submits something. The Forms module returns to this properly." },
          { bit: "/products/shoes", says: "Which resource, from the path part of the URL." },
          { bit: "Host", says: "Which site. One machine serves hundreds of domains, so this header is how it knows which one you meant." },
          { bit: "Accept", says: "What the client can handle. Headers are the extra context that stops the request being just a filename." },
          { bit: "200", says: "The status code. The single most useful number in web development." },
          { bit: "Content-Type", says: "What the reply is. Send HTML labelled as plain text and the browser shows you tags instead of a page — the label decides, not the content." },
          { bit: "Set-Cookie", says: "\"Remember this and send it back next time.\" This is the entire mechanism behind staying logged in." },
        ],
        note: "HTTP is <b>stateless</b>: the server forgets you the instant it answers. Every request arrives with no memory of the last one, which is exactly the problem cookies were invented to solve.",
      },

      { t: "h2", n: "1", text: "Status codes, by their first digit" },
      { t: "p", html: "There are dozens and you do not need them all. The first digit tells you who has the problem, and that is usually enough to know where to look." },

      { t: "note", variant: "tip", html: "<b>2xx — it worked.</b> 200 OK, 201 Created.<br><b>3xx — look somewhere else.</b> 301 moved permanently, 302 temporarily.<br><b>4xx — you asked wrongly.</b> 404 not found, 401 not logged in, 403 not allowed.<br><b>5xx — the server broke.</b> 500 internal error, 503 unavailable.<br><br>4xx is your fault, 5xx is theirs. That one split saves an enormous amount of debugging." },

      { t: "h2", n: "2", text: "What the padlock means, and what it does not" },
      { t: "p", html: "HTTPS is HTTP with the connection encrypted, using TLS — often still called SSL after the older protocol it replaced. It does two things: nobody in between can <b>read</b> what passes, and nobody in between can <b>change</b> it." },
      { t: "p", html: "It also does something quieter: the certificate proves the server really is the one that owns that domain. Without it, a machine on your café's wifi can answer for any site it likes." },

      { t: "note", variant: "warn", html: "<b>The padlock does not mean the site is trustworthy.</b> A certificate is free and takes two minutes, so a phishing page has one too. It certifies the connection and the domain — nothing about the honesty of the people behind it. Read the domain, not the padlock." },

      { t: "h2", n: "3", text: "Cookies and cache, briefly" },
      { t: "p", html: "A <b>cookie</b> is a small piece of text the server asks the browser to store and send back on every later request. Because HTTP forgets you between requests, this is how anything remembers anything: your session, your language, your cart." },
      { t: "p", html: "The <b>cache</b> is a copy the browser keeps of things it has already downloaded, so the second visit does not fetch them again. It is why a site feels instant the second time — and why your CSS change sometimes does not show up until a hard refresh." },

      { t: "mistakes", items: [
        { bad: "\"The padlock means the site is safe.\"", why: "It means the connection is encrypted and the domain is verified. Phishing sites have padlocks.", fix: "\"The padlock means nobody in between can read this. It says nothing about who I am talking to being honest.\"" },
        { bad: "\"My change is not showing — the code must be broken.\"", why: "Very often the browser is serving a cached copy of the old file.", fix: "Hard refresh (Ctrl+Shift+R) before assuming the code is wrong." },
        { bad: "\"A 500 error means I made a mistake in my request.\"", why: "5xx is the server failing. 4xx is the request being wrong.", fix: "First digit 4 is yours; first digit 5 is theirs." },
      ] },

      { t: "recap", items: [
        "HTTP is the agreed <b>shape</b> of a request and a response, not a program",
        "A request carries a method, a path and headers; a response carries a status and a body",
        "HTTP is stateless — cookies exist because the server forgets you",
        "2xx worked · 3xx go elsewhere · 4xx your fault · 5xx theirs",
        "HTTPS encrypts the connection and proves the domain — not the honesty of the owner",
        "The cache is why the second visit is fast, and why your edit sometimes will not appear",
      ] },

      { t: "quiz", items: [
        { level: "easy", q: "What does HTTP actually define?", options: ["The agreed format of a request and a response","A programming language for servers","How files are stored on a server","The encryption used on the connection"], correct: 0, why: "It is an agreement about shape, which is why a browser can talk to a server written in a language it has never heard of." },
        { level: "easy", q: "You get a 404. Whose problem is it?", options: ["The server's — it has crashed","The request's — that resource is not there","Nobody's, it is a redirect","The connection's"], correct: 1, why: "4xx means the request was wrong. 5xx would mean the server itself failed." },
        { level: "easy", q: "Why do cookies exist?", options: ["To make pages load faster","To track advertising","Because HTTP is stateless — the server forgets you the moment it answers","To store images locally"], correct: 2, why: "Tracking is one use it was later put to. The mechanism exists because there was no other way for a second request to be connected to the first." },
        { level: "medium", q: "A response says Content-Type: text/plain but the body is HTML. What happens?", options: ["The browser detects HTML and renders it","The request fails","The server refuses to send it","The browser shows the raw tags as text"], correct: 3, why: "The label decides, not the content. This is the whole reason a mislabelled response shows tags on screen instead of a page." },
        { level: "medium", q: "What does the padlock icon guarantee?", options: ["The connection is encrypted and the domain is verified","The site is trustworthy","The site has been reviewed by the browser vendor","The site does not use cookies"], correct: 0, why: "Certificates are free and quick, so phishing pages have them too. Read the domain rather than the icon." },
        { level: "medium", q: "Your CSS change is not appearing after a reload. What is the most likely cause?", options: ["The file did not save","The browser is serving a cached copy","The server rejected the file","HTTPS is blocking it"], correct: 1, why: "Hard refresh before assuming the code is wrong. This is the commonest false alarm in front-end work." },
        { level: "hard", q: "One machine serves five hundred different domains. How does it know which site a request is for?", options: ["From the IP address","From the port number","From the Host header in the request","From the TLS certificate"], correct: 2, why: "They all share the IP. The Host header is what makes shared hosting possible at all — without it a machine could serve exactly one site." },
        { level: "hard", q: "HTTPS encrypts the connection. Why is putting a token in the query string still a bad idea?", options: ["Query strings are excluded from encryption","HTTPS only encrypts the body","Query strings have a size limit","It is encrypted in transit but still lands in browser history, server logs and the referrer header"], correct: 3, why: "Encryption protects the middle of the journey. The leak is at both ends, which is exactly what makes this mistake easy to miss." },
      ] },
    ],
  },

  {
    slug: "web-typing-a-url",
    order: 5,
    title: "What Happens When You Type a URL",
    minutes: 13,
    content: [
      { t: "objectives", items: [
        "Walk the whole journey from keypress to rendered page, in order",
        "Say where your HTML file enters that journey",
        "Use this to reason about why a page is slow or blank",
        "Answer the single most-asked web interview question",
      ] },

      { t: "hook",
        q: "This is asked in almost every web interview, and it is not a trivia question. Someone answering it well has understood how the whole thing fits together — and someone who has not will guess.",
        why: "You already know every piece. This lesson only puts them in order." },

      { t: "h2", n: "1", text: "The journey, in eight steps" },
      { t: "p", html: "You type <code>example.com</code> and press Enter. Here is everything that happens before you see anything." },

      { t: "syntax",
        intro: "Learn the order rather than the wording. Every step here was a lesson in this module.",
        form: "1. parse the URL      -> scheme, host, path\n2. DNS lookup        -> host becomes an IP address\n3. TCP connection    -> open a channel to that IP\n4. TLS handshake     -> agree encryption, check the certificate\n5. HTTP request      -> GET /, plus headers\n6. server responds   -> status code + the HTML\n7. parse HTML        -> build the tree, fetch CSS/images/JS\n8. render           -> paint the tree onto the screen",
        parts: [
          { bit: "parse the URL", says: "The browser splits it up, and fills in what you left out — no scheme means https is tried, no path means /." },
          { bit: "DNS lookup", says: "Cache first, then the operating system, then a DNS server. Nothing can happen until the name is a number." },
          { bit: "TCP connection", says: "A channel is opened to that address before any web content moves. This costs a round trip, which is why a distant server feels slow even for a small page." },
          { bit: "TLS handshake", says: "Only for https. Both sides agree how to encrypt, and the browser checks the certificate really belongs to this domain." },
          { bit: "HTTP request", says: "The order form from the last lesson: method, path, headers." },
          { bit: "server responds", says: "A status code and, if all went well, your HTML. Static means it read a file; dynamic means it built one." },
          { bit: "parse HTML", says: "The browser reads your markup into a tree — and as it goes it finds more things it needs and requests each of them. <b>This is where your file enters the story.</b>" },
          { bit: "render", says: "The tree, plus its styles, becomes pixels. Anything that arrives later triggers more of this." },
        ],
        note: "Steps 1 to 6 are identical for every site on the internet. Only 7 and 8 depend on what you wrote — which is why this course is entirely about giving step 7 something good to work with.",
      },

      { t: "h2", n: "2", text: "Why the order is useful" },
      { t: "p", html: "Knowing the sequence turns vague problems into located ones. Where a page fails tells you which step broke." },

      { t: "note", variant: "key", html: "<b>Nothing loads, no error page</b> — step 2 or 3: the name did not resolve, or the machine did not answer.<br><b>Certificate warning</b> — step 4.<br><b>404 or 500</b> — step 6: you reached the server and it had something to say.<br><b>Page loads but looks wrong</b> — step 7 or 8, and it is your HTML or CSS.<br><b>Page appears, then jumps about</b> — step 8 running repeatedly as late arrivals change the layout." },

      { t: "h2", n: "3", text: "Why the first visit is slow and the second is not" },
      { t: "p", html: "On the second visit the DNS answer is cached, the connection can often be reused, and the images and CSS are already on disk. Steps 2, 3 and half of 7 mostly disappear — which is the entire reason a site feels different the second time, and why testing only on a warm cache hides how the site feels to a new visitor." },

      { t: "mistakes", items: [
        { bad: "\"The page is blank, so my HTML is broken.\"", why: "A blank page can be any of eight steps. Check whether the request even reached the server first.", fix: "Open DevTools → Network. If there is no response, the problem is before your file." },
        { bad: "\"It works on my machine, so it works.\"", why: "Your machine has warm DNS, a warm cache and a fast local connection. A first-time visitor has none of that.", fix: "Test once with the cache disabled — that is the real first impression." },
      ] },

      { t: "recap", items: [
        "URL parsed → DNS → TCP → TLS → request → response → parse → render",
        "Steps 1-6 are the same for every site; only 7 and 8 are yours",
        "Your HTML enters at step 7, and step 8 follows from what it found",
        "Where it fails tells you which step to look at",
        "The second visit skips most of the early steps — so test cold, not warm",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What happens when you type a URL and press Enter?", a: "The browser parses the URL, resolves the host with DNS, opens a TCP connection, does a TLS handshake if it is https, sends an HTTP request, receives a status code and the HTML, parses that into a tree while fetching the CSS, images and scripts it references, and renders the result. Every one of those steps can fail differently, which is what makes the question worth asking." },
        { level: "medium", q: "Where in that sequence does the HTML you wrote first matter?", a: "Step 7. Everything before it is identical whatever the site is — the same DNS, the same connection, the same request format. The HTML is the first point at which one site differs from another, which is also why it decides so much about what happens afterwards." },
        { level: "hard", q: "A page loads and then visibly jumps around for a second. Which step, and why?", a: "Rendering, running again. The browser laid the page out with what had arrived, then something later — an image with no dimensions, a font, an injected element — changed the size of something already placed, and everything below it moved. It is measured as Cumulative Layout Shift, and the usual fix is telling the browser the size in advance." },
      ] },

      { t: "quiz", items: [
        { level: "easy", q: "What is the first thing that happens after you press Enter?", options: ["The browser parses the URL and works out the host","The server is contacted","The HTML is downloaded","DNS is queried"], correct: 0, why: "It cannot look anything up until it knows what the host part is — and it also fills in what you left out, like the scheme." },
        { level: "easy", q: "At which step does the HTML you wrote first matter?", options: ["DNS lookup","Parsing the HTML into a tree","The TLS handshake","The TCP connection"], correct: 1, why: "Steps 1 to 6 are identical for every site on the internet. Your file is the first thing that makes one page different from another." },
        { level: "easy", q: "The browser shows a certificate warning. Which step?", options: ["DNS lookup","The HTTP request","The TLS handshake","Rendering"], correct: 2, why: "That is where the certificate is checked against the domain — before any web content has moved." },
        { level: "medium", q: "A page loads nothing at all and shows no error page. Which steps are the likely suspects?", options: ["Parsing and rendering","The HTTP request and response","The TLS handshake","DNS or the TCP connection — the name did not resolve, or the machine did not answer"], correct: 3, why: "A 404 or 500 would mean you reached the server. Silence means the conversation never started." },
        { level: "medium", q: "Why is the second visit to a site so much faster?", options: ["The DNS answer is cached, the connection can be reused, and the assets are already on disk","Servers prioritise returning visitors","The browser compresses the page after the first visit","HTTPS is skipped the second time"], correct: 0, why: "Which is why testing on a warm cache hides how the site actually feels to somebody arriving for the first time." },
        { level: "hard", q: "Why does a distant server feel slow even for a tiny page?", options: ["Large files take longer over distance","Every round trip costs time, and connecting and negotiating encryption take several before any content moves","DNS is slower for foreign domains","Browsers throttle foreign connections"], correct: 1, why: "The size of the page is almost irrelevant at that point. It is the number of round trips before the first byte, which is exactly what CDNs exist to reduce." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 1 — ENVIRONMENT SETUP
   *
   * Short on purpose. Nobody learns anything from a tour of a settings screen,
   * and a student who cannot see their own page change is going to give up long
   * before any lesson about elements helps them.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-setup",
    order: 6,
    title: "Your Setup: Editor, Live Server, First File",
    minutes: 12,
    content: [
      { t: "objectives", items: [
        "Have VS Code installed with the two extensions worth having",
        "See your page reload by itself the moment you save",
        "Organise a project so it still makes sense at twenty files",
        "Know why a file must be called <code>index.html</code>",
      ] },

      { t: "hook",
        q: "You can write HTML in Notepad and open it in any browser. So why does anyone install anything?",
        why: "Because of the loop. Edit, save, switch window, press F5, look. Do that four hundred times in an afternoon and the pressing is most of the afternoon. Everything below exists to shorten that loop." },

      { t: "h2", n: "1", text: "The editor" },
      { t: "p", html: "Install <b>VS Code</b> — it is free, it is what most of the industry uses, and every tutorial you find assumes it. Then two extensions, and only two:" },

      { t: "note", variant: "tip", html: "<b>Live Server</b> (Ritwick Dey) — right-click your file, \"Open with Live Server\", and the browser reloads itself every time you save. This is the one that matters.<br><br><b>Prettier</b> — formats your file on save, so indentation stops being something you maintain by hand. In HTML, indentation is how you spot a tag that never closed." },

      { t: "p", html: "Resist the rest for now. An editor loaded with twenty extensions you do not understand is slower and no better, and the ones that auto-write HTML for you will happily teach you nothing." },

      { t: "note", variant: "key", html: "Live Server also changes something real, not just convenience. Opening a file directly gives you <code>file:///</code>; Live Server gives you <code>http://127.0.0.1:5500</code> — an actual server on your own machine. Some things simply do not work over <code>file:///</code>, and later modules depend on the difference." },

      { t: "h2", n: "2", text: "Where files go" },
      { t: "syntax",
        intro: "This shape works from your first page to a real site. Start here even for one file.",
        form: "my-site/\n  index.html      <- the home page, this exact name\n  about.html\n  css/\n    style.css\n  images/\n    logo.png\n  js/\n    main.js",
        parts: [
          { bit: "my-site", says: "The project folder. Everything lives inside it, so the whole site can be moved or uploaded as one thing." },
          { bit: "index.html", says: "The name servers look for when nobody asks for a file. <code>example.com</code> serves <code>index.html</code> without it ever appearing in the address." },
          { bit: "about.html", says: "Other pages sit beside it. Lowercase, no spaces — a space becomes <code>%20</code> in every link to it." },
          { bit: "css", says: "Stylesheets, in their own folder. One file is fine; the folder is for when it is not one file." },
          { bit: "images", says: "Pictures. Keeping them apart is what stops the project folder becoming forty items you have to read past." },
          { bit: "js", says: "Scripts, for later. Empty for now and worth creating anyway." },
        ],
        note: "Lowercase names, hyphens instead of spaces, no capitals. Windows treats <code>About.html</code> and <code>about.html</code> as the same file and most servers do not — which is a link that works on your machine and 404s for everyone else.",
      },

      { t: "h2", n: "3", text: "The loop" },
      { t: "p", html: "Create the folder, create <code>index.html</code>, type <code>!</code> and press Tab — VS Code writes the whole skeleton from Module 2 for you. Then right-click the file and choose Open with Live Server." },
      { t: "p", html: "Now put the browser on one half of the screen and the editor on the other, and change a heading. It updates as you save, with nothing to press. That is the loop, and it is the single biggest thing separating an hour that teaches you something from an hour that exhausts you." },

      { t: "mistakes", items: [
        { bad: "my site/About Page.html", why: "Spaces become %20 in every URL, and capitals break on servers that are case-sensitive even though they work on Windows.", fix: "my-site/about-page.html" },
        { bad: "home.html", why: "A server looking for a default page looks for index.html. Calling it anything else means the address only works with the filename in it.", fix: "index.html" },
        { bad: "index.html.txt", why: "Windows hides known extensions, so a file saved from Notepad is often really a .txt. The browser then shows your markup as text.", fix: "Turn on file extensions in Explorer, and save from VS Code." },
      ] },

      { t: "recap", items: [
        "VS Code, plus <b>Live Server</b> and <b>Prettier</b> — nothing else yet",
        "Live Server reloads on save and serves over <code>http://</code>, not <code>file:///</code>",
        "The home page must be called <code>index.html</code>",
        "Lowercase, hyphens, no spaces — every time",
        "<code>!</code> then Tab writes the skeleton",
      ] },
    ],
  },

  {
    slug: "html-devtools",
    order: 7,
    title: "DevTools: Seeing What the Browser Sees",
    minutes: 13,
    content: [
      { t: "objectives", items: [
        "Open DevTools and read the Elements panel",
        "Understand why what you see there is not your file",
        "Use the Network panel to tell a broken page from a broken request",
        "Read the Console instead of guessing",
      ] },

      { t: "hook",
        q: "Your page looks wrong. You have read your file four times and it looks right. What now?",
        why: "Stop reading the file. The file is what you wrote; DevTools shows what the browser actually built out of it — and when those differ, the difference is the bug." },

      { t: "def",
        term: "DevTools",
        en: "A set of panels built into every browser that show what the page became: its structure, its styles, its requests and its errors. F12, or right-click and Inspect." },

      { t: "analogy",
        concept: "Elements panel vs your file",
        real: "an X-ray, not the photograph",
        html: "A photograph shows what you presented. An X-ray shows what is actually inside — including the bones you did not know were broken. Your HTML file is the photograph; the Elements panel is the X-ray of what the browser built after repairing your mistakes." },

      { t: "h2", n: "1", text: "Elements: the repaired page" },
      { t: "p", html: "Right-click anything on any page and choose <b>Inspect</b>. The Elements panel opens with that exact element highlighted, inside the whole tree." },
      { t: "p", html: "The crucial thing: this is <b>not your file</b>. It is the DOM — the tree the browser built, after it silently repaired everything you got wrong. A tag you never closed shows up closed here. A <code>&lt;p&gt;</code> you nested inside another <code>&lt;p&gt;</code> shows up moved." },

      { t: "note", variant: "key", html: "<b>That difference is the most useful debugging signal you have.</b> When the Elements tree does not match the file you wrote, the browser is telling you exactly which mistake it had to fix — and the shape it chose is why your page looks wrong." },

      { t: "p", html: "You can edit in there — double-click any text or attribute and change it. Nothing is saved; refresh and it is gone. That is what makes it worth doing: it is a free place to try something before touching the file." },

      { t: "h2", n: "2", text: "Network: did it even arrive?" },
      { t: "p", html: "Open the <b>Network</b> panel and reload. Every request the page made is listed with its status code — the same codes from Module 0." },

      { t: "note", variant: "tip", html: "<b>Image not showing?</b> Network will show a 404 against it, and the path in that row is exactly what the browser asked for. Nine times out of ten it is a folder name or a capital letter.<br><br><b>Style change not applying?</b> If the CSS file is not in the list at all, the <code>&lt;link&gt;</code> never worked — which is a different problem from a rule that is being overridden." },

      { t: "p", html: "There is a <b>Disable cache</b> tickbox there. Turn it on while you work: it removes the entire class of bug where your change is correct and you are looking at yesterday's file." },

      { t: "h2", n: "3", text: "Console: read it" },
      { t: "p", html: "The <b>Console</b> is where the browser reports what went wrong. It is genuinely worth reading rather than clearing — a red line naming a file and a line number is a better answer than anything you would have guessed." },

      { t: "debug",
        intro: "A student says \"my image is broken and the path is definitely right\". This is the markup. Decide what to check before opening the fix.",
        code: "<img src=\"Images/logo.png\" alt=\"Logo\">",
        symptom: "Broken-image icon on the page. Network panel shows 404 for /Images/logo.png. The folder on disk is called images.",
        q: "It works when they open the file directly on Windows and breaks once it is on a server. Why?",
        fix: "<img src=\"images/logo.png\" alt=\"Logo\">",
        why: "Windows treats <code>Images</code> and <code>images</code> as the same folder, so it worked locally. Almost every real server is case-sensitive and looks for a folder that does not exist. This is the single commonest \"but it works on my machine\" bug in web development, and the Network panel names it in one line: the 404 shows the exact path that was requested, capital and all." },

      { t: "mistakes", items: [
        { bad: "Reading your HTML file again for the fifth time", why: "The file is what you wrote. The bug is usually in what the browser built from it.", fix: "Open Elements and compare the tree against what you expected." },
        { bad: "Clearing the console because it looks messy", why: "The red lines name the file and the line. That is the answer you were about to spend twenty minutes looking for.", fix: "Read it first." },
        { bad: "\"The image path is right\" — without checking Network", why: "The Network row shows the exact path requested. Guessing cannot compete with that.", fix: "Open Network, find the 404, read the path." },
      ] },

      { t: "recap", items: [
        "F12 or right-click → Inspect",
        "<b>Elements</b> shows the DOM — the repaired page, not your file",
        "Where the tree differs from your file, that gap <b>is</b> the bug",
        "Edits there are temporary, which makes them safe to experiment with",
        "<b>Network</b> answers \"did it arrive?\" — and tick Disable cache",
        "<b>Console</b> names the file and the line. Read it",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between your HTML file and what the Elements panel shows?", a: "The file is the source you wrote. Elements shows the DOM — what the browser built after parsing it, including every repair it made to invalid markup and anything added since by script. They are often not the same, and the difference is usually the bug." },
        { level: "medium", q: "A page works locally and 404s on images once deployed. Where do you look first?", a: "The Network panel, at the failing request's path. It is nearly always a capital letter or a folder name: Windows is case-insensitive and most servers are not, so a path that worked on the machine it was written on cannot be found anywhere else." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 2 — HTML BASICS
   *
   * Where the first line of markup is written, and where graded practice starts.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-what-it-is",
    order: 8,
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

      { t: "note", variant: "tip", html: "<b>Try it now.</b> Make a file called <code>index.html</code>, paste those three lines in, and open it in your browser. That is a web page — on your own disk, not the internet. The address bar will start <code>file:///</code>, and Module 0 explained why that prefix means you have a document rather than a website." },

      { t: "h2", n: "2", text: "The browser is guessing until you tell it" },
      { t: "p", html: "Give a browser plain text with no tags and it shows you one grey wall of words. It has no way to know which line was a title. HTML removes the guessing — and when you leave it out, the guessing comes back." },

      { t: "code", file: "wrong.html", code: "<p>Chapter One</p>\n<p>It was a dark and stormy night.</p>", output: "Two identical-looking paragraphs." },
      { t: "psoft", html: "\"Chapter One\" is a heading, and it was labelled a paragraph. It looks nearly right — and a screen reader will not announce it as a heading, a search engine will not weight it as one, and \"jump to next heading\" will skip straight past it. The page looks fine and is wrong." },

      { t: "debug",
        intro: "A student's first page came out wrong in a way that looks like a styling problem. There is no styling on it. Read the markup and the symptom, and work out what the browser built before opening the fix.",
        code: "<h1>Welcome to my site\n<p>This site is about houseplants.</p>\n<p>I have eleven of them.</p>",
        symptom: "The whole page is huge and bold — the heading, both paragraphs, all of it.",
        q: "Both paragraphs are marked up as paragraphs, and both are closed. So why is the browser drawing them at heading size?",
        fix: "<h1>Welcome to my site</h1>\n<p>This site is about houseplants.</p>\n<p>I have eleven of them.</p>",
        why: "The <code>&lt;h1&gt;</code> was never closed, so as far as the browser is concerned it never ended. It does not guess where you meant to stop — it keeps putting what follows <b>inside</b> the heading, and both paragraphs became children of it. They render at heading size because they are part of the heading. Checked in a real browser and in the parser that grades your practice, and both build the same thing: one <code>h1</code> with two <code>p</code> elements inside it. One missing slash, and this is exactly what the closing tag is for." },

      { t: "drills", intro: "Put these in a file and open it in your browser. Four correct lines are a web page; reading about them is not.", items: [
        { task: "A top-level heading reading <b>My notes</b>.", code: "<h1>My notes</h1>" },
        { task: "That heading, then a paragraph reading <b>Things I learned today.</b>", code: "<h1>My notes</h1>\n<p>Things I learned today.</p>" },
        { task: "Two paragraphs, one after the other.", code: "<p>First paragraph.</p>\n<p>Second paragraph.</p>" },
        { task: "<code>Chapter One</code> has been marked up as a paragraph. Mark it as what it actually is.", code: "<h1>Chapter One</h1>" },
        { task: "Fix this line — it has two opening tags: <code>&lt;h1&gt;Done&lt;h1&gt;</code>", code: "<h1>Done</h1>" },
      ] },

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

      { t: "quiz", items: [
        { level: "easy",
          q: "What is HTML's job on a page?",
          options: [
            "Making the page look attractive",
            "Labelling each piece of content so the browser knows what it is",
            "Deciding what happens when a button is clicked",
            "Storing the page's data so it survives a reload",
          ],
          correct: 1,
          why: "Labelling, and nothing else. Appearance is CSS's job and behaviour is JavaScript's — HTML says what each piece of content <b>is</b>." },
        { level: "easy",
          q: "Which of these can HTML do on its own?",
          options: [
            "Add two numbers together",
            "Repeat a block of content ten times",
            "None of these — it has no logic at all",
            "Show one paragraph in the morning and another at night",
          ],
          correct: 2,
          why: "No variables, no conditions, no loops, no arithmetic. That is what \"markup language, not programming language\" means, and it is why HTML alone can never make a decision." },
        { level: "easy",
          q: "What makes a closing tag a closing tag?",
          options: [
            "It comes second",
            "It is written in capitals",
            "It is indented differently",
            "The slash before the tag name",
          ],
          correct: 3,
          why: "Just the slash. <code>&lt;/p&gt;</code> closes, <code>&lt;p&gt;</code> opens a second paragraph — which is why a forgotten slash never ends the element instead of ending it late." },
        { level: "easy",
          q: "Tag names are case-insensitive, so both work. What follows from that?",
          options: [
            "Both are valid, and lowercase is the universal convention",
            "Only lowercase is valid HTML",
            "Capitals parse faster",
            "The case decides whether the browser treats it as a heading",
          ],
          correct: 0,
          why: "<code>&lt;H1&gt;</code> is not an error. It is also not what anyone writes, and a file that mixes both reads as careless — the reason to pick lowercase is consistency, not validity." },
        { level: "medium",
          q: "\"Chapter One\" is marked up as a paragraph. On screen it looks nearly right. What has actually been lost?",
          options: [
            "Nothing, since CSS can make it look like a heading",
            "The file is no longer valid HTML",
            "Everything that reads the element rather than the pixels — screen readers, search engines, reader mode, jump-to-heading",
            "The browser will refuse to render that line",
          ],
          correct: 2,
          why: "The markup is valid and the page looks fine, which is exactly what makes this bug expensive. The look can be restored with one line of CSS; the meaning cannot be recovered by anything." },
        { level: "medium",
          q: "You hand a browser a file of plain text with no tags in it at all. What do you get?",
          options: [
            "A refusal to display it",
            "One undifferentiated block of text, because nothing told the browser what any line is",
            "Headings guessed from which lines are shortest",
            "Every line automatically wrapped in its own paragraph",
          ],
          correct: 1,
          why: "The browser has nothing to go on, so it draws everything the same. HTML removes the guessing — and leaving it out brings the guessing back." },
        { level: "medium",
          q: "Why does it help that HTML's set of labels is fixed and public rather than something each site invents?",
          options: [
            "A browser from 1998 and a screen reader written last week both understand the same page, with nothing further to agree on",
            "It makes the files smaller",
            "It lets each site define element names that suit it",
            "It lets browsers compete on which tags they support",
          ],
          correct: 0,
          why: "This is the whole bargain of the web. Because nobody can invent private labels, a page written today is readable by software written decades apart in either direction." },
        { level: "hard",
          q: "You write <code>&lt;h1&gt;Welcome</code>, forget the closing tag, and follow it with two paragraphs. What does the browser build?",
          options: [
            "A heading and two paragraphs, as intended",
            "A heading containing both paragraphs, so the whole lot renders at heading size",
            "An error message instead of the page",
            "A heading, with the paragraphs discarded",
          ],
          correct: 1,
          why: "An unclosed element does not end where you meant — it swallows what follows. The paragraphs become children of the <code>h1</code>, which is why they are drawn like a heading." },
        { level: "hard",
          q: "A colleague says \"the element does not matter, we style everything with CSS anyway.\" What is the strongest single answer?",
          options: [
            "CSS is slower to load than HTML",
            "Some browsers ignore CSS",
            "Styling only serves the people looking at that page; the element is all that everything non-visual has to go on",
            "You cannot style a paragraph to look like a heading",
          ],
          correct: 2,
          why: "The last option is simply false — you can. That is what makes the argument tempting and why the answer has to be about the readers who never see the styling at all." },
        { level: "hard",
          q: "Which of these is <b>not</b> something HTML is responsible for?",
          options: [
            "Saying that this text is a heading",
            "Saying that this text is a paragraph",
            "Saying that this text is a link",
            "Saying that this text is centred and 24 pixels tall",
          ],
          correct: 3,
          why: "Size, colour and position are CSS. Every other option is a statement about what the content <b>is</b>, which is the one thing HTML exists to record." },
      ] },
    ],
  },

  {
    slug: "html-document-structure",
    order: 9,
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
        en: "The fixed outer shape of an HTML file: a doctype, an html element, and inside it a head for information about the page and a body for the page itself." },

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

      { t: "drills", intro: "Type the skeleton until it comes out without looking. It is the first thing in every file you will make from here on.", items: [
        { task: "The doctype line, on its own.", code: "<!DOCTYPE html>" },
        { task: "An html element declaring that the page is in English.", code: "<html lang=\"en\">\n</html>" },
        { task: "A head holding the character encoding and a title reading <b>My site</b>.", code: "<head>\n  <meta charset=\"UTF-8\">\n  <title>My site</title>\n</head>" },
        { task: "The whole skeleton, with one heading in the part a visitor can see.", code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My site</title>\n</head>\n<body>\n  <h1>My site</h1>\n</body>\n</html>" },
        { task: "This paragraph is in the half of the page nobody sees — <code>&lt;head&gt;&lt;p&gt;Hello&lt;/p&gt;&lt;/head&gt;</code>. Move it to where it will be drawn.", code: "<head>\n</head>\n<body>\n  <p>Hello</p>\n</body>" },
      ] },

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

      { t: "quiz", items: [
        { level: "easy",
          q: "What does <code>&lt;!DOCTYPE html&gt;</code> do?",
          options: [
            "Opens the document, the way a tag opens an element",
            "Tells the browser to render in standards mode instead of a compatibility mode written for the 1990s",
            "Declares which character encoding the file uses",
            "Names the page for the browser tab",
          ],
          correct: 1,
          why: "It is not a tag and not part of the page — it is an instruction about how to render everything that follows." },
        { level: "easy",
          q: "Where must the doctype appear?",
          options: [
            "Anywhere inside the head",
            "Immediately before the body",
            "The very first thing in the file",
            "At the end, after the html element closes",
          ],
          correct: 2,
          why: "It has to be read before parsing starts, because it decides how the parsing is done." },
        { level: "easy",
          q: "What belongs in the head?",
          options: [
            "The page's first heading",
            "Information about the page, none of which is drawn on screen",
            "The navigation menu",
            "Anything that should appear at the top of the screen",
          ],
          correct: 1,
          why: "The envelope, not the letter. Head content is for the browser, the search engine and the tab — never for the reader's eyes." },
        { level: "easy",
          q: "Which attribute belongs on the html element itself?",
          options: [
            "charset",
            "title",
            "lang",
            "doctype",
          ],
          correct: 2,
          why: "<code>lang</code> describes the whole document, so it goes on the root. <code>charset</code> is a meta element and <code>title</code> is an element of its own; \"doctype\" is not an attribute at all." },
        { level: "medium",
          q: "You put an h1 inside the head by mistake. What happens?",
          options: [
            "The browser moves it into the body for you",
            "It renders at the top of the page as usual",
            "The page reports an error",
            "It is parsed, kept in the document, and never drawn",
          ],
          correct: 3,
          why: "Nothing is invalid, so nothing is reported — and nothing in head is drawn, so the heading exists and is invisible. It is the commonest first-week bug and it produces silence." },
        { level: "medium",
          q: "Why does the charset declaration belong in the first few lines of the head?",
          options: [
            "Because the head is read in alphabetical order",
            "Because the browser must turn bytes into characters before it can read anything, so a late declaration forces it to start over",
            "Because the title cannot be decoded without it",
            "Because the spec requires it to be the first child of html",
          ],
          correct: 1,
          why: "The browser starts with a guess. If your declaration contradicts the guess it re-parses what it has already read — which is where the flash of broken characters comes from." },
        { level: "medium",
          q: "A page has two title elements. Which one does the browser use?",
          options: [
            "The first, and the second is ignored",
            "The last one written",
            "Both, joined together",
            "Neither — it falls back to the filename",
          ],
          correct: 0,
          why: "The first wins, which is why a stale title can survive an edit: you add the new one below and nothing changes." },
        { level: "hard",
          q: "A page has no lang attribute and is otherwise perfect. Who is affected?",
          options: [
            "Nobody — it is a formality",
            "Only search engines",
            "A screen reader, which now has to guess which language to pronounce the words in, and the browser's translation offer, which keys off it",
            "Only an HTML validator",
          ],
          correct: 2,
          why: "One attribute, and the cost of leaving it out lands entirely on people who are not reading the page the way you are." },
        { level: "hard",
          q: "Text you definitely typed is nowhere on the rendered page, and there is no error anywhere. What do you check first?",
          options: [
            "Whether the browser supports the element you used",
            "Whether the text is inside body rather than head",
            "Whether the browser cache needs clearing",
            "Whether the doctype is present",
          ],
          correct: 1,
          why: "Silence plus invisible content points at the wrong half of the page far more often than at anything else. Check the half before you check the browser." },
        { level: "hard",
          q: "The same name appears twice on a page — once in title and once in an h1. Why write it twice?",
          options: [
            "The title is a fallback in case the h1 fails to load",
            "They must match or the page is invalid",
            "The h1 is read by search engines and the title by people",
            "They do different jobs: title is the tab, the bookmark and the search result; h1 is the page's own heading",
          ],
          correct: 3,
          why: "They are independent, and changing one does not change the other. They often say the same thing — but because you wrote it twice, not because they are linked." },
      ] },
    ],
  },

  {
    slug: "html-elements-attributes",
    order: 10,
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
        en: "Extra information written inside an element's opening tag, in the form name=\"value\", that configures what the element does." },

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

      { t: "debug",
        intro: "A student's image will not load, and the filename they typed is exactly right. Read the markup and the symptom, and work out what the browser read before opening the fix.",
        code: "<img src=beach photo.jpg alt=\"Sunset over the sea\">",
        symptom: "Broken-image icon. The Network panel shows a request for a file called beach, with no extension on it.",
        q: "The name in the markup is beach photo.jpg, complete and correctly spelled. Where did the second half of it go?",
        fix: "<img src=\"beach photo.jpg\" alt=\"Sunset over the sea\">",
        why: "An unquoted attribute value ends at the first space. So <code>src</code> was read as <code>beach</code>, and <code>photo.jpg</code> became a second attribute — an empty one, with a name no element has ever heard of, sitting quietly on the tag. Run through both parsers and they agree exactly: <code>src=\"beach\"</code>, an empty <code>photo.jpg</code>, and an intact <code>alt</code>. Nothing is reported because nothing is invalid; the browser applied the rule as written. Quoting every value makes this whole class of bug impossible." },

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

      { t: "quiz", items: [
        { level: "easy",
          q: "What is an attribute?",
          options: [
            "A second tag written inside the first",
            "Extra information in the opening tag, written name=\"value\", that configures what the element does",
            "The text between the opening and closing tags",
            "A styling rule attached to the element",
          ],
          correct: 1,
          why: "The element says what the content is; the attribute configures it. <code>href</code>, <code>src</code> and <code>alt</code> are all settings on an element that would otherwise be incomplete." },
        { level: "easy",
          q: "Where are attributes written?",
          options: [
            "In the opening tag only",
            "In both the opening and the closing tag",
            "In the closing tag only",
            "Anywhere inside the element",
          ],
          correct: 0,
          why: "A closing tag carries a slash and a name and nothing else. There is never anything to put in it." },
        { level: "easy",
          q: "Which of these is an empty element?",
          options: [
            "the p element",
            "the a element",
            "the img element",
            "the strong element",
          ],
          correct: 2,
          why: "An image has no content to wrap, so it has no closing tag. About a dozen elements work this way — img, br, hr, input, meta, link." },
        { level: "easy",
          q: "What is the difference between a tag and an element?",
          options: [
            "They are two words for the same thing",
            "The tag is the marker; the element is the opening tag, the content and the closing tag together",
            "An element is only the opening tag",
            "A tag can carry attributes and an element cannot",
          ],
          correct: 1,
          why: "In conversation people use them interchangeably and nothing breaks. Reading a specification, the difference is the whole sentence." },
        { level: "medium",
          q: "The markup reads <code>&lt;img src=my photo.jpg alt=\"A cat\"&gt;</code>. What does the browser actually end up with?",
          options: [
            "src of \"my photo.jpg\", exactly as written",
            "src of \"my\", plus a meaningless empty attribute called photo.jpg",
            "A parse error, and no image element at all",
            "src of \"my photo.jpg\", with a warning printed to the console",
          ],
          correct: 1,
          why: "An unquoted value ends at the first space. Nothing is reported, because nothing is invalid — the browser followed the rule, and the rule is not the one you had in mind." },
        { level: "medium",
          q: "Why is there no such thing as a closing tag for an image?",
          options: [
            "Because the name is spelled differently when closing",
            "Because images are inserted with CSS instead",
            "Because a closing tag marks where content ends, and an image has no content",
            "Because it was removed in HTML5",
          ],
          correct: 2,
          why: "An image is not a wrapper around anything. There is no \"end of the image's content\" to mark, so there is nothing for a closing tag to do." },
        { level: "medium",
          q: "Two attributes on one element. Does the order they are written in matter?",
          options: [
            "Yes — id must always be first",
            "Yes — the browser applies them left to right",
            "No, never",
            "Only on the img element",
          ],
          correct: 2,
          why: "Attribute order carries no meaning at all. Pick an order that reads well and stay consistent for the sake of the humans." },
        { level: "hard",
          q: "You write <code>&lt;strong&gt;&lt;em&gt;text&lt;/strong&gt;&lt;/em&gt;</code>. What does the browser do?",
          options: [
            "Refuses to render the line",
            "Repairs it silently, in a shape you did not choose, and the consequences appear further down the page",
            "Renders it exactly as intended, since both tags are present",
            "Keeps the strong and drops the em entirely",
          ],
          correct: 1,
          why: "There is no error and no warning. The parser has a written recovery procedure for crossed tags, it runs, and the tree you get is not the tree you wrote — which is why the surprise usually surfaces several elements later." },
        { level: "hard",
          q: "Unquoted attribute values often work. Why quote them anyway?",
          options: [
            "Unquoted values are invalid HTML",
            "Quotes make the browser parse the file faster",
            "Unquoted values are skipped by screen readers",
            "An unquoted value ends at the first space — so it works right up until a value contains one, and then fails silently",
          ],
          correct: 3,
          why: "\"Works until it doesn't, with no error when it doesn't\" is the worst failure shape there is. Quoting always, rather than when it seems necessary, removes the judgement call." },
        { level: "hard",
          q: "You nest three elements inside one another. What rule governs the order they close in?",
          options: [
            "Alphabetical by tag name",
            "Any order — the browser repairs it",
            "Last opened, first closed",
            "The outermost one closes first",
          ],
          correct: 2,
          why: "The same rule as brackets in maths. The browser <i>will</i> repair a violation, which is precisely why you cannot rely on it — you will not be told, and the repair is not your design." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 3 — TEXT & CONTENT
   *
   * Fourteen elements, and the through-line is the same argument the whole
   * course makes: every one of them exists because it means something, and
   * choosing by appearance is what produces a page that works for sighted mouse
   * users and nobody else.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-headings-paragraphs",
    order: 11,
    title: "Headings and Paragraphs: the Shape of a Document",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Use the six heading levels to describe structure rather than size",
        "Explain why skipping from h1 to h3 is a real problem",
        "Know when a line break is right and when it is a mistake",
        "Say what <code>&lt;hr&gt;</code> means now, which is not what it used to",
      ] },

      { t: "hook",
        q: "A screen reader user presses one key and hears a list of every heading on the page, then jumps to the one they want. What happens to that list if you chose your headings by how big they looked?",
        why: "It becomes nonsense. Their table of contents is built entirely from your heading levels — so choosing <code>h3</code> because <code>h2</code> looked too big rearranges a menu you never see." },

      { t: "def",
        term: "Heading level",
        en: "A number from 1 to 6 saying how deeply nested a section is. h1 is the page, h2 its main sections, h3 subsections of those." },

      { t: "analogy",
        concept: "heading levels",
        real: "the contents page of a book",
        html: "Chapter, section, sub-section. You would not label a sub-section \"Chapter\" because the font looked nicer — the number is a claim about where it sits, and everything that generates a contents page believes it." },

      { t: "syntax",
        intro: "Six levels, one paragraph element, and two markers.",
        form: "<h1>Page title</h1>\n<h2>A section</h2>\n<h3>Part of that section</h3>\n\n<p>A paragraph of text.</p>\n\nline one<br>line two\n<hr>",
        parts: [
          { bit: "<h1>", says: "The page's subject. One per page — it is the answer to \"what is this page\", and two answers is none." },
          { bit: "<h2>", says: "Main sections. As many as the page has." },
          { bit: "<h3>", says: "Subsections of an h2. Never used to jump a level because the size suits you." },
          { bit: "<p>", says: "One paragraph. Browsers put space above and below it — that space is the paragraph break, so blank lines in your file do nothing." },
          { bit: "<br>", says: "A line break <b>inside</b> a block of text, where the break is part of the content: an address, a verse. Empty element, no closing tag." },
          { bit: "<hr>", says: "A thematic break — a change of subject, not a decorative line. It draws a rule because that is the convention, and it means the shift." },
        ],
        note: "Six levels exist and pages needing more than three are rare. If you are reaching for <code>h5</code>, the structure underneath it is probably the real problem.",
      },

      { t: "code", file: "structure.html", code: "<h1>Chocolate Cake</h1>\n\n<h2>Ingredients</h2>\n<p>Flour, sugar, cocoa, eggs.</p>\n\n<h2>Method</h2>\n<h3>Preparing the tin</h3>\n<p>Grease it and line the base.</p>\n<h3>Baking</h3>\n<p>Forty minutes at 180C.</p>", output: "A title, two sections, and two subsections under the second one." },
      { t: "psoft", html: "Read only the headings and you have the recipe's outline. That is exactly what a screen reader offers its user, and what a search engine reads to work out what the page covers." },

      { t: "h2", n: "1", text: "Why skipping a level matters" },
      { t: "p", html: "Going <code>h1</code> → <code>h3</code> claims there is an <code>h2</code> section that this belongs to, and there is not. To anything reading the outline, a level has gone missing — the page describes a structure it does not have." },
      { t: "p", html: "The fix is never to change the level. It is to notice that you only wanted smaller text, and that CSS does that in one line without lying about the structure." },

      { t: "note", variant: "warn", html: "<b><code>&lt;br&gt;</code> is not how you make space.</b> Three of them to push something down is the commonest beginner habit, and it tells everything that reads the page that there are three meaningful line breaks there. Spacing is CSS's job; <code>&lt;br&gt;</code> is for breaks that are part of the text itself." },

      { t: "debug",
        intro: "A student has typed an address exactly as it should appear, on four separate lines, and the browser has ignored every one of them. Read it before opening the fix.",
        code: "<p>\n  Etudo Press\n  221B Baker Street\n  London\n  NW1 6XE\n</p>",
        symptom: "The address renders as one long line: Etudo Press 221B Baker Street London NW1 6XE.",
        q: "The line breaks are right there in the file. Why did none of them survive?",
        fix: "<p>\n  Etudo Press<br>\n  221B Baker Street<br>\n  London<br>\n  NW1 6XE\n</p>",
        why: "HTML collapses every run of whitespace — spaces, tabs and newlines alike — into a single space. A newline in your file is not a line break on the page; it is just more whitespace, and the same rule is what lets you indent your markup without the indentation showing up on screen. Where a break is genuinely part of the content, as it is in an address or a verse, you have to say so with <code>&lt;br&gt;</code>. This is the one case the element is for — and it is exactly the opposite of using it to make a gap." },

      { t: "drills", intro: "Write these out. Every one of them is a claim about structure, so read each back and ask whether the claim is true.", items: [
        { task: "A page title, then two sections under it.", code: "<h1>Chocolate Cake</h1>\n<h2>Ingredients</h2>\n<h2>Method</h2>" },
        { task: "This skips a level — <code>&lt;h1&gt;Recipes&lt;/h1&gt;</code> then <code>&lt;h3&gt;Ingredients&lt;/h3&gt;</code>. Repair the outline.", code: "<h1>Recipes</h1>\n<h2>Ingredients</h2>" },
        { task: "A subsection sitting correctly under a section.", code: "<h2>Method</h2>\n<h3>Preparing the tin</h3>" },
        { task: "Two lines of a poem, where the break belongs to the poem.", code: "<p>Tyger Tyger, burning bright,<br>\nIn the forests of the night;</p>" },
        { task: "Two paragraphs with a change of subject between them.", code: "<p>The first topic ends here.</p>\n<hr>\n<p>Something else begins.</p>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<h1>Recipes</h1>\n<h3>Ingredients</h3>", why: "Skips h2, so the outline claims a section that does not exist.", fix: "<h1>Recipes</h1>\n<h2>Ingredients</h2>" },
        { bad: "<p>Line one</p>\n<br><br>\n<p>Line two</p>", why: "Empty breaks used as spacing. Paragraphs already have space around them, and this adds meaningless breaks to the outline.", fix: "<p>Line one</p>\n<p>Line two</p>" },
        { bad: "<h1>Home</h1>\n<h1>About us</h1>", why: "Two answers to \"what is this page about\".", fix: "<h1>Home</h1>\n<h2>About us</h2>" },
      ] },

      { t: "recap", items: [
        "Heading levels describe <b>structure</b>, never size",
        "One <code>h1</code> per page; do not skip levels going down",
        "Screen readers and search engines build the page outline from them",
        "<code>&lt;p&gt;</code> already carries its own spacing",
        "<code>&lt;br&gt;</code> is for breaks that belong to the text, not for gaps",
        "<code>&lt;hr&gt;</code> means a change of subject, not a decorative line",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "Why should a page have only one h1?", a: "Because the h1 answers \"what is this page about\", and a page has one subject. Everything that builds an outline from the headings — screen readers, search engines, reader modes — treats a second h1 as a second top-level answer, so the page describes a structure it does not have." },
        { level: "medium", q: "A designer wants a section heading smaller than the h2 above it. Do you use an h3?", a: "No. The level is a claim about where the section sits in the document, not about type size, and an h3 that is really a second-level section puts a hole in the outline. The right fix is one line of CSS on the h2 — appearance changed, structure intact." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does a heading's level number describe?",
          options: [
            "How large the text should be drawn",
            "How important the words are",
            "How deeply nested the section is within the document",
            "The order the sections were written in",
          ],
          correct: 2,
          why: "h1 is the page, h2 its main sections, h3 subsections of those. Size is a default the browser picked, and CSS can change it without touching the claim." },
        { level: "easy",
          q: "How many h1 elements belong on a page?",
          options: [
            "One",
            "One for each section",
            "As many as the design calls for",
            "At least two, so search engines have a choice",
          ],
          correct: 0,
          why: "The h1 answers \"what is this page\". Two answers is no answer." },
        { level: "easy",
          q: "What does the hr element mean in modern HTML?",
          options: [
            "Draw a horizontal decorative line",
            "Add vertical space between two blocks",
            "End the current section of the page",
            "A thematic break — the subject changes here",
          ],
          correct: 3,
          why: "It draws a rule because that is the convention, but the meaning is the shift in subject. Reaching for it to decorate is the same mistake as reaching for blockquote to indent." },
        { level: "easy",
          q: "When is the br element the right choice?",
          options: [
            "To push a block further down the page",
            "When the line break is part of the content itself, as in an address or a verse",
            "Between every two paragraphs",
            "To separate sections of a document",
          ],
          correct: 1,
          why: "A break that belongs to the text is content. A gap you want for looks is spacing, and spacing is CSS." },
        { level: "medium",
          q: "You write a four-line address inside one paragraph, with a real newline after each line. What does the browser show?",
          options: [
            "Four lines, as typed",
            "Four lines, but only in some browsers",
            "Two lines, since HTML keeps every second break",
            "One long line, because runs of whitespace collapse to a single space",
          ],
          correct: 3,
          why: "Newlines, tabs and runs of spaces all collapse to one space. That rule is what lets you indent your markup freely — and it is why a break that matters has to be marked as one." },
        { level: "medium",
          q: "Going straight from an h1 to an h3 — what is actually wrong with it?",
          options: [
            "It claims the h3 belongs to an h2 section that does not exist, so the outline has a hole in it",
            "It is invalid HTML and will not validate",
            "The browser will render the h3 at h2 size to compensate",
            "Nothing, as long as the sizes look right",
          ],
          correct: 0,
          why: "It is perfectly valid, which is what makes it easy to do by accident. The damage is to the outline every non-visual reader depends on." },
        { level: "medium",
          q: "Three br elements in a row, used to push a heading further down the page. What have you told the machines reading it?",
          options: [
            "Nothing — empty elements carry no meaning",
            "That the heading is more important than the ones above it",
            "That there are three meaningful line breaks in the content at that point",
            "That the section has ended",
          ],
          correct: 2,
          why: "You asked for spacing and said something about the content instead. A screen reader has no way to know you meant \"a gap\"." },
        { level: "hard",
          q: "A page's headings, read in order, are: h1, h2, h2, h3, h2, h4. Which one is the problem?",
          options: [
            "The second h2 — a level may not repeat",
            "The h4, which follows an h2 and so skips h3",
            "The h3, because it comes after an h2",
            "None of them",
          ],
          correct: 1,
          why: "Repeating a level is normal — that is what sibling sections are. Descending by more than one is the fault, and here the h4 claims an h3 section that was never opened." },
        { level: "hard",
          q: "Your designer asks for a section heading in smaller type than the one above it. What do you change?",
          options: [
            "The CSS, leaving the heading at the level the structure requires",
            "The heading level, down one",
            "The heading level, down two, to be safe",
            "Replace the heading with a bold paragraph",
          ],
          correct: 0,
          why: "The last option is the worst of the four: it removes the heading from the outline altogether while looking identical on screen." },
        { level: "hard",
          q: "Blank lines between paragraphs in your source file do nothing on screen. Why does a paragraph still end up with space around it?",
          options: [
            "The blank lines are converted to br elements by the parser",
            "The p element requires a blank line after it",
            "The browser preserves the first newline of every run",
            "Because the browser's default stylesheet puts a margin above and below every p",
          ],
          correct: 3,
          why: "The gap is styling the browser supplies for you, not something your file's whitespace produced — which is why adding more blank lines changes nothing at all." },
      ] },
    ],
  },

  {
    slug: "html-text-meaning",
    order: 12,
    title: "Marking Up Meaning in Text",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Choose between <code>strong</code> and <code>b</code> for the right reason",
        "Quote something so a machine can tell it is a quote",
        "Show code, keystrokes and output with the element each one has",
        "Use <code>abbr</code>, <code>time</code> and <code>address</code> where they belong",
      ] },

      { t: "hook",
        q: "<code>&lt;b&gt;</code> and <code>&lt;strong&gt;</code> both render bold. Both are valid HTML5. So why does the spec keep both?",
        why: "Because they are answers to different questions. One says \"draw this differently\"; the other says \"this matters\". A screen reader changes its emphasis for one of them and not the other." },

      { t: "def",
        term: "Semantic element",
        en: "An element chosen for what the content means rather than for how it looks." },

      { t: "h2", n: "1", text: "Emphasis, and its lookalikes" },
      { t: "syntax",
        intro: "Four elements, two appearances, four different meanings.",
        form: "<strong>important</strong>     <b>stands out</b>\n<em>stressed</em>            <i>a term, a name, a foreign word</i>",
        parts: [
          { bit: "<strong>", says: "This matters — a warning, a deadline, the word that changes the sentence. Screen readers can announce it differently." },
          { bit: "<b>", says: "Draw attention without claiming importance: a product name in a review, a keyword in a summary. The spec's own description is \"stylistically offset\"." },
          { bit: "<em>", says: "Stress emphasis — the word you would lean on when reading aloud. \"I never said she took it\" means six different things depending which word is em." },
          { bit: "<i>", says: "A different voice: a technical term on first use, a ship's name, a phrase in another language. Italic by convention, not by instruction." },
        ],
        note: "In doubt, ask whether a person reading aloud would change their voice. Yes means <code>strong</code> or <code>em</code>; no means <code>b</code> or <code>i</code> — or, more often, that CSS was what you wanted.",
      },

      { t: "code", file: "emphasis.html", code: "<p><strong>Do not</strong> switch the power off while it updates.</p>\n<p>The <b>Kestrel 300</b> is the model we tested.</p>\n<p>I <em>never</em> said she took it.</p>\n<p>The <i>Titanic</i> sailed in 1912.</p>", output: "Two bold lines and two italic ones — and four different claims about the words." },
      { t: "psoft", html: "Change <code>strong</code> to <code>b</code> in the first line and nothing at all happens on screen. That is the whole difficulty with this pair: the only reader who can tell them apart is the one you are not." },

      { t: "h2", n: "2", text: "Quoting" },
      { t: "syntax",
        intro: "A long quote, a short one, and the source of either.",
        form: "<blockquote cite=\"https://example.com/paper\">\n  <p>A quoted passage.</p>\n  <footer>— <cite>The Paper</cite></footer>\n</blockquote>\n\nShe called it <q>a vague but exciting proposal</q>.",
        parts: [
          { bit: "<blockquote", says: "A quoted block. Indented by default, and the indent is a consequence of the meaning rather than the reason to use it." },
          { bit: "cite", says: "A URL for where it came from. Machine-readable; browsers do not display it, which is why people forget it exists." },
          { bit: "<cite>", says: "The <b>title of a work</b> — a book, a paper, a film. Not the person: the spec is specific, and \"— <cite>Tim Berners-Lee</cite>\" is the common misuse." },
          { bit: "<q>", says: "A short inline quote. The browser adds the quotation marks itself, and adds the right ones for the page's language — which is why you do not type them." },
        ],
        note: "Use <code>&lt;blockquote&gt;</code> because something is quoted, never because you want an indent. CSS indents anything, and a fake quote confuses everything that collects citations.",
      },

      { t: "h2", n: "3", text: "Code, keys and output" },
      { t: "syntax",
        intro: "Four elements that all end up in a monospace font and mean four different things.",
        form: "<code>const x = 5</code>\n<pre><code>line one\n  indented line</code></pre>\n<kbd>Ctrl</kbd> + <kbd>S</kbd>\n<samp>File missing</samp>\n<var>n</var>",
        parts: [
          { bit: "<code>", says: "A fragment of code, inline. Monospace by default and that is the least interesting thing about it." },
          { bit: "<pre>", says: "Preserves whitespace and line breaks exactly. Everywhere else HTML collapses runs of spaces into one — <code>pre</code> is the exception." },
          { bit: "<pre><code>", says: "The pair used together for a code block: <code>pre</code> keeps the shape, <code>code</code> says what it is. Neither alone is right." },
          { bit: "<kbd>", says: "Keys the user should press. Wrap each key separately so a stylesheet can draw each as a key." },
          { bit: "<samp>", says: "Output <b>from</b> a program — an error message, a printed result. The mirror of <code>kbd</code>." },
          { bit: "<var>", says: "A variable or placeholder, in prose or in maths." },
        ],
        note: "Inside <code>&lt;pre&gt;</code> your indentation is content. Indenting it to match the surrounding HTML puts that indentation on screen, which is why code blocks so often appear pushed to the right.",
      },

      { t: "code", file: "docs.html", code: "<p>Save the file with <kbd>Ctrl</kbd> + <kbd>S</kbd>.</p>\n<p>If it prints <samp>Permission denied</samp>, the folder is read-only.</p>\n<pre><code>name = \"Etudo\"\nprint(name)</code></pre>", output: "A shortcut, a message from the program, and a two-line code block that keeps its shape." },
      { t: "psoft", html: "The <code>pre</code> is doing the work in the last one. Take it away and the two lines become one — the browser collapses the newline like any other whitespace, which is the bug in the debug task below." },

      { t: "h2", n: "4", text: "Three worth knowing" },
      { t: "syntax",
        intro: "Small elements that answer a question the plain text cannot.",
        form: "<abbr title=\"HyperText Markup Language\">HTML</abbr>\n<time datetime=\"2026-08-06\">6 August</time>\n<address>\n  Contact: <a href=\"mailto:hi@example.com\">hi@example.com</a>\n</address>",
        parts: [
          { bit: "<abbr", says: "An abbreviation, with the expansion in <code>title</code>. Hovering shows it; more usefully, the expansion is available to anything that needs it." },
          { bit: "<time", says: "A date or time a machine can read." },
          { bit: "datetime", says: "The machine-readable form, <code>YYYY-MM-DD</code>. It exists because \"6 August\", \"Aug 6\" and \"06/08\" are the same day and no parser should have to guess — and \"06/08\" means two different days on two continents." },
          { bit: "<address>", says: "Contact details for the page's author or owner — not any postal address that happens to appear in the text. That is the usual misreading of the name." },
        ],
        note: "<code>&lt;time&gt;</code> is what lets a search result show a date beside your article, and a calendar offer to add your event. The visible text stays whatever you want it to be.",
      },

      { t: "debug",
        intro: "A student is documenting a shell command. The monospace font arrived; the shape of the code did not. Read it before opening the fix.",
        code: "<code>cd projects\nnpm install\nnpm run dev</code>",
        symptom: "All three commands run together on one line: cd projects npm install npm run dev.",
        q: "The element is right — this is code, and code is what the element says. So why has the block lost its lines?",
        fix: "<pre><code>cd projects\nnpm install\nnpm run dev</code></pre>",
        why: "<code>&lt;code&gt;</code> says what the content <b>is</b>; it says nothing about whitespace, and outside <code>&lt;pre&gt;</code> the usual rule applies — every run of spaces and newlines collapses to one space. <code>&lt;pre&gt;</code> is the one element that switches that rule off. The pair belongs together for a block: <code>pre</code> keeps the shape, <code>code</code> keeps the meaning, and neither one alone does both. Watch the indentation when you add it — inside <code>pre</code>, the spaces you use to line the markup up with its neighbours become spaces on the screen." },

      { t: "drills", intro: "Write these out. Each one is a choice between two elements that look identical and mean different things.", items: [
        { task: "A warning where the words genuinely matter.", code: "<p><strong>Do not</strong> refresh this page.</p>" },
        { task: "A product name picked out in a review, with no claim that it is important.", code: "<p>We tested the <b>Kestrel 300</b> this week.</p>" },
        { task: "A short quotation inside a sentence, without typing any quotation marks.", code: "<p>She called it <q>a vague but exciting proposal</q>.</p>" },
        { task: "The keyboard shortcut for saving.", code: "<p><kbd>Ctrl</kbd> + <kbd>S</kbd></p>" },
        { task: "The date 6 August 2026, written so a machine can read it too.", code: "<time datetime=\"2026-08-06\">6 August 2026</time>" },
        { task: "The abbreviation HTML, carrying its expansion.", code: "<abbr title=\"HyperText Markup Language\">HTML</abbr>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<blockquote>Some indented text</blockquote>", why: "Used for the indent rather than because anything is quoted. CSS indents; this claims a quotation.", fix: "<p class=\"indented\">Some indented text</p>" },
        { bad: "<cite>Tim Berners-Lee</cite>", why: "cite is for the title of a work, not the person who made it.", fix: "<cite>Weaving the Web</cite>" },
        { bad: "<q>\"a direct quote\"</q>", why: "The browser adds quotation marks itself, so this shows two sets.", fix: "<q>a direct quote</q>" },
        { bad: "<pre>\n    <code>x = 5</code>\n  </pre>", why: "Inside pre, your indentation is content — this puts four spaces on screen.", fix: "<pre><code>x = 5</code></pre>" },
      ] },

      { t: "recap", items: [
        "<code>strong</code>/<code>em</code> carry meaning; <code>b</code>/<code>i</code> only change appearance",
        "Ask whether a reader would change their voice — that is the test",
        "<code>blockquote</code> for quotations, not for indents; <code>cite</code> is the <b>work</b>",
        "<code>q</code> supplies its own quotation marks",
        "<code>pre</code> preserves whitespace; <code>pre</code> + <code>code</code> for blocks",
        "<code>kbd</code> is input, <code>samp</code> is output",
        "<code>time datetime=\"\"</code> is what makes a date machine-readable",
        "<code>address</code> is contact details for the page's owner",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between b and strong?", a: "strong means the content is important — a screen reader may announce it differently, and it survives into anything that reads the page's meaning. b only says \"offset this visually\" with no claim about importance. Both usually render bold, which is why the choice gets made carelessly." },
        { level: "medium", q: "Why does time have a datetime attribute when the text already shows the date?", a: "Because the visible text is for people and is ambiguous — 06/08 is two different days depending on the country, and \"last Tuesday\" is not a date at all. datetime is an unambiguous machine format, which is what lets a search result show the date and a calendar offer to add the event." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What is the difference between <code>&lt;b&gt;</code> and <code>&lt;strong&gt;</code>?",
          options: [
            "strong renders bolder than b",
            "strong says the content is important; b only offsets it visually",
            "b is deprecated and strong replaced it",
            "They are identical and the choice is a matter of taste",
          ],
          correct: 1,
          why: "Both usually render bold, which is exactly why the choice gets made carelessly. Only one of them makes a claim that survives into a screen reader." },
        { level: "easy",
          q: "What does the cite element mark?",
          options: [
            "The person who said something",
            "A URL the quotation came from",
            "The reason a passage was quoted",
            "The title of a work — a book, a paper, a film",
          ],
          correct: 3,
          why: "\"— cite Tim Berners-Lee /cite\" is the standard misuse. The work is <i>Weaving the Web</i>; the person is just text." },
        { level: "easy",
          q: "Why should you not type quotation marks inside a q element?",
          options: [
            "Because the browser supplies them itself, so you would get two sets",
            "Because quotation marks are not valid inside an element",
            "Because they break the element's styling",
            "Because screen readers announce them separately",
          ],
          correct: 0,
          why: "And it supplies the right ones for the page's language, which is a job worth handing over." },
        { level: "easy",
          q: "Which pair of elements belongs together for a multi-line code block?",
          options: [
            "code and samp",
            "pre and kbd",
            "pre and code",
            "code and var",
          ],
          correct: 2,
          why: "<code>pre</code> keeps the shape, <code>code</code> says what it is. Neither alone does both jobs." },
        { level: "medium",
          q: "A student wraps three shell commands in <code>&lt;code&gt;</code> alone. What appears on the page?",
          options: [
            "Three lines in a monospace font",
            "One line, because whitespace outside pre collapses to single spaces",
            "Three lines, but the indentation is lost",
            "Nothing — code cannot hold more than one line",
          ],
          correct: 1,
          why: "The font arrives and the shape does not. <code>code</code> is a statement about meaning; it says nothing about whitespace." },
        { level: "medium",
          q: "What is the test for choosing between em and i?",
          options: [
            "Whether the text is longer than a few words",
            "Whether the surrounding text is already italic",
            "Whether someone reading aloud would change their voice on it",
            "Whether the phrase is in another language",
          ],
          correct: 2,
          why: "Stress you can hear is <code>em</code>. A different voice with no extra stress — a term, a ship's name, a foreign phrase — is <code>i</code>." },
        { level: "medium",
          q: "What does the address element actually mark?",
          options: [
            "Any postal address appearing on the page",
            "The location of a business on a map",
            "The address a form submits to",
            "Contact details for the page's author or owner",
          ],
          correct: 3,
          why: "The name is the trap. A postal address inside an article is just text; <code>address</code> is about who to contact regarding this page." },
        { level: "hard",
          q: "Why does <code>&lt;time&gt;</code> carry a datetime attribute when the date is already written in the text?",
          options: [
            "Because visible dates are ambiguous — 06/08 is two different days on two continents — and datetime is unambiguous to a machine",
            "Because the element is invalid without it",
            "Because it sets the time zone for the whole page",
            "Because browsers use it to format the date for the reader",
          ],
          correct: 0,
          why: "The visible text stays whatever reads best. The attribute is what lets a search result show a date and a calendar offer to add an event." },
        { level: "hard",
          q: "You want a passage indented. Which of these is the wrong reason to reach for blockquote?",
          options: [
            "The passage is quoted from a named source",
            "The passage is quoted from a source you cannot name",
            "You want the indent, and nothing is being quoted",
            "The passage is quoted and you also want to cite it",
          ],
          correct: 2,
          why: "CSS indents anything. A blockquote that quotes nothing is a false claim, and it confuses everything that collects quotations from a page." },
        { level: "hard",
          q: "kbd and samp both render in a monospace font. What is the difference between them?",
          options: [
            "kbd is for single keys and samp for whole commands",
            "kbd is what the user types in; samp is what the program prints back",
            "kbd is inline and samp is a block",
            "samp is for sample code and kbd for real code",
          ],
          correct: 1,
          why: "Input and output — mirror images of each other. Wrap each key separately so a stylesheet can draw each one as a key." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 4 — LINKS
   *
   * The element the whole system is named for. Module 0 made the argument that
   * the Web exists because documents can point at each other; these two lessons
   * are where the student's own pages finally do. The first is the anchor and
   * the two kinds of address; the second is everything a link can do besides
   * fetching a page — and the words inside it, which matter more than beginners
   * ever expect.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-links",
    order: 13,
    title: "Links: the Element the Web Is Named After",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Write a link to another site, and name each part of it",
        "Link between pages of your own site with relative paths",
        "Climb out of a folder with <code>..</code> instead of guessing",
        "Choose between an absolute and a relative address, deliberately",
      ] },

      { t: "hook",
        q: "Module 0 opened with the claim that the entire Web was invented for one idea: a document pointing at another document. Twelve lessons in, nothing you have written points anywhere. What are your pages, until they do?",
        why: "Documents. Well-structured, honestly marked up — and each one alone in its folder. The anchor element is what turns a pile of pages into a site, and it is the reason the H in HTML stands for <b>hypertext</b>." },

      { t: "def",
        term: "Hyperlink",
        en: "A piece of content that, when activated, takes the reader somewhere else — another site, another page of this one, or another place on this page." },

      { t: "analogy",
        concept: "absolute vs relative addresses",
        real: "a full postal address vs \"two doors down\"",
        html: "An absolute address works from anywhere on earth — that is what all the parts are for. \"Two doors down\" is shorter and works perfectly, but only from where you are standing. Relative paths are directions from the file the link is written in — move that file and every direction in it now starts from the wrong place." },

      { t: "syntax",
        intro: "The anchor. One element, one attribute, and the text a reader clicks.",
        form: "<a href=\"https://example.com/menu.html\">See the menu</a>",
        parts: [
          { bit: "<a", says: "The anchor element — the original idea the Web was built around, which is why it got the shortest name in the language." },
          { bit: "href", says: "<b>H</b>ypertext <b>ref</b>erence: where this link goes. Without it, an <code>&lt;a&gt;</code> is not a link at all — it draws like text, cannot be focused, and does nothing." },
          { bit: "https://example.com/menu.html", says: "The destination — any URL from Module 0: a page, a section, an email address." },
          { bit: "See the menu", says: "The content. This is what renders, what gets clicked, and what a screen reader announces. The next lesson is partly about choosing it well." },
        ],
        note: "Anything can be the content — wrap an image in an anchor and the image becomes clickable. The browser's defaults for a text link are blue and underlined, and like every default so far, that is CSS's business to change, not a reason to pick a different element.",
      },

      { t: "code", file: "out.html", code: "<p>The reference for every element is\n<a href=\"https://developer.mozilla.org\">MDN Web Docs</a>,\nand the language itself is specified at\n<a href=\"https://html.spec.whatwg.org\">WHATWG</a>.</p>", output: "One paragraph with two clickable links in it." },
      { t: "psoft", html: "Notice the links sit <b>inside</b> the paragraph, mid-sentence. An anchor is an inline element like <code>strong</code> or <code>em</code> — it wraps a few words wherever those words happen to be." },

      { t: "h2", n: "1", text: "Two kinds of address" },
      { t: "p", html: "An <b>absolute</b> URL is the whole thing, scheme first: <code>https://example.com/about.html</code>. It means the same destination from anywhere — written on your page, pasted in a chat, printed on paper." },
      { t: "p", html: "A <b>relative</b> URL leaves all of that out and gives directions from the file it is written in. <code>about.html</code> means \"the file called about.html, in the same folder as me\". Shorter to write — and it keeps working when the whole site moves, because the pages have not moved <i>relative to each other</i>. That is why links between your own pages should be relative: rename the domain, move from Live Server to real hosting, and not one internal link breaks." },

      { t: "syntax",
        intro: "Every shape a relative path takes, measured from the file the link is in.",
        form: "about.html            same folder as this file\nblog/post.html        down into a folder\n../index.html         up one folder, then the file\n../../images/logo.png  up two, then down\n/contact.html         from the site's root, wherever this file is",
        parts: [
          { bit: "about.html", says: "A bare name looks in this file's own folder. The commonest case and the shortest to write." },
          { bit: "blog/post.html", says: "A name with a slash walks down: into <code>blog</code>, then to <code>post.html</code>." },
          { bit: "..", says: "Up one level. It means \"my parent folder\" — the same <code>..</code> you may have met in a terminal, doing the same job." },
          { bit: "../../", says: "They chain. Two levels up, then whatever path follows." },
          { bit: "/contact.html", says: "A leading slash starts from the site root instead of from this file — the same address from every page on the site, however deep." },
        ],
        note: "The root-relative form needs a root to exist, so it works on a server — including Live Server — and misbehaves on <code>file:///</code>, where \"the root\" is your whole disk. One more thing that quietly depends on the difference Module 1 set up.",
      },

      { t: "code", file: "blog/post.html", code: "<!-- this file lives in the blog/ folder -->\n<a href=\"../index.html\">Home</a>\n<a href=\"second-post.html\">Next post</a>\n<img src=\"../images/banner.png\" alt=\"Banner\">", output: "Two links and an image, each path measured from blog/, where this file lives." },
      { t: "psoft", html: "The same rules drive <code>src</code> on an image, <code>href</code> on a stylesheet — every attribute that names a file. Learn the path rules once here and you have learned them for the whole language." },

      { t: "h2", n: "2", text: "The mistake the browser cannot warn you about" },
      { t: "p", html: "Write <code>href=\"www.wikipedia.org\"</code> and the link is broken — but not in the way you might guess. There is no error. The browser applies the rule it always applies: <b>no scheme means relative</b>. So it looks for a file called <code>www.wikipedia.org</code> in your own folder, fails to find one, and 404s on your own site." },

      { t: "debug",
        intro: "A student's footer link goes wrong in a way that looks impossible. Read the markup and the symptom, and work out what the browser did before opening the fix.",
        code: "<p>Sources: <a href=\"www.wikipedia.org\">Wikipedia</a></p>",
        symptom: "Clicking the link shows a 404 page — and the address bar reads mysite.com/www.wikipedia.org.",
        q: "The destination is right there in the tag. Why did the browser go looking for it on the student's own site?",
        fix: "<p>Sources: <a href=\"https://www.wikipedia.org\">Wikipedia</a></p>",
        why: "There is no scheme, and a URL without a scheme is relative — that is the rule, with no exception for values that happen to look like domains. So <code>www.wikipedia.org</code> was treated exactly like <code>about.html</code>: a file to find near this one. The address bar in the symptom says all of this in one line, which is why reading it beats re-reading the markup. Every external link starts <code>https://</code>." },

      { t: "h2", n: "3", text: "index.html, paid off" },
      { t: "p", html: "Module 1 insisted the home page be called <code>index.html</code> and promised a reason. Here it is: link to a <b>folder</b> — <code>href=\"blog/\"</code> — and the server serves that folder's <code>index.html</code> without the name ever appearing in the address. It is why <code>example.com</code> works with no filename in it, and why every folder of a well-organised site has an index." },

      { t: "drills", intro: "Write these out — the path rules only become automatic through your fingers.", items: [
        { task: "From index.html, a link to about.html in the same folder.", code: "<a href=\"about.html\">About</a>" },
        { task: "From index.html, a link to the first post, at blog/first.html.", code: "<a href=\"blog/first.html\">First post</a>" },
        { task: "From blog/first.html, a link back to the home page.", code: "<a href=\"../index.html\">Home</a>" },
        { task: "From anywhere at all, a link to Wikipedia.", code: "<a href=\"https://www.wikipedia.org\">Wikipedia</a>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<a href=\"www.example.com\">Visit</a>", why: "No scheme, so it is a relative path — the browser looks for a file called www.example.com on your own site.", fix: "<a href=\"https://www.example.com\">Visit</a>" },
        { bad: "<a href=\"C:\\Users\\ravi\\site\\about.html\">About</a>", why: "That is a disk path on one particular computer. It cannot work for any visitor, and backslashes are not path separators on the web.", fix: "<a href=\"about.html\">About</a>" },
        { bad: "<a>Contact</a>", why: "No href — so it is not a link. It renders as plain text, cannot be reached with the keyboard, and clicking does nothing.", fix: "<a href=\"contact.html\">Contact</a>" },
        { bad: "<a href=\"About.html\">About</a> — for a file named about.html", why: "Works on Windows, which ignores case, and 404s on almost every real server, which does not. The same trap DevTools caught with the Images/ folder in Module 1.", fix: "<a href=\"about.html\">About</a>" },
      ] },

      { t: "recap", items: [
        "<code>&lt;a href=\"...\"&gt;text&lt;/a&gt;</code> — no <code>href</code>, no link",
        "Absolute = the full URL, works from anywhere; relative = directions from this file",
        "Internal links should be relative — the site can then move without breaking",
        "<code>..</code> climbs one folder; a leading <code>/</code> starts from the site root",
        "No scheme means relative — <code>www.site.com</code> is a broken link, not a shortcut",
        "Linking to a folder serves its <code>index.html</code> — the payoff of the name",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "When would you use a relative URL rather than an absolute one?", a: "For every link between pages of the same site. Relative paths are measured between the files, so the whole site can change domain or move from local development to hosting without a single internal link breaking. Absolute URLs are for destinations you do not control — other people's sites." },
        { level: "medium", q: "A link written as href=\"example.com\" goes to a 404 on the developer's own site. What happened?", a: "There is no scheme, so the browser treated it as a relative path — a file called example.com next to the current page — exactly as it would treat about.html. Nothing distinguishes a value that looks like a domain; the rule is purely about the scheme. External links must carry https:// for this reason." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What turns an anchor element into a link?",
          options: [
            "The text inside it",
            "The href attribute",
            "The blue underline the browser draws",
            "Being placed inside a paragraph",
          ],
          correct: 1,
          why: "Without <code>href</code> it is not a link at all: it draws as plain text, cannot be focused with the keyboard, and clicking does nothing." },
        { level: "easy",
          q: "What does a bare filename like <code>about.html</code> mean in an href?",
          options: [
            "The file at the root of the site",
            "A file on any site with that name",
            "The file called about.html in the same folder as the page the link is written in",
            "A file the browser searches the whole site for",
          ],
          correct: 2,
          why: "Relative paths are directions from the file the link lives in — which is why moving that file changes where every relative link in it points." },
        { level: "easy",
          q: "What does <code>..</code> do in a path?",
          options: [
            "Goes up one folder",
            "Goes to the site's root",
            "Repeats the current folder",
            "Marks the path as absolute",
          ],
          correct: 0,
          why: "The same <code>..</code> you may have met in a terminal, doing the same job. They chain, so <code>../../</code> climbs two." },
        { level: "easy",
          q: "A leading slash, as in <code>/contact.html</code>, means what?",
          options: [
            "Up one folder from here",
            "The same folder as this file",
            "An external site",
            "Start from the site's root, whichever page the link is on",
          ],
          correct: 3,
          why: "It is the one relative form that reads the same from every page on the site, however deep the page sits." },
        { level: "medium",
          q: "You write <code>href=\"www.wikipedia.org\"</code>. Where does the browser go?",
          options: [
            "To Wikipedia, adding https:// for you",
            "Nowhere — it reports an invalid link",
            "To a file called www.wikipedia.org on your own site, and 404s",
            "To Wikipedia, but without encryption",
          ],
          correct: 2,
          why: "No scheme means relative, and there is no exception for values that happen to look like a domain. The address bar gives it away: it reads yoursite.com/www.wikipedia.org." },
        { level: "medium",
          q: "Why should links between pages of your own site be relative?",
          options: [
            "Relative links load faster",
            "The pages have not moved relative to each other, so the whole site can change domain or move to real hosting without one internal link breaking",
            "Absolute links are invalid within a site",
            "Search engines ignore absolute links",
          ],
          correct: 1,
          why: "It is the one property absolute URLs cannot give you: they name a domain, so changing the domain breaks every one of them." },
        { level: "medium",
          q: "What happens when you link to a folder, as in <code>href=\"blog/\"</code>?",
          options: [
            "The browser lists the files in it",
            "The link fails, since a folder is not a page",
            "The browser picks the most recently changed file",
            "The server serves that folder's index.html, with the name never appearing in the address",
          ],
          correct: 3,
          why: "This is the whole reason the home page is called index.html — it is why example.com works with no filename in it." },
        { level: "hard",
          q: "A file at <code>blog/post.html</code> needs to link to <code>index.html</code> at the top of the site. Which relative path is right?",
          options: [
            "../index.html",
            "index.html",
            "blog/index.html",
            "../../index.html",
          ],
          correct: 0,
          why: "The path is measured from the file the link is written in. From inside <code>blog/</code>, one climb reaches the top." },
        { level: "hard",
          q: "A link works on Windows and 404s once the site is deployed. Which cause fits best?",
          options: [
            "The server does not support relative paths",
            "The file was saved in the wrong encoding",
            "The href's capitalisation does not match the file on disk, and the server — unlike Windows — is case-sensitive",
            "The link needs a leading slash to work on a server",
          ],
          correct: 2,
          why: "Windows treats <code>About.html</code> and <code>about.html</code> as one file and almost every real server does not. It is the commonest \"but it works on my machine\" bug on the web." },
        { level: "hard",
          q: "Which of these is a real reason to use an absolute URL?",
          options: [
            "Linking from your home page to your about page",
            "Linking to a site you do not control",
            "Linking to an image in your own images folder",
            "Linking between two blog posts of your own",
          ],
          correct: 1,
          why: "Absolute is for destinations outside your control. Everything inside your own site is better off relative, for the reason above." },
      ] },
    ],
  },

  {
    slug: "html-link-targets",
    order: 14,
    title: "Fragments, New Tabs and the Words You Click",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Link to a specific place on a page — this one or any other",
        "Open a link in a new tab, and know when you should not",
        "Write links that start an email or a phone call",
        "Choose link text that works out of context — because it is read out of context",
      ] },

      { t: "hook",
        q: "A screen reader user presses one key and hears every link on the page read out as a plain list, with the sentences around them gone. Half your links say \"click here\". What does that list sound like?",
        why: "\"Click here. Click here. Read more. Here.\" — a menu with no dishes on it. The sentence that explained each link did not come along. Nothing else this lesson covers matters as much as the words you put inside the anchor." },

      { t: "def",
        term: "id attribute",
        en: "A name you give to one element so that it can be pointed at — by a link, and later by CSS and JavaScript. Each id may appear once per page." },

      { t: "analogy",
        concept: "fragment links",
        real: "handing over a book open at the right page",
        html: "A normal link hands someone the whole book and lets them find the passage. A fragment link hands it over already open at the paragraph you meant. The <code>id</code> is the bookmark you left; the <code>#</code> in the link is you saying \"start there\"." },

      { t: "syntax",
        intro: "Give an element a name, and links can jump straight to it — from this page or any other.",
        form: "<h2 id=\"pricing\">Pricing</h2>\n\n<a href=\"#pricing\">Jump to pricing</a>\n<a href=\"plans.html#pricing\">Pricing, over on the plans page</a>",
        parts: [
          { bit: "id=\"pricing\"", says: "The name. One element per page may hold it, and the convention is lowercase with hyphens — the same habits as filenames." },
          { bit: "#pricing", says: "A fragment on its own: jump to that id on <b>this</b> page. Module 0 said the fragment never reaches the server — this is why the jump is instant, with no request at all." },
          { bit: "plans.html#pricing", says: "A path and a fragment together: fetch that page, then land at that spot on it." },
        ],
        note: "Fragments are <b>case-sensitive</b> even though most of HTML is not: <code>href=\"#Pricing\"</code> does not find <code>id=\"pricing\"</code>, and the browser says nothing — the link simply scrolls nowhere. Lowercase both, every time, and the problem cannot exist.",
      },

      { t: "code", file: "guide.html", code: "<a href=\"#setup\">Setup</a> | <a href=\"#faq\">FAQ</a>\n\n<h2 id=\"setup\">Setup</h2>\n<p>Long section...</p>\n\n<h2 id=\"faq\">FAQ</h2>\n<p>Long section...</p>\n\n<a href=\"#top\">Back to top</a>", output: "A tiny table of contents that jumps down the page, and a link at the bottom that jumps back up." },
      { t: "psoft", html: "This is the entire mechanism behind every \"table of contents\" and every \"back to top\" you have ever clicked — and behind the address bar's <code>#reviews</code> from Module 0, which you can now write yourself." },

      { t: "h2", n: "1", text: "New tabs — the attribute and the manners" },
      { t: "syntax",
        intro: "Two attributes that travel together, and two schemes that make a link do something other than fetch a page.",
        form: "<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">Example</a>\n\n<a href=\"mailto:hi@example.com\">Email us</a>\n<a href=\"tel:+911234567890\">Call us</a>",
        parts: [
          { bit: "target=\"_blank\"", says: "Open in a new tab instead of navigating this one." },
          { bit: "rel=\"noopener\"", says: "Rides along with <code>_blank</code>. Without it, the opened page keeps a handle back to yours and can redirect it while the visitor is not looking — a real attack with a name, tabnabbing. One attribute closes the door." },
          { bit: "mailto:", says: "A scheme, like https — but it opens the visitor's mail program with the address filled in, instead of fetching anything." },
          { bit: "tel:", says: "The same idea for phone numbers. On a phone it dials; include the country code so it works from every country." },
        ],
        note: "The default — same tab — is right more often than beginners believe. The back button belongs to the visitor, and it already does everything a new tab does. Reserve <code>_blank</code> for genuine departures, like an external reference leaving your site, and never reach for it just to \"keep people on the page\".",
      },

      { t: "h2", n: "2", text: "The words inside the anchor" },
      { t: "p", html: "Link text is read in three places where the surrounding sentence is missing: the screen reader's links list from the hook, a search engine weighing what the destination page is about, and a visitor scanning the page for the blue underlines alone. In all three, <code>click here</code> carries nothing." },
      { t: "p", html: "The test is simple: read only the linked words, and ask whether they say where the link goes. \"<a>Click here</a> to see the price list\" fails it. \"See <a>the price list</a>\" passes — same sentence, same length, and the link now describes its destination." },

      { t: "note", variant: "key", html: "<b>Move the link onto the words that name the destination.</b> The fix is almost never new words — the sentence already contains the right ones, and the anchor is just wrapped around the wrong ones. \"Click here\" also fails a second way: it assumes a mouse. Nobody taps \"here\" on a phone or presses \"click\" on a keyboard." },

      { t: "debug",
        intro: "A table-of-contents link refuses to jump. Every name is spelled the same, in the same case, and the browser reports nothing at all. Read it before opening the fix.",
        code: "<a href=\"#pricing\" id=\"pricing\">Jump to pricing</a>\n\n<p>Long section...</p>\n\n<h2>Pricing</h2>\n<p>The plans and what they cost.</p>",
        symptom: "Clicking the link puts #pricing in the address bar and the page does not move.",
        q: "The id exists, the fragment matches it exactly, and the heading is further down. So why does nothing happen?",
        fix: "<a href=\"#pricing\">Jump to pricing</a>\n\n<p>Long section...</p>\n\n<h2 id=\"pricing\">Pricing</h2>\n<p>The plans and what they cost.</p>",
        why: "The id is on the <b>link</b> instead of on the destination. So the browser does exactly what it was asked: it finds the element named <code>pricing</code> — which is the link you just clicked — and scrolls to it. You are already there, so nothing appears to happen. The fragment went in the address bar because the jump succeeded, and that is the detail worth reading: a fragment that matched but did nothing means it matched the wrong element, while a fragment that missed leaves the page still and is usually a case mismatch instead. The <code>id</code> belongs on the thing you want to arrive at." },

      { t: "drills", intro: "Write these out. Two of them are about where the link goes, and two are about the words a reader hears.", items: [
        { task: "A heading named so that a link can reach it.", code: "<h2 id=\"pricing\">Pricing</h2>" },
        { task: "A link that jumps to that heading from the same page.", code: "<a href=\"#pricing\">Jump to pricing</a>" },
        { task: "A link to that same heading from a different page.", code: "<a href=\"plans.html#pricing\">Pricing, on the plans page</a>" },
        { task: "An external reference that leaves your site, opened in a new tab safely.", code: "<a href=\"https://developer.mozilla.org\" target=\"_blank\" rel=\"noopener\">MDN Web Docs</a>" },
        { task: "A link that starts an email to hi@example.com.", code: "<a href=\"mailto:hi@example.com\">Email us</a>" },
        { task: "Repair this link text: <code>Click &lt;a href=\"guide.html\"&gt;here&lt;/a&gt; to read the guide.</code>", code: "Read <a href=\"guide.html\">the guide</a>." },
      ] },

      { t: "mistakes", items: [
        { bad: "Click <a href=\"guide.html\">here</a> to read the guide.", why: "Out of context — in the links list, in a search index, at a glance — \"here\" says nothing about the destination.", fix: "Read <a href=\"guide.html\">the guide</a>." },
        { bad: "<a href=\"#Setup\">Setup</a> — for id=\"setup\"", why: "Fragments are case-sensitive. The link scrolls nowhere and no error says why.", fix: "<a href=\"#setup\">Setup</a>" },
        { bad: "<a href=\"#\">Products</a>", why: "A placeholder that ships. Clicking it jumps to the top of the page and puts a stray # in the address bar.", fix: "<a href=\"products.html\">Products</a>" },
        { bad: "target=\"_blank\" on every link in the navigation", why: "Every click breeds a tab, the back button dies, and the visitor's browser fills with copies of your site. It is their tab — let them decide.", fix: "Same tab for your own pages; _blank only for genuine departures." },
      ] },

      { t: "recap", items: [
        "<code>id</code> names a spot; <code>#name</code> jumps to it — instantly, with no request",
        "<code>page.html#name</code> combines a fetch and a jump",
        "Fragments are case-sensitive, and fail silently when they miss",
        "<code>target=\"_blank\"</code> opens a new tab; <code>rel=\"noopener\"</code> goes with it",
        "<code>mailto:</code> and <code>tel:</code> are links that act instead of fetching",
        "Link text must name its destination — it is read with the sentence stripped away",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What does target=\"_blank\" do, and what should accompany it?", a: "It opens the link in a new tab. rel=\"noopener\" should ride along, because without it the opened page holds a reference back to the opener and can navigate it — the tabnabbing attack. Modern browsers have closed most of the hole by default, but the attribute states the intent and costs nothing." },
        { level: "medium", q: "Why is \"click here\" considered bad link text?", a: "Because link text is consumed out of context: screen readers present links as a bare list, search engines use the anchor text to understand the destination, and scanning readers read only the underlines. In all three, \"here\" carries no information. The fix is to move the anchor onto the words that already name the destination — \"read the pricing guide\", not \"click here\"." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does the id attribute do?",
          options: [
            "Styles the element",
            "Groups elements that belong together",
            "Names one element so it can be pointed at",
            "Marks the element as important",
          ],
          correct: 2,
          why: "One element per page may hold a given id. Links use it now; CSS and JavaScript use the same names later." },
        { level: "easy",
          q: "What does <code>href=\"#setup\"</code> do?",
          options: [
            "Jumps to the element with id \"setup\" on this page, with no request to the server",
            "Requests a page called setup from the server",
            "Opens a search for the word setup",
            "Scrolls to the top of the page",
          ],
          correct: 0,
          why: "The fragment never reaches the server — which is exactly why the jump is instant." },
        { level: "easy",
          q: "Which attribute should travel with <code>target=\"_blank\"</code>?",
          options: [
            "rel=\"external\"",
            "rel=\"nofollow\"",
            "rel=\"alternate\"",
            "rel=\"noopener\"",
          ],
          correct: 3,
          why: "Without it the opened page keeps a handle back to yours and can navigate it while nobody is looking — the tabnabbing attack. One attribute closes the door." },
        { level: "easy",
          q: "What does a <code>mailto:</code> link do?",
          options: [
            "Sends an email directly from the page",
            "Opens the visitor's mail program with the address filled in",
            "Fetches the mail server's home page",
            "Copies the address to the clipboard",
          ],
          correct: 1,
          why: "It is a scheme, like https — but instead of fetching anything it hands the address to whatever program handles mail." },
        { level: "medium",
          q: "<code>href=\"#Pricing\"</code> is written, and the heading carries <code>id=\"pricing\"</code>. What happens?",
          options: [
            "It jumps correctly — fragments ignore case like tag names do",
            "The browser reports a broken fragment",
            "The page reloads",
            "Nothing at all, and nothing is reported",
          ],
          correct: 3,
          why: "Fragments are case-sensitive even though most of HTML is not, and a miss is completely silent. Lowercase both and the problem cannot exist." },
        { level: "medium",
          q: "You click a fragment link. The address bar gains the fragment and the page does not move. What does that combination suggest?",
          options: [
            "The id is missing from the page entirely",
            "The fragment is spelled in the wrong case",
            "It matched — but it matched an element already on screen, such as the link itself",
            "The browser has fragment navigation disabled",
          ],
          correct: 2,
          why: "A miss leaves the page still. A match that appears to do nothing means you arrived somewhere you already were, which is what happens when the id is on the link instead of the destination." },
        { level: "medium",
          q: "When is <code>target=\"_blank\"</code> a reasonable choice?",
          options: [
            "For an external reference genuinely leaving your site",
            "For every link in the site navigation",
            "For any link a visitor might want to come back from",
            "For links to large pages that take time to load",
          ],
          correct: 0,
          why: "The back button already does everything a new tab does, and it belongs to the visitor. The third option is an argument for the default, not against it." },
        { level: "hard",
          q: "A screen reader user pulls up the list of every link on your page. Which link text survives that?",
          options: [
            "Click here",
            "See the price list",
            "Read more",
            "This link",
          ],
          correct: 1,
          why: "The list arrives with every surrounding sentence stripped away. Only one of these still says where it goes." },
        { level: "hard",
          q: "\"Click here to see the price list.\" What is the best repair?",
          options: [
            "Add a title attribute explaining the destination",
            "Change it to \"click the price list here\"",
            "Move the anchor onto \"the price list\", leaving the sentence as it is",
            "Add target=\"_blank\" so the destination is obvious",
          ],
          correct: 2,
          why: "The fix is almost never new words — the sentence already contains the right ones, and the anchor is simply wrapped around the wrong ones." },
        { level: "hard",
          q: "Besides carrying no information, what second thing is wrong with \"click here\"?",
          options: [
            "It is too short to be indexed",
            "It assumes a mouse — nobody taps \"here\" on a phone or presses \"click\" on a keyboard",
            "Browsers render it in a lighter colour",
            "It cannot be translated automatically",
          ],
          correct: 1,
          why: "The instruction names an input device most of your visitors are not using." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 5 — IMAGES
   *
   * Two lessons. The first is the element, the paths (already learned — they
   * are the link rules) and alt text, which gets the most room because it is
   * the part beginners get wrong invisibly. The second is behaviour: reserving
   * space so the page does not jump, captions, and lazy loading.
   *
   * THE PRACTICE AREA SHIPS ITS OWN IMAGES — public/img-lab/ — so every
   * exercise renders a real picture inside the workbench preview. A student
   * never needs to find an image file, and a broken path shows an actual
   * broken-image icon they then fix and SEE fixed. The files are addressed
   * root-relatively (/img-lab/cat.svg), which is honest: it is the exact
   * root-relative form lesson 13 taught. banner.svg is 640x160 and photo.png
   * is 320x200 ON PURPOSE — the width/height exercise quotes those numbers.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-images",
    order: 15,
    title: "Images: src, alt and the Audience That Never Sees Them",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Put an image on a page and know exactly where the browser looks for it",
        "Write alt text that does its job — and know the one case where empty is correct",
        "Pick a file format by what the image <b>is</b>, not by habit",
        "Debug a missing image in one look instead of twenty guesses",
      ] },

      { t: "hook",
        q: "A visitor on hotel wifi, a screen reader user, and a search engine crawler all reach your page today. Not one of them sees your photo. What does each get instead?",
        why: "Whatever you wrote in <code>alt</code> — and if you wrote nothing, they get nothing: a silent gap, an unlabelled \"image\", an unindexed file. Every image has this second audience, and the whole craft of this lesson is writing for it." },

      { t: "def",
        term: "alt text",
        en: "The words that stand in for an image when the image cannot be seen: read aloud by screen readers, shown in place of a failed file, and read by search engines." },

      { t: "analogy",
        concept: "alt text",
        real: "describing a photo to someone over the phone",
        html: "You would never say \"it's an image\" — they know that. You would say what is <i>in</i> it: \"the three of us outside the old house, mid-laugh\". That sentence is exactly what good alt text is, and the phone test — would this description work aloud? — catches almost every bad one." },

      { t: "syntax",
        intro: "One empty element, two attributes that are never optional.",
        form: "<img src=\"/img-lab/cat.svg\" alt=\"A grey cat curled up asleep\">",
        parts: [
          { bit: "<img", says: "An empty element, from Module 2 — the image <b>is</b> the content, so there is no closing tag and never a <code>&lt;/img&gt;</code>." },
          { bit: "src", says: "Where the file lives. Every path rule from the links lesson applies unchanged: relative, <code>../</code>, root-relative, absolute." },
          { bit: "/img-lab/cat.svg", says: "A root-relative path — lesson 13's <code>/</code> form. This one is real: the practice area ships a small folder of images at <code>/img-lab/</code>, so your exercises render actual pictures." },
          { bit: "alt", says: "The stand-in words. Not optional decoration — it is the image's content for everyone who cannot see the pixels." },
        ],
        note: "<code>&lt;img&gt;</code> is inline, like <code>&lt;a&gt;</code> — it sits in the flow of text where you put it. Wrapping one in an anchor makes a clickable image; the two elements compose exactly as you would hope.",
      },

      { t: "code", file: "cat-page.html", code: "<h2>Meet Mochi</h2>\n<p>The office cat reviews every page before it ships.</p>\n<img src=\"/img-lab/cat.svg\" alt=\"A grey cat curled up asleep, striped tail wrapped around\">", output: "A heading, a line of text, and the cat — actually drawn on the page." },
      { t: "psoft", html: "Try this exact markup in any practice problem of this module — the picture renders in the preview, because <code>/img-lab/</code> genuinely exists here. Then break the path on purpose and watch what appears instead: the broken-image icon <b>and your alt text</b>. That fallback is the first of alt's three jobs, demonstrated in ten seconds." },

      { t: "h2", n: "1", text: "Writing alt that does the job" },
      { t: "p", html: "Describe what the image <b>shows</b>, or what it <b>does</b> if it is functional — a logo that links home is \"Home\", not \"company logo in blue gradient\". Never start with \"image of\" or \"picture of\": the screen reader already announces it as an image, so those words are pure noise played twice." },
      { t: "p", html: "Length follows the phone test: as many words as you would actually say, usually a short phrase, occasionally a sentence. If the image is a chart whose content <i>matters</i>, the description belongs in the page text where everyone gets it — alt then summarises." },

      { t: "note", variant: "key", html: "<b>The one case where empty is correct: <code>alt=\"\"</code> on decoration.</b> A flourish, a divider, a background texture — describing it aloud would be noise, so the empty value says \"skip this, it carries no content\". <b>Empty and missing are opposites here.</b> Missing <code>alt</code> gives the screen reader nothing to go on, so many fall back to reading the <b>filename</b> — \"IMG underscore 4 0 3 2 dot J P G\" — which is the worst outcome available. Decorative image → <code>alt=\"\"</code>, present and empty. Content image → real words. Missing → never." },

      { t: "h2", n: "2", text: "Formats: match the file to the picture" },
      { t: "note", variant: "tip", html: "<b>JPG</b> — photographs. Millions of colours, small files, no transparency.<br><b>PNG</b> — screenshots, diagrams, anything needing transparency. Crisp edges stay crisp.<br><b>SVG</b> — logos, icons, illustrations. It is markup, not pixels, so it scales to any size without blurring — the lab's cat is one.<br><b>WebP</b> — a modern format that does both jobs smaller; support is now universal.<br><b>GIF</b> — the legacy one. For animation, video formats beat it; for stills, everything beats it." },
      { t: "p", html: "The choice is content-driven: a photograph saved as PNG is enormous; a logo saved as JPG grows fuzz around every edge. When in doubt — photo means JPG (or WebP), art and UI mean PNG or SVG." },

      { t: "h2", n: "3", text: "When the image does not appear" },
      { t: "p", html: "Module 1's DevTools lesson already handed you the tool: open <b>Network</b>, find the red 404, and read the path in that row — it is exactly what the browser asked for. The usual culprits are the usual suspects: a capital letter that Windows forgave, a space that became <code>%20</code>, a file that sits one folder above where the path points." },

      { t: "debug",
        intro: "A student's photo shows on their machine and is broken for everyone else. The file on disk is photo.png, inside the images folder. Decide what is wrong before opening the fix.",
        code: "<img src=\"Images/Photo.PNG\" alt=\"Sunset over the sea\">",
        symptom: "Fine locally. On the deployed site: broken-image icon, and Network shows 404 for /Images/Photo.PNG.",
        q: "The file exists and the spelling looks right. What is the server seeing that Windows never did?",
        fix: "<img src=\"images/photo.png\" alt=\"Sunset over the sea\">",
        why: "Case. Windows treats <code>Images/Photo.PNG</code> and <code>images/photo.png</code> as the same file, so the page worked on the machine it was written on. The server treats them as three separate differences — folder, name, extension — and finds nothing. The Network row said all of this in one line; the fix is making the markup match the disk exactly, lowercase throughout, which is why Module 1 told you to name files that way in the first place." },

      { t: "drills", intro: "Write these out — attribute order never matters, but every quote and slash does.", items: [
        { task: "The lab's cat, with proper alt text.", code: "<img src=\"/img-lab/cat.svg\" alt=\"A grey cat curled up asleep\">" },
        { task: "A decorative divider that screen readers should skip.", code: "<img src=\"/img-lab/divider.svg\" alt=\"\">" },
        { task: "A photo that lives in an images folder next to this page.", code: "<img src=\"images/photo.jpg\" alt=\"Sunset over the harbour\">" },
        { task: "The lab's logo, linked to the home page.", code: "<a href=\"index.html\"><img src=\"/img-lab/logo.svg\" alt=\"Home\"></a>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<img src=\"cat.jpg\" alt=\"image of a cat\">", why: "The screen reader announces \"image\" already — the phrase plays twice. Say what is in it.", fix: "<img src=\"cat.jpg\" alt=\"A grey cat asleep on the windowsill\">" },
        { bad: "<img src=\"divider.svg\">", why: "Missing alt is not \"no description\" — many screen readers read the filename aloud instead, which is worse than silence.", fix: "<img src=\"divider.svg\" alt=\"\">" },
        { bad: "<img src=\"logo.svg\" alt=\"\"> — as the site's only home link", why: "Empty alt on a functional image makes the link unusable: there is nothing to announce, so the control vanishes for keyboard and screen reader users.", fix: "<img src=\"logo.svg\" alt=\"Home\">" },
        { bad: "<img src=\"My Photo.JPG\" alt=\"...\">", why: "The space becomes %20 in every URL and the capitals 404 on case-sensitive servers — the two filename rules from Module 1, both broken at once.", fix: "<img src=\"my-photo.jpg\" alt=\"...\">" },
      ] },

      { t: "recap", items: [
        "<code>&lt;img&gt;</code> is empty: <code>src</code> says where, <code>alt</code> says what",
        "Paths follow the link rules exactly — nothing new to learn",
        "Alt describes content or function; never \"image of\"",
        "Decorative → <code>alt=\"\"</code>, present and empty. Missing → filename read aloud",
        "JPG photos · PNG crisp/transparent · SVG scales forever · WebP both, smaller",
        "Broken image? Network panel first — the 404 row shows the exact path asked for",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is alt text for?", a: "Three audiences that never see the pixels: screen readers speak it, browsers show it when the file fails to load, and search engines index by it. It is the image's content in words, not a caption and not a tooltip." },
        { level: "medium", q: "What is the difference between alt=\"\" and leaving alt off entirely?", a: "Opposites. alt=\"\" is a deliberate statement that the image is decorative, so assistive tech skips it silently. A missing alt gives the screen reader nothing to go on, and many fall back to announcing the filename — noise at best, confusion at worst. Every img gets an alt attribute; only decorative ones get an empty value." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does the src attribute on an image give?",
          options: [
            "Where the file lives",
            "What the image shows",
            "How big to draw it",
            "Which format the file is in",
          ],
          correct: 0,
          why: "And every path rule from the links lesson applies to it unchanged — relative, <code>../</code>, root-relative, absolute." },
        { level: "easy",
          q: "Who is alt text for?",
          options: [
            "People who hover over the image",
            "The designer, as a note about the file",
            "Search engines only",
            "Anyone who cannot see the pixels — a screen reader, a failed load, a crawler",
          ],
          correct: 3,
          why: "Three audiences, none of them looking at the picture. It is the image's content in words." },
        { level: "easy",
          q: "How should alt text for a photograph begin?",
          options: [
            "With \"image of\"",
            "With what the image shows",
            "With the filename",
            "With \"picture:\"",
          ],
          correct: 1,
          why: "A screen reader already announces it as an image, so \"image of\" plays the same word twice." },
        { level: "easy",
          q: "Which format suits a logo that must stay sharp at any size?",
          options: [
            "JPG",
            "GIF",
            "SVG",
            "WebP",
          ],
          correct: 2,
          why: "SVG is markup rather than pixels, so it is drawn fresh at whatever size it is shown." },
        { level: "medium",
          q: "What is the difference between <code>alt=\"\"</code> and no alt attribute at all?",
          options: [
            "None — both mean the image has no description",
            "Opposites: the empty value says \"decorative, skip it\"; a missing attribute leaves the screen reader guessing, and many read the filename aloud",
            "The empty value is invalid HTML",
            "A missing alt makes the browser hide the image",
          ],
          correct: 1,
          why: "\"IMG underscore 4 0 3 2 dot J P G\" read aloud is the worst outcome available, and it is what a missing attribute buys you." },
        { level: "medium",
          q: "A logo is the only link to the home page. What should its alt say?",
          options: [
            "Nothing — it is decorative",
            "Company logo in blue gradient",
            "logo.svg",
            "Home",
          ],
          correct: 3,
          why: "When an image is functional, the alt describes the <b>function</b>. Describing the artwork tells a keyboard user nothing about where the link goes." },
        { level: "medium",
          q: "An image is broken on the deployed site and fine on your machine. What do you open first?",
          options: [
            "The image file, to check it is not corrupt",
            "The Network panel, to read the exact path the browser asked for",
            "The CSS, to check nothing is hiding it",
            "The hosting dashboard",
          ],
          correct: 1,
          why: "The 404 row names the path that was requested, capitals and all — which is usually the whole diagnosis in one line." },
        { level: "hard",
          q: "<code>&lt;img src=\"My Photo.JPG\"&gt;</code> breaks on a real server in two separate ways. Which two?",
          options: [
            "The space becomes %20 in the URL, and the capitals do not match a case-sensitive filesystem",
            "The extension is wrong, and the file is too large",
            "JPG is not a supported format, and the path is relative",
            "The quotes are wrong, and the element needs closing",
          ],
          correct: 0,
          why: "Both are filename rules, and both were set out in Module 1: lowercase, and hyphens instead of spaces." },
        { level: "hard",
          q: "A chart carries information the reader genuinely needs. Where should that information live?",
          options: [
            "Entirely in the alt attribute, however long it takes",
            "In a title attribute on the image",
            "Nowhere — a chart is decorative by definition",
            "In the page text, where everyone gets it, with alt summarising",
          ],
          correct: 3,
          why: "Content that matters should not be reachable only by the people using a screen reader — nor only by the people who are not." },
        { level: "hard",
          q: "Which image genuinely deserves <code>alt=\"\"</code>?",
          options: [
            "A product photo in a shop listing",
            "A decorative divider between two sections",
            "A logo that links to the home page",
            "A screenshot showing where to click",
          ],
          correct: 1,
          why: "Only the divider carries no content. Announcing it aloud would be noise, and the empty value is how you say so deliberately." },
      ] },
    ],
  },

  {
    slug: "html-image-figures",
    order: 16,
    title: "Images That Behave: Size, Captions and Lazy Loading",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Stop a page jumping mid-read by reserving the image's space",
        "Caption an image with the element built for captions",
        "Delay offscreen images with one attribute — and know the one image that must not wait",
        "Keep alt and caption doing their separate jobs",
      ] },

      { t: "hook",
        q: "You are reading an article on your phone. The paragraph slides down mid-sentence, your thumb taps the wrong link. Module 0's final lesson named this jumping as a rendering step gone wrong. What did the developer leave out?",
        why: "Two attributes. The browser laid the text out, an image arrived late with dimensions nobody had declared, and everything below it moved to make room. <code>width</code> and <code>height</code> would have held the space from the first moment." },

      { t: "def",
        term: "figure",
        en: "A self-contained piece of content — an image, a chart, a code listing — that the surrounding text refers to, optionally with a caption that belongs to it." },

      { t: "analogy",
        concept: "width and height on an image",
        real: "a reserved seat",
        html: "The guest has not arrived, but the seat is held — nobody shuffles when they walk in. Declaring the dimensions reserves the image's seat in the layout, so its arrival changes nothing. Without the reservation, every latecomer reshuffles the whole room." },

      { t: "syntax",
        intro: "The two attributes that hold space, and the one that delays loading.",
        form: "<img src=\"/img-lab/photo.png\" alt=\"Sunset over the sea\"\n     width=\"320\" height=\"200\" loading=\"lazy\">",
        parts: [
          { bit: "width=\"320\"", says: "The image's real pixel width, as a bare number — no units. CSS can still display it at any size; what these declare is the <b>shape</b> of the space to reserve." },
          { bit: "height=\"200\"", says: "The real height. Together they give the browser the aspect ratio before a single byte of the file arrives — which is what kills the jump." },
          { bit: "loading=\"lazy\"", says: "Do not fetch this until the reader scrolls near it. Free bandwidth on every image below the first screen — and wrong on any image <b>in</b> the first screen, which would then wait to appear." },
        ],
        note: "Use the file's true dimensions. Declare a 320x200 image as 320x320 and the browser reserves the wrong shape — the space is held, the picture arrives, and it is stretched or the layout shifts anyway. The lab's files state their sizes: <code>banner.svg</code> is 640x160, <code>photo.png</code> is 320x200.",
      },

      { t: "syntax",
        intro: "A captioned figure: the image and its caption, tied together so everything knows they belong to each other.",
        form: "<figure>\n  <img src=\"/img-lab/photo.png\" alt=\"The sun low over a dark sea\"\n       width=\"320\" height=\"200\">\n  <figcaption>Sunset from the harbour wall, minutes before the storm.</figcaption>\n</figure>",
        parts: [
          { bit: "<figure>", says: "The wrapper that says \"this is one self-contained thing\". Move it, and the caption moves with it — they cannot drift apart." },
          { bit: "<figcaption>", says: "The visible caption, first or last child of the figure. One per figure." },
        ],
        note: "A <code>&lt;p&gt;</code> under an image <i>looks</i> identical — and nothing knows the two are related. The figure exists for the relationship: screen readers announce the caption as the image's caption, and anything extracting content keeps them together.",
      },

      { t: "code", file: "figure.html", code: "<figure>\n  <img src=\"/img-lab/photo.png\" alt=\"The sun low over a dark sea\"\n       width=\"320\" height=\"200\" loading=\"lazy\">\n  <figcaption>Sunset from the harbour wall, minutes before the storm.</figcaption>\n</figure>", output: "The photo with its caption beneath it, and the space already the right shape before the file arrives." },
      { t: "psoft", html: "Change <code>height</code> to <code>320</code> and the picture distorts — the reserved seat is now the wrong shape, and the browser fits the image to what you declared. That is the fastest way to feel what these two attributes actually do, and why the file's <b>true</b> numbers are the only ones worth typing." },

      { t: "h2", n: "1", text: "Alt and caption are different jobs" },
      { t: "p", html: "The caption is visible commentary — <i>why this image is here</i>: \"Sunset from the harbour wall, minutes before the storm.\" The alt describes <i>what the image shows</i> for someone who cannot see it: \"The sun low over a dark sea.\" A screen reader reads both, in turn — write them identically and the listener hears the same sentence twice." },

      { t: "h2", n: "2", text: "Lazy loading, and the image that must not wait" },
      { t: "p", html: "A long article might carry twenty images; a visitor who reads the first paragraph and leaves has paid for all twenty. <code>loading=\"lazy\"</code> defers each one until the reader approaches it — one attribute, no script, and the saving is real on exactly the pages that have many images." },
      { t: "note", variant: "warn", html: "<b>Never lazy-load the first screen.</b> The banner at the top of the page is the first thing a visitor looks at; marking it <code>lazy</code> tells the browser it can wait, and the largest thing on screen arrives last. Everything <b>below</b> the first screen: lazy. The hero image: never." },

      { t: "debug",
        intro: "A developer added <code>loading=\"lazy\"</code> to every image on the site and measured the page as slower to feel ready, not faster. This is the top of the page. Work out why before opening the fix.",
        code: "<body>\n  <img src=\"/img-lab/banner.svg\" alt=\"Etudo\"\n       width=\"640\" height=\"160\" loading=\"lazy\">\n  <h1>Learn it. Practise it.</h1>\n  <p>Twenty paragraphs follow, with ten more images.</p>\n</body>",
        symptom: "On a slow connection the banner is the last thing to appear. The heading and the text are readable long before the top of the page finishes drawing.",
        q: "Every one of the eleven images was deferred, so less was downloaded up front. Why did the page get worse?",
        fix: "<body>\n  <img src=\"/img-lab/banner.svg\" alt=\"Etudo\"\n       width=\"640\" height=\"160\">\n  <h1>Learn it. Practise it.</h1>\n  <p>Twenty paragraphs follow, with ten more images.</p>\n</body>",
        why: "Because \"lazy\" is not a synonym for \"fast\" — it means <b>this one can wait</b>, and the browser believes you. The ten images further down genuinely can wait, and deferring them is the whole point of the attribute. The banner cannot: it is the largest thing in the first screen, so it is the image the visitor is waiting on, and telling the browser to postpone it puts the most important download at the back of the queue. The rule is positional, not global — below the first screen, lazy; the hero, never. Note that <code>width</code> and <code>height</code> stay in both versions: reserving the space is right either way, and it is a separate job from deciding when to fetch." },

      { t: "drills", intro: "Write these out. The lab's files are real and their dimensions are load-bearing: banner.svg is 640x160 and photo.png is 320x200.", items: [
        { task: "The lab's photo with its space reserved correctly.", code: "<img src=\"/img-lab/photo.png\" alt=\"Sunset over the sea\" width=\"320\" height=\"200\">" },
        { task: "The same photo, deferred because it sits far down the page.", code: "<img src=\"/img-lab/photo.png\" alt=\"Sunset over the sea\" width=\"320\" height=\"200\" loading=\"lazy\">" },
        { task: "That photo as a figure, with a caption that comments rather than repeats the alt.", code: "<figure>\n  <img src=\"/img-lab/photo.png\" alt=\"The sun low over a dark sea\" width=\"320\" height=\"200\">\n  <figcaption>Taken from the harbour wall, minutes before the storm.</figcaption>\n</figure>" },
        { task: "The lab's banner at the top of a page — the one image that must not be deferred.", code: "<img src=\"/img-lab/banner.svg\" alt=\"Etudo\" width=\"640\" height=\"160\">" },
      ] },

      { t: "mistakes", items: [
        { bad: "<figcaption>The harbour</figcaption>\n<figure>\n  <img src=\"photo.png\" alt=\"...\">\n</figure>", why: "The caption is outside the figure, so it is a stray element related to nothing. It belongs inside — first or last child.", fix: "<figure>\n  <img src=\"photo.png\" alt=\"...\">\n  <figcaption>The harbour</figcaption>\n</figure>" },
        { bad: "width=\"320\" height=\"320\" — on a 320x200 photo", why: "The reserved space has the wrong shape, so the layout shifts anyway when the real ratio arrives — the exact bug the attributes exist to prevent.", fix: "width=\"320\" height=\"200\" — the file's true ratio" },
        { bad: "<img src=\"banner.svg\" loading=\"lazy\"> — at the very top of the page", why: "The first thing the visitor should see is the one image told it may wait.", fix: "Lazy below the first screen; the hero loads normally." },
        { bad: "alt=\"Sunset from the harbour wall\" + <figcaption>Sunset from the harbour wall</figcaption>", why: "A screen reader reads the same words twice in a row. Alt describes the picture; the caption says why it is here.", fix: "alt=\"The sun low over a dark sea\" + a caption that comments" },
      ] },

      { t: "recap", items: [
        "<code>width</code>/<code>height</code> = the file's real pixels, no units — they reserve the shape",
        "Reserved shape = no layout jump when the image arrives",
        "<code>&lt;figure&gt;</code> ties image and <code>&lt;figcaption&gt;</code> into one unit",
        "Alt describes the image; the caption comments on it — never the same words",
        "<code>loading=\"lazy\"</code> on everything below the first screen",
        "The hero image is the one image that must never be lazy",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "Why give an image width and height attributes when CSS controls its displayed size anyway?", a: "The attributes tell the browser the aspect ratio before the file arrives, so the layout reserves correctly-shaped space and nothing below the image moves when it loads. CSS then scales it freely. Without them the browser learns the size only when the bytes arrive, lays the page out again, and the visible content jumps — measured as Cumulative Layout Shift." },
        { level: "medium", q: "When is figure the right element rather than a bare img?", a: "When the image has a caption, or the text refers to it as a unit — \"see the chart below\". figure binds the image and figcaption into one self-contained thing that can move together, and assistive tech announces the caption as belonging to the image. A bare img with a paragraph under it looks the same and relates the two by nothing but proximity." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What do the width and height attributes on an image actually buy you?",
          options: [
            "They force the image to display at that size",
            "The browser knows the shape to reserve before the file arrives, so nothing below it jumps",
            "They compress the file to those dimensions",
            "They stop the image loading on small screens",
          ],
          correct: 1,
          why: "CSS still decides the displayed size. What the attributes declare is the aspect ratio, and that is what the layout needs early." },
        { level: "easy",
          q: "How are those two values written?",
          options: [
            "With px units",
            "As a percentage",
            "In any CSS length unit",
            "As bare numbers, the file's real pixel dimensions",
          ],
          correct: 3,
          why: "No units. And they must be the file's true numbers — a wrong ratio reserves a wrong shape, which is the bug they exist to prevent." },
        { level: "easy",
          q: "What does the figure element do?",
          options: [
            "Ties a piece of self-contained content and its caption into one unit",
            "Centres an image on the page",
            "Adds a border and a shadow",
            "Marks an image as decorative",
          ],
          correct: 0,
          why: "Move the figure and the caption moves with it. A paragraph under an image looks identical and is related to it by nothing but proximity." },
        { level: "easy",
          q: "What does <code>loading=\"lazy\"</code> tell the browser?",
          options: [
            "Load this image at a lower quality first",
            "Load this image only on fast connections",
            "Do not fetch this until the reader scrolls near it",
            "Load this image after the stylesheet",
          ],
          correct: 2,
          why: "One attribute, no script — and the saving is real on exactly the pages that carry many images." },
        { level: "medium",
          q: "Which image should never carry <code>loading=\"lazy\"</code>?",
          options: [
            "A photograph halfway down a long article",
            "A decorative divider near the footer",
            "Any image inside a figure",
            "The banner at the top of the page",
          ],
          correct: 3,
          why: "It is the largest thing the visitor is waiting on. \"Lazy\" means \"this one can wait\", and the browser believes you." },
        { level: "medium",
          q: "A 320x200 photo is declared <code>width=\"320\" height=\"320\"</code>. What goes wrong?",
          options: [
            "Nothing — only the width is used for layout",
            "The reserved space is the wrong shape, so the layout shifts anyway or the picture is distorted",
            "The browser ignores both attributes and loads normally",
            "The image fails to load",
          ],
          correct: 1,
          why: "The attributes are a promise about the ratio. A wrong promise is worse than none, because the layout is now confidently wrong." },
        { level: "medium",
          q: "Alt text and a figcaption on the same image. What is the difference?",
          options: [
            "The caption is for search engines and the alt is for people",
            "They should carry the same words for consistency",
            "The alt describes what the image shows; the caption comments on why it is here",
            "The caption replaces the alt when it is present",
          ],
          correct: 2,
          why: "A screen reader reads both, in turn. Write them identically and the listener hears the same sentence twice." },
        { level: "hard",
          q: "A developer marks every image on the site lazy and the page feels slower to become useful. What happened?",
          options: [
            "The hero image was deferred, so the largest thing in the first screen arrived last",
            "Lazy loading is slower than normal loading on every image",
            "The browser downloaded the images twice",
            "The attribute is only valid on images below the fold and the rest were ignored",
          ],
          correct: 0,
          why: "The rule is positional, not global: it is a statement about which images can wait, and the one at the top cannot." },
        { level: "hard",
          q: "Where may a figcaption sit?",
          options: [
            "Anywhere near the figure",
            "Immediately before the figure",
            "Only after the image, outside the figure",
            "As the first or last child of the figure, one per figure",
          ],
          correct: 3,
          why: "Outside the figure it is a stray element related to nothing — which is exactly the relationship the figure exists to create." },
        { level: "hard",
          q: "Why does a late-arriving image push the text below it down the page?",
          options: [
            "Because images always load after text",
            "Because the browser laid the page out without knowing the image's size, then had to lay it out again once the bytes arrived",
            "Because the image is inserted into the document only when it finishes downloading",
            "Because the browser reserves a default size that is always too small",
          ],
          correct: 1,
          why: "Two layouts instead of one, and the second one moves everything. Declaring the dimensions means the first layout was already right." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 6 — LISTS
   *
   * Three elements that look trivial and are not. The through-line: a list is a
   * COUNT that gets announced ("list, four items") before its contents, which is
   * why faking one with paragraphs and bullet characters loses information no
   * amount of CSS puts back.
   *
   * THE NESTING EXERCISE IS GRADEABLE HERE, and that is worth writing down
   * because Module 2's note says the opposite about markup tidying. A nested
   * list put in the wrong place — a <ul> as a sibling of <li> rather than
   * inside one — SURVIVES parsing as `ul > ul` in both linkedom and the
   * browser's DOMParser. Verified in both before the problem was written. The
   * general rule stands (crossed tags and missing closers are repaired away);
   * this particular error changes the tree, so it can be checked.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-lists",
    order: 17,
    title: "Lists: When Order Means Something",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Choose between <code>ul</code> and <code>ol</code> for a reason you can state",
        "Nest a list inside another one — in the right place",
        "Make an ordered list start where you need it to",
        "Stop faking lists with paragraphs and dashes",
      ] },

      { t: "hook",
        q: "A screen reader reaches your list and announces \"list, four items\" before reading any of them. Now write those same four things as four paragraphs starting with a dash. What did the listener just lose?",
        why: "The count, and the boundary. They no longer know how many there are, when the list ends, or that it was a list at all — and they cannot skip past it, because nothing told them it was one thing. The bullets on screen looked the same the whole time." },

      { t: "def",
        term: "List",
        en: "A group of related items marked as a group, so that everything reading the page knows how many there are and where the group ends." },

      { t: "analogy",
        concept: "ul vs ol",
        real: "a shopping list vs a recipe",
        html: "Shuffle a shopping list and nothing is lost — you needed all of it anyway. Shuffle a recipe and you are icing a cake before baking it. That is the entire test: <b>if reordering the items changes the meaning, it is ordered</b>. Bullets and numbers are only how the two look." },

      { t: "syntax",
        intro: "Two containers, one item element between them.",
        form: "<ul>\n  <li>Onions</li>\n  <li>Rice</li>\n</ul>\n\n<ol>\n  <li>Heat the oil</li>\n  <li>Add the onions</li>\n</ol>",
        parts: [
          { bit: "<ul>", says: "Unordered list. The items belong together and their sequence carries no meaning." },
          { bit: "<ol>", says: "Ordered list. The sequence <b>is</b> information — steps, rankings, anything numbered." },
          { bit: "<li>", says: "One list item. The only element allowed directly inside either container — and it may hold anything: text, a link, a paragraph, another list." },
        ],
        note: "The bullet and the number are the browser's defaults, not the point. CSS can remove bullets entirely and the list is still a list to everything that reads the page — which is exactly why navigation menus are built from them.",
      },

      { t: "code", file: "lists.html", code: "<h3>What to buy</h3>\n<ul>\n  <li>Onions</li>\n  <li>Rice</li>\n  <li>Yoghurt</li>\n</ul>\n\n<h3>How to cook it</h3>\n<ol>\n  <li>Heat the oil</li>\n  <li>Add the onions</li>\n  <li>Add the rice and water</li>\n</ol>", output: "A bulleted list of three items, then a numbered list of three steps." },
      { t: "psoft", html: "Press <b>Try it yourself</b> and swap the two container names over. The shopping list becomes numbered, which is harmless nonsense — and the recipe becomes bulleted, which is a genuine lie: it now claims those three steps could be done in any order." },

      { t: "h2", n: "1", text: "Nesting: inside the item, not beside it" },
      { t: "p", html: "A list inside a list goes <b>inside an <code>&lt;li&gt;</code></b> — because the sub-list belongs to that item. Putting it between two <code>&lt;li&gt;</code> elements instead is the single commonest list mistake, and it is not repaired away: the browser keeps your wrong tree, so the sub-list belongs to nothing." },

      { t: "code", file: "nesting.html", code: "<ul>\n  <li>Fruit\n    <ul>\n      <li>Mangoes</li>\n      <li>Bananas</li>\n    </ul>\n  </li>\n  <li>Vegetables</li>\n</ul>", output: "Fruit, with Mangoes and Bananas indented under it, then Vegetables." },
      { t: "psoft", html: "Notice where <code>&lt;/li&gt;</code> is: <b>after</b> the inner list. The Fruit item is not finished until everything belonging to Fruit has been written — which is what makes the nesting mean \"these are kinds of fruit\"." },

      { t: "debug",
        intro: "This list looks almost right on screen and is structurally broken. Work out where before opening the fix.",
        code: "<ul>\n  <li>Fruit</li>\n  <ul>\n    <li>Mangoes</li>\n  </ul>\n  <li>Vegetables</li>\n</ul>",
        symptom: "Mangoes appears indented, so it looks fine. But a screen reader announces the outer list as having two items, and Mangoes belongs to neither of them.",
        q: "Every tag is closed and the indentation looks tidy. So what is the browser being told?",
        fix: "<ul>\n  <li>Fruit\n    <ul>\n      <li>Mangoes</li>\n    </ul>\n  </li>\n  <li>Vegetables</li>\n</ul>",
        why: "The inner <code>&lt;ul&gt;</code> is a <b>sibling</b> of the items, not a child of one — Fruit was closed before the sub-list started, so nothing connects them. Only <code>&lt;li&gt;</code> may sit directly inside a list, and the browser does not move the stray one; it keeps the structure you wrote and indents it anyway, which is why the screen never shows the bug. Moving <code>&lt;/li&gt;</code> to after the inner list makes Mangoes part of Fruit." },

      { t: "h2", n: "2", text: "Changing where the numbers start" },
      { t: "syntax",
        intro: "Three attributes for ordered lists. Each answers a real need, not a styling whim.",
        form: "<ol start=\"5\">      continue from 5\n<ol reversed>       count down\n<ol type=\"a\">       a, b, c instead of 1, 2, 3",
        parts: [
          { bit: "start", says: "The first number. For a list continued after an interruption — step 5 onwards, after a paragraph explaining steps 1 to 4." },
          { bit: "reversed", says: "Count down instead of up. A countdown, a top-ten read from tenth upward. Present or absent, no value needed." },
          { bit: "type", says: "Which marker: <code>1</code> numbers, <code>a</code>/<code>A</code> letters, <code>i</code>/<code>I</code> roman numerals. Use it when the marker <b>is</b> the reference — a legal clause called 4(a) is not clause 4.1." },
        ],
        note: "<code>type</code> is the one place where a list's appearance is legitimately content: if the document elsewhere says \"see item (c)\", the letter has to be a letter. For everything else, leave the marker alone and let CSS decide how it looks.",
      },

      { t: "drills", intro: "Write these out. Before each one, say out loud whether reordering the items would change the meaning — that is the whole decision.", items: [
        { task: "Three things to buy.", code: "<ul>\n  <li>Onions</li>\n  <li>Rice</li>\n  <li>Yoghurt</li>\n</ul>" },
        { task: "Three steps that must happen in that order.", code: "<ol>\n  <li>Heat the oil</li>\n  <li>Add the onions</li>\n  <li>Add the rice and water</li>\n</ol>" },
        { task: "Fruit, with Mangoes nested underneath it — the sub-list inside the item it belongs to.", code: "<ul>\n  <li>Fruit\n    <ul>\n      <li>Mangoes</li>\n    </ul>\n  </li>\n</ul>" },
        { task: "A numbered list continuing from step 5 after an interruption.", code: "<ol start=\"5\">\n  <li>Bake for forty minutes</li>\n  <li>Leave to cool</li>\n</ol>" },
        { task: "A list whose markers are letters, because the text elsewhere refers to item (b).", code: "<ol type=\"a\">\n  <li>Notice of termination</li>\n  <li>Payment in lieu</li>\n</ol>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<ul>\n  <li>Fruit</li>\n  <ul><li>Mangoes</li></ul>\n</ul>", why: "The nested list is a sibling of the item, not inside it — so it belongs to nothing. Only <li> may sit directly inside a list.", fix: "<ul>\n  <li>Fruit\n    <ul><li>Mangoes</li></ul>\n  </li>\n</ul>" },
        { bad: "<p>- Onions</p>\n<p>- Rice</p>", why: "Bullet characters typed by hand. It looks like a list and is three unrelated paragraphs to everything that is not a pair of eyes — no count, no boundary, no way to skip.", fix: "<ul>\n  <li>Onions</li>\n  <li>Rice</li>\n</ul>" },
        { bad: "<ol> — for a shopping list", why: "Numbers claim the sequence matters. Nothing changes if you buy the rice first.", fix: "<ul> for the shopping list; <ol> for the recipe." },
        { bad: "<ul>\n  <li>One</li>\n  <p>A note about it</p>\n</ul>", why: "A paragraph directly inside a list. It has no item to belong to.", fix: "<ul>\n  <li>One\n    <p>A note about it</p>\n  </li>\n</ul>" },
      ] },

      { t: "recap", items: [
        "<code>ul</code> when order carries no meaning, <code>ol</code> when it does — reorder it and see",
        "<code>li</code> is the only element allowed directly inside either",
        "A nested list goes <b>inside</b> an <code>li</code>, before its closing tag",
        "That mistake survives parsing — the page looks right and the structure is wrong",
        "<code>start</code>, <code>reversed</code> and <code>type</code> change the numbering when the number is content",
        "A list announces its <b>count</b>; hand-typed dashes announce nothing",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "How do you decide between ul and ol?", a: "Reorder the items in your head. If the meaning survives, it is unordered; if it breaks — steps, rankings, anything the text refers to by number — it is ordered. The bullets and numbers are only defaults; CSS can swap the appearance either way, which is exactly why the choice has to be made on meaning." },
        { level: "medium", q: "Why does it matter that a list is marked up as a list rather than styled to look like one?", a: "Because a list is announced as a group with a count — \"list, four items\" — and can be skipped as a unit. Paragraphs with dash characters give a screen reader user no count, no boundary and no way past. The visual result is identical, which is what makes this so easy to get wrong and impossible to see." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What is the test for choosing between an unordered and an ordered list?",
          options: [
            "Whether the list has more than five items",
            "Whether the design shows bullets or numbers",
            "Whether reordering the items would change the meaning",
            "Whether the items are sentences or single words",
          ],
          correct: 2,
          why: "Shuffle a shopping list and nothing is lost. Shuffle a recipe and you are icing a cake before baking it." },
        { level: "easy",
          q: "Which element may sit directly inside a ul or an ol?",
          options: [
            "Only the li element",
            "Any element at all",
            "Only text",
            "Only li and p elements",
          ],
          correct: 0,
          why: "An li may then hold anything you like — text, a link, a paragraph, another list." },
        { level: "easy",
          q: "What does a screen reader announce when it reaches a list?",
          options: [
            "Only the first item",
            "The name of the list",
            "Nothing — lists are silent",
            "That it is a list, and how many items it has",
          ],
          correct: 3,
          why: "The count and the boundary are the information the markup carries, and both are lost when a list is faked with dashes." },
        { level: "easy",
          q: "Where does a nested list belong?",
          options: [
            "Between two li elements",
            "Inside the li it belongs to, before that item's closing tag",
            "After the outer list closes",
            "Inside the ul, as the last child",
          ],
          correct: 1,
          why: "The sub-list belongs to that item, so the item is not finished until the sub-list has been written." },
        { level: "medium",
          q: "A nested list is written as a sibling of the items instead of inside one. What does the browser do?",
          options: [
            "Moves it inside the previous item automatically",
            "Reports an invalid nesting error",
            "Keeps the wrong tree exactly as written, and indents it anyway",
            "Drops the nested list entirely",
          ],
          correct: 2,
          why: "This is why the mistake survives review: the screen looks right, and the structure says the sub-list belongs to nothing. It is also why it can be graded — unlike crossed tags, this error is still there after parsing." },
        { level: "medium",
          q: "Four items written as four paragraphs each starting with a dash. What is lost?",
          options: [
            "Nothing — the bullets look the same",
            "Only the indentation",
            "The count, the boundary, and any way to skip the group as a unit",
            "The ability to style them with CSS",
          ],
          correct: 2,
          why: "It is three unrelated paragraphs to everything that is not a pair of eyes, and the visual result is identical — which is what makes it so easy to ship." },
        { level: "medium",
          q: "Which attribute makes an ordered list continue from 5?",
          options: [
            "value=\"5\"",
            "start=\"5\"",
            "from=\"5\"",
            "index=\"5\"",
          ],
          correct: 1,
          why: "For a list resumed after an interruption — steps 5 onwards, after a paragraph explaining the first four." },
        { level: "hard",
          q: "When is <code>type</code> on an ordered list legitimately about content rather than styling?",
          options: [
            "When the design calls for letters instead of numbers",
            "When the list is nested inside another list",
            "When there are more than nine items",
            "When the document refers to an item by its marker, as in \"see clause (c)\"",
          ],
          correct: 3,
          why: "A legal clause called 4(a) is not clause 4.1. Everywhere else the marker is appearance, and CSS owns it." },
        { level: "hard",
          q: "Navigation menus are built from unordered lists. Why, when the bullets are always removed?",
          options: [
            "Because the browser requires links to be inside list items",
            "Because CSS cannot lay out links horizontally otherwise",
            "Because the count and the grouping survive the styling — a user hears how big the menu is before walking it",
            "Because search engines only follow links inside lists",
          ],
          correct: 2,
          why: "The structure is what is being kept, not the appearance. That is the whole reason the markup is worth writing." },
        { level: "hard",
          q: "A shopping list is marked up with an ol. What has the markup claimed?",
          options: [
            "That the sequence matters — that buying the rice first would be wrong",
            "Nothing at all; ol and ul are interchangeable",
            "That the list is longer than usual",
            "That the items are ranked by importance",
          ],
          correct: 0,
          why: "Harmless-looking and still false. The numbers are a claim, and it is the one thing a shopping list cannot support." },
      ] },
    ],
  },

  {
    slug: "html-description-lists",
    order: 18,
    title: "Description Lists, and Lists as Page Furniture",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Mark up a glossary or spec table with <code>dl</code>, <code>dt</code> and <code>dd</code>",
        "Give one term several descriptions, and several terms one",
        "Build a navigation menu out of a list, and say why it is one",
        "Recognise the third list type when you meet it in real markup",
      ] },

      { t: "hook",
        q: "A phone's spec sheet: Screen — 6.1 inches. Battery — 3200 mAh. Weight — 174 g. You could write that as a two-column table, or as paragraphs with dashes. Both are wrong, and HTML has an element for exactly this. Why does it exist?",
        why: "Because it is neither a table nor prose — it is a set of <b>name–value pairs</b>, and the relationship is the content. A table implies rows and columns that can be compared across; paragraphs imply nothing at all. The description list says \"each of these labels owns what follows it\"." },

      { t: "def",
        term: "Description list",
        en: "A list of terms and their descriptions — a glossary, a spec sheet, a set of questions and answers, any name-and-value pairing." },

      { t: "syntax",
        intro: "Three elements. The container, the term, the description.",
        form: "<dl>\n  <dt>Screen</dt>\n  <dd>6.1 inches</dd>\n\n  <dt>Battery</dt>\n  <dd>3200 mAh</dd>\n</dl>",
        parts: [
          { bit: "<dl>", says: "Description list — the container for the whole set of pairs." },
          { bit: "<dt>", says: "Description term: the name, the label, the word being defined." },
          { bit: "<dd>", says: "Description details: what that term is. Indented by default, and the indent is a consequence of the meaning, not the reason to use it." },
        ],
        note: "The pairing is by <b>order</b>, not by wrapping — every <code>dd</code> belongs to the <code>dt</code> above it. That is why the source order matters here in a way it does not in a <code>ul</code>, and why a stray <code>dd</code> before any <code>dt</code> belongs to nothing.",
      },

      { t: "code", file: "glossary.html", code: "<h3>Glossary</h3>\n<dl>\n  <dt>HTML</dt>\n  <dd>The language that labels the parts of a page.</dd>\n\n  <dt>DNS</dt>\n  <dd>The service that turns a domain name into an IP address.</dd>\n</dl>", output: "Two terms, each with its description indented beneath it." },
      { t: "psoft", html: "Every <code>def</code> box in this course is this shape underneath — a term and what it means. Press <b>Try it yourself</b> and add a third pair for a word from an earlier lesson; you have just written a glossary." },

      { t: "h2", n: "1", text: "One term, several descriptions — and the other way round" },
      { t: "p", html: "The pairing is not strictly one to one. A term may be followed by several <code>&lt;dd&gt;</code> elements — one word with three meanings — and several <code>&lt;dt&gt;</code> elements may share a single <code>&lt;dd&gt;</code>, which is how you say \"these two names mean the same thing\"." },

      { t: "code", file: "many.html", code: "<dl>\n  <dt>Cache</dt>\n  <dd>A copy kept nearby so it need not be fetched again.</dd>\n  <dd>The verb: to keep such a copy.</dd>\n\n  <dt>Link</dt>\n  <dt>Hyperlink</dt>\n  <dd>Two names for the same thing.</dd>\n</dl>", output: "Cache with two descriptions under it, then two terms sharing one description." },

      { t: "note", variant: "warn", html: "<b><code>&lt;dl&gt;</code> is not a layout tool.</b> It was misused for years to get two indented columns, and the indent is available from CSS on anything. Use it when the content genuinely is <b>pairs of name and value</b> — and when it is, nothing else says so." },

      { t: "h2", n: "2", text: "Navigation is a list" },
      { t: "p", html: "Every navigation menu you have ever used is a list of links, and the professional way to write one is to say so. The bullets are removed with one line of CSS; what the markup keeps is the count and the grouping — \"list, five items\" — which is how a screen reader user knows how big the menu is before walking it." },

      { t: "code", file: "nav.html", code: "<ul>\n  <li><a href=\"index.html\">Home</a></li>\n  <li><a href=\"about.html\">About</a></li>\n  <li><a href=\"contact.html\">Contact</a></li>\n</ul>", output: "Three bulleted links — which CSS turns into a horizontal menu without changing any of this." },
      { t: "psoft", html: "The anchor goes <b>inside</b> the <code>&lt;li&gt;</code>: the item is the thing in the menu, and the link is what that item does. Wrapping the other way round — a list item inside a link — is invalid and says something nobody means." },

      { t: "note", variant: "key", html: "Module 9 adds <code>&lt;nav&gt;</code> around this to say <i>which</i> list is the navigation. The list stays exactly as it is — the two elements answer different questions, and both are worth having." },

      { t: "h2", n: "3", text: "The three, side by side" },
      { t: "note", variant: "tip", html: "<b><code>ul</code></b> — the order does not matter. Shopping list, feature list, menu.<br><b><code>ol</code></b> — the order is information. Steps, rankings, anything referred to by number.<br><b><code>dl</code></b> — name and value pairs. Glossary, spec sheet, FAQ, metadata.<br><br>If you cannot say which of the three it is, it is probably not a list — it is prose." },

      { t: "debug",
        intro: "A glossary entry for a word with two meanings. The second meaning has come out looking like a heading. Work out what it has been declared to be before opening the fix.",
        code: "<dl>\n  <dt>Cache</dt>\n  <dd>A copy kept nearby so it need not be fetched again.</dd>\n  <dt>The verb: to keep such a copy.</dt>\n</dl>",
        symptom: "The second meaning sits flush against the left margin, in line with the word Cache, instead of indented beneath it.",
        q: "Both meanings belong to the same word. Why has the browser set the second one out as though it were a new entry?",
        fix: "<dl>\n  <dt>Cache</dt>\n  <dd>A copy kept nearby so it need not be fetched again.</dd>\n  <dd>The verb: to keep such a copy.</dd>\n</dl>",
        why: "Because that is what <code>&lt;dt&gt;</code> means: a new <b>term</b>. The sentence was declared to be a word being defined, so it lines up with the other terms and has no description of its own — while <code>Cache</code> now looks as though it has only one meaning. A term may take as many <code>&lt;dd&gt;</code> elements as it has meanings, and each one belongs to the nearest term above it. The indentation is the giveaway and it is a consequence, not the point: <code>dd</code> is indented by default because it is subordinate, so anything unindented in a <code>dl</code> is claiming to be a term." },

      { t: "drills", intro: "Write these out. The first three are about pairing; the last two are the menu you will build in every project you ever start.", items: [
        { task: "A two-line spec sheet: screen 6.1 inches, battery 3200 mAh.", code: "<dl>\n  <dt>Screen</dt>\n  <dd>6.1 inches</dd>\n  <dt>Battery</dt>\n  <dd>3200 mAh</dd>\n</dl>" },
        { task: "One term with two separate descriptions.", code: "<dl>\n  <dt>Cache</dt>\n  <dd>A copy kept nearby so it need not be fetched again.</dd>\n  <dd>The verb: to keep such a copy.</dd>\n</dl>" },
        { task: "Two terms that mean the same thing, sharing one description.", code: "<dl>\n  <dt>Link</dt>\n  <dt>Hyperlink</dt>\n  <dd>Two names for the same thing.</dd>\n</dl>" },
        { task: "A three-item navigation menu, marked up as what it is.", code: "<ul>\n  <li><a href=\"index.html\">Home</a></li>\n  <li><a href=\"about.html\">About</a></li>\n  <li><a href=\"contact.html\">Contact</a></li>\n</ul>" },
        { task: "Repair this: <code>&lt;a href=\"about.html\"&gt;&lt;li&gt;About&lt;/li&gt;&lt;/a&gt;</code>", code: "<li><a href=\"about.html\">About</a></li>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<dl>\n  <dd>6.1 inches</dd>\n  <dt>Screen</dt>\n</dl>", why: "Reversed. Pairing is by order — a dd before any dt describes nothing.", fix: "<dl>\n  <dt>Screen</dt>\n  <dd>6.1 inches</dd>\n</dl>" },
        { bad: "<dl> — used to indent a block of text", why: "A layout hack from before CSS was reliable. It claims name-and-value pairs where there are none.", fix: "A <p> with a CSS margin." },
        { bad: "<a href=\"about.html\"><li>About</li></a>", why: "A list item inside a link, and the li is no longer inside a list. Invalid both ways round.", fix: "<li><a href=\"about.html\">About</a></li>" },
        { bad: "<ul>\n  <li><a href=\"index.html\">Home</a>\n  <li><a href=\"about.html\">About</a>\n</ul>", why: "Missing closing tags. Browsers repair this one silently, so it works — until an editor's formatter or a future nested list turns the guess into the wrong tree.", fix: "Close every <li> explicitly." },
      ] },

      { t: "recap", items: [
        "<code>dl</code> is for <b>name and value</b> pairs — glossary, specs, FAQ",
        "<code>dt</code> is the term, <code>dd</code> is its description; pairing is by <b>order</b>",
        "One <code>dt</code> may take several <code>dd</code>s, and several <code>dt</code>s may share one",
        "Never use <code>dl</code> for indentation — that is CSS's job",
        "A navigation menu is a <code>ul</code> of links, with the anchor <b>inside</b> the <code>li</code>",
        "Three list types: order irrelevant, order meaningful, name–value",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "When would you use a dl instead of a ul?", a: "When each item is a pair — a term and what it means. A glossary, a product's specifications, a set of questions and answers. A ul holds single items; a dl holds a relationship between two things, and that relationship is the reason the element exists." },
        { level: "medium", q: "Why are navigation menus built from unordered lists?", a: "Because a menu is a group of related links and a list is the element that says \"group, this many items\". Assistive tech announces the count so the user knows the size of the menu before walking it, and can skip it as one unit. The bullets are removed in CSS — the structure is what is being kept, not the appearance." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What kind of content is a description list for?",
          options: [
            "Pairs of a name and its value — a glossary, a spec sheet, a set of questions and answers",
            "Any list that needs indenting",
            "Lists longer than ten items",
            "Lists where each item has a heading",
          ],
          correct: 0,
          why: "It is neither a table nor prose. The relationship between the two halves is the content." },
        { level: "easy",
          q: "Which element holds the term, and which the description?",
          options: [
            "dd is the term and dt is the description",
            "dt and dd are interchangeable",
            "dt is the term and dd is the description",
            "dl is the term and dd is the description",
          ],
          correct: 2,
          why: "<b>t</b> for term, <b>d</b> for details — and both live inside the <code>dl</code> that contains the whole set." },
        { level: "easy",
          q: "How is a term paired with its description?",
          options: [
            "By wrapping each pair in a container",
            "By source order — each description belongs to the term above it",
            "By matching id attributes",
            "By an attribute naming the term",
          ],
          correct: 1,
          why: "Which is why order matters here in a way it does not in a plain list, and why a description before any term describes nothing." },
        { level: "easy",
          q: "Where does the anchor go in a navigation menu?",
          options: [
            "Around the whole list",
            "Around each list item",
            "Beside the list item",
            "Inside the list item",
          ],
          correct: 3,
          why: "The item is the thing in the menu; the link is what that item does. The other way round is invalid both ways at once." },
        { level: "medium",
          q: "Can one term carry more than one description?",
          options: [
            "No — the pairing is strictly one to one",
            "Only if they are wrapped in a container",
            "Yes — a term may be followed by as many descriptions as it has meanings",
            "Only in a table",
          ],
          correct: 2,
          why: "And the reverse works too: several terms may share one description, which is how you say two names mean the same thing." },
        { level: "medium",
          q: "In a glossary, one line is flush left where the others are indented. What has most likely happened?",
          options: [
            "It was marked as a term when it should have been a description",
            "It is missing its closing tag",
            "The list is missing its dl container",
            "The browser ran out of indentation levels",
          ],
          correct: 0,
          why: "Descriptions are indented because they are subordinate. Anything unindented inside a dl is claiming to be a term." },
        { level: "medium",
          q: "Why is using a dl purely to indent a block of text wrong?",
          options: [
            "It is invalid HTML",
            "Indentation cannot be achieved any other way",
            "Screen readers ignore dl elements",
            "It claims name-and-value pairs where there are none, and CSS indents anything",
          ],
          correct: 3,
          why: "A layout hack from before CSS was reliable. The claim outlives the reason it was made." },
        { level: "hard",
          q: "A phone's specifications could be a table, paragraphs, or a description list. Why is the description list the best of the three?",
          options: [
            "It renders fastest",
            "A table implies rows and columns that can be compared across, and paragraphs imply nothing — only the dl says each label owns what follows it",
            "Tables are not allowed for specifications",
            "It requires the least markup",
          ],
          correct: 1,
          why: "Pick the element that makes the claim you actually mean. Here the claim is pairing, not tabulation." },
        { level: "hard",
          q: "A navigation list is written with the closing li tags left off. It works. Why is that not good enough?",
          options: [
            "It is slower to parse",
            "Screen readers refuse to announce it",
            "The browser is guessing where each item ends, and the guess stops matching your intent as soon as anything is nested inside one",
            "The bullets render in the wrong place",
          ],
          correct: 2,
          why: "Browsers repair it silently today. The repair is not your design, and it is only a repair until the markup gets more complicated." },
        { level: "hard",
          q: "Module 9 will add a nav element around the menu. What happens to the list?",
          options: [
            "The list is replaced by the nav",
            "The list items become nav items",
            "The list loses its bullets automatically",
            "It stays exactly as it is — the two elements answer different questions",
          ],
          correct: 3,
          why: "The list says \"a group, this many items\". The nav says \"this group is the navigation\". Both are worth having." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 7 — TABLES
   *
   * The elements with the worst history in the language: for about a decade
   * tables were how every page was laid out, and the damage is still quoted as
   * a rule ("never use tables") by people who then have real tabular data and
   * do not know what to reach for. Both halves are taught here — the right use
   * in lesson 19, the wrong one in lesson 20 — because only knowing the ban
   * produces developers who build data grids out of divs.
   *
   * ⚠️ THE IMPLICIT-TBODY DIVERGENCE, for anyone writing table problems.
   * The browser's DOMParser INSERTS a <tbody> around loose <tr>s; linkedom does
   * NOT. Grading runs in both — the workbench uses DOMParser, db:check and
   * lib/verify.ts use linkedom — so a test written as `tbody tr` against markup
   * with no explicit <tbody> PASSES in the browser and FAILS on submit. Both
   * engines were checked before these lessons were written. The rule that comes
   * out of it: assert with descendant selectors (`table tr`, `table th`), and
   * only mention `tbody` when the exercise itself requires the student to type
   * one.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-tables",
    order: 19,
    title: "Tables: Data That Has Rows and Columns",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Build a table from rows and cells, and know which is which",
        "Mark header cells so a screen reader can say which column a value is in",
        "Use <code>thead</code>, <code>tbody</code> and <code>caption</code> for what they are for",
        "Say what <code>scope</code> does, and why a table without it is a wall of numbers",
      ] },

      { t: "hook",
        q: "A sighted reader looks at the number 82 in a table and instantly knows it is Ravi's score in Physics — the eye follows the row left and the column up. A screen reader user hears \"82\". How do they find out whose, and in what?",
        why: "From the header cells — <b>if</b> you marked them as header cells. Mark them as ordinary cells and the announcement is just \"82\", and the two pieces of information the eye got for free are gone. That is the entire subject of this lesson." },

      { t: "def",
        term: "Table",
        en: "A grid of data where each value belongs to both a row and a column, and the meaning comes from that pairing." },

      { t: "analogy",
        concept: "th vs td",
        real: "the labels on a bus timetable",
        html: "The times mean nothing without the column that says which stop and the row that says which service. Take away the labels and you have a page of numbers that is technically complete and useless. <code>&lt;th&gt;</code> is the label; <code>&lt;td&gt;</code> is the number — and a screen reader reads the labels back with every value, which is the whole reason to tell them apart." },

      { t: "syntax",
        intro: "A table is built in rows. Cells live inside rows; nothing lives directly inside the table but rows and the sections that hold them.",
        form: "<table>\n  <caption>Term results</caption>\n  <thead>\n    <tr>\n      <th scope=\"col\">Name</th>\n      <th scope=\"col\">Physics</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope=\"row\">Ravi</th>\n      <td>82</td>\n    </tr>\n  </tbody>\n</table>",
        parts: [
          { bit: "<table>", says: "The grid itself. Only rows and the section elements go directly inside it." },
          { bit: "<caption>", says: "The table's title, and it must be the <b>first</b> child. Visible, and announced before the contents — a screen reader user decides from it whether to walk the table at all." },
          { bit: "<thead>", says: "The header row or rows. Not decoration: a long table printed across several pages repeats these, and some readers keep them pinned." },
          { bit: "<tbody>", says: "The body rows. Write it even though the browser will insert one for you — a tool that reads your source rather than the rendered page will not." },
          { bit: "<tr>", says: "One row. Every cell belongs to exactly one." },
          { bit: "<th", says: "A header cell — a label. Bold and centred by default, and that appearance is the least useful thing about it." },
          { bit: "scope", says: "Which direction this header labels: <code>col</code> for the column below, <code>row</code> for the row beside. It is what lets \"82\" be announced as \"Ravi, Physics, 82\"." },
          { bit: "<td>", says: "An ordinary data cell — a value under some header." },
        ],
        note: "Rows are horizontal and columns are what you get by stacking them. There is no column element: the third cell of every row <i>is</i> the third column. That is why a missing cell shifts everything after it one place left.",
      },

      { t: "code", file: "results.html", code: "<table>\n  <caption>Term results</caption>\n  <thead>\n    <tr>\n      <th scope=\"col\">Name</th>\n      <th scope=\"col\">Physics</th>\n      <th scope=\"col\">Maths</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope=\"row\">Ravi</th>\n      <td>82</td>\n      <td>91</td>\n    </tr>\n    <tr>\n      <th scope=\"row\">Meera</th>\n      <td>88</td>\n      <td>79</td>\n    </tr>\n  </tbody>\n</table>", output: "A titled grid: three columns, a header row, and two rows of results." },
      { t: "psoft", html: "The names are <code>&lt;th scope=\"row\"&gt;</code>, not <code>&lt;td&gt;</code> — a name is a label for its row, exactly as \"Physics\" is a label for its column. Press <b>Try it yourself</b>, change one <code>th</code> to a <code>td</code>, and notice the page barely changes while the meaning does." },

      { t: "h2", n: "1", text: "Why scope earns its keep" },
      { t: "p", html: "Without <code>scope</code>, a screen reader has to guess which headers apply to a cell — and it guesses from position, which works on a simple grid and falls apart on anything real. With it, every value is announced with its labels: \"Ravi, Physics, 82\"." },
      { t: "p", html: "It costs one attribute per header cell and it is the difference between a table a blind user can read and one they cannot. On a simple table the guess is usually right; the habit is what makes the complicated one work." },

      { t: "note", variant: "key", html: "<b>A table's structure is announced, like a list's count.</b> \"Table, three columns, three rows\" comes before anything else — so a screen reader user knows the size and shape before deciding to walk it. A grid faked out of <code>&lt;div&gt;</code> elements announces nothing at all, however identical it looks." },

      { t: "h2", n: "2", text: "The parts people leave out" },
      { t: "p", html: "A table works without <code>caption</code>, <code>thead</code> or <code>scope</code>. It renders, it lines up, and the missing pieces are invisible on screen — which is exactly why they get left out and why leaving them out is the default state of most tables on the web." },

      { t: "note", variant: "tip", html: "<b><code>caption</code></b> — what this table is. First child, always.<br><b><code>thead</code>/<code>tbody</code></b> — which rows are labels and which are data.<br><b><code>tfoot</code></b> — a totals row. It may be written before <code>tbody</code> in the source and still renders last, which is useful when a long table is generated a row at a time.<br><b><code>scope</code></b> — which way a header points." },

      { t: "debug",
        intro: "This table lines up perfectly and is unreadable to a screen reader. Find what is missing before opening the fix.",
        code: "<table>\n  <tr>\n    <td>Name</td>\n    <td>Score</td>\n  </tr>\n  <tr>\n    <td>Ravi</td>\n    <td>82</td>\n  </tr>\n</table>",
        symptom: "Renders as a neat two-by-two grid. A screen reader announces the cells as \"Name, Score, Ravi, 82\" — four values with nothing saying which are labels.",
        q: "Every tag is closed and the grid is correct. What did the markup never say?",
        fix: "<table>\n  <thead>\n    <tr>\n      <th scope=\"col\">Name</th>\n      <th scope=\"col\">Score</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope=\"row\">Ravi</th>\n      <td>82</td>\n    </tr>\n  </tbody>\n</table>",
        why: "That there are any headers. Every cell is a <code>&lt;td&gt;</code>, so nothing in the table is a label — the first row only looks like one because it is at the top. The fix marks the column labels as <code>&lt;th scope=\"col\"&gt;</code> and the name as <code>&lt;th scope=\"row\"&gt;</code>, and now 82 is announced with both of its headers. On screen the difference is that headers are bold, which is the least important thing that changed." },

      { t: "drills", intro: "Type these out — table markup is verbose and the shape only sticks through the fingers.", items: [
        { task: "A table row with two data cells.", code: "<tr>\n  <td>Ravi</td>\n  <td>82</td>\n</tr>" },
        { task: "A header row for Name and Score.", code: "<tr>\n  <th scope=\"col\">Name</th>\n  <th scope=\"col\">Score</th>\n</tr>" },
        { task: "A caption saying what the table is.", code: "<caption>Term results</caption>" },
        { task: "A row whose first cell is the row's label.", code: "<tr>\n  <th scope=\"row\">Ravi</th>\n  <td>82</td>\n</tr>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<table>\n  <td>Ravi</td>\n</table>", why: "A cell with no row. Cells live inside <tr> and nothing else does.", fix: "<table>\n  <tr><td>Ravi</td></tr>\n</table>" },
        { bad: "<td>Name</td> — for a column label", why: "It looks like a header because it is on top. Nothing reading the page can tell, so the value below it is announced with no label at all.", fix: "<th scope=\"col\">Name</th>" },
        { bad: "<table>\n  <tr>...</tr>\n  <caption>Results</caption>\n</table>", why: "The caption must be the table's first child. Placed later it is invalid, and the announcement that would have introduced the table comes after it.", fix: "<table>\n  <caption>Results</caption>\n  <tr>...</tr>\n</table>" },
        { bad: "A row with three cells where every other row has four", why: "There is no column element — the third cell IS the third column. One missing cell shifts every value after it one column left, silently.", fix: "Give the empty position an empty cell: <td></td>" },
      ] },

      { t: "recap", items: [
        "A table is built from rows; cells live inside <code>&lt;tr&gt;</code> and nowhere else",
        "<code>&lt;th&gt;</code> is a label, <code>&lt;td&gt;</code> is a value — the bold is not the point",
        "<code>scope=\"col\"</code> / <code>scope=\"row\"</code> says which way a header points",
        "<code>&lt;caption&gt;</code> is the table's title and must come first",
        "<code>thead</code>/<code>tbody</code> separate labels from data; write <code>tbody</code> even though it is implied",
        "No column element exists — a missing cell shifts the whole row",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between th and td?", a: "th is a header cell — a label for a row or a column — and td is a data cell. Browsers render th bold and centred, but the reason to use it is that assistive technology reads the relevant headers back with each value, so a number is announced with what it means rather than on its own." },
        { level: "medium", q: "What does the scope attribute do?", a: "It states which cells a header labels: scope=\"col\" for the column beneath it, scope=\"row\" for the row beside it. Without it a screen reader infers the association from position, which is usually right on a simple grid and unreliable on anything with multiple header levels. It is one attribute per header cell and it is what makes a data table readable non-visually." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What may a table cell sit directly inside?",
          options: [
            "The table element",
            "A table row",
            "Either the table or a row",
            "A column element",
          ],
          correct: 1,
          why: "A table is built out of rows, and cells live inside rows and nowhere else." },
        { level: "easy",
          q: "What is the difference between th and td?",
          options: [
            "th is bold and td is not",
            "th is used in the first row and td everywhere else",
            "th is wider than td",
            "th is a label for a row or column; td is a value",
          ],
          correct: 3,
          why: "The bold is the browser's default and the least important thing about the choice. The label is what gets read back with each value." },
        { level: "easy",
          q: "What does <code>scope=\"col\"</code> say?",
          options: [
            "This header labels the column beneath it",
            "This header spans the whole column",
            "This column may not be sorted",
            "This header belongs to the row beside it",
          ],
          correct: 0,
          why: "One attribute per header cell, saying which way the label points — down a column or along a row." },
        { level: "easy",
          q: "Where must a caption appear?",
          options: [
            "Anywhere inside the table",
            "Immediately before the table",
            "As the table's first child",
            "After the last row",
          ],
          correct: 2,
          why: "Placed later it is invalid, and the sentence that would have introduced the table arrives after the table." },
        { level: "medium",
          q: "A table's first row uses td for the column labels. What does a screen reader announce for the cell below?",
          options: [
            "The value with its column label",
            "The value with the caption",
            "The value on its own, because nothing in the table is marked as a label",
            "An error about missing headers",
          ],
          correct: 2,
          why: "The first row looks like headers because it is on top. Nothing reading the markup can tell — so 82 arrives with no idea that it is a score." },
        { level: "medium",
          q: "A row is written with three cells where every other row has four. What happens?",
          options: [
            "Every value after the gap shifts one column left, silently",
            "The browser adds an empty cell at the end",
            "The row is dropped",
            "The table reports a structural error",
          ],
          correct: 0,
          why: "There is no column element — the third cell IS the third column. Give the empty position an empty cell and the alignment is safe." },
        { level: "medium",
          q: "Which of these is genuinely tabular data?",
          options: [
            "A sidebar sitting next to an article",
            "A page header with a logo and a menu",
            "A photo gallery in a grid",
            "A price comparison of four plans across six features",
          ],
          correct: 3,
          why: "Rows and columns that mean something, and values you compare across both. The other three are layout, and layout is CSS." },
        { level: "hard",
          q: "Why mark a student's name as <code>&lt;th scope=\"row\"&gt;</code> rather than a td?",
          options: [
            "So it renders bold like the column headers",
            "Because it labels its row, so each value in that row is announced with the name as well as the column",
            "Because the first cell of a row must always be a th",
            "So the row can be sorted",
          ],
          correct: 1,
          why: "A score then arrives as \"Ravi, Physics, 82\" rather than as a bare number. Both headers, one value." },
        { level: "hard",
          q: "The lessons say to write tbody even though the browser supplies one. What is the risk in relying on the browser?",
          options: [
            "The table will not render without it",
            "Older browsers do not support tbody",
            "Something else reading your markup may not invent the same element the browser does",
            "The rows will appear in the wrong order",
          ],
          correct: 2,
          why: "This course hit exactly that: the browser's parser inserts a tbody around loose rows and the parser that grades your practice does not, so a selector written against the invented element passes in one and fails in the other." },
        { level: "hard",
          q: "On screen, adding th, scope and a caption changes almost nothing. What is the argument for doing it?",
          options: [
            "It makes the table narrower",
            "It is required for the table to validate",
            "Browsers render such tables faster",
            "The table only becomes readable to anyone who is not looking at the grid",
          ],
          correct: 3,
          why: "A grid does its explaining through alignment, and alignment is exactly what does not survive being read aloud." },
      ] },
    ],
  },

  {
    slug: "html-table-layout",
    order: 20,
    title: "Spanning Cells, and the Decade Tables Were Misused",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Merge cells across columns and down rows, and count the remaining cells correctly",
        "Explain why tables were used for layout, and why that ended",
        "Recognise a layout table in real markup and know what to replace it with",
        "Stop a wide table breaking a phone screen",
      ] },

      { t: "hook",
        q: "\"Never use tables\" is advice you will hear from working developers. It is also why teams build sortable data grids out of nested <code>&lt;div&gt;</code>s that no screen reader can read. What was the advice actually about?",
        why: "Layout — not data. For about a decade a table was the only reliable way to place two things side by side, so entire pages were built inside one. CSS ended that, the warning stayed, and the warning lost the half that mattered: <b>tables are still exactly right for tabular data</b>." },

      { t: "def",
        term: "Layout table",
        en: "A table used to position unrelated content on a page rather than to present data that has rows and columns." },

      { t: "syntax",
        intro: "Two attributes that merge cells. Both are counts of cells, not distances.",
        form: "<tr>\n  <th scope=\"row\" rowspan=\"2\">Ravi</th>\n  <td>Physics</td>\n  <td>82</td>\n</tr>\n<tr>\n  <td>Maths</td>\n  <td>91</td>\n</tr>\n<tr>\n  <td colspan=\"3\">Averages published Friday</td>\n</tr>",
        parts: [
          { bit: "rowspan=\"2\"", says: "This cell occupies its own row and the one below. The next row then has <b>one fewer</b> cell written, because that position is already filled." },
          { bit: "colspan=\"3\"", says: "This cell occupies three columns. That row therefore contains one cell where the others contain three." },
        ],
        note: "The commonest table bug is arithmetic. Every row must add up to the same number of columns, counting a spanned cell as the number it spans — miss by one and the grid tears, usually several rows further down than where the mistake is.",
      },

      { t: "code", file: "span.html", code: "<table>\n  <caption>Results by subject</caption>\n  <tbody>\n    <tr>\n      <th scope=\"row\" rowspan=\"2\">Ravi</th>\n      <td>Physics</td>\n      <td>82</td>\n    </tr>\n    <tr>\n      <td>Maths</td>\n      <td>91</td>\n    </tr>\n    <tr>\n      <td colspan=\"3\">Averages published Friday</td>\n    </tr>\n  </tbody>\n</table>", output: "Ravi's name spanning two rows beside his two subjects, and a full-width note underneath." },
      { t: "psoft", html: "Count the cells: row one has three written, row two has <b>two</b> — Ravi's name is still occupying the first position — and row three has one that covers all three. Every row is three columns wide. Press <b>Try it yourself</b> and change <code>rowspan</code> to 3: the grid tears, and it tears in a row you did not touch." },

      { t: "h2", n: "1", text: "Why layout tables happened, and why they stopped" },
      { t: "p", html: "In 1996 CSS barely existed and browsers disagreed about the little of it they had. A table was the one construct that reliably put two things side by side, so designers nested them — a table for the page, a table inside the header, a table inside that for the menu. It worked, and it was the only thing that did." },
      { t: "p", html: "What it cost became clear later. Content order in the source stops matching the reading order, so a screen reader walks the page in whatever sequence the layout happened to produce. It cannot reflow on a narrow screen — a table is a grid by definition. And nothing about the markup describes the content: everything is a cell, so nothing is a heading, an article, or a menu." },

      { t: "note", variant: "warn", html: "<b>The rule is about intent, not the element.</b> Data with rows and columns → a table, with headers and a caption, and anyone who tells you otherwise has learned half of this history. Positioning things on a page → CSS, always. The question to ask is: <i>would this still make sense as a grid if I read it aloud?</i>" },

      { t: "h2", n: "2", text: "What a layout table becomes" },
      { t: "p", html: "The replacement is almost never another single element. A page laid out as a table is really a heading, some paragraphs, an image and a menu — each of which has an element that says what it is. Module 9's semantic elements finish the job; the elements you already have get most of the way." },

      { t: "code", file: "was-a-table.html", code: "<!-- what a 2003 page looked like -->\n<table>\n  <tr>\n    <td><h2>About us</h2></td>\n    <td><img src=\"/img-lab/logo.svg\" alt=\"Home\"></td>\n  </tr>\n</table>\n\n<!-- what it is -->\n<h2>About us</h2>\n<img src=\"/img-lab/logo.svg\" alt=\"Home\">", output: "Both draw roughly the same thing; only the second says what any of it is." },

      { t: "h2", n: "3", text: "Wide tables on narrow screens" },
      { t: "p", html: "A table with six columns cannot shrink to a 375px phone — its content decides its width, and a grid does not wrap. Left alone, it pushes the whole page sideways and every other element on it goes off-screen with it." },
      { t: "note", variant: "tip", html: "The fix is one line of CSS on a wrapper: <code>overflow-x: auto</code> around the table. The table then scrolls <b>inside its own box</b> and the rest of the page stays put. It is the standard treatment and worth knowing now, because the alternative is a page that is broken on the device most of your visitors are using." },

      { t: "debug",
        intro: "A three-column results table has grown a fourth column, and the row that looks wrong is not the row that is wrong. Count the cells before opening the fix.",
        code: "<table>\n  <tr>\n    <th scope=\"col\">Student</th>\n    <th scope=\"col\">Subject</th>\n    <th scope=\"col\">Score</th>\n  </tr>\n  <tr>\n    <th scope=\"row\" rowspan=\"2\">Ravi</th>\n    <td>Physics</td>\n    <td>82</td>\n  </tr>\n  <tr>\n    <td>Maths</td>\n    <td>91</td>\n    <td>A</td>\n  </tr>\n</table>",
        symptom: "The table is four columns wide. The last row fills all four; every other row leaves the fourth one empty, and the headings no longer sit above the values they name.",
        q: "The last row has three cells, exactly like the header row. So how did the table end up four columns wide?",
        fix: "<table>\n  <tr>\n    <th scope=\"col\">Student</th>\n    <th scope=\"col\">Subject</th>\n    <th scope=\"col\">Score</th>\n  </tr>\n  <tr>\n    <th scope=\"row\" rowspan=\"2\">Ravi</th>\n    <td>Physics</td>\n    <td>82</td>\n  </tr>\n  <tr>\n    <td>Maths</td>\n    <td>91</td>\n  </tr>\n</table>",
        why: "Because a spanned cell still occupies its position in the rows below. <code>Ravi</code> has <code>rowspan=\"2\"</code>, so it fills the first column of the last row before that row writes anything — and the three cells written there land in columns two, three and <b>four</b>. The row you have to change is not the one carrying the extra cell, it is the one carrying the span, and the tear shows up wherever the arithmetic first overflows. Count every row as: cells written, plus positions already filled from above. Every row must reach the same total, and here the last one reached four." },

      { t: "drills", intro: "Type these out, and count the columns of each row as you go — that arithmetic is the whole skill.", items: [
        { task: "A row whose single cell stretches across three columns.", code: "<tr>\n  <td colspan=\"3\">Averages published Friday</td>\n</tr>" },
        { task: "A row label that covers this row and the next.", code: "<tr>\n  <th scope=\"row\" rowspan=\"2\">Ravi</th>\n  <td>Physics</td>\n  <td>82</td>\n</tr>" },
        { task: "The row that follows it — remembering that its first column is already taken.", code: "<tr>\n  <td>Maths</td>\n  <td>91</td>\n</tr>" },
        { task: "This 2003 layout table, rewritten as the two things it actually contains: <code>&lt;table&gt;&lt;tr&gt;&lt;td&gt;&lt;h2&gt;About us&lt;/h2&gt;&lt;/td&gt;&lt;td&gt;&lt;img src=\"/img-lab/logo.svg\" alt=\"Home\"&gt;&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;", code: "<h2>About us</h2>\n<img src=\"/img-lab/logo.svg\" alt=\"Home\">" },
      ] },

      { t: "mistakes", items: [
        { bad: "<tr><td colspan=\"2\">A</td><td>B</td><td>C</td></tr> — in a three-column table", why: "That row is four columns wide: two plus one plus one. The grid tears, usually visibly in a different row.", fix: "<tr><td colspan=\"2\">A</td><td>B</td></tr>" },
        { bad: "A <table> used to put a sidebar next to an article", why: "Layout, not data. The reading order stops matching the source, it cannot reflow on a phone, and nothing in the markup says what any of it is.", fix: "Real elements for the content, and CSS for the placement." },
        { bad: "\"Never use tables\" — applied to a price comparison grid", why: "Half the advice. That IS tabular data, and rebuilding it from divs removes the row and column relationships that make it readable non-visually.", fix: "A proper <table> with <th>, scope and a caption." },
        { bad: "A six-column table dropped straight into a phone layout", why: "The table cannot shrink, so the whole page scrolls sideways and everything else goes with it.", fix: "Wrap it in an element with overflow-x: auto so only the table scrolls." },
      ] },

      { t: "recap", items: [
        "<code>colspan</code> and <code>rowspan</code> count <b>cells</b>, not pixels",
        "A spanned cell fills positions in later rows — write one fewer cell there",
        "Every row must total the same column count, spans included",
        "Tables were the only layout tool once; CSS replaced that, and the warning outlived the reason",
        "Tabular data still belongs in a table — headers, <code>scope</code> and a caption",
        "Wrap a wide table in <code>overflow-x: auto</code> so the page does not scroll sideways",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between colspan and rowspan?", a: "colspan merges a cell across columns, to the right; rowspan merges it down across rows. Both take a count of cells. The consequence people forget is on the other rows: a cell spanning two rows already occupies a position in the row below, so that row is written with one fewer cell." },
        { level: "medium", q: "Is it true that you should never use tables?", a: "Only for layout. Tables were the only reliable way to position content before CSS, and pages built that way lose the match between source order and reading order, cannot reflow on a phone, and describe nothing about their content. But tabular data — anything with real rows and columns — belongs in a table, with th, scope and a caption. Rebuilding a data grid out of divs to obey a half-remembered rule removes exactly the relationships that make the data readable to anyone not looking at it." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What do colspan and rowspan count?",
          options: [
            "Pixels",
            "Percentages of the table's width",
            "Cells",
            "Rows of text inside the cell",
          ],
          correct: 2,
          why: "They are counts of grid positions, which is why the arithmetic in the rest of the table has to change with them." },
        { level: "easy",
          q: "A cell carries <code>rowspan=\"2\"</code>. What does the row beneath it need?",
          options: [
            "One fewer cell written, because that position is already filled",
            "One extra cell, to balance the span",
            "The same number of cells as every other row",
            "A matching rowspan of its own",
          ],
          correct: 0,
          why: "The span reaches down into that row and occupies a position there before the row writes anything." },
        { level: "easy",
          q: "\"Never use tables\" was advice about what?",
          options: [
            "All tables, and it still stands",
            "Using tables for layout, not for data",
            "Tables without captions",
            "Tables on mobile devices",
          ],
          correct: 1,
          why: "The warning outlived the reason for it, and lost the half that mattered: tabular data still belongs in a table." },
        { level: "easy",
          q: "How do you stop a wide table dragging the whole page sideways on a phone?",
          options: [
            "Reduce the number of columns",
            "Set the table's width to 100%",
            "Rebuild it as a list",
            "Wrap it in an element with overflow-x: auto, so only the table scrolls",
          ],
          correct: 3,
          why: "A grid cannot reflow — its content decides its width. Giving it its own scrolling box keeps the rest of the page still." },
        { level: "medium",
          q: "A three-column table has a row reading <code>colspan=\"2\"</code>, then a cell, then another cell. How wide is that row?",
          options: [
            "Three columns",
            "Four columns",
            "Two columns",
            "It depends on the other rows",
          ],
          correct: 1,
          why: "Two plus one plus one. The grid tears — and usually the tear shows up in a row you did not touch." },
        { level: "medium",
          q: "Why did designers lay pages out with tables in the first place?",
          options: [
            "Tables loaded faster than the alternatives",
            "Screen readers preferred them",
            "It was the one construct that reliably put two things side by side before CSS was usable",
            "The specification recommended it",
          ],
          correct: 2,
          why: "It worked, and nothing else did. Knowing that is what stops the rule being applied to the case it was never about." },
        { level: "medium",
          q: "Which is <b>not</b> a cost of using a table for layout?",
          options: [
            "Source order stops matching reading order",
            "It cannot reflow on a narrow screen",
            "Nothing in the markup says what any of the content is",
            "The page takes longer to download",
          ],
          correct: 3,
          why: "The three real costs are all about meaning and adaptability. Weight was never the argument." },
        { level: "hard",
          q: "A team rebuilds a sortable price grid out of nested div elements to obey \"never use tables\". What have they lost?",
          options: [
            "The row and column relationships that make the data readable to anyone not looking at the grid",
            "Nothing — divs and tables are equivalent",
            "Only the default borders",
            "The ability to sort the data",
          ],
          correct: 0,
          why: "They have obeyed half a rule and paid the price the whole rule was invented to avoid." },
        { level: "hard",
          q: "What question best decides whether something belongs in a table?",
          options: [
            "Does it have more than three columns?",
            "Would it still make sense as a grid if you read it aloud?",
            "Does it need borders?",
            "Is it wider than the page?",
          ],
          correct: 1,
          why: "The test is about the content's shape, not the design's. A sidebar read aloud is not a grid; a results table is." },
        { level: "hard",
          q: "In the debug task, the row that had to change was not the row that overflowed. Why?",
          options: [
            "Because the browser reports errors one row late",
            "Because the header row set the column count too low",
            "Because the extra cell was invisible",
            "Because a cell with rowspan fills a position in the row below, so the fault is in the row carrying the span",
          ],
          correct: 3,
          why: "The tear appears wherever the arithmetic first overflows, which is rarely where the mistake was typed." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 8 — FORMS
   *
   * THREE lessons rather than the usual two, because this is the largest topic
   * in the language and the one with the most ways to be silently wrong. A
   * form that looks perfect and sends nothing is the beginner experience, and
   * it has exactly one cause — a missing `name` — which is why that gets a
   * whole section rather than a bullet.
   *
   * ⚠️ THE PREVIEW CANNOT SUBMIT, AND THE LESSONS SAY SO. The workbench frame
   * is `sandbox=""`, which permits typing but blocks form submission entirely —
   * not even a submit event fires (measured, not assumed). That is honest and
   * left alone: there is no server on the other end either. The lessons show
   * what WOULD be sent instead of pretending, which is the more useful thing
   * to look at anyway.
   *
   * Parser parity for every selector used here was checked in linkedom and the
   * browser's DOMParser before the problems were written — 12 of 12 identical,
   * including `[required]`, `[checked]`, `label > input` and `select > option`.
   * Also confirmed: `type`, `method` and `scope` match case-INSENSITIVELY in
   * both engines (the HTML spec's list), while `src` and `name` are
   * case-sensitive in both.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-forms",
    order: 21,
    title: "Forms: Where the Web Stops Being Read-Only",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Build a form that actually sends what the visitor typed",
        "Say what <code>name</code> does, and why a field without one does not exist",
        "Attach a label to a field in both of the two correct ways",
        "Choose <code>GET</code> or <code>POST</code> for a reason you can defend",
      ] },

      { t: "hook",
        q: "A beginner's form looks perfect. Every field is styled, the button works, the page reloads. The data arrives at the server with one field mysteriously empty — the same one every time. Nothing is misspelt and no tag is unclosed. What is wrong?",
        why: "That field has no <code>name</code>. A form does not send fields; it sends <b>name and value pairs</b>, so a field with no name has no way to be referred to and is simply not included. It is the single commonest form bug, it produces no error anywhere, and it is invisible on screen." },

      { t: "def",
        term: "Form",
        en: "A section of a page that collects input from the visitor and sends it somewhere when submitted." },

      { t: "analogy",
        concept: "the name attribute",
        real: "posting a form with no field labels",
        html: "Imagine filling in a paper form, then cutting off the printed labels before posting it. The clerk receives \"Ravi\", \"1998\", \"Mumbai\" and no idea which is which. HTML solves this by refusing to send an unlabelled answer at all — <code>name</code> is that printed label, and the value never travels without it." },

      { t: "syntax",
        intro: "The smallest complete form: where it goes, how it travels, one field, and a button.",
        form: "<form action=\"/subscribe\" method=\"post\">\n  <label for=\"email\">Email address</label>\n  <input type=\"email\" id=\"email\" name=\"email\">\n  <button type=\"submit\">Subscribe</button>\n</form>",
        parts: [
          { bit: "<form", says: "The container. Everything that gets sent lives inside it, and everything outside it is ignored on submit however close it looks." },
          { bit: "action", says: "The URL the data is sent to. Same path rules as a link — relative or absolute. Left out, it posts back to the current page." },
          { bit: "method", says: "How it travels: <code>get</code> puts the data in the URL, <code>post</code> puts it in the request body. Section 3 is entirely about choosing." },
          { bit: "<label", says: "The field's visible name. Clicking it focuses the field — which is the small proof that the two are genuinely connected." },
          { bit: "for", says: "The <code>id</code> of the field this label belongs to. This attribute and that id must match exactly, and it is the association everything non-visual relies on." },
          { bit: "<input", says: "The field itself. Empty element — no closing tag — and <code>type</code> decides what kind of field it is, which is the next lesson." },
          { bit: "id", says: "So the label can point at it. Unique on the page, as always." },
          { bit: "name", says: "<b>What the value is called when it is sent.</b> No name, no data — this is the attribute the hook was about." },
          { bit: "<button", says: "Submits the form. <code>type=\"submit\"</code> is the default inside a form and worth writing anyway, because a button meaning \"reset\" or \"nothing\" looks identical." },
        ],
        note: "<code>id</code> and <code>name</code> look redundant and are not. <code>id</code> is for <b>this page</b> — the label, CSS, scripts. <code>name</code> is for <b>the server</b> — it is the key the value arrives under. Give them the same text by convention, and understand that they are answering different questions.",
      },

      { t: "code", file: "signup.html", code: "<form action=\"/signup\" method=\"post\">\n  <label for=\"user\">Username</label>\n  <input type=\"text\" id=\"user\" name=\"username\">\n\n  <label for=\"mail\">Email</label>\n  <input type=\"email\" id=\"mail\" name=\"email\">\n\n  <button type=\"submit\">Create account</button>\n</form>", output: "Two labelled fields and a button. Clicking a label puts the cursor in its field." },
      { t: "psoft", html: "Press <b>Try it yourself</b> and click the word <b>Username</b> in the preview — the cursor jumps into the field beside it. That is <code>for</code> and <code>id</code> agreeing. Change one of them by a single character and the click stops working, which is the fastest way to test a label you have ever been given." },

      { t: "note", variant: "warn", html: "<b>The preview cannot submit.</b> The frame your page renders in is sandboxed, so typing works and pressing the button does nothing at all. That is not a bug in your markup — there is no server on the other end either. What the form <i>would</i> send is shown below instead, which is the part worth looking at." },

      { t: "h2", n: "1", text: "What a form actually sends" },
      { t: "p", html: "It sends a list of <code>name=value</code> pairs — one for every field that has a name and is inside the form. Not the labels, not the ids, not the placeholder text. Just the names and what the visitor typed." },

      { t: "code", file: "what-is-sent.html", code: "<!-- the visitor types Ravi and ravi@example.com, then submits -->\n\n<!-- with method=\"get\" the browser builds a URL: -->\n<!-- /signup?username=Ravi&email=ravi%40example.com -->\n\n<!-- with method=\"post\" the same pairs go in the request body, -->\n<!-- and the address bar still reads /signup -->", output: "The same two pairs, carried two different ways." },
      { t: "psoft", html: "That query string is the one from Module 0 — <code>?</code> starts it, <code>&amp;</code> joins the pairs, and the <code>@</code> became <code>%40</code> because some characters cannot appear raw in a URL. You have been reading these in your address bar for years; this is where they come from." },

      { t: "h2", n: "2", text: "Labels, and the two correct ways" },
      { t: "p", html: "A label can be attached explicitly, with <code>for</code> pointing at the field's <code>id</code>, or implicitly, by wrapping the field. Both are correct HTML and both make clicking the text focus the field." },

      { t: "code", file: "labels.html", code: "<!-- explicit: for matches id -->\n<label for=\"city\">City</label>\n<input type=\"text\" id=\"city\" name=\"city\">\n\n<!-- implicit: the input lives inside the label -->\n<label>\n  City\n  <input type=\"text\" name=\"city\">\n</label>", output: "Two labelled fields that behave identically." },
      { t: "psoft", html: "The explicit form is the one to reach for by default: it survives the two being styled into different parts of the layout, which the wrapping form does not. The implicit form is handy for a checkbox, where the text sits right beside the box anyway." },

      { t: "note", variant: "key", html: "<b>A field with no label is a field a screen reader announces as \"edit, blank\".</b> The visitor hears that there is something to type in and nothing about what. Every input needs a label — and the placeholder is not one, which lesson 23 makes a whole section out of because it is the most common substitute." },

      { t: "h2", n: "3", text: "GET or POST" },
      { t: "p", html: "<b>GET</b> puts the data in the URL. That makes the result bookmarkable, shareable and re-runnable — which is exactly right for a search, and exactly wrong for a password. Module 0 already listed where a URL ends up: browser history, server logs, and the referrer header sent to the next site." },
      { t: "p", html: "<b>POST</b> puts the data in the request body. Nothing appears in the address bar, nothing is bookmarked, and the browser warns before re-sending it. Use it for anything private and anything that <b>changes</b> something — creating an account, placing an order, deleting a post." },

      { t: "note", variant: "tip", html: "<b>The test:</b> would you be happy for this to be a link somebody could share? A search for \"blue shirts\" — yes, GET. A login, a payment, a deletion — no, POST.<br><br>And note POST is not encryption: it keeps data out of the URL, nothing more. What protects it in transit is HTTPS, which is a separate decision you already made in Module 0." },

      { t: "debug",
        intro: "This form looks and behaves correctly, and one field never arrives. Find it before opening the fix.",
        code: "<form action=\"/signup\" method=\"post\">\n  <label for=\"user\">Username</label>\n  <input type=\"text\" id=\"user\">\n\n  <label for=\"mail\">Email</label>\n  <input type=\"email\" id=\"mail\" name=\"email\">\n\n  <button type=\"submit\">Create account</button>\n</form>",
        symptom: "The server receives email=ravi@example.com and nothing else. The username field was filled in, is spelt correctly, and has a working label.",
        q: "Both fields have an id and both have a label that focuses them. So why does only one of them travel?",
        fix: "<form action=\"/signup\" method=\"post\">\n  <label for=\"user\">Username</label>\n  <input type=\"text\" id=\"user\" name=\"username\">\n\n  <label for=\"mail\">Email</label>\n  <input type=\"email\" id=\"mail\" name=\"email\">\n\n  <button type=\"submit\">Create account</button>\n</form>",
        why: "The username field has no <code>name</code>. A form sends name-and-value pairs, so a field with nothing to be called is left out of the submission entirely — it is not sent empty, it is not sent at all. Everything visible about it works, which is what makes this so hard to spot: the label focuses it, the styling applies, the value is in the box. <code>id</code> serves the label; only <code>name</code> serves the server, and the two attributes get confused precisely because they usually hold the same word." },

      { t: "drills", intro: "Type these — form markup has more moving parts than anything so far.", items: [
        { task: "A form that posts to /login.", code: "<form action=\"/login\" method=\"post\">\n</form>" },
        { task: "A labelled text field for a city.", code: "<label for=\"city\">City</label>\n<input type=\"text\" id=\"city\" name=\"city\">" },
        { task: "The same field, with the label wrapping it.", code: "<label>\n  City\n  <input type=\"text\" name=\"city\">\n</label>" },
        { task: "A submit button reading Send.", code: "<button type=\"submit\">Send</button>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<input type=\"text\" id=\"username\">", why: "No name, so the value is never sent. Nothing on screen shows this and no error appears anywhere.", fix: "<input type=\"text\" id=\"username\" name=\"username\">" },
        { bad: "<label>Email</label>\n<input type=\"email\" id=\"mail\" name=\"email\">", why: "A label attached to nothing. It looks right and the field is still announced as unlabelled.", fix: "<label for=\"mail\">Email</label>" },
        { bad: "<form method=\"get\" action=\"/login\"> — with a password field", why: "The password lands in the URL, and from there in browser history, server logs and the referrer sent to the next site.", fix: "<form method=\"post\" action=\"/login\">" },
        { bad: "An <input> written after </form>", why: "Only fields inside the form are submitted. It looks adjacent and is not part of it.", fix: "Move it inside the <form> element." },
      ] },

      { t: "recap", items: [
        "A form sends <b>name=value pairs</b> — no <code>name</code>, no data",
        "<code>id</code> is for this page (the label); <code>name</code> is for the server",
        "<code>action</code> is where it goes, <code>method</code> is how it travels",
        "Label with <code>for</code> matching <code>id</code>, or by wrapping the field",
        "Clicking a label should focus its field — that is the working test",
        "GET for shareable searches; POST for private or changing things — and POST is not encryption",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between GET and POST?", a: "GET puts the form data in the URL as a query string, so the result can be bookmarked, shared and re-run — right for searches and filters. POST puts it in the request body, so it stays out of the address bar, history and logs, and the browser warns before re-sending — right for anything private or anything that changes state. POST is not encryption; HTTPS is what protects either of them in transit." },
        { level: "medium", q: "Why does an input need both id and name?", a: "They answer different questions. id identifies the element on this page, which is how a label's for attribute finds it and how CSS and scripts reach it. name is the key the value is submitted under, so it is what the server sees. A field with an id but no name is fully functional on screen and is silently excluded from the submission — one of the most common form bugs precisely because both attributes usually hold the same word." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does a form actually send?",
          options: [
            "Every element inside it",
            "The labels and the values",
            "The ids and the values",
            "Name-and-value pairs, one for every named field inside it",
          ],
          correct: 3,
          why: "Not the labels, not the ids, not the placeholder text. Just the names and what the visitor typed." },
        { level: "easy",
          q: "A field has an id and a working label but no name. What arrives at the server?",
          options: [
            "The value, keyed by its id",
            "Nothing for that field — it is left out of the submission entirely",
            "An empty value for that field",
            "The label text and the value",
          ],
          correct: 1,
          why: "Not sent empty. Not sent at all. And nothing on screen shows it, which is why this is the commonest form bug there is." },
        { level: "easy",
          q: "What does a label's <code>for</code> attribute point at?",
          options: [
            "The field's name",
            "The field's type",
            "The field's id",
            "The form's action",
          ],
          correct: 2,
          why: "And they must match exactly. Clicking the label focusing the field is the working test that they do." },
        { level: "easy",
          q: "Which attribute says where a form's data is sent?",
          options: [
            "action",
            "method",
            "target",
            "href",
          ],
          correct: 0,
          why: "Same path rules as a link. Leave it out and the form posts back to the page it is on." },
        { level: "medium",
          q: "Why does a field need both an id and a name when they usually hold the same word?",
          options: [
            "One is for older browsers",
            "id is for this page — the label, CSS, scripts; name is the key the server receives the value under",
            "name is for text fields and id for everything else",
            "id is optional and name is required for styling",
          ],
          correct: 1,
          why: "They answer different questions, and confusing them produces a field that works perfectly on screen and never arrives." },
        { level: "medium",
          q: "Which of these belongs in a POST rather than a GET?",
          options: [
            "A search for blue shirts",
            "A filter on a product list",
            "A page number in a list of results",
            "A login with a password",
          ],
          correct: 3,
          why: "The test is whether you would be happy for it to be a link somebody could share. The first three, yes. A password lands in history, server logs and the referrer." },
        { level: "medium",
          q: "Is POST encrypted?",
          options: [
            "Yes, that is the difference between it and GET",
            "Only when combined with a password field",
            "No — it only keeps data out of the URL; HTTPS is what protects it in transit",
            "Yes, but only on the same domain",
          ],
          correct: 2,
          why: "Two separate decisions. Choosing POST is about where the data sits; choosing HTTPS is about who can read it on the way." },
        { level: "hard",
          q: "An input sits just after the form's closing tag, right beside the other fields on screen. What is submitted?",
          options: [
            "Nothing from that field — only fields inside the form are sent",
            "The field, since it is visually adjacent",
            "The field, if it has a name",
            "The field, but with an empty value",
          ],
          correct: 0,
          why: "The container is the boundary, and the boundary is invisible. Everything outside it is ignored on submit however close it looks." },
        { level: "hard",
          q: "A field has no label at all. What does a screen reader announce?",
          options: [
            "The placeholder text",
            "The field's name attribute",
            "The nearest heading",
            "That there is something to type in, and nothing about what",
          ],
          correct: 3,
          why: "\"Edit, blank\". The visitor learns a box exists and not what belongs in it." },
        { level: "hard",
          q: "Which way of labelling survives the label and the field being styled into different parts of the layout?",
          options: [
            "Wrapping the field inside the label",
            "The explicit form, with for matching the field's id",
            "Neither — both break",
            "Putting the label text in a placeholder",
          ],
          correct: 1,
          why: "Both forms are correct HTML. Only the explicit one keeps working when the two elements no longer sit together." },
      ] },
    ],
  },

  {
    slug: "html-input-types",
    order: 22,
    title: "Choosing the Right Input",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Pick an input type by what is being asked for",
        "Group radio buttons correctly — and know what actually groups them",
        "Use <code>select</code>, <code>option</code> and <code>textarea</code>",
        "Say why <code>value</code> matters on some fields and not others",
      ] },

      { t: "hook",
        q: "Two phone-number fields, identical on a laptop. On a phone, one opens a full QWERTY keyboard and the other opens a number pad. What is different in the markup?",
        why: "One attribute: <code>type=\"tel\"</code> instead of <code>type=\"text\"</code>. The type is not a validation rule so much as a <b>declaration of what is being asked for</b>, and every device answers it in its own way — a keyboard layout on a phone, a date picker on a laptop, an autofill suggestion in a password manager." },

      { t: "def",
        term: "Input type",
        en: "The attribute that says what kind of value a field expects, which decides how the browser presents and handles it." },

      { t: "note", variant: "tip", html: "<b>text</b> — anything short with no better type.<br><b>email</b> — an address. Phone keyboards add <code>@</code>; browsers check the shape.<br><b>tel</b> — a phone number. Number pad, and <b>no</b> format checking, because phone numbers differ by country.<br><b>url</b> — a web address.<br><b>number</b> — a real quantity, with <code>min</code>, <code>max</code> and <code>step</code>. Not for phone numbers or PIN codes: they are digits, not amounts.<br><b>password</b> — masks what is typed. It hides it from the room, not from the network.<br><b>date</b> / <b>time</b> — a picker, and a value in the machine format from Module 3.<br><b>search</b> — a search box; some browsers add a clear button.<br><b>checkbox</b> — an independent yes/no.<br><b>radio</b> — one choice out of several.<br><b>file</b> — a file from the visitor's machine.<br><b>hidden</b> — a value the visitor never sees and the form still sends." },

      { t: "syntax",
        intro: "The types you will use most, with the attributes that go with each.",
        form: "<input type=\"email\" id=\"e\" name=\"email\">\n<input type=\"tel\" id=\"p\" name=\"phone\">\n<input type=\"number\" id=\"q\" name=\"qty\" min=\"1\" max=\"10\">\n<input type=\"password\" id=\"pw\" name=\"password\">\n<input type=\"date\" id=\"d\" name=\"born\">",
        parts: [
          { bit: "type=\"email\"", says: "An address. The browser checks it roughly contains the shape of one, and a phone offers the <code>@</code> key without switching layouts." },
          { bit: "type=\"tel\"", says: "A phone number. Deliberately unvalidated — every country writes them differently — but the number pad appears, which is the whole win." },
          { bit: "type=\"number\"", says: "A quantity that can be counted or compared. Comes with spinner arrows and accepts <code>min</code>, <code>max</code> and <code>step</code>." },
          { bit: "min", says: "The smallest acceptable value. <code>max</code> is its pair, and both are enforced by the browser before submission." },
          { bit: "type=\"password\"", says: "Masks the characters on screen. It does nothing to the data in transit — that is HTTPS's job, and confusing the two is a real mistake." },
          { bit: "type=\"date\"", says: "Offers a calendar and submits <code>YYYY-MM-DD</code> — the machine format from the <code>&lt;time&gt;</code> lesson, for the same reason." },
        ],
        note: "Use <code>number</code> only for things that are genuinely amounts. A phone number, a PIN and a postcode are strings of digits you would never add together — <code>number</code> would let a visitor spin a phone number up by one, and strips a leading zero.",
      },

      { t: "h2", n: "1", text: "Checkbox and radio: what actually groups them" },
      { t: "p", html: "A checkbox is independent — tick any number of them. A radio is one choice from a set. What makes several radios <b>a set</b> is not being near each other: it is <b>sharing the same <code>name</code></b>. Give two radios different names and both can be selected at once, because as far as the browser is concerned they are two unrelated questions." },

      { t: "code", file: "choices.html", code: "<p>Size</p>\n<label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n<label><input type=\"radio\" name=\"size\" value=\"m\" checked> Medium</label>\n<label><input type=\"radio\" name=\"size\" value=\"l\"> Large</label>\n\n<p>Extras</p>\n<label><input type=\"checkbox\" name=\"gift\" value=\"yes\"> Gift wrap</label>\n<label><input type=\"checkbox\" name=\"news\" value=\"yes\"> Email me offers</label>", output: "Three sizes where only one can be chosen, then two independent tickboxes." },
      { t: "psoft", html: "The three sizes share <code>name=\"size\"</code>, which is what makes choosing one clear the others. The two extras have <b>different</b> names because they are different questions — give them the same name and ticking one would untick the other. Press <b>Try it yourself</b> and make both checkboxes <code>name=\"gift\"</code> to watch that happen." },

      { t: "note", variant: "key", html: "<b>A radio or checkbox needs a <code>value</code>, and this is the one place it is not optional.</b> A text field submits what the visitor typed; a tick has nothing to submit but the fact that it was ticked. With no <code>value</code>, a ticked box arrives as the literal string <code>on</code> — so three ticked options all arrive as \"on\" and the server cannot tell them apart. <code>checked</code> preselects one, and takes no value: present or absent." },

      { t: "h2", n: "2", text: "Choosing from a list" },
      { t: "syntax",
        intro: "A dropdown, and how to group its options.",
        form: "<label for=\"city\">City</label>\n<select id=\"city\" name=\"city\">\n  <option value=\"\">Choose one</option>\n  <optgroup label=\"North\">\n    <option value=\"del\">Delhi</option>\n  </optgroup>\n  <option value=\"mum\" selected>Mumbai</option>\n</select>",
        parts: [
          { bit: "<select", says: "The dropdown. It carries the <code>name</code> — the options do not." },
          { bit: "<option", says: "One choice. Its <code>value</code> is what gets submitted; the text between the tags is what the visitor reads." },
          { bit: "value", says: "What the server receives. Leave it out and the visible text is sent instead — which works until somebody rewrites the wording." },
          { bit: "<optgroup", says: "A labelled group of options inside the list. The group heading is not selectable, which is exactly what you want." },
          { bit: "selected", says: "Which option starts chosen. Without it the first one does — which is why a \"Choose one\" placeholder option with an empty value is the usual first entry." },
        ],
        note: "A <code>&lt;select&gt;</code> with 4 options is a worse radio group: it hides the choices behind a click and takes two interactions instead of one. Reach for it when the list is long enough that showing it all would swamp the page — countries, states, years.",
      },

      { t: "h2", n: "3", text: "The long answer" },
      { t: "p", html: "<code>&lt;textarea&gt;</code> is the multi-line field, and it is the odd one out: it is <b>not</b> an <code>&lt;input&gt;</code>, it has a closing tag, and its value is the content between the tags rather than a <code>value</code> attribute. That is why whitespace inside it is preserved exactly, the same rule as <code>&lt;pre&gt;</code>." },

      { t: "code", file: "message.html", code: "<label for=\"msg\">Your message</label>\n<textarea id=\"msg\" name=\"message\" rows=\"5\"></textarea>", output: "A five-line box that the visitor can drag to resize." },
      { t: "psoft", html: "Write it as <code>&lt;textarea&gt;&lt;/textarea&gt;</code> with nothing between the tags. Put a newline or spaces in there and that is the field's starting value — so the box opens containing whitespace the visitor has to delete." },

      { t: "debug",
        intro: "An order form offers three extras. The visitor ticks two, and the server cannot work out which two. Read the markup before opening the fix.",
        code: "<p>Extras</p>\n<label><input type=\"checkbox\" name=\"extras\"> Gift wrap</label>\n<label><input type=\"checkbox\" name=\"extras\"> Express delivery</label>\n<label><input type=\"checkbox\" name=\"extras\"> Include a note</label>",
        symptom: "Two boxes ticked, and the submission reads extras=on&extras=on. The count is right and the identities are gone.",
        q: "The boxes tick independently and all three are named. So why does the server receive the same word twice?",
        fix: "<p>Extras</p>\n<label><input type=\"checkbox\" name=\"extras\" value=\"gift\"> Gift wrap</label>\n<label><input type=\"checkbox\" name=\"extras\" value=\"express\"> Express delivery</label>\n<label><input type=\"checkbox\" name=\"extras\" value=\"note\"> Include a note</label>",
        why: "A text field submits what the visitor typed. A tick has nothing to submit but the <b>fact</b> that it was ticked — so with no <code>value</code> the browser sends the default string <code>on</code>, and three boxes sharing a name send three identical answers. This is the one place <code>value</code> is not optional. Sharing the name is right here, incidentally: it is how you say \"these are answers to the same question\", and the server receives one pair per ticked box. What was missing was the part that says <i>which</i> answer." },

      { t: "drills", intro: "Type these out. Each one is a different question being asked, and the type is how you ask it.", items: [
        { task: "A labelled email field.", code: "<label for=\"mail\">Email</label>\n<input type=\"email\" id=\"mail\" name=\"email\">" },
        { task: "A phone number field — the type that brings up a number pad and checks nothing.", code: "<label for=\"ph\">Phone</label>\n<input type=\"tel\" id=\"ph\" name=\"phone\">" },
        { task: "A quantity between 1 and 10.", code: "<label for=\"qty\">Quantity</label>\n<input type=\"number\" id=\"qty\" name=\"qty\" min=\"1\" max=\"10\">" },
        { task: "Three sizes where only one may be chosen, with Medium preselected.", code: "<label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n<label><input type=\"radio\" name=\"size\" value=\"m\" checked> Medium</label>\n<label><input type=\"radio\" name=\"size\" value=\"l\"> Large</label>" },
        { task: "A dropdown of two cities, opening on a prompt that submits nothing.", code: "<label for=\"city\">City</label>\n<select id=\"city\" name=\"city\">\n  <option value=\"\">Choose one</option>\n  <option value=\"del\">Delhi</option>\n  <option value=\"mum\">Mumbai</option>\n</select>" },
        { task: "A five-line message box that opens empty.", code: "<label for=\"msg\">Your message</label>\n<textarea id=\"msg\" name=\"message\" rows=\"5\"></textarea>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<input type=\"radio\" name=\"small\">\n<input type=\"radio\" name=\"medium\">", why: "Different names, so they are two separate questions and both can be selected at once.", fix: "Both name=\"size\", with different value attributes." },
        { bad: "<input type=\"checkbox\" name=\"gift\">", why: "No value, so a ticked box submits the literal string \"on\" — useless the moment there is more than one.", fix: "<input type=\"checkbox\" name=\"gift\" value=\"yes\">" },
        { bad: "<input type=\"number\" name=\"phone\">", why: "A phone number is not a quantity. Spinner arrows appear, leading zeros are stripped, and nothing is gained.", fix: "<input type=\"tel\" name=\"phone\">" },
        { bad: "<textarea value=\"Hello\"></textarea>", why: "textarea has no value attribute — its content is its value.", fix: "<textarea>Hello</textarea>" },
      ] },

      { t: "recap", items: [
        "<code>type</code> declares what is being asked for; the device decides how to help",
        "<code>tel</code> for phone numbers, <code>number</code> only for real quantities",
        "Radios are grouped by a <b>shared <code>name</code></b>, nothing else",
        "Checkboxes and radios need a <code>value</code>, or they submit \"on\"",
        "<code>&lt;select&gt;</code> carries the name; each <code>&lt;option&gt;</code> carries its value",
        "<code>&lt;textarea&gt;</code> has a closing tag and its content <b>is</b> its value",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "How do you make several radio buttons work as one choice?", a: "Give them all the same name attribute. That is what defines the group — proximity in the markup does nothing. Each one then needs its own value, because the name is shared and the value is what identifies which option was chosen." },
        { level: "medium", q: "Why use type=\"tel\" rather than type=\"number\" for a phone number?", a: "number is for quantities. It shows spinner arrows, allows a value to be incremented, and drops leading zeros — all wrong for a phone number, which is a string of digits nobody would arithmetic on. tel declares the intent, brings up the numeric keypad on a phone, and deliberately applies no format validation, because phone number formats differ by country." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What is an input's type attribute really declaring?",
          options: [
            "How wide the field should be",
            "What kind of value is being asked for, which each device then answers in its own way",
            "Which validation library to use",
            "Whether the field is required",
          ],
          correct: 1,
          why: "A keyboard layout on a phone, a picker on a laptop, an autofill suggestion in a password manager — all from one attribute." },
        { level: "easy",
          q: "What makes several radio buttons behave as one choice?",
          options: [
            "Being next to each other in the markup",
            "Being inside the same fieldset",
            "Having the same value",
            "Sharing the same name",
          ],
          correct: 3,
          why: "Proximity does nothing. Give two radios different names and both can be selected at once, because they are two unrelated questions." },
        { level: "easy",
          q: "Which type suits a phone number?",
          options: [
            "number",
            "text",
            "tel",
            "password",
          ],
          correct: 2,
          why: "The number pad appears and no format is enforced, which is right — phone numbers are written differently in every country." },
        { level: "easy",
          q: "Where does a textarea keep its value?",
          options: [
            "In the content between its opening and closing tags",
            "In a value attribute",
            "In a placeholder attribute",
            "In its name attribute",
          ],
          correct: 0,
          why: "It is the odd one out: not an input, has a closing tag, and its content is its value — which is why stray whitespace in there becomes text the visitor must delete." },
        { level: "medium",
          q: "A checkbox is ticked and has no value attribute. What does the server receive?",
          options: [
            "true",
            "The label's text",
            "An empty string",
            "The string \"on\"",
          ],
          correct: 3,
          why: "Useless the moment more than one box shares a name — three ticks arrive as three identical answers." },
        { level: "medium",
          q: "Why is type=\"number\" the wrong choice for a PIN code?",
          options: [
            "It is only valid for decimals",
            "A PIN is digits, not a quantity — spinner arrows appear, and a leading zero is stripped",
            "It does not appear on phone keyboards",
            "It cannot be marked required",
          ],
          correct: 1,
          why: "The test is whether you would ever do arithmetic on it. Nobody adds one to a PIN." },
        { level: "medium",
          q: "Which element carries the name attribute in a dropdown?",
          options: [
            "The select",
            "Each option",
            "Both the select and each option",
            "The optgroup",
          ],
          correct: 0,
          why: "The select is the field; each option carries the value that gets submitted when it is the one chosen." },
        { level: "hard",
          q: "An option has no value attribute. What is submitted when it is chosen?",
          options: [
            "Nothing",
            "The option's position in the list",
            "The visible text between the tags",
            "The select's name repeated",
          ],
          correct: 2,
          why: "It works — right up until someone rewrites the wording and every stored answer stops matching." },
        { level: "hard",
          q: "When is a select a worse choice than a group of radio buttons?",
          options: [
            "When the list has more than twenty entries",
            "When the options need to be grouped",
            "When one option should be preselected",
            "When there are only a few options — it hides them behind a click and costs two interactions instead of one",
          ],
          correct: 3,
          why: "Reach for a dropdown when showing every choice would swamp the page: countries, states, years." },
        { level: "hard",
          q: "type=\"password\" masks what is typed. What does it protect?",
          options: [
            "The data in transit across the network",
            "The characters from anyone looking at the screen, and nothing else",
            "The value from appearing in the page source",
            "The field from being autofilled",
          ],
          correct: 1,
          why: "It hides it from the room, not from the network. HTTPS is what protects it on the way, and confusing the two is a real mistake." },
      ] },
    ],
  },

  {
    slug: "html-form-validation",
    order: 23,
    title: "Validation, Grouping, and the Lie of the Placeholder",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Have the browser check a field before the form is sent",
        "Say why that checking is a courtesy and never a defence",
        "Group related fields so the group's question is announced too",
        "Explain why a placeholder can never replace a label",
      ] },

      { t: "hook",
        q: "You add <code>required</code> to every field. The form now refuses to submit until they are all filled in. So the data reaching your server is guaranteed complete — true or false?",
        why: "False, and it is the most consequential misunderstanding in this module. Everything you write in HTML runs in a browser the <b>visitor controls</b>. They can edit your page in DevTools, or skip the browser and send the request directly. Client-side validation exists to give a helpful person quick feedback, not to stop an unhelpful one." },

      { t: "def",
        term: "Client-side validation",
        en: "Checks the browser performs before sending a form — instant, free, and impossible to rely on, because the browser belongs to the visitor." },

      { t: "syntax",
        intro: "The attributes that make the browser check a field before it lets the form go.",
        form: "<input type=\"text\" id=\"u\" name=\"user\" required minlength=\"3\" maxlength=\"20\">\n<input type=\"number\" id=\"q\" name=\"qty\" min=\"1\" max=\"10\" step=\"1\">\n<input type=\"text\" id=\"pin\" name=\"pin\" pattern=\"[0-9]{6}\" title=\"Six digits\">",
        parts: [
          { bit: "required", says: "Must not be empty. The browser blocks submission and points at the field. Present or absent — no value." },
          { bit: "minlength", says: "Fewest characters accepted. <code>maxlength</code> is the pair, and it stops further typing rather than complaining afterwards." },
          { bit: "min", says: "Smallest acceptable number — or earliest date, on a date field. <code>max</code> is its pair." },
          { bit: "step", says: "The allowed increment. <code>step=\"0.5\"</code> permits halves; <code>step=\"1\"</code> keeps it whole." },
          { bit: "pattern", says: "A regular expression the value must match, for formats no type covers — a PIN code, a vehicle registration." },
          { bit: "title", says: "Beside <code>pattern</code>, this is what the browser shows when the value does not match. Without it the message says only that the format is wrong, which helps nobody." },
        ],
        note: "Every one of these is free — no script, no library, and the messages come translated into the visitor's own language. What none of them do is protect anything, which the next section is about.",
      },

      { t: "code", file: "validated.html", code: "<form action=\"/join\" method=\"post\">\n  <label for=\"u\">Username</label>\n  <input type=\"text\" id=\"u\" name=\"user\" required minlength=\"3\" maxlength=\"20\">\n\n  <label for=\"q\">How many seats</label>\n  <input type=\"number\" id=\"q\" name=\"qty\" min=\"1\" max=\"10\" required>\n\n  <button type=\"submit\">Join</button>\n</form>", output: "Two fields the browser refuses to send until both are filled in and within range." },
      { t: "psoft", html: "Not a line of script, and the complaints arrive in the visitor's own language. Press <b>Try it yourself</b> and set <code>min</code> to <code>5</code>: the seats field starts rejecting 1 through 4 immediately, before anything is submitted anywhere." },

      { t: "h2", n: "1", text: "Why the server has to check again" },
      { t: "p", html: "The browser is the visitor's software, running on the visitor's machine. Two minutes in DevTools removes a <code>required</code> attribute; a single command-line request skips the page entirely. Neither is exotic — the second is how every API is tested." },
      { t: "note", variant: "warn", html: "<b>Validate in the browser for the visitor. Validate on the server for the system.</b> The first is about not making an honest person fill in the form twice. The second is the only one that is a check at all. Every real application does both, and a beginner who learns only the first ships something that looks careful and defends nothing." },

      { t: "h2", n: "2", text: "The placeholder is not a label" },
      { t: "p", html: "It is the most common shortcut in web forms: delete the labels, put the field's name in <code>placeholder</code>, enjoy the tidier layout. It fails in four separate ways, and every one of them hurts somebody real." },

      { t: "note", variant: "key", html: "<b>1. It disappears the moment typing starts</b> — so anyone interrupted mid-form has no way to recall what the field was for.<br><b>2. It is grey by design</b>, which usually fails contrast requirements, so partially sighted visitors cannot read it.<br><b>3. Screen reader support is inconsistent</b> — some announce it, some do not, and a field whose name is only in a placeholder may be announced as \"edit, blank\".<br><b>4. There is nothing to click</b> — a label is a second, larger target for the same field, which matters to anyone whose hands are not steady.<br><br>A placeholder is for an <b>example</b> of the format: <code>label</code> says \"Phone\", <code>placeholder</code> shows <code>+91 98765 43210</code>." },

      { t: "h2", n: "3", text: "Grouping fields that ask one question" },
      { t: "p", html: "Three radio buttons labelled Small, Medium and Large are three labelled controls — and nothing in that markup says the <b>question</b> is \"Size\". A sighted visitor reads the heading above them; a screen reader user hears \"Small, radio button, one of three\" with no idea what is being sized." },

      { t: "syntax",
        intro: "The pair that gives a group its own name.",
        form: "<fieldset>\n  <legend>Size</legend>\n\n  <label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n  <label><input type=\"radio\" name=\"size\" value=\"m\"> Medium</label>\n</fieldset>",
        parts: [
          { bit: "<fieldset>", says: "Wraps controls that together answer one question. Draws a border by default, which CSS can remove without losing the meaning." },
          { bit: "<legend>", says: "The group's question, and it must be the fieldset's <b>first</b> child. It is announced with every control inside — \"Size, Small, radio button\"." },
        ],
        note: "This is the same shape as a table's <code>&lt;caption&gt;</code> and a figure's <code>&lt;figcaption&gt;</code>: a container for related things, plus one element naming what they are. Three elements in three modules built on one idea.",
      },

      { t: "note", variant: "tip", html: "<b><code>autocomplete</code> is worth one line of effort.</b> <code>autocomplete=\"email\"</code>, <code>\"tel\"</code>, <code>\"street-address\"</code>, <code>\"new-password\"</code> let the browser and password managers fill fields correctly. It saves everyone time and it saves some people the entire form — anyone for whom typing is slow or painful. Switching it off on a login field, which people still do, helps nobody." },

      { t: "code", file: "labelled.html", code: "<label for=\"ph\">Phone</label>\n<input type=\"tel\" id=\"ph\" name=\"phone\"\n       placeholder=\"+91 98765 43210\" autocomplete=\"tel\">", output: "A field whose name is always visible, and an example of the format that disappears as you type — which is fine, because it was only ever an example." },
      { t: "psoft", html: "This is the division the whole section argues for. The <b>label</b> says what the field is and stays put; the <b>placeholder</b> shows what a good answer looks like and is expendable. Delete the label and the field still looks fine and has stopped naming itself." },

      { t: "debug",
        intro: "A six-digit PIN field is marked up carefully and accepts nine digits without complaint. The rest of the form's validation works. Read it before opening the fix.",
        code: "<label for=\"pin\">PIN code</label>\n<input type=\"number\" id=\"pin\" name=\"pin\" maxlength=\"6\" required>",
        symptom: "Typing 123456789 and submitting is accepted. Leaving it empty is correctly refused, so the browser is checking the field — just not its length.",
        q: "The attribute is spelt correctly and the value is far too long. Why is the limit ignored while required is obeyed?",
        fix: "<label for=\"pin\">PIN code</label>\n<input type=\"text\" id=\"pin\" name=\"pin\"\n       pattern=\"[0-9]{6}\" title=\"Six digits\" inputmode=\"numeric\" required>",
        why: "<code>maxlength</code> does not apply to a <code>number</code> field. It is defined for the text-like types — text, search, url, tel, email, password — and on anything else the browser reads it, keeps it, and never enforces it. Measured in a real browser: a <code>number</code> field carrying <code>maxlength=\"3\"</code> reports a six-digit value as <b>valid</b>, while the same field carrying <code>max=\"999\"</code> reports it as invalid with a range overflow. So the browser is certainly checking — it is checking a different attribute. And <code>max</code> is not the repair here either, because a PIN is not a quantity: lesson 22's rule applies, and the field should never have been a <code>number</code>. <code>type=\"text\"</code> with a <code>pattern</code> states the real requirement, <code>title</code> makes the failure message say something useful, and <code>inputmode=\"numeric\"</code> keeps the number pad on a phone." },

      { t: "drills", intro: "Write these out. Every one of them is a courtesy to the visitor — and none of them is a check.", items: [
        { task: "A field that must not be empty and must be at least three characters.", code: "<input type=\"text\" id=\"u\" name=\"user\" required minlength=\"3\">" },
        { task: "A quantity that must be between 1 and 10.", code: "<input type=\"number\" id=\"q\" name=\"qty\" min=\"1\" max=\"10\">" },
        { task: "A six-digit code, with a message that says what is wanted when it fails.", code: "<input type=\"text\" id=\"pin\" name=\"pin\" pattern=\"[0-9]{6}\" title=\"Six digits\">" },
        { task: "Two radio buttons wrapped in a group that announces its own question.", code: "<fieldset>\n  <legend>Size</legend>\n  <label><input type=\"radio\" name=\"size\" value=\"s\"> Small</label>\n  <label><input type=\"radio\" name=\"size\" value=\"m\"> Medium</label>\n</fieldset>" },
        { task: "A phone field with a real label and the placeholder doing its actual job.", code: "<label for=\"ph\">Phone</label>\n<input type=\"tel\" id=\"ph\" name=\"phone\" placeholder=\"+91 98765 43210\" autocomplete=\"tel\">" },
      ] },

      { t: "mistakes", items: [
        { bad: "<input placeholder=\"Email\"> — with no label", why: "Vanishes on typing, usually fails contrast, is announced inconsistently, and gives nothing to click.", fix: "<label for=\"e\">Email</label>\n<input id=\"e\" name=\"email\" placeholder=\"you@example.com\">" },
        { bad: "\"The form has required on every field, so the data is valid.\"", why: "The browser belongs to the visitor. DevTools removes the attribute; a direct request skips the page.", fix: "Keep required for the visitor's sake, and validate again on the server." },
        { bad: "<fieldset>\n  <label>...</label>\n  <legend>Size</legend>\n</fieldset>", why: "legend must be the first child. Later, it is invalid and stops naming the group.", fix: "<fieldset>\n  <legend>Size</legend>\n  <label>...</label>\n</fieldset>" },
        { bad: "<input pattern=\"[0-9]{6}\"> — with no title", why: "When it fails, the browser can only say the format is wrong. The visitor is told to try again with no idea what would work.", fix: "<input pattern=\"[0-9]{6}\" title=\"Six digits\">" },
      ] },

      { t: "recap", items: [
        "<code>required</code>, <code>minlength</code>, <code>min</code>/<code>max</code>, <code>step</code>, <code>pattern</code> — free, instant, translated",
        "<code>pattern</code> needs <code>title</code>, or the error message says nothing useful",
        "Browser validation is for the visitor; <b>server validation is the only real check</b>",
        "A placeholder vanishes, is low contrast, is announced unreliably, and cannot be clicked",
        "Label says what the field is; placeholder shows an example of the format",
        "<code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code> give a group of controls its question",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What does the required attribute do?", a: "It stops the browser submitting the form while that field is empty, and points the visitor at it with a message in their own language. It costs nothing and is purely a convenience — it does not guarantee the server receives a value, because the check runs in software the visitor controls." },
        { level: "medium", q: "Why is a placeholder not an acceptable replacement for a label?", a: "It disappears as soon as the visitor types, so anyone interrupted loses the field's name; it is grey by default and usually fails contrast; screen reader support for it is inconsistent, so the field may be announced with no name at all; and it gives no second click target, which matters for anyone with limited dexterity. A placeholder should show an example of the expected format while the label carries the name." },
        { level: "hard", q: "If HTML validation can be bypassed, why bother writing it?", a: "Because it solves a different problem from security. It gives immediate, local feedback with no round trip and no script — the visitor learns the postcode is malformed before waiting for a server to say so — and the messages arrive translated. It is a user-experience feature that happens to look like a security feature, which is exactly why the distinction has to be stated: it must be paired with server-side validation, never trusted in place of it." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does <code>required</code> do?",
          options: [
            "Stops the browser submitting while the field is empty, and points the visitor at it",
            "Guarantees the server receives a value",
            "Marks the field with an asterisk",
            "Makes the field impossible to leave until it is filled",
          ],
          correct: 0,
          why: "A courtesy to an honest visitor, in their own language, for free. Not a guarantee about anything." },
        { level: "easy",
          q: "Which attribute must accompany <code>pattern</code>?",
          options: [
            "placeholder",
            "required",
            "title",
            "maxlength",
          ],
          correct: 2,
          why: "Without it, the browser can only say the format is wrong. The visitor is told to try again with no idea what would work." },
        { level: "easy",
          q: "Where must a legend appear?",
          options: [
            "Anywhere inside the fieldset",
            "Immediately before the fieldset",
            "After the controls it describes",
            "As the fieldset's first child",
          ],
          correct: 3,
          why: "Later, it is invalid and stops naming the group — the same rule as a table's caption, for the same reason." },
        { level: "easy",
          q: "What is a placeholder actually for?",
          options: [
            "Naming the field",
            "Showing an example of the format expected",
            "Holding the field's default value",
            "Explaining why the field is required",
          ],
          correct: 1,
          why: "The label says \"Phone\"; the placeholder shows +91 98765 43210. One stays, one is expendable." },
        { level: "medium",
          q: "A form has <code>required</code> on every field. Is the data reaching the server guaranteed complete?",
          options: [
            "Yes — the browser refuses to send it otherwise",
            "Yes, unless JavaScript is disabled",
            "No — the check runs in software the visitor controls, and a request can skip the page entirely",
            "No, but only if the visitor uses an old browser",
          ],
          correct: 2,
          why: "Two minutes in DevTools removes the attribute; a single command-line request never loads the page. Neither is exotic — the second is how every API gets tested." },
        { level: "medium",
          q: "Which of these is <b>not</b> one of the reasons a placeholder fails as a label?",
          options: [
            "It disappears as soon as the visitor types",
            "It is grey by design and usually fails contrast",
            "It gives no second target to click",
            "It cannot contain more than one word",
          ],
          correct: 3,
          why: "Length was never the problem. The fourth real reason is that screen reader support for it is inconsistent." },
        { level: "medium",
          q: "Three radios labelled Small, Medium and Large, with no fieldset. What does a screen reader user miss?",
          options: [
            "Which one is selected",
            "The question — nothing says these three are about size",
            "The order of the options",
            "That only one may be chosen",
          ],
          correct: 1,
          why: "They hear \"Small, radio button, one of three\" and never learn what is being sized. The legend is announced with every control in the group." },
        { level: "hard",
          q: "A <code>type=\"number\"</code> field carries <code>maxlength=\"6\"</code> and accepts nine digits. Why?",
          options: [
            "The attribute needs a matching minlength",
            "The value must be marked required first",
            "The browser only enforces maxlength after submission",
            "maxlength applies only to the text-like types, so on a number field it is read and never enforced",
          ],
          correct: 3,
          why: "The browser is certainly checking the field — the same field with <code>max</code> instead does reject the value. It is checking a different attribute." },
        { level: "hard",
          q: "Where should validation live in a real application?",
          options: [
            "In the browser, for the visitor — and again on the server, which is the only real check",
            "In the browser only, since the server can trust it",
            "On the server only, since the browser can be bypassed",
            "In whichever place is easier to write",
          ],
          correct: 0,
          why: "The third option is defensible and still worse: dropping the browser half makes an honest person fill the form in twice." },
        { level: "hard",
          q: "Why is <code>autocomplete=\"tel\"</code> worth adding?",
          options: [
            "It validates the phone number's format",
            "It stops the browser storing the value",
            "It lets browsers and password managers fill the field correctly, which saves some people the whole form",
            "It is required for the field to be accessible",
          ],
          correct: 2,
          why: "One line, and the benefit is largest for anyone who finds typing slow or painful. Switching it off on a login field helps nobody." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 9 — SEMANTIC HTML
   *
   * The module the whole course has been promising. Every earlier lesson made
   * the same argument in miniature — h1 is not "big text", strong is not bold,
   * a list announces its count, a table needs headers — and this is where that
   * argument gets its name and its page-level elements.
   *
   * TWO REFERENCES ELSEWHERE POINT HERE, and both said "Module 12" until this
   * module was written (the lists lesson promising <nav>, the tables lesson
   * promising the replacement for layout tables). Both corrected. If this
   * module ever moves, grep the file for its number before doing anything else.
   *
   * Parser parity checked in linkedom and DOMParser before the problems were
   * written: 12 of 12 identical across header/nav/main/article/section/aside/
   * footer including nesting, and — the one that matters for problem 633 — a
   * SECOND <main> survives parsing in both, so "there should be one" is a
   * gradeable exercise rather than a repaired-away one.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-semantic",
    order: 24,
    title: "Semantic HTML: Naming the Parts of a Page",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Say what \"semantic\" means, in one sentence, without using the word",
        "Lay a page out with <code>header</code>, <code>nav</code>, <code>main</code>, <code>aside</code> and <code>footer</code>",
        "Explain what a landmark is and who uses one",
        "Know when a <code>&lt;div&gt;</code> is still the right answer",
      ] },

      { t: "hook",
        q: "A screen reader user presses one key and gets a menu: banner, navigation, main, complementary, footer — and jumps straight past your header and menu into the article. On a page built from <code>&lt;div&gt;</code>s, what does that menu say?",
        why: "Nothing. It is empty. They then have to tab through every logo, every menu item and every advert to reach the first sentence — on every page, every time. The elements in this lesson are what fill that menu, and they cost you nothing but choosing a different tag name." },

      { t: "def",
        term: "Semantic element",
        en: "An element chosen for what the content is, rather than for how it should look." },

      { t: "def",
        term: "Landmark",
        en: "A region of the page that assistive technology can list and jump between — produced automatically by header, nav, main, aside and footer." },

      { t: "analogy",
        concept: "semantic elements",
        real: "rooms in a house versus one open hall",
        html: "\"Go to the kitchen\" works because rooms have names. In an open hall you can only say \"about six metres past the sofa\" — accurate, useless to anyone who cannot see the sofa. <code>&lt;div&gt;</code> builds the hall; <code>&lt;main&gt;</code> and <code>&lt;nav&gt;</code> build rooms, and everything that cannot see the page navigates by room name." },

      { t: "syntax",
        intro: "The shape of nearly every page on the web, in seven elements.",
        form: "<body>\n  <header>\n    <h1>The Practice Site</h1>\n    <nav>\n      <ul><li><a href=\"/\">Home</a></li></ul>\n    </nav>\n  </header>\n\n  <main>\n    <h2>Today's article</h2>\n    <p>The thing the visitor came for.</p>\n  </main>\n\n  <aside>\n    <h2>Related</h2>\n  </aside>\n\n  <footer>\n    <p>&copy; 2026</p>\n  </footer>\n</body>",
        parts: [
          { bit: "<header>", says: "Introductory content for whatever contains it. At the top of <code>&lt;body&gt;</code> it is the site's banner; inside an <code>&lt;article&gt;</code> it is that article's own header, and there may be many on a page for that reason." },
          { bit: "<nav>", says: "A block of <b>major</b> navigation. Not every group of links — the site menu, a table of contents, the pagination. Marking every link cluster as <code>nav</code> refills the landmark menu with noise." },
          { bit: "<main>", says: "The page's own content — what is left when you remove the parts repeated on every page. <b>Exactly one per page</b>, and it is the landmark \"skip to content\" actually jumps to." },
          { bit: "<aside>", says: "Related but not essential: a sidebar, a pull quote, further reading. Announced as \"complementary\", which is a good test — if removing it would damage the page, it is not an aside." },
          { bit: "<footer>", says: "Closing content for its container: copyright and small print at page level, a byline inside an article." },
        ],
        note: "None of these do anything visual. <code>&lt;main&gt;</code> and <code>&lt;div&gt;</code> render identically, and that is the point — the difference is entirely in what the page <i>says about itself</i>, which is what everything other than a pair of eyes has to work from.",
      },

      { t: "code", file: "page.html", code: "<body>\n  <header>\n    <h1>Mochi's Kitchen</h1>\n    <nav>\n      <ul>\n        <li><a href=\"index.html\">Home</a></li>\n        <li><a href=\"recipes.html\">Recipes</a></li>\n      </ul>\n    </nav>\n  </header>\n\n  <main>\n    <h2>Poha Chivda</h2>\n    <p>Twenty minutes, one pan.</p>\n  </main>\n\n  <footer>\n    <p>Written by Ravi</p>\n  </footer>\n</body>", output: "A heading, a menu, the recipe, and a byline — laid out top to bottom, exactly as divs would be." },
      { t: "psoft", html: "Press <b>Try it yourself</b> and change every one of those tags to <code>&lt;div&gt;</code>. <b>Nothing on screen moves.</b> That is the entire lesson: the version you just broke looks identical and has stopped telling anyone what any of it is." },

      { t: "h2", n: "1", text: "Why this is not decoration" },
      { t: "p", html: "Four groups read your markup and none of them are looking at it. <b>Screen readers</b> build the landmark menu from the hook. <b>Search engines</b> weigh content inside <code>&lt;main&gt;</code> above a footer repeated on 400 pages. <b>Reader modes</b> — Safari's, Firefox's, every read-it-later app — guess which part is the article, and semantic markup is what they guess from. <b>Your own CSS</b> gets to say <code>main p</code> instead of <code>.content-wrapper .inner p</code>." },

      { t: "note", variant: "key", html: "<b>\"Skip to content\" is the oldest accessibility feature on the web, and <code>&lt;main&gt;</code> is what makes it work without one.</b> A keyboard user landing on a page has to tab past every header link before reaching the article — forty times, if your menu has forty items and they visit forty pages. The landmark turns that into one key." },

      { t: "h2", n: "2", text: "One main, many headers" },
      { t: "p", html: "<code>&lt;main&gt;</code> is the exception: exactly one per page, because \"the main content\" is a claim that cannot be true twice. <code>&lt;header&gt;</code> and <code>&lt;footer&gt;</code> are the opposite — they belong to whatever contains them, so a page with six articles legitimately has seven headers." },

      { t: "debug",
        intro: "This page has a landmark problem that renders perfectly. Find it before opening the fix.",
        code: "<body>\n  <main>\n    <header>\n      <h1>Mochi's Kitchen</h1>\n      <nav><ul><li><a href=\"/\">Home</a></li></ul></nav>\n    </header>\n  </main>\n\n  <main>\n    <h2>Poha Chivda</h2>\n    <p>Twenty minutes, one pan.</p>\n  </main>\n</body>",
        symptom: "The page looks right. \"Skip to main content\" lands on the site's logo and menu instead of the recipe, and a landmark list shows two identical \"main\" entries.",
        q: "Both <code>&lt;main&gt;</code> elements are correctly opened and closed. So what did the page claim?",
        fix: "<body>\n  <header>\n    <h1>Mochi's Kitchen</h1>\n    <nav><ul><li><a href=\"/\">Home</a></li></ul></nav>\n  </header>\n\n  <main>\n    <h2>Poha Chivda</h2>\n    <p>Twenty minutes, one pan.</p>\n  </main>\n</body>",
        why: "That it has two main contents, which cannot be true — so anything jumping to \"the main content\" takes the first, and the first is the banner. The banner is not main content at all: it is the part repeated on every page, which is the definition of what <code>&lt;main&gt;</code> excludes. The fix is not to rename the second one; it is to notice the header was never inside main to begin with. <b>The parser keeps both</b>, which is why this ships — nothing repairs it and nothing on screen changes." },

      { t: "h2", n: "3", text: "When a div is still right" },
      { t: "p", html: "<code>&lt;div&gt;</code> is not deprecated and not a mistake. It means \"a box with no meaning of its own\", and sometimes that is exactly true — a wrapper that exists only so CSS has something to grid, a row, a card shell." },
      { t: "note", variant: "tip", html: "<b>The test: could you describe this box to someone over the phone without mentioning how it looks?</b> \"The site menu\" — that is <code>nav</code>. \"The article\" — <code>main</code> or <code>article</code>. \"The thing that holds the three columns\" — that is a <code>div</code>, and reaching for a semantic element there is the opposite mistake, just as wrong and much less common." },

      { t: "drills", intro: "Write these out. Not one of them changes anything on screen, and that is what you are practising.", items: [
        { task: "A site banner holding the site's name and its menu.", code: "<header>\n  <h1>Mochi's Kitchen</h1>\n  <nav>\n    <ul><li><a href=\"index.html\">Home</a></li></ul>\n  </nav>\n</header>" },
        { task: "The part of the page that is not repeated on every other page.", code: "<main>\n  <h2>Poha Chivda</h2>\n  <p>Twenty minutes, one pan.</p>\n</main>" },
        { task: "A sidebar of related links — content the page would survive losing.", code: "<aside>\n  <h2>Related</h2>\n  <ul><li><a href=\"chivda.html\">More snacks</a></li></ul>\n</aside>" },
        { task: "Repair this: <code>&lt;div class=\"header\"&gt;&lt;h1&gt;Site&lt;/h1&gt;&lt;/div&gt;</code>", code: "<header>\n  <h1>Site</h1>\n</header>" },
        { task: "A wrapper that exists only so CSS has something to lay three columns out on.", code: "<div class=\"columns\">\n  <article>...</article>\n  <article>...</article>\n  <article>...</article>\n</div>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<div class=\"header\">…</div>", why: "The class name tells a human reading the source and nothing else. Assistive tech, search engines and reader modes never see class names.", fix: "<header>…</header>" },
        { bad: "Two <main> elements on one page", why: "Only one thing can be the main content. Anything jumping to it takes the first, which is usually the wrong one — and the parser keeps both, so nothing warns you.", fix: "One <main>; the other was probably a <section> or the header." },
        { bad: "<nav> around every group of links", why: "Marking a three-link footer cluster as major navigation fills the landmark menu with entries nobody wants to jump to.", fix: "<nav> for the site menu and the table of contents; plain lists elsewhere." },
        { bad: "<aside> for the article's own conclusion", why: "aside is announced as complementary — content that could be removed. A conclusion cannot.", fix: "Keep it inside <main>; use <aside> for the sidebar beside it." },
      ] },

      { t: "recap", items: [
        "Semantic means the element says what the content <b>is</b>, not how it looks",
        "<code>header</code> · <code>nav</code> · <code>main</code> · <code>aside</code> · <code>footer</code> create <b>landmarks</b> that can be jumped between",
        "Exactly one <code>&lt;main&gt;</code> per page; <code>header</code> and <code>footer</code> may repeat",
        "Screen readers, search engines, reader modes and your own CSS all read them",
        "None of them change the rendering — that is the point, not a shortcoming",
        "<code>&lt;div&gt;</code> is right when the box genuinely has no meaning",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is semantic HTML?", a: "Choosing elements for what the content is rather than for how it should look — header, nav, main, article and so on instead of a div with a class name. The rendering is usually identical; what changes is that assistive technology, search engines and reader modes can now tell the parts of the page apart, because a class name means nothing to any of them." },
        { level: "medium", q: "Why should there be only one main element per page?", a: "Because it identifies the page's primary content, and a page cannot have two primary contents. Assistive tech and skip links jump to the first one, so a second makes that jump unpredictable — and since nothing repairs or warns about it, the page looks perfectly correct while the skip link lands in the banner." },
        { level: "hard", q: "If semantic elements do not change the rendering, what is the business case for them?", a: "Three things that are all measurable. Search: content inside main is weighted differently from a footer that repeats across every page, and reader modes and rich results depend on being able to identify the article. Accessibility: landmarks are what let a keyboard or screen reader user skip a forty-item menu on every page, which in many countries is also a legal requirement. Maintenance: main p is a selector that survives a redesign, and .wrapper-inner-2 p is not." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does it mean to call an element semantic?",
          options: [
            "It has a default appearance",
            "It carries a class name describing it",
            "It is new in HTML5",
            "It was chosen for what the content is, not for how it should look",
          ],
          correct: 3,
          why: "The rendering is usually identical. What changes is what the page says about itself." },
        { level: "easy",
          q: "How many main elements should a page have?",
          options: [
            "One per section",
            "Exactly one",
            "One per article",
            "As many as the layout needs",
          ],
          correct: 1,
          why: "\"The main content\" is a claim that cannot be true twice." },
        { level: "easy",
          q: "What is a landmark?",
          options: [
            "A region assistive technology can list and jump between",
            "An element with an id",
            "A heading at the top of a section",
            "A link that scrolls to a fragment",
          ],
          correct: 0,
          why: "Produced automatically by header, nav, main, aside and footer — no attributes, no effort." },
        { level: "easy",
          q: "Which content belongs in an aside?",
          options: [
            "The article's conclusion",
            "The page's navigation menu",
            "Related but inessential content, such as a sidebar or further reading",
            "Anything positioned to the side of the page",
          ],
          correct: 2,
          why: "It is announced as \"complementary\", which is the test: if removing it would damage the page, it is not an aside." },
        { level: "medium",
          q: "A page is built entirely from divs with descriptive class names. What does a screen reader's landmark menu show?",
          options: [
            "The class names",
            "The headings instead",
            "Nothing — it is empty",
            "One landmark for the whole page",
          ],
          correct: 2,
          why: "Class names are for you and your CSS. Nothing else has ever read one." },
        { level: "medium",
          q: "Why can a page legitimately contain several header elements?",
          options: [
            "Because browsers merge them",
            "Because header belongs to whatever contains it — a page has one, and each article may have its own",
            "Because one is for the top and one for the bottom",
            "It cannot; only one is allowed",
          ],
          correct: 1,
          why: "A page with six articles legitimately has seven headers. main is the element that is the exception, not the rule." },
        { level: "medium",
          q: "What is wrong with wrapping every group of links in a nav?",
          options: [
            "nav may only appear once per page",
            "Links inside nav are not followed by search engines",
            "It fills the landmark menu with entries nobody wants to jump to",
            "nav must contain a list",
          ],
          correct: 2,
          why: "It is for <b>major</b> navigation — the site menu, a table of contents, the pagination. A three-link footer cluster is a plain list." },
        { level: "hard",
          q: "A page has two main elements and renders perfectly. What actually breaks?",
          options: [
            "The page fails to validate and will not display",
            "The second main is ignored by the parser",
            "The CSS applies to only one of them",
            "\"Skip to main content\" takes the first one, which here is the banner — and nothing warns you",
          ],
          correct: 3,
          why: "Both survive parsing in every engine this course grades in, which is exactly why the mistake ships." },
        { level: "hard",
          q: "When is a div still the right element?",
          options: [
            "When the box genuinely has no meaning — a wrapper that exists only so CSS has something to lay out",
            "Never; every div can be replaced by a semantic element",
            "Only inside a main element",
            "When the content is not text",
          ],
          correct: 0,
          why: "Reaching for a semantic element on a meaningless box is the opposite mistake — just as wrong, and much less common." },
        { level: "hard",
          q: "Which is <b>not</b> a group that reads your semantic markup?",
          options: [
            "Screen readers, building the landmark menu",
            "Search engines, weighing main above a repeated footer",
            "The browser's layout engine, deciding how to draw the page",
            "Reader modes, guessing which part is the article",
          ],
          correct: 2,
          why: "main and div render identically, and that is the point rather than a shortcoming — the difference is entirely in what the page claims." },
      ] },
    ],
  },

  {
    slug: "html-article-section",
    order: 25,
    title: "Article, Section, or Just a Div",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Choose between <code>article</code>, <code>section</code> and <code>div</code> with a test you can apply",
        "Give every <code>&lt;section&gt;</code> the heading it requires",
        "Know why heading levels still decide the outline",
        "Assemble a whole page from everything this course has covered",
      ] },

      { t: "hook",
        q: "Three elements, identical rendering, and the most-argued question in HTML: is this an <code>article</code>, a <code>section</code>, or a <code>div</code>? Two of them have a real test. What is it?",
        why: "<b>Article: would it still make sense somewhere else?</b> A blog post in a feed reader, a product card in search results — yes, article. <b>Section: is it a named part of something bigger?</b> Chapter three of a guide only makes sense inside the guide — section. Neither — <code>div</code>." },

      { t: "def",
        term: "article",
        en: "A self-contained piece of content that would still make sense if it were taken out and published somewhere else." },

      { t: "def",
        term: "section",
        en: "A thematic part of a larger whole, with a heading that names it." },

      { t: "syntax",
        intro: "The three, and what each claims about the box.",
        form: "<article>          stands alone anywhere\n  <h2>Poha Chivda</h2>\n  <section>        a named part of THIS article\n    <h3>Ingredients</h3>\n  </section>\n</article>\n\n<div>              a box with no meaning: CSS needs a handle</div>",
        parts: [
          { bit: "<article>", says: "Self-contained. A blog post, a product card, a comment, a news item. If it appeared alone in a feed reader it would still make sense." },
          { bit: "<section>", says: "A named part of something. It <b>needs a heading</b> — a section nobody can name is not a section, it is a <code>div</code>." },
          { bit: "<h3>", says: "That heading. Section and heading arrive together, which is the fastest way to tell whether you actually wanted a section." },
          { bit: "<div>", says: "No claim at all. A layout wrapper, a grid row, a styling hook. Still correct, still common, and not a failure." },
        ],
        note: "They nest both ways round and both are right. An <code>&lt;article&gt;</code> divided into <code>&lt;section&gt;</code>s is one long post with parts; a <code>&lt;section&gt;</code> holding several <code>&lt;article&gt;</code>s is \"Latest posts\" holding posts.",
      },

      { t: "code", file: "post.html", code: "<main>\n  <article>\n    <header>\n      <h2>Poha Chivda</h2>\n      <p>By Ravi, <time datetime=\"2026-08-06\">6 August</time></p>\n    </header>\n\n    <section>\n      <h3>Ingredients</h3>\n      <ul><li>Poha</li><li>Peanuts</li></ul>\n    </section>\n\n    <section>\n      <h3>Method</h3>\n      <ol><li>Heat the oil</li><li>Fry the peanuts</li></ol>\n    </section>\n\n    <footer>\n      <p>Filed under snacks</p>\n    </footer>\n  </article>\n</main>", output: "One recipe with a byline, two named parts, and a footer — all inside the page's main content." },
      { t: "psoft", html: "Everything in that snippet came from an earlier module: the heading levels, the <code>&lt;time datetime&gt;</code>, the two list types, the header and footer belonging to their container. The only new elements are <code>article</code> and <code>section</code> — this module is mostly the point at which the rest clicks together." },

      { t: "h2", n: "1", text: "A section without a heading is a div" },
      { t: "p", html: "This is the single most reliable rule in the module, and it settles most arguments before they start. If you cannot write the heading, the box is not a thematic part of anything — it is a wrapper, and a wrapper is a <code>&lt;div&gt;</code>." },
      { t: "p", html: "The reason is what a section claims. It says \"the document has a part here\", and a part with no name cannot appear in any outline, be announced, or be linked to. It is a promise the markup never keeps." },

      { t: "note", variant: "warn", html: "<b>The outline algorithm never happened.</b> HTML5 was specified so that each <code>&lt;section&gt;</code> would restart heading levels — an <code>&lt;h1&gt;</code> inside a section would automatically become a sub-heading. It sounded excellent and <b>no browser or screen reader ever implemented it</b>; the spec removed it. So <code>&lt;h1&gt;</code> inside a <code>&lt;section&gt;</code> is still an <code>&lt;h1&gt;</code>, and the rules from Module 3 stand unchanged: one <code>h1</code>, do not skip levels. Advice telling you otherwise is real, was once correct, and is now wrong." },

      { t: "h2", n: "2", text: "Article or section: worked examples" },
      { t: "note", variant: "tip", html: "<b>A blog post on a listing page</b> → <code>article</code>. It makes sense on its own.<br><b>Each comment under it</b> → <code>article</code>. Same test — a comment is self-contained.<br><b>\"Ingredients\" inside a recipe</b> → <code>section</code>. Meaningless without the recipe.<br><b>\"Latest posts\" wrapping five posts</b> → <code>section</code> holding five <code>article</code>s.<br><b>The three-column grid wrapper</b> → <code>div</code>. It exists for CSS.<br><b>A product card in a shop</b> → <code>article</code>. It appears in search results alone.<br><br>Still unsure? Choose <code>div</code>. A wrong <code>div</code> claims nothing; a wrong <code>article</code> tells every machine that a fragment is a complete work." },

      { t: "h2", n: "3", text: "The whole page, assembled" },
      { t: "code", file: "index.html", code: "<body>\n  <header>\n    <h1>Mochi's Kitchen</h1>\n    <nav>\n      <ul>\n        <li><a href=\"index.html\">Home</a></li>\n        <li><a href=\"about.html\">About</a></li>\n      </ul>\n    </nav>\n  </header>\n\n  <main>\n    <section>\n      <h2>Latest recipes</h2>\n\n      <article>\n        <h3>Poha Chivda</h3>\n        <p>Twenty minutes, one pan.</p>\n      </article>\n\n      <article>\n        <h3>Masala Peanuts</h3>\n        <p>Ten minutes, no oven.</p>\n      </article>\n    </section>\n  </main>\n\n  <aside>\n    <h2>About the cook</h2>\n    <p>Ravi has been cooking since 2019.</p>\n  </aside>\n\n  <footer>\n    <p>&copy; 2026 Mochi's Kitchen</p>\n  </footer>\n</body>", output: "A complete page: banner and menu, two recipes in a named group, a sidebar, and a footer." },
      { t: "psoft", html: "Read only the headings — <i>Mochi's Kitchen, Latest recipes, Poha Chivda, Masala Peanuts, About the cook</i> — and you have the page. That is the outline from Module 3, still built entirely from <code>h1</code> to <code>h6</code>, with the landmarks sitting alongside it rather than replacing it." },

      { t: "debug",
        intro: "A developer followed a well-regarded article from 2013 and gave every section its own <code>&lt;h1&gt;</code>, expecting the nesting to sort the levels out. Work out what the page ended up claiming before opening the fix.",
        code: "<main>\n  <h1>Mochi's Kitchen</h1>\n\n  <article>\n    <h1>Poha Chivda</h1>\n    <section>\n      <h1>Ingredients</h1>\n    </section>\n    <section>\n      <h1>Method</h1>\n    </section>\n  </article>\n</main>",
        symptom: "The page renders in a sensible visual hierarchy. A screen reader's heading list shows four top-level headings, and \"Ingredients\" is announced at the same level as the site's name.",
        q: "Every heading is nested inside the section it belongs to. Why did the nesting not lower any of them?",
        fix: "<main>\n  <h1>Mochi's Kitchen</h1>\n\n  <article>\n    <h2>Poha Chivda</h2>\n    <section>\n      <h3>Ingredients</h3>\n    </section>\n    <section>\n      <h3>Method</h3>\n    </section>\n  </article>\n</main>",
        why: "Because the thing that was supposed to lower them <b>never shipped</b>. HTML5 specified an outline algorithm under which a heading inside a <code>&lt;section&gt;</code> would take its level from how deeply it was nested — so an <code>&lt;h1&gt;</code> anywhere would do the right thing. No browser and no screen reader ever implemented it, and the specification eventually removed it. The advice was written while everyone expected it to arrive, which is why so much of it is still online and still confident. Heading levels are <b>absolute</b>, exactly as Module 3 said: you choose them, and the nesting has no opinion. The visual hierarchy looked right only because browsers style h1 smaller inside sectioning elements — a cosmetic leftover from the same abandoned idea, and it is what hides the bug." },

      { t: "drills", intro: "For each one, say the test out loud first — would it make sense elsewhere, or can you write its heading?", items: [
        { task: "A blog post that would still make sense in a feed reader.", code: "<article>\n  <h2>Poha Chivda</h2>\n  <p>Twenty minutes, one pan.</p>\n</article>" },
        { task: "The Ingredients part of that recipe, which means nothing without it.", code: "<section>\n  <h3>Ingredients</h3>\n  <ul><li>Poha</li><li>Peanuts</li></ul>\n</section>" },
        { task: "A named group holding two posts.", code: "<section>\n  <h2>Latest recipes</h2>\n  <article><h3>Poha Chivda</h3></article>\n  <article><h3>Masala Peanuts</h3></article>\n</section>" },
        { task: "Repair this — it has no name, so it is not a section: <code>&lt;section class=\"wrapper\"&gt;…&lt;/section&gt;</code>", code: "<div class=\"wrapper\">…</div>" },
        { task: "An article with its own byline header and its own footer.", code: "<article>\n  <header>\n    <h2>Poha Chivda</h2>\n    <p>By Ravi, <time datetime=\"2026-08-06\">6 August</time></p>\n  </header>\n  <p>Twenty minutes, one pan.</p>\n  <footer><p>Filed under snacks</p></footer>\n</article>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<section class=\"wrapper\">…</section>", why: "No heading and no name — it is a layout box wearing a semantic element.", fix: "<div class=\"wrapper\">…</div>" },
        { bad: "<article> for \"Ingredients\" inside a recipe", why: "It is not self-contained: alone in a feed it would be a list of items for nothing.", fix: "<section><h3>Ingredients</h3>…</section>" },
        { bad: "<section><h1>Method</h1></section> — expecting it to become an h3", why: "The outline algorithm was specified, never implemented anywhere, and removed. That h1 is a page-level heading.", fix: "<section><h3>Method</h3></section>" },
        { bad: "Wrapping every div on the page in <section> to be \"more semantic\"", why: "Sections you cannot name are noise in the outline, and noise is worse than silence.", fix: "Use <div> unless you can write the heading." },
      ] },

      { t: "recap", items: [
        "<b>article</b> = would still make sense somewhere else, on its own",
        "<b>section</b> = a named part of something bigger, and it <b>needs its heading</b>",
        "<b>div</b> = no meaning, only a handle for CSS — still correct, still common",
        "If you cannot write the heading, it is a <code>div</code>",
        "The outline algorithm never shipped: <code>h1</code>–<code>h6</code> still decide the outline",
        "Unsure? <code>div</code> — a wrong <code>div</code> claims nothing",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between article and section?", a: "An article is self-contained — it would still make sense republished elsewhere, like a blog post, a comment or a product card. A section is a named thematic part of something bigger, like \"Ingredients\" inside a recipe, and it needs a heading. They nest either way round: an article split into sections, or a section holding several articles." },
        { level: "medium", q: "Does putting an h1 inside a section make it behave like a lower-level heading?", a: "No. HTML5 specified an outline algorithm that would have done exactly that, but no browser or assistive technology ever implemented it and it was removed from the spec. Heading levels are still absolute, so the old rules hold: one h1 per page and no skipped levels. It is worth knowing because plenty of still-published advice says the opposite and was written while the algorithm was expected to arrive." },
        { level: "hard", q: "How do you decide between section and div when both would render identically?", a: "Try to write the section's heading. If there is a name for what the box contains — a thematic part of the document — it is a section and that heading belongs in the markup. If the box exists only so CSS has something to position, it has no name and it is a div. Reaching for section everywhere is a common overcorrection: an unnamed section adds an empty entry to the document's structure, which is worse than a div that claimed nothing at all." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What is the test for an article?",
          options: [
            "It is longer than a paragraph",
            "It has its own heading",
            "It sits inside main",
            "It would still make sense republished somewhere else, on its own",
          ],
          correct: 3,
          why: "A blog post in a feed reader, a product card in search results, a comment. Self-contained is the whole claim." },
        { level: "easy",
          q: "What does a section require that an article does not?",
          options: [
            "An id",
            "A heading that names it",
            "A closing tag",
            "A parent article",
          ],
          correct: 1,
          why: "Section and heading arrive together, which is the fastest way to tell whether you actually wanted a section." },
        { level: "easy",
          q: "You cannot write a heading for the box. What element is it?",
          options: [
            "A div",
            "A section with an empty heading",
            "An article",
            "An aside",
          ],
          correct: 0,
          why: "It is a wrapper, and a wrapper is a div. This one rule settles most of the arguments in this module." },
        { level: "easy",
          q: "Each comment beneath a blog post should be what?",
          options: [
            "A div, since comments are not content",
            "A section, since comments are part of the post",
            "An article — a comment is self-contained",
            "An aside, since comments are inessential",
          ],
          correct: 2,
          why: "The same test as the post itself. Self-containment does not mean long." },
        { level: "medium",
          q: "Can an article contain sections, and a section contain articles?",
          options: [
            "Only the first",
            "Only the second",
            "Both, and both are correct",
            "Neither — they may not nest",
          ],
          correct: 2,
          why: "One long post with named parts; or \"Latest posts\" holding posts. Both shapes are ordinary." },
        { level: "medium",
          q: "Does putting an h1 inside a section make it behave as a lower-level heading?",
          options: [
            "Yes, since HTML5",
            "Yes, in modern browsers only",
            "Only if the section has an id",
            "No — the algorithm that would have done that was never implemented and was removed",
          ],
          correct: 3,
          why: "It was specified, expected, widely written about, and never built by any browser or screen reader. Heading levels are absolute." },
        { level: "medium",
          q: "What is the cost of wrapping every div in a section \"to be more semantic\"?",
          options: [
            "Slower rendering",
            "Sections nobody can name become noise in the outline, and noise is worse than silence",
            "The page fails validation",
            "CSS selectors stop working",
          ],
          correct: 1,
          why: "A wrong div claims nothing. A wrong section adds an empty entry to the document's structure." },
        { level: "hard",
          q: "\"Ingredients\" inside a recipe: article or section?",
          options: [
            "Article — it is a distinct block of content",
            "Article — it has its own heading",
            "Section — alone in a feed it would be a list of items for nothing",
            "Div — it is only for layout",
          ],
          correct: 2,
          why: "Apply the article test honestly and it fails. It is a named part of something bigger, which is exactly what section means." },
        { level: "hard",
          q: "Why does an h1 inside a section still look smaller in most browsers?",
          options: [
            "Because the outline algorithm is partly implemented",
            "Because sections reduce font size by default",
            "Because screen readers request it",
            "A cosmetic default left over from the abandoned outline idea — the level itself is unchanged",
          ],
          correct: 3,
          why: "And it is what hides the bug: the page looks like a sensible hierarchy while the outline says four top-level headings." },
        { level: "hard",
          q: "You genuinely cannot decide between article, section and div. What is the safe answer?",
          options: [
            "div — a wrong div claims nothing, while a wrong article tells every machine a fragment is a complete work",
            "article — it is the most descriptive",
            "section — it sits between the other two",
            "Use all three nested, so one of them is right",
          ],
          correct: 0,
          why: "Choose the element whose claim you can defend. Silence beats a confident false statement." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 10 — METADATA AND THE HEAD
   *
   * The one module about content nobody ever sees on the page. That is exactly
   * why it is taught late and why it is taught at all: a page can be perfect
   * from the first screen to the footer and still be unreadable on a phone,
   * invisible in search, and ugly the moment anybody shares it — and all three
   * are decided in six lines of <head>.
   *
   * ⚠️ WRITE HEAD PROBLEMS AGAINST A FULL DOCUMENT, AND ASSERT WITH BARE
   * SELECTORS. The browser's DOMParser hoists a stray <meta> or <title> into an
   * implicit <head>; linkedom leaves it where it was. Measured: on the fragment
   * `<meta name="description">…`, `head meta` counts 1 in the browser and 0 in
   * linkedom. Since the workbench grades with DOMParser and submit grades with
   * linkedom, a `head meta[...]` assertion can go green and then be rejected.
   * With an explicit <head> present the two agree 9 of 9 — so the starters here
   * supply the whole skeleton, and every test still uses `meta[name="…"]`
   * rather than `head meta[…]` so the divergence cannot be reached at all.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-metadata",
    order: 26,
    title: "The Head: What the Page Says About Itself",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Make a page readable on a phone with one line",
        "Write a description that a search result will actually use",
        "Point at the canonical version of a page, and say why duplicates happen",
        "Add a favicon and know which files a browser really asks for",
      ] },

      { t: "hook",
        q: "You build a page, test it on your laptop, and open it on a phone. Everything is there and everything is <b>tiny</b> — as if the phone photographed a desktop screen and shrank it. Nothing in your CSS says any of this. What is missing?",
        why: "One line: the viewport meta tag. Without it a phone pretends to be a 980px desktop and then zooms out to fit, which is a workaround invented in 2007 for a web that had no mobile pages. Your page is being treated as one of those." },

      { t: "def",
        term: "Metadata",
        en: "Information about the page rather than in it — read by browsers, search engines and share previews, and never drawn on screen." },

      { t: "analogy",
        concept: "the head",
        real: "the spine and back cover of a book",
        html: "Nobody reads the spine as part of the story, and it decides whether the book is ever picked up: the title on the shelf, the blurb, the category it is filed under, the barcode a machine scans. <code>&lt;head&gt;</code> is all of that for a page — Module 2 called it the envelope, and this is what goes on the envelope." },

      { t: "syntax",
        intro: "The head worth writing on every page you ever make.",
        form: "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\n  <title>Poha Chivda Recipe | Mochi's Kitchen</title>\n  <meta name=\"description\" content=\"A twenty-minute Maharashtrian snack made in one pan.\">\n\n  <link rel=\"canonical\" href=\"https://mochis.example/poha-chivda\">\n  <link rel=\"icon\" href=\"/favicon.svg\" type=\"image/svg+xml\">\n  <link rel=\"stylesheet\" href=\"/css/style.css\">\n</head>",
        parts: [
          { bit: "charset", says: "First, always — Module 2's reason: the browser has to decode bytes into characters before it can read anything else." },
          { bit: "viewport", says: "The line from the hook. <code>width=device-width</code> says \"the page is as wide as this device\", and <code>initial-scale=1</code> says \"do not zoom out\". Nothing responsive works without it." },
          { bit: "<title>", says: "The tab, the bookmark, and the blue line in a search result — the most-read text on the page. Specific first, site name last: a tab shows the beginning." },
          { bit: "description", says: "The grey text under that blue line. Google is not obliged to use it and often does; write it as a sentence for a person, around 150 characters, and never stuff it with keywords." },
          { bit: "canonical", says: "\"This is the real address of this page.\" The fix for one page being reachable at several URLs — with and without a trailing slash, with tracking parameters, printed versions." },
          { bit: "icon", says: "The favicon: the tab icon and the bookmark icon. An SVG scales to every size a browser asks for, which is the reason to prefer one." },
          { bit: "stylesheet", says: "How CSS gets attached. It is a <code>&lt;link&gt;</code> because it points at another file — the same element as the two above it, doing a different job through <code>rel</code>." },
        ],
        note: "Everything here is one line and none of it renders. The whole module is worth about six lines per page, and they decide how the page behaves on a phone, how it appears in search, and what it looks like when somebody shares it.",
      },

      { t: "h2", n: "1", text: "Viewport: the line that makes a page mobile" },
      { t: "p", html: "When the iPhone arrived there were no mobile-friendly pages, so it invented one: pretend the screen is 980 pixels wide, render the desktop page, then shrink the result to fit. It worked, and it is still the default — because a page from 2004 must not break." },
      { t: "p", html: "<code>width=device-width</code> opts out: this page knows what a phone is, so give it the real width. Every media query, every flexible layout and every readable font size on mobile depends on that opt-out having happened." },

      { t: "note", variant: "warn", html: "<b>Do not add <code>user-scalable=no</code> or <code>maximum-scale=1</code>.</b> They appear in copied snippets everywhere and they take pinch-zoom away from the visitor. For anyone with low vision that is not a polish decision — it is the page becoming unusable, and it fails accessibility requirements. There is no good reason for either." },

      { t: "h2", n: "2", text: "Title and description, as a search result" },
      { t: "code", file: "search-result.html", code: "<!-- what you write -->\n<title>Poha Chivda Recipe | Mochi's Kitchen</title>\n<meta name=\"description\" content=\"A twenty-minute Maharashtrian snack made in one pan.\">\n\n<!-- what a search result shows -->\n<!-- Poha Chivda Recipe | Mochi's Kitchen          <- the title, blue -->\n<!-- mochis.example > poha-chivda                 <- the URL -->\n<!-- A twenty-minute Maharashtrian snack made...  <- the description -->", output: "Three lines a stranger uses to decide whether to click." },
      { t: "psoft", html: "Both are cut off if they are long — roughly 60 characters of title and 155 of description, though it varies by device. That is why the <b>specific</b> part goes first: \"Poha Chivda Recipe\" survives the truncation and \"| Mochi's Kitchen\" is the part you can afford to lose." },

      { t: "note", variant: "tip", html: "<b><code>&lt;meta name=\"keywords\"&gt;</code> is dead.</b> Search engines stopped using it decades ago because it was abused within months of being invented. It is still in old tutorials and still copied into new pages; it does nothing at all." },

      { t: "h2", n: "3", text: "Canonical, robots and the favicon" },
      { t: "p", html: "The same page is often reachable at several addresses — <code>/shop</code> and <code>/shop/</code>, with and without <code>?ref=twitter</code>, an <code>m.</code> version. A search engine sees several pages with identical content and has to guess which to rank. <code>canonical</code> removes the guess." },
      { t: "note", variant: "tip", html: "<b><code>&lt;meta name=\"robots\" content=\"noindex\"&gt;</code></b> — keep this page out of search results. Right for a thank-you page or a staging site, and catastrophic left on a live homepage, which happens more than anyone admits.<br><br><b><code>&lt;link rel=\"icon\"&gt;</code></b> — one SVG covers every size. A browser also asks for <code>/favicon.ico</code> at the site root whether you declared one or not, so that 404 in your logs is normal.<br><br><b><code>&lt;meta name=\"theme-color\"&gt;</code></b> — tints the browser chrome on mobile. Small, and it makes a site feel deliberate." },

      { t: "debug",
        intro: "This page is a correct, responsive layout that is unreadable on a phone. Work out why before opening the fix.",
        code: "<head>\n  <meta charset=\"UTF-8\">\n  <title>Mochi's Kitchen</title>\n  <link rel=\"stylesheet\" href=\"/css/style.css\">\n</head>",
        symptom: "On a laptop it is perfect. On a phone the whole page appears zoomed out, text about 4px tall, and every media query behaves as if the screen were 980px wide.",
        q: "The CSS is right and the media queries are right. So what is the phone being told?",
        fix: "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Mochi's Kitchen</title>\n  <link rel=\"stylesheet\" href=\"/css/style.css\">\n</head>",
        why: "Nothing — and that is the problem. With no viewport declaration a phone falls back to its 2007 compatibility behaviour: render at 980px, then scale the whole thing down. The media queries were never wrong; they were being evaluated against 980px, so the mobile rules never matched. <b>One line, and it is the difference between a responsive page and a photograph of one.</b>" },

      { t: "drills", intro: "Write these out. Six lines like these go in every page you will ever build, and not one of them draws anything.", items: [
        { task: "The line that makes a page behave on a phone.", code: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" },
        { task: "A title with the specific part first, so it survives being cut off.", code: "<title>Poha Chivda Recipe | Mochi's Kitchen</title>" },
        { task: "A description written as a sentence for a person.", code: "<meta name=\"description\" content=\"A twenty-minute Maharashtrian snack made in one pan.\">" },
        { task: "A declaration of this page's real address.", code: "<link rel=\"canonical\" href=\"https://mochis.example/poha-chivda\">" },
        { task: "An SVG favicon.", code: "<link rel=\"icon\" href=\"/favicon.svg\" type=\"image/svg+xml\">" },
        { task: "The tag that keeps a staging page out of search results.", code: "<meta name=\"robots\" content=\"noindex\">" },
      ] },

      { t: "mistakes", items: [
        { bad: "<head> with no viewport meta", why: "The phone renders at 980px and zooms out. Every responsive rule you wrote is evaluated against the wrong width.", fix: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" },
        { bad: "content=\"width=device-width, user-scalable=no\"", why: "Removes pinch-zoom. For a low-vision visitor the page simply becomes unreadable, and it fails accessibility requirements.", fix: "content=\"width=device-width, initial-scale=1\"" },
        { bad: "<title>Home</title>", why: "In a search result, a bookmark list and twenty open tabs, \"Home\" identifies nothing.", fix: "<title>Poha Chivda Recipe | Mochi's Kitchen</title>" },
        { bad: "<meta name=\"keywords\" content=\"recipe, snack, poha, indian\">", why: "Ignored by every major search engine for over a decade. Copied from old tutorials, does nothing.", fix: "Delete it, and write a real description instead." },
      ] },

      { t: "recap", items: [
        "<code>viewport</code> is what makes a page mobile — without it a phone renders at 980px",
        "Never <code>user-scalable=no</code>: it takes zoom away from people who need it",
        "<code>title</code> is the most-read text on the page — specific part first",
        "<code>description</code> is the grey line in a search result; write it for a person",
        "<code>canonical</code> names the real address when a page has several",
        "<code>keywords</code> is dead; <code>robots=noindex</code> is powerful and dangerous",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What does the viewport meta tag do?", a: "It tells the browser to lay the page out at the device's real width instead of pretending to be a 980px desktop and scaling down — the compatibility behaviour phones adopted when almost no site had a mobile version. width=device-width plus initial-scale=1 is the whole line, and without it no media query or flexible layout produces what you designed." },
        { level: "medium", q: "What is a canonical link for?", a: "It declares the real URL for a page that is reachable at more than one address — trailing slashes, tracking parameters, print versions, http and https. Without it search engines see near-duplicate pages and have to pick one themselves, splitting whatever ranking signals the page has earned across the copies." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does the viewport meta tag do?",
          options: [
            "Sets the page's maximum width",
            "Tells the browser to lay the page out at the device's real width instead of pretending to be a 980px desktop",
            "Enables media queries",
            "Scales images down on small screens",
          ],
          correct: 1,
          why: "Media queries work either way — they were simply being evaluated against 980px, which is why none of the mobile rules matched." },
        { level: "easy",
          q: "Which of these should never appear in a viewport tag?",
          options: [
            "user-scalable=no",
            "width=device-width",
            "initial-scale=1",
            "The tag itself is optional",
          ],
          correct: 0,
          why: "It takes pinch-zoom away. For a visitor with low vision that is not a polish decision — the page becomes unusable." },
        { level: "easy",
          q: "Where does the text of <code>&lt;meta name=\"description\"&gt;</code> show up?",
          options: [
            "At the top of the page",
            "In the browser tab",
            "In the page's footer",
            "As the grey line under the blue link in a search result",
          ],
          correct: 3,
          why: "A search engine is not obliged to use it and often does. Write it as a sentence for a person, around 150 characters." },
        { level: "easy",
          q: "What is <code>&lt;meta name=\"keywords\"&gt;</code> worth today?",
          options: [
            "It is the main ranking signal",
            "It helps only on smaller search engines",
            "Nothing — every major search engine stopped using it decades ago",
            "It is required for the page to be indexed",
          ],
          correct: 2,
          why: "It was abused within months of being invented. It is still in old tutorials and still copied into new pages." },
        { level: "medium",
          q: "Why does the specific part of a title go first?",
          options: [
            "Because titles are cut off at roughly 60 characters, and the site name is the part you can afford to lose",
            "Because search engines only read the first three words",
            "Because browsers sort tabs alphabetically",
            "Because the title must match the h1",
          ],
          correct: 0,
          why: "A tab shows the beginning, and so does a truncated search result." },
        { level: "medium",
          q: "What problem does <code>rel=\"canonical\"</code> solve?",
          options: [
            "Pages that load slowly",
            "One page reachable at several addresses, which a search engine would otherwise treat as duplicates",
            "Pages that need to be excluded from search",
            "Links that break when a site moves",
          ],
          correct: 1,
          why: "Trailing slashes, tracking parameters, print versions, http and https. Without it, the ranking a page earned is split across its copies." },
        { level: "medium",
          q: "A 404 for <code>/favicon.ico</code> appears in your server logs even though you declared an SVG icon. What is wrong?",
          options: [
            "The SVG declaration is malformed",
            "The icon needs to be in the root folder",
            "Nothing — browsers ask for that path whether you declared one or not",
            "The type attribute is missing",
          ],
          correct: 2,
          why: "Normal, and not worth chasing. One SVG covers every size a browser actually asks you for." },
        { level: "hard",
          q: "A page has perfect responsive CSS and appears zoomed out on a phone with 4px text. What is missing?",
          options: [
            "A charset declaration",
            "A stylesheet link",
            "A canonical link",
            "The viewport meta tag",
          ],
          correct: 3,
          why: "The phone fell back to rendering at 980px and scaling down — the compatibility behaviour invented when almost no site had a mobile version." },
        { level: "hard",
          q: "Which head tag is both powerful and genuinely dangerous?",
          options: [
            "meta charset",
            "meta robots with noindex, which is right on a staging site and catastrophic left on a live homepage",
            "link rel=icon",
            "meta name=keywords",
          ],
          correct: 1,
          why: "It happens more often than anyone admits, and the page simply disappears from search with no error anywhere." },
        { level: "hard",
          q: "Why is charset declared before everything else in the head?",
          options: [
            "Because the title depends on it",
            "Because it is alphabetically first",
            "Because the browser must decode bytes into characters before it can read anything else",
            "Because search engines read only the first tag",
          ],
          correct: 2,
          why: "The same reason Module 2 gave. Declare it late and the browser re-parses what it has already read." },
      ] },
    ],
  },

  {
    slug: "html-social-meta",
    order: 27,
    title: "Link Previews: the Card Your Page Becomes",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Control exactly what appears when your page is shared",
        "Write the five Open Graph tags that matter",
        "Avoid the one-word mistake that silently disables all of them",
        "Say why you cannot test this by looking at your own page",
      ] },

      { t: "hook",
        q: "You paste your site's link into WhatsApp. Somebody else's link becomes a card with a picture, a headline and a line of text. Yours becomes a bare blue URL. Neither of you wrote any code for it. What does the other page have?",
        why: "Four or five lines in its <code>&lt;head&gt;</code>. Every chat app, social network and search preview asks the page what it should look like when shared — and a page that answers nothing gets whatever the crawler can scrape, which is usually a URL and no picture at all." },

      { t: "def",
        term: "Open Graph",
        en: "A small set of meta tags, originally from Facebook and now read by nearly everything, that describe how a page should appear when it is shared." },

      { t: "analogy",
        concept: "Open Graph tags",
        real: "the cover you send when someone asks about your book",
        html: "If you supply nothing, they photograph the spine. If you supply a cover, a title and a one-line pitch, that is what everyone sees. The share card is the first impression for people who never reach your page — and for the ones who decide not to." },

      { t: "syntax",
        intro: "The five that do almost all the work, plus the one line for Twitter's larger card.",
        form: "<meta property=\"og:title\" content=\"Poha Chivda Recipe\">\n<meta property=\"og:description\" content=\"A twenty-minute snack made in one pan.\">\n<meta property=\"og:image\" content=\"https://mochis.example/img/poha-card.jpg\">\n<meta property=\"og:url\" content=\"https://mochis.example/poha-chivda\">\n<meta property=\"og:type\" content=\"article\">\n\n<meta name=\"twitter:card\" content=\"summary_large_image\">",
        parts: [
          { bit: "property", says: "<b>The attribute Open Graph uses — not <code>name</code>.</b> Section 2 is about this and only this, because it is the mistake that quietly turns every tag below it off." },
          { bit: "og:title", says: "The card's headline. It may differ from <code>&lt;title&gt;</code>, and usually should: no site name, no separator, just the thing itself." },
          { bit: "og:description", says: "One line under the headline. Around 60 to 90 characters survive on most apps." },
          { bit: "og:image", says: "The picture. <b>An absolute URL</b> — crawlers do not resolve a relative path here, so <code>/img/card.jpg</code> fetches nothing." },
          { bit: "og:url", says: "The page's canonical address, so shares of the same page with different tracking parameters are counted as one." },
          { bit: "og:type", says: "<code>website</code> for a normal page, <code>article</code> for a post. Rarely more than these two." },
          { bit: "twitter:card", says: "Twitter's own, and it takes <code>name</code> rather than <code>property</code> — the two systems genuinely disagree. <code>summary_large_image</code> gives the wide card instead of the thumbnail." },
        ],
        note: "Make the image about <b>1200 by 630</b>. Every platform crops to its own shape, and that ratio is the one they all crop from acceptably — put nothing important within about 60px of any edge.",
      },

      { t: "h2", n: "1", text: "What happens with none of this" },
      { t: "p", html: "The crawler falls back and guesses: the <code>&lt;title&gt;</code>, then the meta description, then the first image on the page it considers large enough. Sometimes that produces something reasonable. Often it produces your logo, a navigation icon, or nothing — and you find out when a link you cared about is already posted." },

      { t: "h2", n: "2", text: "The one-word mistake" },
      { t: "code", file: "the-mistake.html", code: "<!-- silently ignored: Open Graph uses property, not name -->\n<meta name=\"og:title\" content=\"Poha Chivda Recipe\">\n\n<!-- read correctly -->\n<meta property=\"og:title\" content=\"Poha Chivda Recipe\">\n\n<!-- and Twitter is the other way round, on purpose -->\n<meta name=\"twitter:card\" content=\"summary_large_image\">", output: "Two tags that look interchangeable; one of them does nothing." },
      { t: "psoft", html: "Nothing warns you. The markup is valid, the page renders identically, and the tag is simply not the tag Open Graph is looking for — so the crawler falls back to guessing as if you had written nothing. This is the commonest reason a page \"has Open Graph tags\" and still previews badly." },

      { t: "note", variant: "key", html: "<b>Open Graph uses <code>property=</code>. Twitter uses <code>name=</code>.</b> There is no elegant reason — they come from different specifications that were designed a year apart. Memorise it as a pair, because half the copied snippets on the web get one of them wrong." },

      { t: "h2", n: "3", text: "You cannot test this by looking" },
      { t: "p", html: "Nothing about a share card appears when you open your own page: it only exists inside somebody else's app, built from what their crawler fetched. So you test it with the platforms' own debuggers — Facebook's sharing debugger, Twitter's card validator, LinkedIn's post inspector — each of which shows you exactly what it sees." },
      { t: "note", variant: "warn", html: "<b>Every platform caches the result, sometimes for days.</b> Fix a broken card and the old one keeps appearing, which reads as \"my fix did not work\". It usually did — the debuggers all have a \"scrape again\" button, and that button is the actual fix." },

      { t: "debug",
        intro: "A page's share card arrives with its headline and its description and a blank grey rectangle where the picture should be. The image file exists and loads fine on the page itself. Read the head before opening the fix.",
        code: "<meta property=\"og:title\" content=\"Poha Chivda Recipe\">\n<meta property=\"og:description\" content=\"A twenty-minute snack made in one pan.\">\n<meta property=\"og:image\" content=\"/img/poha-card.jpg\">\n<meta property=\"og:url\" content=\"https://mochis.example/poha-chivda\">",
        symptom: "Headline and description appear correctly on the card. The image area is empty. Opening the same path in a browser shows the picture immediately.",
        q: "Three of these four tags worked, and they are all written the same way. So why is the fourth one the only failure?",
        fix: "<meta property=\"og:title\" content=\"Poha Chivda Recipe\">\n<meta property=\"og:description\" content=\"A twenty-minute snack made in one pan.\">\n<meta property=\"og:image\" content=\"https://mochis.example/img/poha-card.jpg\">\n<meta property=\"og:url\" content=\"https://mochis.example/poha-chivda\">",
        why: "Because the other three carry their whole value in the tag, and this one carries an <b>address</b> — and the thing reading it is not your visitor's browser. It is a crawler on some other company's machine, which has your markup and no notion of where <code>/img/</code> is. A relative path only means anything to something that already knows the page it came from. The rule is narrower than \"use absolute URLs\": inside the page, <code>src=\"/img/poha-card.jpg\"</code> is correct and preferred, exactly as Module 5 taught. It is only in metadata read by other machines that the address has to stand on its own. <b>Then re-scrape it</b> — the platform cached the broken card, often for days, and the old one reappearing is what makes a correct fix look like a failed one." },

      { t: "drills", intro: "Write these out. Watch the attribute name on each — it changes once, on purpose.", items: [
        { task: "The card's headline.", code: "<meta property=\"og:title\" content=\"Poha Chivda Recipe\">" },
        { task: "One line of description under it.", code: "<meta property=\"og:description\" content=\"A twenty-minute snack made in one pan.\">" },
        { task: "The card's picture, as an address a stranger's server can fetch.", code: "<meta property=\"og:image\" content=\"https://mochis.example/img/poha-card.jpg\">" },
        { task: "The page's canonical address, so shares with different tracking parameters count as one.", code: "<meta property=\"og:url\" content=\"https://mochis.example/poha-chivda\">" },
        { task: "Twitter's wide card — and this is the one that takes a different attribute.", code: "<meta name=\"twitter:card\" content=\"summary_large_image\">" },
      ] },

      { t: "mistakes", items: [
        { bad: "<meta name=\"og:title\" content=\"…\">", why: "Open Graph reads property, not name. The tag is valid, ignored, and produces no warning anywhere.", fix: "<meta property=\"og:title\" content=\"…\">" },
        { bad: "<meta property=\"og:image\" content=\"/img/card.jpg\">", why: "A relative path. The crawler is on another machine and does not resolve it — the card comes back with no image.", fix: "<meta property=\"og:image\" content=\"https://site.example/img/card.jpg\">" },
        { bad: "<meta property=\"twitter:card\" content=\"summary\">", why: "Backwards: Twitter's tags use name. The pair is genuinely inconsistent and worth memorising as a pair.", fix: "<meta name=\"twitter:card\" content=\"summary_large_image\">" },
        { bad: "\"I fixed the tags but the old card still shows.\"", why: "The platform cached the previous scrape, often for days.", fix: "Re-scrape it in that platform's own debugger." },
      ] },

      { t: "recap", items: [
        "Share cards are built from <code>&lt;head&gt;</code> tags, not from the page",
        "The five: <code>og:title</code>, <code>og:description</code>, <code>og:image</code>, <code>og:url</code>, <code>og:type</code>",
        "<b>Open Graph uses <code>property=</code>; Twitter uses <code>name=</code></b>",
        "<code>og:image</code> must be an <b>absolute</b> URL — about 1200x630",
        "With no tags the crawler guesses, and usually guesses badly",
        "Test in the platforms' debuggers, and re-scrape after a fix",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What are Open Graph tags for?", a: "They tell any app that unfurls a link — chat apps, social networks, search previews — what the page's share card should say and show: a headline, a line of description, an image and the canonical URL. Without them the crawler falls back to guessing from the title, the meta description and whatever image it finds first." },
        { level: "medium", q: "Why do og:title and twitter:card use different attributes?", a: "Open Graph came from Facebook's specification, which is built on RDFa and therefore uses property. Twitter's card tags were designed separately and use the ordinary name attribute. There is no deeper reason and no way to reconcile them — writing name=\"og:title\" produces a tag that is valid, ignored, and warns you about nothing, which is why it is such a common silent failure." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "Where does a link preview card get its content from?",
          options: [
            "The first paragraph of the page",
            "The largest image on the page",
            "Meta tags in the page's head",
            "The page's URL",
          ],
          correct: 2,
          why: "And a page that answers nothing gets whatever the crawler can scrape, which is usually a bare URL." },
        { level: "easy",
          q: "Which attribute do Open Graph tags use?",
          options: [
            "name",
            "rel",
            "itemprop",
            "property",
          ],
          correct: 3,
          why: "Writing <code>name=\"og:title\"</code> produces a tag that is valid, ignored, and warns about nothing." },
        { level: "easy",
          q: "Which attribute does <code>twitter:card</code> use?",
          options: [
            "name",
            "property",
            "content only",
            "rel",
          ],
          correct: 0,
          why: "Genuinely the other way round from Open Graph, because the two specifications were designed a year apart. Memorise them as a pair." },
        { level: "easy",
          q: "What must <code>og:image</code> contain?",
          options: [
            "A path relative to the page",
            "A full absolute URL",
            "The image's filename",
            "A base64 data URI",
          ],
          correct: 1,
          why: "The crawler is on another company's machine and has no idea where your <code>/img/</code> folder is." },
        { level: "medium",
          q: "Roughly what size should a share image be?",
          options: [
            "320 by 200",
            "640 by 640",
            "As large as possible",
            "About 1200 by 630",
          ],
          correct: 3,
          why: "Every platform crops to its own shape, and that ratio is the one they all crop from acceptably. Keep anything important away from the edges." },
        { level: "medium",
          q: "A page has no Open Graph tags at all. What does the crawler do?",
          options: [
            "Refuses to build a card",
            "Shows only the URL",
            "Guesses — the title, then the meta description, then the first large-enough image it finds",
            "Uses the page's h1 and first paragraph",
          ],
          correct: 2,
          why: "Sometimes reasonable, often your logo or a navigation icon — and you find out once the link is already posted." },
        { level: "medium",
          q: "Why can you not test a share card by opening your own page?",
          options: [
            "The tags are hidden by the browser",
            "The card only exists inside another app, built from what that app's crawler fetched",
            "Cards are generated by JavaScript",
            "You need to be logged in to the platform",
          ],
          correct: 1,
          why: "Which is why every platform ships its own debugger showing exactly what it sees." },
        { level: "hard",
          q: "You fix a broken card and the old one keeps appearing. What is happening?",
          options: [
            "The platform cached the previous scrape, sometimes for days",
            "The fix was wrong",
            "The tags need to be in a different order",
            "The page needs to be redeployed",
          ],
          correct: 0,
          why: "It reads as \"my fix did not work\". The debugger's \"scrape again\" button is the actual fix." },
        { level: "hard",
          q: "A card shows its headline and description but no picture, and the image loads fine on the page. What is the likeliest cause?",
          options: [
            "The image is too large",
            "The image is the wrong format",
            "og:image holds a relative path, which the crawler cannot resolve",
            "og:image must come before og:title",
          ],
          correct: 2,
          why: "The tags that carry their whole value worked. The one that carries an <b>address</b> is the one that needed to stand on its own." },
        { level: "hard",
          q: "Module 5 said to prefer root-relative paths like <code>/img-lab/cat.svg</code>. Why is that not the rule here?",
          options: [
            "Because meta tags cannot contain slashes",
            "Because Open Graph predates relative paths",
            "Because share images live on a different server",
            "Because inside the page the browser knows where the path came from, and a crawler reading your metadata does not",
          ],
          correct: 3,
          why: "The rule is narrower than \"always use absolute URLs\" — it applies to addresses read by other machines, not to the page's own markup." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 11 — ENTITIES AND SPECIAL CHARACTERS
   *
   * A small module that removes a specific kind of stuck. Every beginner who
   * tries to write ABOUT html on a page hits it — the tag vanishes, or the
   * page fills with &amp;lt; — and neither symptom explains itself.
   *
   * ⚠️ TWO THINGS IN HERE CANNOT BE GRADED, and both were checked before the
   * problems were written rather than after:
   *
   *   &nbsp; — the grader normalises text with /\s+/g, and JavaScript's \s
   *   MATCHES U+00A0. So "1&nbsp;000" and "1 000" are identical by the time any
   *   assertion sees them. Measured in both engines.
   *
   *   & versus &amp; inside an href — the parser decodes the entity, and a bare
   *   ampersand stays an ampersand, so both spellings produce exactly "?a=1&b=2"
   *   in the DOM. Nothing downstream can tell them apart.
   *
   * Both are taught here and neither is set as an exercise. This is the same
   * rule Module 2 wrote down: only set an exercise on something that changes
   * the parsed tree.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-entities",
    order: 28,
    title: "Characters That Mean Something Else",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Write about HTML <b>in</b> HTML without the page eating it",
        "Name the characters that must be escaped, and say why each one",
        "Read a numeric entity as well as a named one",
        "Recognise the double-escape bug on sight",
      ] },

      { t: "hook",
        q: "You write a paragraph explaining the paragraph element: <code>Use the &lt;p&gt; element for text.</code> The page shows \"Use the\" and then <b>nothing</b> — the rest of the sentence has disappeared. Where did it go?",
        why: "Nowhere. The browser read <code>&lt;p&gt;</code> as the start of a paragraph, exactly as you told it to, and \"element for text\" is now inside that new paragraph. You meant to show the characters; the browser took them as markup — and it has no way to know the difference unless you say so." },

      { t: "def",
        term: "Character entity",
        en: "A code that stands in for a character the browser would otherwise read as markup — or one that is hard to type." },

      { t: "analogy",
        concept: "escaping",
        real: "quoting someone who is shouting",
        html: "Writing <i>she said \"stop\"</i> needs the quotation marks to be visibly not yours. Programming languages have the same problem and solve it the same way: some characters do a job, so when you mean the character itself rather than the job, you have to mark it. <code>&amp;lt;</code> is you saying \"a less-than sign, not the start of a tag\"." },

      { t: "syntax",
        intro: "Every entity has the same three parts, and the semicolon is not optional.",
        form: "&name;      &lt;      less-than sign\n&#number;   &#60;     the same character, by its number\n&#xhex;     &#x3C;     the same number, in hexadecimal",
        parts: [
          { bit: "&", says: "Starts an entity. Which is exactly why the ampersand itself has to be escaped — it is the character that begins the escape." },
          { bit: ";", says: "Ends it. Leave it off and browsers often still guess correctly, which is worse than failing: the habit survives until the one case where the guess is wrong." },
          { bit: "&#number;", says: "The character's Unicode number in decimal. Works for every character there is, including ones with no name." },
          { bit: "&#xhex;", says: "The same number written in hexadecimal — the form you will see in specifications and CSS." },
        ],
        note: "Named entities exist for a few hundred characters; numeric ones exist for all of them. Prefer the name when there is one — <code>&amp;copy;</code> is readable and <code>&amp;#169;</code> is a lookup.",
      },

      { t: "h2", n: "1", text: "The five that matter" },
      { t: "note", variant: "key", html: "<b><code>&amp;lt;</code></b> → <b>&lt;</b> — starts a tag, so it must be escaped in text.<br><b><code>&amp;gt;</code></b> → <b>&gt;</b> — ends one. Less dangerous alone, escaped for symmetry and safety.<br><b><code>&amp;amp;</code></b> → <b>&amp;</b> — starts an entity, so it must escape itself.<br><b><code>&amp;quot;</code></b> → <b>\"</b> — needed <i>inside</i> a double-quoted attribute value.<br><b><code>&amp;apos;</code></b> → <b>'</b> — the same, inside a single-quoted one.<br><br>In ordinary text you only really need the first three. In attribute values you need whichever quote you used to open the value." },

      { t: "code", file: "escaped.html", code: "<p>Use the &lt;p&gt; element for text.</p>\n<p>Tom &amp; Jerry</p>\n<p>5 &lt; 10 and 10 &gt; 5</p>\n<a href=\"/x\" title=\"She said &quot;hello&quot;\">link</a>", output: "Four lines showing the characters themselves: a paragraph tag, an ampersand, a less-than and a greater-than sign, and a link whose tooltip contains real quotation marks." },
      { t: "psoft", html: "Press <b>Try it yourself</b> and change the first line's <code>&amp;lt;p&amp;gt;</code> back to a plain <code>&lt;p&gt;</code>. The sentence breaks apart in the preview exactly as the hook described — which is the fastest way to believe any of this." },

      { t: "h2", n: "2", text: "Showing code on a page" },
      { t: "p", html: "This is where escaping stops being trivia. Every tutorial, every documentation page, every blog post with a snippet in it — including every code block in this course — is markup <b>about</b> markup, and all of it is escaped." },
      { t: "code", file: "docs.html", code: "<pre><code>&lt;h1&gt;Title&lt;/h1&gt;\n&lt;p&gt;A paragraph&lt;/p&gt;</code></pre>", output: "A code block showing the two tags as text, on two lines." },
      { t: "psoft", html: "<code>&lt;pre&gt;</code> preserves the line break and <code>&lt;code&gt;</code> says it is code — both from Module 3 — and the escaping is what stops the browser rendering the example instead of displaying it. Three separate ideas, and a code block needs all three." },

      { t: "h2", n: "3", text: "The double-escape bug" },
      { t: "p", html: "The mirror-image mistake, and the more confusing one: the page displays <code>&amp;lt;p&amp;gt;</code> literally, entity and all. It means the ampersand itself got escaped — the source says <code>&amp;amp;lt;</code>, so the browser correctly renders an ampersand followed by <code>lt;</code>." },
      { t: "note", variant: "warn", html: "<b>Escaped text that is escaped again is the commonest bug in any system that generates HTML.</b> A template escapes the value, then a second layer escapes it once more, and the page fills with <code>&amp;amp;</code>. The symptom is unmistakable once you have seen it: <b>visible entity codes on the page</b>. Working out which layer did it twice is the actual job." },

      { t: "debug",
        intro: "Two lines of a tutorial page, each broken the opposite way. Work out both before opening the fix.",
        code: "<p>Use the <strong> element for importance.</p>\n<p>To show a tag, write &amp;lt;p&amp;gt; in your source.</p>",
        symptom: "The first line reads \"Use the\" and then the rest of the page turns bold. The second line displays &lt;p&gt; on screen, entity codes and all, instead of showing a tag.",
        q: "One line escaped nothing and one escaped twice. Which is which?",
        fix: "<p>Use the &lt;strong&gt; element for importance.</p>\n<p>To show a tag, write &lt;p&gt; in your source.</p>",
        why: "The first line typed a real tag where it meant to show one, so the browser opened a <code>&lt;strong&gt;</code> that nothing ever closes — and everything after it inherits the bold. The second escaped the ampersand of an entity that was already correct, so <code>&amp;amp;lt;</code> renders as the four characters <code>&amp;lt;</code>. <b>Both look like typos and neither is: each one is a decision about whether these characters are markup or content, made wrongly in opposite directions.</b>" },

      { t: "drills", intro: "Write the source that would display each of these.", items: [
        { task: "The text: 5 < 10", code: "<p>5 &lt; 10</p>" },
        { task: "The text: Tom & Jerry", code: "<p>Tom &amp; Jerry</p>" },
        { task: "The text: <br> is an empty element", code: "<p>&lt;br&gt; is an empty element</p>" },
        { task: "A title attribute containing double quotes.", code: "<a href=\"/x\" title=\"She said &quot;hi&quot;\">link</a>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<p>Use the <p> element</p>", why: "A real tag where the text was meant. The browser opens a paragraph and the sentence falls apart.", fix: "<p>Use the &lt;p&gt; element</p>" },
        { bad: "<p>Tom & Jerry &amp; friends</p>", why: "Inconsistent, and the bare ampersand only works because browsers are forgiving. The moment it is followed by a word that looks like an entity name, it stops.", fix: "<p>Tom &amp; Jerry &amp; friends</p>" },
        { bad: "&amp;lt;p&amp;gt; — meaning to show <p>", why: "Escaped twice. The page displays the entity code instead of the character.", fix: "&lt;p&gt;" },
        { bad: "&lt p &gt", why: "No semicolons. Browsers guess, sometimes correctly, and the habit fails on the day the guess is wrong.", fix: "&lt;p&gt;" },
      ] },

      { t: "recap", items: [
        "<code>&amp;lt;</code> <code>&amp;gt;</code> <code>&amp;amp;</code> are the three that matter in text",
        "<code>&amp;quot;</code> / <code>&amp;apos;</code> matter inside an attribute value",
        "<code>&amp;</code> must escape itself, because it is what starts an entity",
        "Named for readability, numeric (<code>&amp;#60;</code>) when there is no name",
        "The semicolon is part of the entity — always write it",
        "Entity codes <b>visible on the page</b> means something escaped twice",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "Why do you need character entities in HTML?", a: "Because a few characters already have a job. A less-than sign starts a tag and an ampersand starts an entity, so writing them literally in text makes the browser act on them instead of displaying them. &lt; and &amp; say \"I mean the character, not the job\" — which is why every page that shows code on screen is escaped." },
        { level: "medium", q: "A page is displaying &amp;lt;p&amp;gt; on screen instead of a tag. What happened?", a: "Something escaped the text twice. The source contains &amp;amp;lt;, so the browser renders an ampersand followed by lt; — exactly what it was told. It is nearly always two layers of a system both escaping the same value: a template escaping output that was already escaped when it was stored." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "Why can you not simply type a less-than sign in HTML text?",
          options: [
            "It is not part of UTF-8",
            "It already has a job — it starts a tag, so the browser acts on it instead of showing it",
            "Browsers render it as a space",
            "It must be uppercase",
          ],
          correct: 1,
          why: "An entity is how you say \"I mean the character, not the job\"." },
        { level: "easy",
          q: "Which entity produces an ampersand?",
          options: [
            "&num;",
            "&and;",
            "&amp;",
            "&ampersand;",
          ],
          correct: 2,
          why: "The ampersand has to escape itself, because it is the character that starts every entity." },
        { level: "easy",
          q: "Which character ends an entity?",
          options: [
            "A semicolon",
            "A space",
            "A closing angle bracket",
            "Nothing — it ends at the next character",
          ],
          correct: 0,
          why: "Browsers sometimes guess without it. The habit fails on the day the guess is wrong." },
        { level: "easy",
          q: "Which entity matters most <b>inside</b> an attribute value?",
          options: [
            "&nbsp;",
            "&copy;",
            "&mdash;",
            "&quot; — for the quote character that opened the value",
          ],
          correct: 3,
          why: "Otherwise the value ends early, at the quote you meant as content." },
        { level: "medium",
          q: "A page shows the literal text <code>&amp;lt;p&amp;gt;</code> on screen. What happened?",
          options: [
            "The semicolons are missing",
            "The browser does not support that entity",
            "The character encoding is wrong",
            "Something escaped the text twice",
          ],
          correct: 3,
          why: "The source holds <code>&amp;amp;lt;</code>, so the browser renders an ampersand followed by <code>lt;</code> — exactly what it was told. Usually two layers both escaping the same value." },
        { level: "medium",
          q: "You want the page to display the text <code>5 &lt; 10</code>. What do you write in your source?",
          options: [
            "5 &lt; 10",
            "5 < 10",
            "5 &amp;lt; 10",
            "5 &lt 10",
          ],
          correct: 0,
          why: "The second is the character doing its job instead of being shown; the third is escaped twice and displays the entity code; the fourth has no semicolon, so the browser is left guessing where it ends." },
        { level: "medium",
          q: "<code>&lt;p&gt;Tom &amp; Jerry&lt;/p&gt;</code> displays correctly in your browser. Why write <code>&amp;amp;</code> anyway?",
          options: [
            "Because the bare version is slower to parse",
            "Because screen readers skip bare ampersands",
            "Because it works only through the parser's forgiveness, and stops when the next word looks like an entity name",
            "Because it is invalid and will not validate",
          ],
          correct: 2,
          why: "\"Tom & Jerry\" survives; \"AT&T\" and \"Tom &amp;copy Jerry\" are where the forgiveness runs out." },
        { level: "hard",
          q: "Why do numeric entities such as <code>&amp;#60;</code> exist alongside named ones?",
          options: [
            "They are faster to parse",
            "They are required inside attributes",
            "Named entities are deprecated",
            "Because not every character has a name, and the number always works",
          ],
          correct: 3,
          why: "Named for readability where a name exists; numeric as the universal fallback." },
        { level: "hard",
          q: "Which of these is <b>not</b> a reason a page ends up showing entity codes to the reader?",
          options: [
            "A template escaping a value that was already escaped when it was stored",
            "Content pasted from another system that escaped it on the way out",
            "An author writing &amp;amp;lt; by hand while meaning &amp;lt;",
            "The page declaring the wrong character encoding",
          ],
          correct: 3,
          why: "A wrong encoding produces mangled accented characters, not visible entity codes. Double-escaping is a layering problem, not an encoding one." },
        { level: "hard",
          q: "In <code>&lt;a href=\"/x\" title=\"She said &amp;quot;hi&amp;quot;\"&gt;</code>, what breaks if the entities are removed?",
          options: [
            "Nothing — attributes may contain quotes",
            "The title attribute ends at the first inner quote, and the rest is parsed as more attributes",
            "The link stops working",
            "The quotes render as curly quotes",
          ],
          correct: 1,
          why: "The parser cannot tell a quote you meant as content from the quote that closes the value. That is the entire reason the entity exists." },
      ] },
    ],
  },

  {
    slug: "html-symbols",
    order: 29,
    title: "Symbols, Spaces and Emoji",
    minutes: 14,
    content: [
      { t: "objectives", items: [
        "Put ©, ₹, → and — on a page the modern way",
        "Use a non-breaking space where it belongs, and nowhere else",
        "Choose the right dash and the right quotation marks",
        "Know what a screen reader does with a row of emoji",
      ] },

      { t: "hook",
        q: "Every list of HTML entities has hundreds of rows — <code>&amp;copy;</code>, <code>&amp;rarr;</code>, <code>&amp;hellip;</code>, page after page. How many of them do you actually need to memorise in 2026?",
        why: "About five, and they are the ones from the last lesson. Everything else you can simply <b>type</b> — because Module 2's <code>&lt;meta charset=\"UTF-8\"&gt;</code> means your file can hold any character there is. Those hundreds of rows are a survival from when it could not." },

      { t: "def",
        term: "UTF-8",
        en: "The character encoding that covers every writing system, symbol and emoji in one scheme — and what your pages already declare." },

      { t: "h2", n: "1", text: "Type it, do not encode it" },
      { t: "p", html: "With UTF-8 declared, <code>©</code> in your file is <code>©</code> on the page. The entity <code>&amp;copy;</code> produces exactly the same character and is harder to read in the source. The rule is simple: <b>escape the characters that are markup; type everything else.</b>" },

      { t: "code", file: "symbols.html", code: "<p>&copy; 2026 Mochi's Kitchen</p>\n<p>Price: ₹499 &mdash; down from ₹699</p>\n<p>Delhi &rarr; Mumbai &times; 2 flights</p>\n\n<p>© 2026 Mochi's Kitchen</p>\n<p>Price: ₹499 — down from ₹699</p>\n<p>Delhi → Mumbai × 2 flights</p>", output: "Two identical sets of three lines. The second set is what you would write today." },
      { t: "psoft", html: "Both halves render the same. The entities are worth <b>recognising</b> — you will meet them in code written by other people and in older documents — and worth <b>writing</b> only when a character is invisible or ambiguous, which is the next section." },

      { t: "h2", n: "2", text: "The space that refuses to break" },
      { t: "p", html: "<code>&amp;nbsp;</code> is a space with two special properties: a line will never wrap at it, and it never collapses. Module 3's rule was that HTML squashes any run of whitespace into one space — this is the exception, and it is the one entity you still write by hand every week." },

      { t: "note", variant: "tip", html: "<b>Use it where a break would look wrong or read wrong:</b><br>• <code>10&amp;nbsp;km</code> — the number and its unit belong on one line<br>• <code>₹&amp;nbsp;500</code>, <code>Mr&amp;nbsp;Sharma</code>, <code>Figure&amp;nbsp;3</code><br>• between the last two words of a heading, so one word cannot be left alone on its own line" },
      { t: "note", variant: "warn", html: "<b>And do not use it for spacing.</b> Five <code>&amp;nbsp;</code>s to push something across is the same mistake as three <code>&lt;br&gt;</code>s to push something down: it puts fake content in the text, a screen reader reads through it, and CSS does the job properly in one line. <b>Spacing is layout, not content</b> — the same sentence Module 3 ended on." },

      { t: "h2", n: "3", text: "Dashes and quotation marks" },
      { t: "note", variant: "tip", html: "<b>Hyphen -</b> joins words: <code>well-known</code>.<br><b>En dash –</b> spans a range: <code>2020–2026</code>, <code>Mumbai–Delhi</code>.<br><b>Em dash —</b> breaks a sentence — like this.<br><b>Curly quotes “ ” ‘ ’</b> are the typographic ones; the straight <code>\"</code> and <code>'</code> on your keyboard are a typewriter compromise nobody has to keep.<br><br>None of these need entities. Type them, or let your editor do it." },
      { t: "p", html: "One caution worth the sentence: <b>never let curly quotes into code</b>. An editor that helpfully converts <code>\"text\"</code> to <code>“text”</code> inside an attribute produces markup that does not work, and the character looks almost identical at normal size — which is a genuinely miserable half hour." },

      { t: "h2", n: "4", text: "Emoji are text, and they are read aloud" },
      { t: "p", html: "An emoji is an ordinary character, so it works with no entity and no image. What beginners do not expect is that each one has a <b>name</b>, and a screen reader speaks it: 🎉 is announced as \"party popper\", 🔥 as \"fire\"." },
      { t: "note", variant: "key", html: "<b>Five emoji in a row are read as five names, in full, one after another.</b> \"Fire fire fire fire fire.\" Used as punctuation that is noise; used as content — a 🎉 next to a result — it is information, and it needs no extra markup. The test is the same as everywhere else in this course: <b>would you want this read out?</b>" },

      { t: "debug",
        intro: "A navigation link 404s at an address nobody typed. The path is spelt correctly and the file is definitely there. Look very closely at the markup before opening the fix.",
        code: "<a href=“/about”>About us</a>",
        symptom: "Clicking it asks the server for a path with two odd curly characters wrapped around it, and gets a 404. Copying the path out of the markup and pasting it into the address bar works perfectly.",
        q: "The path between the quotes is right, and pasting it by hand works. So what is the browser adding?",
        fix: "<a href=\"/about\">About us</a>",
        why: "Nothing — it is reading exactly what is there. Those are <b>curly quotes</b>, and to the parser they are not quotation marks at all; they are ordinary characters, no different from letters. So the value was never quoted, and the attribute picked up the run of characters up to the next space — the opening curly quote, the path, and the closing curly quote, all as part of the address. Checked in a real browser: <code>href</code> comes back as the six-character-longer string with both curly marks inside it. Some editor or document turned your straight quotes into typographic ones on the way in, which is a service everywhere except in code, and at normal size the two characters look nearly identical. <b>Curly quotes belong in prose and never in markup.</b>" },

      { t: "drills", intro: "Write these out. Most of them are just typing, and knowing that is the lesson.", items: [
        { task: "A copyright line for 2026, without using an entity.", code: "<p>© 2026 Mochi's Kitchen</p>" },
        { task: "A distance where the number and its unit must not be split across lines.", code: "<p>The flight is 500&nbsp;km long.</p>" },
        { task: "A range of years using the correct dash.", code: "<p>Open 2020–2026</p>" },
        { task: "A sentence interrupted by the dash that interrupts.", code: "<p>The price is fixed — and it includes delivery.</p>" },
        { task: "A result line where one emoji carries meaning rather than decorating.", code: "<p>All tests passed 🎉</p>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<p>Total:&nbsp;&nbsp;&nbsp;&nbsp;₹500</p>", why: "Non-breaking spaces used as layout. It is fake content in the text, and a screen reader reads through it.", fix: "<p>Total: <span class=\"amount\">₹500</span></p> with CSS spacing." },
        { bad: "<p>The flight is 500 km long.</p>", why: "Not wrong, and \"500\" can end a line with \"km\" starting the next one.", fix: "<p>The flight is 500&nbsp;km long.</p>" },
        { bad: "<a href=“/about”>About</a>", why: "Curly quotes in markup. They are not quotation marks to the parser, so the attribute is broken — and at normal size the difference is nearly invisible.", fix: "<a href=\"/about\">About</a>" },
        { bad: "<h2>New! 🔥🔥🔥 Sale 🎉🎉</h2>", why: "Announced as \"fire fire fire party popper party popper\". Emoji as punctuation becomes noise the moment it is read rather than seen.", fix: "<h2>Sale 🎉</h2>" },
      ] },

      { t: "recap", items: [
        "With UTF-8 you can <b>type</b> ©, ₹, →, — directly; entities are for markup characters",
        "Recognise the named ones — you will read them in other people's code",
        "<code>&amp;nbsp;</code> never wraps and never collapses: <code>10&amp;nbsp;km</code>, <code>Mr&amp;nbsp;Sharma</code>",
        "Never use <code>&amp;nbsp;</code> for spacing — that is CSS's job",
        "Hyphen joins, en dash spans, em dash interrupts",
        "Curly quotes belong in prose and <b>never</b> in markup",
        "Emoji are read aloud by name — one carries meaning, five are noise",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "When do you actually need HTML entities today?", a: "For the characters that are markup — &lt;, &gt; and &amp; — and inside an attribute for whichever quote opened it. Everything else can be typed directly, because the page declares UTF-8 and the file can hold any character. The long entity tables are a survival from when encodings could not be relied on." },
        { level: "medium", q: "What is a non-breaking space for?", a: "A space that will not wrap and will not collapse, so two things stay on the same line: a number and its unit, a title and a name, a figure and its number. It is the one entity still written by hand routinely. What it is not for is spacing — pushing content across with several of them puts fake content into the text, and a screen reader reads straight through it." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "With UTF-8 declared, how should you put a © on a page?",
          options: [
            "Type the character directly",
            "Always use &copy;",
            "Use an image",
            "Use a numeric entity",
          ],
          correct: 0,
          why: "Escape the characters that are markup; type everything else. The long entity tables survive from when files could not hold every character." },
        { level: "easy",
          q: "What are the two special properties of a non-breaking space?",
          options: [
            "It is wider, and it is invisible to CSS",
            "It is read aloud, and it cannot be selected",
            "It is ignored by search engines, and it is faster",
            "A line never wraps at it, and it never collapses",
          ],
          correct: 3,
          why: "It is the one exception to Module 3's rule that any run of whitespace squashes down to a single space." },
        { level: "easy",
          q: "Which dash spans a range, as in 2020–2026?",
          options: [
            "The hyphen",
            "The em dash",
            "The en dash",
            "The minus sign",
          ],
          correct: 2,
          why: "Hyphen joins words, en dash spans a range, em dash interrupts a sentence." },
        { level: "easy",
          q: "What does a screen reader do with an emoji?",
          options: [
            "Skips it",
            "Speaks its name — 🎉 is announced as \"party popper\"",
            "Announces it as an image",
            "Reads its numeric code",
          ],
          correct: 1,
          why: "Which is why five in a row are five full names, one after another." },
        { level: "medium",
          q: "Where does <code>&amp;nbsp;</code> genuinely belong?",
          options: [
            "Between paragraphs, to add space",
            "At the start of an indented line",
            "Anywhere you want a wider gap",
            "Between a number and its unit, as in 10&amp;nbsp;km",
          ],
          correct: 3,
          why: "Also between a title and a name, and between the last two words of a heading so one word is not left alone on a line." },
        { level: "medium",
          q: "Why is using several non-breaking spaces to push content across wrong?",
          options: [
            "It is fake content in the text, and a screen reader reads straight through it",
            "It is invalid HTML",
            "Browsers collapse them anyway",
            "It only works in some fonts",
          ],
          correct: 0,
          why: "The same mistake as three line breaks to make a vertical gap. Spacing is layout, and layout is CSS." },
        { level: "medium",
          q: "An editor converts your straight quotes to curly ones inside an attribute. What happens?",
          options: [
            "Nothing — both are valid quote characters",
            "The attribute breaks, because to the parser curly quotes are ordinary characters and not quotation marks at all",
            "The page fails to load",
            "The attribute value is escaped automatically",
          ],
          correct: 1,
          why: "The value was never quoted, so the attribute swallows the curly marks along with the path — and at normal size the two characters look almost identical." },
        { level: "hard",
          q: "How many entities does a modern page genuinely need to memorise?",
          options: [
            "All of the named ones",
            "About fifty",
            "None at all",
            "About five — the markup characters, plus the quote inside an attribute",
          ],
          correct: 3,
          why: "The rest are worth <b>recognising</b>, because you will read them in other people's code and in older documents." },
        { level: "hard",
          q: "Which emoji use passes the test this course applies everywhere?",
          options: [
            "🔥🔥🔥 after a heading, for emphasis",
            "A row of emoji used as a separator between sections",
            "A single 🎉 beside a result the reader has just earned",
            "Emoji replacing the words in a navigation menu",
          ],
          correct: 2,
          why: "The test is: would you want this read out? One carries information. The others are punctuation, and punctuation read aloud is noise." },
        { level: "hard",
          q: "Why does this lesson say entities are still worth <b>recognising</b> even though you rarely write them?",
          options: [
            "Because validators require them",
            "Because they are faster than typed characters",
            "Because you will meet them constantly in other people's code and in older documents",
            "Because search engines index them differently",
          ],
          correct: 2,
          why: "Reading is the skill here, not writing. <code>&amp;mdash;</code> in someone else's markup should not stop you." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 12 — ACCESSIBILITY
   *
   * The module that mostly COLLECTS. Every earlier module made an accessibility
   * argument without naming it — alt text, labels, landmarks, heading levels,
   * a list's count, a table's scope, the words inside a link — so lesson 30
   * spends its first section handing those back as receipts. A student who has
   * followed the course has already been doing this; what they have not had is
   * the name, the model, and the keyboard.
   *
   * The second lesson is ARIA, and it is deliberately mostly a warning. The
   * dangerous thing about ARIA is that it changes what a page CLAIMS without
   * changing what it DOES, so a beginner who reaches for it usually makes the
   * page worse — a div that announces itself as a button and still cannot be
   * focused or pressed is a lie the previous version was not telling.
   *
   * Parser parity checked before writing: 13 of 13 identical across aria-*,
   * role, tabindex, onclick and the skip-link/main pairing — and `role` is
   * case-SENSITIVE in both engines, unlike `type`/`method`/`scope`.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-accessibility",
    order: 30,
    title: "Accessibility: What You Have Been Doing All Along",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Say who accessibility is for, and get the answer right",
        "Operate a page with the keyboard alone, and fix what you cannot reach",
        "Explain what a <code>&lt;div&gt;</code> pretending to be a button actually loses",
        "Use <code>tabindex</code> correctly — which mostly means barely",
      ] },

      { t: "hook",
        q: "Unplug your mouse. Now buy something on your own site — reach the menu, open the product, fill the form, press the button. Most developers cannot finish. What broke?",
        why: "Almost always the same thing: something that <b>looks</b> like a control is a <code>&lt;div&gt;</code>. It cannot be reached with Tab, it does not respond to Enter, and nothing announces it as a control — so the page works perfectly for a mouse and stops dead for everyone else." },

      { t: "def",
        term: "Accessibility",
        en: "Building so that the page works for people who are not using it the way you are — with a keyboard, a screen reader, a magnifier, one hand, or a phone in the sun." },

      { t: "h2", n: "1", text: "Who this is for" },
      { t: "p", html: "The usual mental picture is a blind user with a screen reader, and that is one group of many. The one worth carrying instead is this: <b>permanent, temporary, situational</b>. A person with one arm, a person with a broken arm, a person holding a baby — all three need the same one-handed page." },
      { t: "note", variant: "key", html: "<b>Situational is the category that changes people's minds, because it is everybody.</b> Bright sunlight is low vision. A noisy train is deafness. A cracked screen, a slow connection, a hand holding a bag on the metro. You have used your own site under at least three of these this month, and every fix in this module helped you." },

      { t: "h2", n: "2", text: "The receipts: you have been doing this since Module 2" },
      { t: "note", variant: "tip", html: "<b>Module 2</b> — the right element, because CSS cannot restore meaning.<br><b>Module 3</b> — heading levels as the page's outline, which is a menu a screen reader user navigates by.<br><b>Module 4</b> — link text that names its destination, because links are read out of context.<br><b>Module 5</b> — <code>alt</code>, and <code>alt=\"\"</code> for decoration.<br><b>Module 6</b> — a real list, so its count is announced.<br><b>Module 7</b> — <code>th</code> and <code>scope</code>, so a number is read with its labels.<br><b>Module 8</b> — a label per field, and <code>fieldset</code> for the group's question.<br><b>Module 9</b> — landmarks, so the whole menu can be skipped.<br><br><b>None of that was framed as accessibility, and all of it was.</b> This module adds the part that was missing: the keyboard." },

      { t: "h2", n: "3", text: "Everything interactive must work from the keyboard" },
      { t: "p", html: "Tab moves forward, Shift+Tab back, Enter activates a link or button, Space presses a button and scrolls the page, Escape closes things. That is the whole vocabulary — and the rule is that <b>anything a mouse can do, the keyboard must be able to do too</b>." },
      { t: "p", html: "The good news is how little work this is when you use real elements. <code>&lt;a&gt;</code>, <code>&lt;button&gt;</code>, <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code> and <code>&lt;textarea&gt;</code> are focusable, operable and announced — for free, in every browser, forever." },

      { t: "syntax",
        intro: "What you get from a real button, and what a styled div is missing.",
        form: "<button>Send</button>\n\n<div class=\"btn\" onclick=\"send()\">Send</div>",
        parts: [
          { bit: "<button>", says: "Focusable with Tab. Fires on Enter <b>and</b> Space. Announced as \"Send, button\". Supports <code>disabled</code>. Works before any of your CSS or JavaScript has loaded." },
          { bit: "<div", says: "None of the above. It is a box with a click handler: unreachable by Tab, silent to a screen reader, dead to Enter — and it looks identical, which is why it ships." },
        ],
        note: "You can bolt the missing pieces onto a div with <code>tabindex</code>, key handlers and a role, and people do. It is four things to get right, in every browser, instead of one element that already does them.",
      },

      { t: "h2", n: "4", text: "tabindex, in three values" },
      { t: "note", variant: "tip", html: "<b><code>tabindex=\"0\"</code></b> — put this in the natural tab order, where it sits in the source. The only value you will use often.<br><b><code>tabindex=\"-1\"</code></b> — focusable by script but not by Tab. For a dialog you move focus into, or a target you jump to.<br><b><code>tabindex=\"3\"</code></b> and any positive number — <b>never.</b> It jumps to the front of the tab order for the whole page, so the sequence stops matching what is on screen and every later addition makes it worse." },
      { t: "p", html: "The rule underneath: <b>tab order follows source order</b>. If the tab sequence feels wrong, the markup is usually in the wrong order — and moving the element is the fix, not a number." },

      { t: "h2", n: "5", text: "Two lines that help everybody" },
      { t: "code", file: "a11y-basics.html", code: "<html lang=\"en\">\n<body>\n  <a href=\"#main\" class=\"skip\">Skip to content</a>\n\n  <header>\n    <nav><!-- forty links --></nav>\n  </header>\n\n  <main id=\"main\">\n    <h1>Poha Chivda</h1>\n  </main>\n</body>\n</html>", output: "A normal page with one extra link at the very top." },
      { t: "psoft", html: "The <b>skip link</b> is the first focusable thing on the page and is usually hidden until focused. Without it a keyboard user tabs through the entire menu on every page they visit. <b><code>lang=\"en\"</code></b> is the other one-liner: it tells a screen reader which language to pronounce, and a French page read with English pronunciation is genuinely unintelligible." },

      { t: "drills", intro: "Write these out, then do the real drill: put your mouse out of reach and Tab through what you built.", items: [
        { task: "A control that submits an order — the element, not a lookalike.", code: "<button type=\"submit\">Pay now</button>" },
        { task: "Repair this: <code>&lt;div class=\"btn\" onclick=\"send()\"&gt;Send&lt;/div&gt;</code>", code: "<button onclick=\"send()\">Send</button>" },
        { task: "A skip link and the landmark it points at.", code: "<a href=\"#main\" class=\"skip\">Skip to content</a>\n\n<main id=\"main\">\n  <h1>Poha Chivda</h1>\n</main>" },
        { task: "The root element of an English page.", code: "<html lang=\"en\">" },
        { task: "Remove what is wrong here without adding anything: <code>&lt;ul tabindex=\"3\"&gt;&lt;li&gt;&lt;a href=\"/terms\"&gt;Terms&lt;/a&gt;&lt;/li&gt;&lt;/ul&gt;</code>", code: "<ul>\n  <li><a href=\"/terms\">Terms</a></li>\n</ul>" },
      ] },

      { t: "debug",
        intro: "This checkout page works perfectly with a mouse and cannot be completed with a keyboard. Find both problems before opening the fix.",
        code: "<div class=\"btn\" onclick=\"pay()\">Pay now</div>\n\n<ul tabindex=\"3\">\n  <li><a href=\"/terms\">Terms</a></li>\n</ul>",
        symptom: "Tab never reaches \"Pay now\" at all, and the first Tab press on the page jumps straight to the Terms list, skipping the header and the form above it.",
        q: "Nothing here is invalid HTML. So why can a keyboard user not finish?",
        fix: "<button onclick=\"pay()\">Pay now</button>\n\n<ul>\n  <li><a href=\"/terms\">Terms</a></li>\n</ul>",
        why: "Two separate faults with the same cause — appearance decided the markup. The <code>&lt;div&gt;</code> is not focusable, so Tab passes it by and the purchase cannot be made without a mouse; a real <code>&lt;button&gt;</code> is focusable, fires on Enter and Space, and announces itself. The positive <code>tabindex=\"3\"</code> pulled that list to the <b>front of the whole page's</b> tab order, so the sequence no longer matches what is on screen. Removing it puts the list back where it visually is. <b>Neither produces an error, and both are invisible with a mouse in your hand.</b>" },

      { t: "mistakes", items: [
        { bad: "<div class=\"button\" onclick=\"send()\">Send</div>", why: "Not focusable, not keyboard-operable, not announced as a control. It works for a mouse and for nothing else.", fix: "<button onclick=\"send()\">Send</button>" },
        { bad: "<ul tabindex=\"5\">", why: "A positive tabindex jumps to the front of the page's tab order, so the sequence stops matching the layout.", fix: "Remove it — source order is the tab order." },
        { bad: "<html> with no lang", why: "The screen reader guesses a language, and the wrong pronunciation makes text unintelligible rather than merely odd.", fix: "<html lang=\"en\">" },
        { bad: "a:focus { outline: none } — with nothing replacing it", why: "The focus ring is how a keyboard user knows where they are. Removing it is like hiding the mouse pointer.", fix: "Style the focus, never delete it." },
      ] },

      { t: "recap", items: [
        "Permanent, temporary, <b>situational</b> — the last one is everybody",
        "Every module so far was already teaching this; the new part is the keyboard",
        "Anything a mouse can do, the keyboard must do — Tab, Enter, Space, Escape",
        "Real elements are focusable, operable and announced for free",
        "<code>tabindex=\"0\"</code> yes, <code>-1</code> sometimes, <b>positive never</b>",
        "A skip link and <code>lang</code> are two lines that help every visitor",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "Why use a button element instead of a styled div with a click handler?", a: "A button is focusable with Tab, activates on both Enter and Space, is announced as a button by assistive technology, supports the disabled state, and works before any CSS or JavaScript arrives. A div has none of that — it renders identically and is unreachable for anyone not using a mouse. Recreating those four behaviours by hand is more work than using the element." },
        { level: "medium", q: "When would you use a positive tabindex?", a: "Never in practice. A positive value moves the element to the front of the whole page's tab order, ahead of everything with tabindex 0 or none, so the sequence stops matching the visual order and every element added later makes it worse. tabindex=\"0\" puts something in the natural order and tabindex=\"-1\" makes it focusable by script only — those two cover the real cases." },
        { level: "hard", q: "How would you check whether a page is keyboard accessible?", a: "Put the mouse away and complete a real task with Tab, Shift+Tab, Enter, Space and Escape. Three things to watch: can you reach every control, can you see where focus is at each step, and does the order match what is on screen. That walk catches the common failures — unreachable fake buttons, a removed focus ring, and focus staying behind a dialog — faster than any automated tool, which is why it is the first thing to do rather than the last." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "Which framing of who accessibility serves is the most useful?",
          options: [
            "Blind users with screen readers",
            "People with registered disabilities",
            "Users on old devices",
            "Permanent, temporary and situational — and the last one is everybody",
          ],
          correct: 3,
          why: "One arm, a broken arm, a baby on the other arm. Bright sunlight is low vision; a noisy train is deafness." },
        { level: "easy",
          q: "What does a real button give you that a styled div does not?",
          options: [
            "Focusable with Tab, fires on Enter and Space, announced as a button, and supports disabled",
            "A nicer default appearance",
            "Faster click handling",
            "Automatic form submission only",
          ],
          correct: 0,
          why: "And it works before any of your CSS or JavaScript has loaded." },
        { level: "easy",
          q: "Which tabindex value should you essentially never use?",
          options: [
            "0",
            "Any positive number",
            "-1",
            "They are all equally safe",
          ],
          correct: 1,
          why: "It jumps to the front of the whole page's tab order, so the sequence stops matching the screen — and every element added later makes it worse." },
        { level: "easy",
          q: "What determines the tab order of a page by default?",
          options: [
            "The order elements appear on screen",
            "Alphabetical order of their ids",
            "Source order",
            "The order stylesheets are loaded",
          ],
          correct: 2,
          why: "So when the tab sequence feels wrong, the markup is usually in the wrong order — and moving the element is the fix, not a number." },
        { level: "medium",
          q: "What does a skip link do?",
          options: [
            "Gives a keyboard user one keypress past a menu they would otherwise tab through on every page",
            "Skips loading images on slow connections",
            "Jumps to the next heading",
            "Lets a screen reader skip decorative images",
          ],
          correct: 0,
          why: "It is the first focusable thing on the page, usually hidden until focused, and it is what <code>&lt;main&gt;</code> gives it something to point at." },
        { level: "medium",
          q: "A page's CSS contains <code>a:focus { outline: none }</code> and nothing replacing it. What has been lost?",
          options: [
            "Nothing visible",
            "The hover effect",
            "The way a keyboard user can tell where they are on the page",
            "The link's underline",
          ],
          correct: 2,
          why: "It is the equivalent of hiding the mouse pointer. Style the focus ring; never delete it." },
        { level: "medium",
          q: "Why does <code>lang=\"en\"</code> on the html element matter?",
          options: [
            "It translates the page automatically",
            "It sets the text direction",
            "A screen reader pronounces the words with that language's rules — the wrong one makes text unintelligible, not merely odd",
            "It selects the correct font",
          ],
          correct: 2,
          why: "One attribute, and it is the difference between a French page being read and being noise." },
        { level: "hard",
          q: "Which of these was <b>not</b> already an accessibility lesson earlier in this course?",
          options: [
            "Heading levels as the page's outline",
            "th and scope on a data table",
            "A label on every form field",
            "Choosing a file format for an image",
          ],
          correct: 3,
          why: "Format is about weight and sharpness. The other three were accessibility all along and were simply never named as such." },
        { level: "hard",
          q: "You could add tabindex, key handlers and a role to make a div behave like a button. Why is that the wrong call?",
          options: [
            "It is invalid HTML",
            "It is four things to get right in every browser instead of one element that already does them",
            "Screen readers ignore role attributes",
            "Divs cannot receive click handlers",
          ],
          correct: 1,
          why: "People do it, and it can be made to work. The argument is cost and reliability, not possibility." },
        { level: "hard",
          q: "What is the fastest way to find the common keyboard failures on a page?",
          options: [
            "Run an automated accessibility scanner",
            "Check the HTML validates",
            "Read the CSS for outline rules",
            "Put the mouse away and complete a real task with Tab, Enter, Space and Escape",
          ],
          correct: 3,
          why: "Unreachable fake buttons, a deleted focus ring and focus trapped behind a dialog all surface in the first minute — faster than any tool, which is why it comes first rather than last." },
      ] },
    ],
  },

  {
    slug: "html-aria",
    order: 31,
    title: "ARIA: the First Rule Is Not to Use It",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "State the first rule of ARIA and explain why it exists",
        "Give a control an accessible name when its label is not text",
        "Hide decoration from a screen reader without hiding it from the page",
        "Recognise ARIA that is redundant, and ARIA that is actively harmful",
      ] },

      { t: "hook",
        q: "You add <code>role=\"button\"</code> to a <code>&lt;div&gt;</code>. A screen reader now announces it as a button. Is the page more accessible than it was?",
        why: "<b>It is worse.</b> It was a div that nobody could use; it is now a div that <i>claims to be a button</i> and still cannot be focused with Tab or pressed with Enter. A user is told there is a button, tries to use it, and nothing happens. ARIA changed what the page <b>says</b> and nothing about what it <b>does</b>." },

      { t: "def",
        term: "ARIA",
        en: "Accessible Rich Internet Applications — attributes that change what assistive technology is told about an element. They add no behaviour of any kind." },

      { t: "note", variant: "key", html: "<b>The first rule of ARIA is: do not use ARIA.</b> That is not a joke and it is close to the actual wording of the specification. If a native element does the job, use it — because it brings the behaviour, the keyboard support and the announcement together. Reach for ARIA when there is genuinely no element for what you are building, which for the pages in this course is almost never." },

      { t: "analogy",
        concept: "ARIA on a div",
        real: "a label saying FIRE EXIT on a wall",
        html: "The sign is real, the wall is real, and there is no door. Everyone who can see works around it; the person following the signs walks into a wall. That is <code>role=\"button\"</code> on something that cannot be focused or pressed — the announcement is now correct and the thing behind it still does not work." },

      { t: "h2", n: "1", text: "What ARIA actually offers" },
      { t: "syntax",
        intro: "Three kinds of attribute, and the two you will genuinely use.",
        form: "role=\"button\"                what this element IS\naria-label=\"Close\"           its accessible NAME\naria-labelledby=\"title-id\"   its name, taken from another element\naria-describedby=\"help-id\"   extra description\naria-hidden=\"true\"           hide from assistive tech only\naria-expanded=\"false\"        current STATE",
        parts: [
          { bit: "role", says: "Overrides what the element claims to be. The most dangerous one, because it changes the claim and nothing else — and a native element already carries the right role for free." },
          { bit: "aria-label", says: "A name for a control that has no visible text — an icon-only button. This is the one you will reach for most often, and it is genuinely useful." },
          { bit: "aria-labelledby", says: "The same, taking the name from text already on the page by its <code>id</code>. Better than <code>aria-label</code> when that text exists, because the two cannot drift apart." },
          { bit: "aria-describedby", says: "Extra detail read after the name — a password rule, a format hint." },
          { bit: "aria-hidden", says: "Remove from the accessibility tree while leaving it on screen. For decoration only, and <b>never</b> on anything focusable." },
          { bit: "aria-expanded", says: "State, for a control that opens something. State attributes must be kept in step by script, which is why they belong with the JavaScript that changes them." },
        ],
        note: "Notice what is not in the list: anything that makes something work. There is no ARIA attribute that makes an element focusable, clickable, or operable by keyboard.",
      },

      { t: "h2", n: "2", text: "The accessible name" },
      { t: "p", html: "Every control needs a name — the thing announced when focus lands on it. A button gets it from its text, a field from its <code>&lt;label&gt;</code>, an image from its <code>alt</code>. All three came from earlier modules, and they cover almost everything." },
      { t: "p", html: "The gap is a control whose label is <b>not text</b>: a close button that is an ×, a search button that is a magnifier. There is nothing to read, so it is announced as \"button\" and nothing more." },

      { t: "code", file: "names.html", code: "<!-- announced as \"button\" — a user hears nothing useful -->\n<button>&times;</button>\n\n<!-- announced as \"Close, button\" -->\n<button aria-label=\"Close\">&times;</button>\n\n<!-- the visible × is decoration; the NAME carries the meaning -->\n<button aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>", output: "Three identical-looking buttons; only two of them can be used without sight." },
      { t: "psoft", html: "The third is the pattern to copy for any icon button: the <b>name</b> on the control, the <b>symbol</b> hidden from assistive tech. Without <code>aria-hidden</code> some readers announce both — \"Close, button, multiplication sign\" — which is the icon leaking into the label." },

      { t: "note", variant: "warn", html: "<b><code>aria-hidden=\"true\"</code> must never go on anything focusable.</b> It removes the element from the accessibility tree while leaving it in the tab order, so a keyboard user lands on something that announces <i>nothing at all</i> — focus simply vanishes into silence. It is the one ARIA attribute that can break a page outright, and it is usually applied to a wrapper without noticing there is a button inside it." },

      { t: "h2", n: "3", text: "Redundant ARIA" },
      { t: "code", file: "redundant.html", code: "<!-- all four say what the element already said -->\n<nav role=\"navigation\">\n<main role=\"main\">\n<button role=\"button\">\n<input type=\"checkbox\" role=\"checkbox\">\n\n<!-- what to write -->\n<nav>\n<main>\n<button>\n<input type=\"checkbox\">", output: "Two identical sets of elements, one of them repeating itself." },
      { t: "psoft", html: "Harmless in itself and worth deleting anyway: it is noise, it suggests the author was unsure, and copying that habit is how <code>role=\"button\"</code> ends up on a <code>&lt;div&gt;</code> where it does real damage. Module 9's elements already carry their roles." },

      { t: "h2", n: "4", text: "How to check any of this" },
      { t: "note", variant: "tip", html: "<b>Put the mouse away</b> and do the task with Tab, Enter, Space and Escape. This finds more than any tool.<br><b>Open DevTools' accessibility panel</b> and read the name and role of each control — the name is what a screen reader will say.<br><b>Run Lighthouse</b> for the mechanical checks (missing alt, low contrast, no label).<br><br><b>And know Lighthouse's limit:</b> it can tell you a button has <i>a</i> name, not whether that name makes sense. \"Button 3\" scores full marks. A score of 100 means nothing obviously mechanical is broken — it is a floor, not a pass." },

      { t: "debug",
        intro: "A developer hid a decorative panel from screen readers. Now a keyboard user reports that focus \"disappears\" somewhere in the middle of the page. Find it before opening the fix.",
        code: "<div class=\"promo\" aria-hidden=\"true\">\n  <img src=\"/img-lab/banner.svg\" alt=\"\">\n  <button onclick=\"dismiss()\">Dismiss</button>\n</div>",
        symptom: "Tabbing through the page, one press lands on something that announces nothing at all — no name, no role, silence. Pressing Enter dismisses the panel, so the control is clearly there.",
        q: "The attribute is spelt correctly and it is doing exactly what it says. So why is a control still being reached?",
        fix: "<div class=\"promo\">\n  <img src=\"/img-lab/banner.svg\" alt=\"\">\n  <button onclick=\"dismiss()\">Dismiss</button>\n</div>",
        why: "Because <code>aria-hidden</code> removes an element from the <b>accessibility tree</b> and does nothing whatsoever to the <b>tab order</b> — those are two separate things, and this is the one ARIA attribute that can put them in contradiction. The button is still focusable, still reachable, still operable, and now has no name and no role to announce, so focus lands in silence. It is worse than an unlabelled button: the user cannot even tell that focus moved. The image already carried <code>alt=\"\"</code>, which is the correct way to say \"this picture is decoration\" — so the attribute was not needed on the wrapper at all. <b>Never put <code>aria-hidden</code> on anything containing something focusable</b>, and it is almost always applied to a wrapper without noticing what is inside it." },

      { t: "drills", intro: "Write these out. Three of them are about adding ARIA and two are about taking it away, which is the balance the lesson argues for.", items: [
        { task: "An icon-only close button that announces itself properly.", code: "<button aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>" },
        { task: "A search button whose label is a magnifier icon.", code: "<button aria-label=\"Search\"><span class=\"icon-search\" aria-hidden=\"true\"></span></button>" },
        { task: "A control named from a heading already on the page.", code: "<h2 id=\"plans-title\">Choose a plan</h2>\n<button aria-labelledby=\"plans-title\">Choose</button>" },
        { task: "Repair this — it claims something it cannot do: <code>&lt;div role=\"button\" onclick=\"go()\"&gt;Send&lt;/div&gt;</code>", code: "<button onclick=\"go()\">Send</button>" },
        { task: "Remove what is redundant here: <code>&lt;nav role=\"navigation\"&gt;&lt;/nav&gt;</code>", code: "<nav></nav>" },
      ] },

      { t: "mistakes", items: [
        { bad: "<div role=\"button\" onclick=\"go()\">Send</div>", why: "Announced as a button, still not focusable and still dead to Enter. The page now lies about what it can do, which is worse than being silent.", fix: "<button onclick=\"go()\">Send</button>" },
        { bad: "<button><span class=\"icon-close\"></span></button>", why: "No text and no aria-label — announced as \"button\", which tells the user nothing about what it does.", fix: "<button aria-label=\"Close\"><span class=\"icon-close\" aria-hidden=\"true\"></span></button>" },
        { bad: "<div aria-hidden=\"true\"><button>Send</button></div>", why: "The button is still in the tab order and now announces nothing. Focus lands on silence.", fix: "Never put aria-hidden on anything containing a focusable element." },
        { bad: "<nav role=\"navigation\">", why: "The element already has that role. Harmless, and the habit leads to putting roles where they do damage.", fix: "<nav>" },
      ] },

      { t: "recap", items: [
        "<b>First rule of ARIA: do not use ARIA</b> — a native element brings behaviour with it",
        "ARIA changes what is <b>announced</b>, never what <b>works</b>",
        "<code>role</code> on a <code>&lt;div&gt;</code> makes the page claim something untrue",
        "<code>aria-label</code> names an icon-only control; <code>aria-labelledby</code> reuses text already on the page",
        "<code>aria-hidden=\"true\"</code> for decoration, and <b>never</b> on anything focusable",
        "Test by unplugging the mouse; Lighthouse 100 is a floor, not a pass",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the first rule of ARIA?", a: "Do not use ARIA — use the native element instead. It is close to the specification's own wording. A native button or checkbox brings the role, the keyboard behaviour and the focus handling together, whereas ARIA supplies only the announcement, so recreating a control by hand means reimplementing everything the browser already gave you." },
        { level: "medium", q: "What is an accessible name, and where does it come from?", a: "It is what assistive technology announces when it reaches a control. It comes from the element's own text for a button, its label for a form field, its alt for an image — and from aria-label or aria-labelledby when there is no visible text, as with an icon-only button. A control with no accessible name is announced as just \"button\" or \"edit\", which tells the user nothing." },
        { level: "hard", q: "Why can adding role=\"button\" to a div make a page worse rather than better?", a: "Because ARIA only changes what the element claims to be. The div is still not in the tab order, still does not respond to Enter or Space, and still has no disabled state — so a screen reader user is now told there is a button, tries to use it, and nothing happens. Before the role they would at least have known there was nothing there. Making it genuinely work means adding tabindex, key handlers for both Enter and Space, and the role — which is four things to maintain instead of one element." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What is the first rule of ARIA?",
          options: [
            "Add a role to every element",
            "Do not use ARIA — use the native element instead",
            "Always pair a role with a tabindex",
            "Use ARIA only on forms",
          ],
          correct: 1,
          why: "Close to the specification's own wording. A native element brings the role, the keyboard behaviour and the focus handling together." },
        { level: "easy",
          q: "What does ARIA change?",
          options: [
            "What an element does",
            "How an element is styled",
            "Which keys an element responds to",
            "What assistive technology is told about an element",
          ],
          correct: 3,
          why: "There is no ARIA attribute that makes anything focusable, clickable or keyboard-operable. Not one." },
        { level: "easy",
          q: "Which attribute gives an icon-only button a name?",
          options: [
            "aria-label",
            "role",
            "aria-hidden",
            "title",
          ],
          correct: 0,
          why: "The one ARIA attribute you will genuinely reach for often — and <code>aria-labelledby</code> is better still when the text already exists on the page." },
        { level: "easy",
          q: "What is <code>aria-hidden=\"true\"</code> for?",
          options: [
            "Hiding an element from the page",
            "Hiding an element from search engines",
            "Removing an element from the accessibility tree while leaving it on screen",
            "Disabling a control",
          ],
          correct: 2,
          why: "For decoration only — and never on anything focusable." },
        { level: "medium",
          q: "You add <code>role=\"button\"</code> to a div with a click handler. What is the net effect?",
          options: [
            "The page is now accessible",
            "The div becomes focusable",
            "Enter now activates it",
            "The page claims a button that still cannot be focused or pressed — worse than before",
          ],
          correct: 3,
          why: "A user is told there is a button, tries it, and nothing happens. Before the role, at least nothing was being promised." },
        { level: "medium",
          q: "Where does a form field's accessible name normally come from?",
          options: [
            "Its name attribute",
            "Its label element",
            "Its placeholder",
            "Its id",
          ],
          correct: 1,
          why: "A button gets it from its text, an image from its alt, a field from its label. Between them those three cover almost everything." },
        { level: "medium",
          q: "Why is <code>&lt;nav role=\"navigation\"&gt;</code> worth deleting even though it is harmless?",
          options: [
            "It slows the page down",
            "Screen readers announce the role twice",
            "It is noise, and the habit is how role=\"button\" ends up on a div where it does real damage",
            "It makes the element invalid",
          ],
          correct: 2,
          why: "Module 9's elements already carry their roles. Repeating them suggests the author was unsure." },
        { level: "hard",
          q: "A wrapper carries <code>aria-hidden=\"true\"</code> and contains a button. What happens to a keyboard user?",
          options: [
            "The button is skipped in the tab order",
            "Focus still lands on the button, and it now announces nothing at all",
            "The button is disabled",
            "Nothing — aria-hidden also removes it from the tab order",
          ],
          correct: 1,
          why: "The accessibility tree and the tab order are separate. This is the one ARIA attribute that can put them in contradiction, and the user cannot even tell focus moved." },
        { level: "hard",
          q: "Your page scores 100 in Lighthouse's accessibility audit. What does that prove?",
          options: [
            "Nothing obviously mechanical is broken — it is a floor, not a pass",
            "The page is fully accessible",
            "Every control has a sensible name",
            "A screen reader user can complete every task",
          ],
          correct: 0,
          why: "It can tell you a button has <i>a</i> name, not whether the name makes sense. \"Button 3\" scores full marks." },
        { level: "hard",
          q: "When is reaching for ARIA genuinely the right call?",
          options: [
            "Whenever a page has interactive content",
            "On every landmark element",
            "When a control has no visible text, or you are building something with no native element",
            "When a native element renders the wrong way",
          ],
          correct: 2,
          why: "The last option is a styling problem, and CSS solves it. For the pages in this course the honest answer is: naming icon buttons, and almost nothing else." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 13 — SEO
   *
   * WRITTEN TO AVOID BEING A REPEAT. Most of an SEO syllabus has already been
   * taught here under other names: title and description (M10), canonical and
   * robots (M10), headings (M3), alt (M5), link text (M4), main and landmarks
   * (M9). Re-teaching those would fill two lessons and add nothing, so they
   * appear ONCE, as an audit checklist the reader ticks off — and the lessons
   * spend their length on the parts that are genuinely new:
   *
   *   - how a crawler actually works, and the robots.txt / noindex trap, which
   *     is the highest-value thing in the module and is counter-intuitive
   *   - that a crawler follows real <a href> links and nothing else
   *   - sitemap.xml and robots.txt as files rather than tags
   *   - structured data, which is the one modern SEO surface not covered by
   *     anything else in the course
   *
   * JSON-LD parses identically in both engines (checked, including
   * JSON.parse of the script's textContent), and the problems use bare
   * `script[type="application/ld+json"]` selectors for the Module 10 reason.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-seo",
    order: 32,
    title: "SEO: What a Crawler Actually Reads",
    minutes: 17,
    content: [
      { t: "objectives", items: [
        "Describe the four stages between a crawler arriving and a page ranking",
        "Explain why blocking a page in <code>robots.txt</code> can leave it in search anyway",
        "Say which links a crawler can follow, and which it cannot",
        "Audit a page against what you already know",
      ] },

      { t: "hook",
        q: "You do not want a page in Google, so you block it in <code>robots.txt</code>. Weeks later it is in the results — with your URL, no description, and a note that no information is available. How did a blocked page get indexed?",
        why: "Because <code>robots.txt</code> blocks <b>crawling</b>, not <b>indexing</b>. Google found the URL from a link elsewhere, was not allowed to fetch it, and listed it anyway with nothing to show. Worse: the <code>noindex</code> you also added is <i>inside</i> the page — and a crawler that is forbidden to fetch the page can never read it." },

      { t: "def",
        term: "Crawler",
        en: "A program that fetches pages, follows the links it finds, and reports what it saw — a very well-organised visitor, as Module 0 put it." },

      { t: "h2", n: "1", text: "Crawl, render, index, rank" },
      { t: "note", variant: "tip", html: "<b>Crawl</b> — fetch the HTML. From a sitemap, a link on another page, or a previous visit.<br><b>Render</b> — build the page, running JavaScript. This happens, and it happens <i>later</i> and on a budget.<br><b>Index</b> — store what the page is about: its title, its headings, its text, its structured data.<br><b>Rank</b> — decide where it appears for a given search. This part is not yours to control.<br><br><b>Only the first three are affected by your HTML, and that is the useful half of SEO.</b> The last one attracts all the attention and all the nonsense." },
      { t: "p", html: "The stage worth understanding is <b>render</b>. Crawlers do run JavaScript now, so a page whose content only appears after a script has run will usually be indexed eventually. \"Eventually\" is the catch: rendering is queued and budgeted, so content that is in the HTML from the start is seen immediately and reliably. That is the whole SEO argument for server-rendered pages, and it is a timing argument rather than a capability one." },

      { t: "h2", n: "2", text: "Two files, and the trap between them" },
      { t: "syntax",
        intro: "Neither of these is a tag. Both sit at the root of the site as real files.",
        form: "/robots.txt\n  User-agent: *\n  Disallow: /admin/\n  Sitemap: https://mochis.example/sitemap.xml\n\n/sitemap.xml\n  a list of every URL you want found, with a last-modified date",
        parts: [
          { bit: "User-agent", says: "Which crawler the rules apply to. <code>*</code> means all of them." },
          { bit: "Disallow", says: "Do not <b>fetch</b> anything under this path. It is a request, obeyed by the major search engines and by nobody else — it is not security." },
          { bit: "Sitemap", says: "Where the sitemap lives. Worth the one line: it is how a crawler finds pages nothing links to yet." },
        ],
        note: "A sitemap does not make a page rank. It makes a page <b>findable</b> — which matters most for a new site, a deep page, or one nothing links to.",
      },

      { t: "note", variant: "key", html: "<b><code>robots.txt</code> stops crawling. <code>&lt;meta name=\"robots\" content=\"noindex\"&gt;</code> stops indexing. They are not alternatives and using both together breaks the second one</b> — the crawler is forbidden to fetch the page, so it never reads the <code>noindex</code> inside it.<br><br><b>To keep a page out of search: allow it to be crawled, and put <code>noindex</code> on it.</b> That sounds backwards and it is the correct answer." },

      { t: "h2", n: "3", text: "A crawler follows anchors, and nothing else" },
      { t: "p", html: "Links are how pages are discovered, and only one thing counts as a link: an <code>&lt;a&gt;</code> with an <code>href</code>. A <code>&lt;div&gt;</code> that navigates when clicked is invisible to a crawler exactly as it was invisible to the keyboard in Module 12 — the same markup mistake, failing twice." },

      { t: "code", file: "links.html", code: "<!-- a crawler cannot follow this, and neither can a keyboard -->\n<div class=\"card\" onclick=\"location='/recipes/poha'\">Poha Chivda</div>\n\n<!-- discovered, followed, and its text describes the destination -->\n<a href=\"/recipes/poha\">Poha Chivda</a>", output: "Two things that look and behave the same under a mouse. One of them exists as far as search is concerned." },
      { t: "psoft", html: "This is the pattern the whole course has: <b>one wrong element, several unrelated things broken at once.</b> The keyboard, the screen reader and the crawler all fail on the same div, for the same reason." },

      { t: "h2", n: "4", text: "The audit: you already did most of this" },
      { t: "note", variant: "tip", html: "<b>One <code>&lt;h1&gt;</code> saying what the page is</b> — Module 3.<br><b>Headings in order, describing structure</b> — Module 3.<br><b>Descriptive link text</b> — Module 4, and it is how a crawler learns what the destination is about.<br><b><code>alt</code> on every content image</b> — Module 5, and it is the only thing image search has.<br><b>A specific <code>&lt;title&gt;</code> and a real description</b> — Module 10.<br><b><code>canonical</code> when a page has several addresses</b> — Module 10.<br><b>Content in <code>&lt;main&gt;</code>, not repeated furniture</b> — Module 9.<br><br><b>That is most of on-page SEO, and none of it was taught as SEO.</b> A page built the way this course teaches is already most of the way there — which is the point worth taking, because the alternative industry does sell it back to you as a service." },

      { t: "debug",
        intro: "A staging site was launched. Six weeks later it has no search traffic at all and the homepage is not in Google. Read the two files and find it before opening the fix.",
        code: "<!-- /robots.txt -->\nUser-agent: *\nDisallow: /\n\n<!-- every page's head -->\n<meta name=\"robots\" content=\"noindex\">",
        symptom: "Not one page appears in search. The team added the noindex during staging and removed it from the homepage before launch — but the homepage is still missing.",
        q: "The homepage no longer contains a noindex. So why is it still absent?",
        fix: "<!-- /robots.txt -->\nUser-agent: *\nDisallow: /admin/\nSitemap: https://mochis.example/sitemap.xml\n\n<!-- every page's head: the tag is simply gone -->",
        why: "<code>Disallow: /</code> blocks the <b>entire site</b> from being fetched, so the crawler has not read the homepage since launch and does not know the <code>noindex</code> was removed. The two changes fight each other: the file stops the crawl, and the tag needs a crawl to be seen. <b>Fix the file first</b> — until crawling is allowed, no change inside any page can have any effect. This is the commonest launch-day SEO failure there is, and it costs weeks because nothing about it produces an error." },

      { t: "drills", intro: "Two of these are files rather than markup, and that is worth feeling in your fingers — this module is the one where the answer is not always a tag.", items: [
        { task: "A robots.txt that keeps crawlers out of the admin area and points at the sitemap.", code: "User-agent: *\nDisallow: /admin/\nSitemap: https://mochis.example/sitemap.xml" },
        { task: "The tag that keeps one page out of search results — on a page that is still allowed to be crawled.", code: "<meta name=\"robots\" content=\"noindex\">" },
        { task: "Repair this so a crawler and a keyboard can both follow it: <code>&lt;div class=\"card\" onclick=\"location='/recipes/poha'\"&gt;Poha Chivda&lt;/div&gt;</code>", code: "<a href=\"/recipes/poha\">Poha Chivda</a>" },
        { task: "Link text that tells a crawler what the destination is about.", code: "<a href=\"/recipes/poha\">the poha chivda recipe</a>" },
        { task: "The one heading that says what the page is.", code: "<h1>Poha Chivda</h1>" },
      ] },

      { t: "mistakes", items: [
        { bad: "Disallow: / in robots.txt, plus noindex in the pages", why: "The crawler cannot fetch the pages, so it never reads the noindex — and may still list bare URLs it found from links elsewhere.", fix: "Allow crawling and use noindex. To hide it entirely, require a login." },
        { bad: "\"robots.txt keeps the page private.\"", why: "It is a public file that politely asks well-behaved crawlers not to look — and it advertises the paths you wanted hidden.", fix: "Anything genuinely private needs authentication." },
        { bad: "<div onclick=\"location='/page'\">Read more</div>", why: "Not a link. A crawler cannot follow it, so the destination may never be discovered — and a keyboard cannot reach it either.", fix: "<a href=\"/page\">Read more about poha chivda</a>" },
        { bad: "Submitting a sitemap and expecting rankings", why: "A sitemap affects discovery, not position. It helps a new or deep page be found at all.", fix: "Treat it as plumbing: list real URLs and reference it from robots.txt." },
      ] },

      { t: "recap", items: [
        "<b>Crawl → render → index → rank</b>; your HTML affects the first three",
        "JavaScript is rendered, but later and on a budget — HTML is read immediately",
        "<code>robots.txt</code> stops <b>crawling</b>; <code>noindex</code> stops <b>indexing</b>",
        "Using both breaks the second: a blocked page is never read",
        "Only a real <code>&lt;a href&gt;</code> is a link a crawler can follow",
        "Most on-page SEO is the markup this course already taught",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between robots.txt and a noindex meta tag?", a: "robots.txt asks crawlers not to fetch certain paths; noindex asks them not to list the page in results. They act at different stages, so combining them is self-defeating: a page blocked in robots.txt is never fetched, so its noindex is never read, and the URL can still be listed with no content from links elsewhere. To keep a page out of search, allow the crawl and use noindex." },
        { level: "medium", q: "Does a search engine see content that JavaScript adds after load?", a: "Usually yes — crawlers render pages and run scripts — but it happens in a second pass that is queued and budgeted rather than immediately. Content present in the HTML response is seen on the first visit and reliably; script-inserted content may be seen later, or not at all if rendering fails. That timing difference is the real SEO argument for server-rendered HTML, not a claim that crawlers cannot run JavaScript." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What are the four stages between a crawler arriving and a page appearing in results?",
          options: [
            "Fetch, validate, store, publish",
            "Request, parse, cache, serve",
            "Crawl, render, index, rank",
            "Discover, download, display, deliver",
          ],
          correct: 2,
          why: "Your HTML affects the first three. The fourth is not yours to control, and it attracts all the attention." },
        { level: "easy",
          q: "What does <code>robots.txt</code> control?",
          options: [
            "Whether crawlers fetch a path",
            "Whether a page appears in results",
            "How a page is ranked",
            "Which pages are private",
          ],
          correct: 0,
          why: "It is a request, obeyed by the major search engines and by nobody else. It is not security." },
        { level: "easy",
          q: "What can a crawler follow as a link?",
          options: [
            "Any element with a click handler",
            "Any element with a url attribute",
            "Anything styled to look like a link",
            "An anchor element with an href, and nothing else",
          ],
          correct: 3,
          why: "The same div that failed the keyboard in Module 12 fails search too — one wrong element, two unrelated things broken." },
        { level: "easy",
          q: "What does submitting a sitemap do?",
          options: [
            "Raises the site's ranking",
            "Makes pages findable, especially new or deep ones nothing links to",
            "Forces every page to be indexed",
            "Replaces the need for robots.txt",
          ],
          correct: 1,
          why: "Treat it as plumbing: list real URLs and reference it from robots.txt." },
        { level: "medium",
          q: "You block a page in robots.txt <b>and</b> add a noindex tag to it. What happens?",
          options: [
            "The page is doubly protected from search",
            "Both are ignored",
            "The crawler never fetches the page, so it never reads the noindex — and may list the bare URL anyway",
            "The noindex overrides the block",
          ],
          correct: 2,
          why: "They act at different stages, so combining them is self-defeating. To keep a page out of search: allow the crawl, and use noindex." },
        { level: "medium",
          q: "Why is content present in the HTML response better for search than content a script adds?",
          options: [
            "Crawlers cannot run JavaScript",
            "Rendering is a second pass that is queued and budgeted, so HTML is seen immediately and reliably",
            "Scripts are blocked by robots.txt",
            "Script-inserted content is penalised",
          ],
          correct: 1,
          why: "A timing argument, not a capability one — which is a distinction most SEO advice gets wrong in both directions." },
        { level: "medium",
          q: "Is <code>robots.txt</code> a way to keep something private?",
          options: [
            "Yes, for any path listed in it",
            "Yes, if you also add noindex",
            "No — it is a public file that advertises the very paths you wanted hidden",
            "No, but only because some crawlers ignore it",
          ],
          correct: 2,
          why: "Anything genuinely private needs authentication. A list of paths you do not want visited is a list of interesting paths." },
        { level: "hard",
          q: "A site launches, and six weeks later no page is in Google. robots.txt reads <code>Disallow: /</code> and the homepage's noindex was removed before launch. What has to be fixed first?",
          options: [
            "The robots.txt — until crawling is allowed, no change inside any page can have any effect",
            "The homepage's title tag",
            "The sitemap, so the pages are resubmitted",
            "Nothing — it just needs more time",
          ],
          correct: 0,
          why: "The file stops the crawl and the tag needs a crawl to be seen. The commonest launch-day failure there is, and nothing about it produces an error." },
        { level: "hard",
          q: "How much of on-page SEO did this course already teach under other names?",
          options: [
            "Almost none of it",
            "Only the title and description",
            "Only the parts about links",
            "Most of it — headings, link text, alt, title, description, canonical, main",
          ],
          correct: 3,
          why: "A page built the way this course teaches is already most of the way there, which is worth knowing because an industry sells it back to you as a service." },
        { level: "hard",
          q: "Which of these is <b>not</b> something your HTML can influence?",
          options: [
            "Whether a page can be crawled",
            "Whether a page can be indexed",
            "Where a page ranks for a given search",
            "What a crawler understands the page to be about",
          ],
          correct: 2,
          why: "Crawl, render and index are yours. Rank is the one that is not, and it is the one everything is sold against." },
      ] },
    ],
  },

  {
    slug: "html-structured-data",
    order: 33,
    title: "Structured Data: Saying What the Page Is",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Explain what structured data adds that headings and text cannot",
        "Write a JSON-LD block for a page",
        "Pick a schema type without guessing",
        "State the one rule that turns structured data into a penalty",
      ] },

      { t: "hook",
        q: "Your recipe page says \"45 minutes\" and \"4.8 out of 5\". A search result for someone else's recipe shows a star rating, a cook time and a photo, right there in the listing. Both pages contain the same facts. Why does only one of them show?",
        why: "Because theirs said which fact was which. Your page has the characters \"45 minutes\" somewhere in a paragraph; theirs has a small block stating <code>cookTime</code>. <b>Everything so far has described a page's structure. Structured data describes its meaning</b> — that this page is a recipe, and this number is how long it takes." },

      { t: "def",
        term: "Structured data",
        en: "A machine-readable description of what a page is about, written in a vocabulary search engines agree on." },

      { t: "def",
        term: "JSON-LD",
        en: "The format that description is written in — a block of JSON inside a script tag, kept separate from the visible markup." },

      { t: "syntax",
        intro: "One script tag, four lines that always look like this, and then the facts.",
        form: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Recipe\",\n  \"name\": \"Poha Chivda\",\n  \"cookTime\": \"PT20M\",\n  \"recipeYield\": \"4 servings\"\n}\n</script>",
        parts: [
          { bit: "type=\"application/ld+json\"", says: "Marks this script as data, not code. The browser does not execute it and does not display it — it is there for machines that ask." },
          { bit: "@context", says: "Which vocabulary. Always <code>https://schema.org</code> in practice." },
          { bit: "@type", says: "What this page <b>is</b>: Recipe, Article, Product, Event, Organization, FAQPage. Choosing this correctly is most of the work." },
          { bit: "name", says: "The properties themselves — the fields depend on the type, and schema.org lists them all." },
          { bit: "cookTime", says: "\"PT20M\" is ISO 8601 duration: 20 minutes. Machine-readable for the same reason <code>&lt;time datetime&gt;</code> was in Module 3." },
        ],
        note: "It goes in <code>&lt;head&gt;</code> by convention and works anywhere in the document. Unlike every other element in this course it renders <b>nothing</b> — it is a note pinned to the page for machines.",
      },

      { t: "h2", n: "1", text: "What it buys you" },
      { t: "p", html: "A <b>rich result</b>: the listing with stars, a price, a cook time, an image, an FAQ that expands. It is not a ranking boost — it is the same position looking substantially more useful than the results around it, which is often worth more than a position." },
      { t: "note", variant: "tip", html: "<b>Article</b> — headline, author, date published.<br><b>Product</b> — price, availability, rating.<br><b>Recipe</b> — cook time, yield, ingredients, rating.<br><b>FAQPage</b> — questions and answers, expandable in the result.<br><b>Organization</b> / <b>LocalBusiness</b> — name, logo, address, opening hours.<br><br>Start with the one type that describes the page. Most pages need exactly one." },

      { t: "h2", n: "2", text: "The rule that matters more than the syntax" },
      { t: "note", variant: "warn", html: "<b>The structured data must match what a visitor actually sees.</b> A rating in the markup that appears nowhere on the page, a price that is not the price, an FAQ nobody can read — these are not clever, they are the specific thing search engines issue manual penalties for. The block describes the page; it does not get to invent it.<br><br>The honest test: <b>could a person reading the page verify every value in your JSON?</b> If not, remove the value." },

      { t: "code", file: "match.html", code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Recipe\",\n  \"name\": \"Poha Chivda\",\n  \"cookTime\": \"PT20M\"\n}\n</script>\n\n<article>\n  <h1>Poha Chivda</h1>\n  <p>Ready in <time datetime=\"PT20M\">20 minutes</time>.</p>\n</article>", output: "A normal recipe page, plus a block stating the same two facts in a form a machine can read." },
      { t: "psoft", html: "Both facts appear twice — once for a person, once for a machine — and they agree. That agreement is the whole contract. The <code>&lt;time&gt;</code> element from Module 3 was the same idea at the scale of one value; this is it at the scale of a page." },

      { t: "h2", n: "3", text: "Checking it" },
      { t: "p", html: "You cannot see structured data by looking at the page — it renders nothing, which is exactly the situation from Module 10's share cards. Google's <b>Rich Results Test</b> takes a URL or a block of markup and tells you which rich result the page qualifies for and which required properties are missing. Use it; the failure mode otherwise is a JSON typo that silently disables the whole block." },
      { t: "note", variant: "key", html: "<b>One misplaced comma disables all of it.</b> JSON-LD is parsed as a single unit, so a syntax error anywhere means the entire block is discarded — and nothing on the page changes, no error appears in the console, and the rich result simply never arrives. It is the same silent-failure shape as <code>name=</code> on an Open Graph tag." },

      { t: "debug",
        intro: "A recipe page has had structured data on it for a month and has never once produced a rich result. The page renders perfectly and the console is clean. Read the block before opening the fix.",
        code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Recipe\",\n  \"name\": \"Poha Chivda\",\n  \"cookTime\": \"PT20M\",\n  \"recipeYield\": \"4 servings\",\n}\n</script>",
        symptom: "No stars, no cook time, no image in the listing. Nothing appears in the browser console, and the page itself is unchanged in every way.",
        q: "Every property is spelt correctly and the values are right. So why has none of it ever been used?",
        fix: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Recipe\",\n  \"name\": \"Poha Chivda\",\n  \"cookTime\": \"PT20M\",\n  \"recipeYield\": \"4 servings\"\n}\n</script>",
        why: "There is a comma after the last property. JavaScript object literals allow that; <b>JSON does not</b>, and this is JSON — the block is data, not code. So the whole thing fails to parse and is discarded <b>as a unit</b>: not \"three properties out of four\", but nothing at all. The console stays clean because the browser never executes this script — <code>type=\"application/ld+json\"</code> means it is not code, so there is no runtime to complain, and the page is identical either way. Every failure mode in this module has this shape, which is why the Rich Results Test is not optional: it is the only thing that will ever tell you." },

      { t: "drills", intro: "Write these out. The four lines at the top never change; the decision is the type, and the discipline is that every value is visible on the page.", items: [
        { task: "The opening of any JSON-LD block, up to and including the type, for an article.", code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Article\"\n}\n</script>" },
        { task: "A complete block for a recipe called Poha Chivda that takes twenty minutes.", code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Recipe\",\n  \"name\": \"Poha Chivda\",\n  \"cookTime\": \"PT20M\"\n}\n</script>" },
        { task: "The same twenty minutes, written for a person to read, in the element from Module 3.", code: "<p>Ready in <time datetime=\"PT20M\">20 minutes</time>.</p>" },
        { task: "Repair the script tag here: <code>&lt;script type=\"text/javascript\"&gt;{ \"@type\": \"Recipe\" }&lt;/script&gt;</code>", code: "<script type=\"application/ld+json\">\n{ \"@type\": \"Recipe\" }\n</script>" },
        { task: "A block for a business, carrying only what a visitor could check on the page.", code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"LocalBusiness\",\n  \"name\": \"Mochi's Kitchen\",\n  \"telephone\": \"+91 98765 43210\"\n}\n</script>" },
      ] },

      { t: "mistakes", items: [
        { bad: "\"aggregateRating\" with no rating visible on the page", why: "Markup that describes something the visitor cannot see. This is the specific pattern search engines penalise manually.", fix: "Only describe what is on the page." },
        { bad: "<script type=\"text/javascript\"> around JSON-LD", why: "The wrong type. The browser tries to execute it as code and no crawler recognises it as data.", fix: "<script type=\"application/ld+json\">" },
        { bad: "\"@type\": \"Article\" — on a product page", why: "The type is the main claim in the block. The wrong one asks for a rich result the page can never qualify for.", fix: "\"@type\": \"Product\"" },
        { bad: "A trailing comma after the last property", why: "Invalid JSON, so the whole block is discarded — silently, with nothing on the page to show for it.", fix: "Validate with the Rich Results Test before shipping." },
      ] },

      { t: "recap", items: [
        "Structured data says what a page <b>is</b>, where headings said what it <b>contains</b>",
        "JSON-LD lives in <code>&lt;script type=\"application/ld+json\"&gt;</code> and renders nothing",
        "<code>@context</code> is always schema.org; <code>@type</code> is the real decision",
        "It earns a <b>rich result</b>, not a ranking boost",
        "<b>Every value must match what a visitor can see</b> — the mismatch is what gets penalised",
        "One JSON typo silently discards the entire block; test it",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is structured data for?", a: "It tells search engines what a page is and what its facts mean — that this is a recipe, that this number is the cook time, that this is the price. Headings and paragraphs describe how a page is organised; structured data describes what it is about. The payoff is a rich result: stars, prices, cook times or FAQs shown in the listing itself." },
        { level: "medium", q: "Does adding structured data improve rankings?", a: "Not directly. It makes a result eligible for a richer presentation at whatever position it already has, and a listing with a rating and an image typically earns more clicks than the plain ones around it. The real risk is in the other direction: describing values the visitor cannot see on the page is what search engines issue manual penalties for." },
      ] },

      { t: "quiz", items: [
        { level: "easy",
          q: "What does structured data describe that headings and paragraphs cannot?",
          options: [
            "How the page is laid out",
            "How large the page is",
            "Which stylesheet the page uses",
            "What the page IS, and what its facts mean",
          ],
          correct: 3,
          why: "Headings describe how a page is organised. Structured data says this page is a recipe and this number is the cook time." },
        { level: "easy",
          q: "Where does a JSON-LD block live?",
          options: [
            "In a script element with type application/ld+json",
            "In a meta tag",
            "In a data attribute on the body",
            "In a separate .json file linked from the head",
          ],
          correct: 0,
          why: "The type marks it as data rather than code, so the browser neither executes nor displays it." },
        { level: "easy",
          q: "What is <code>@context</code> almost always set to?",
          options: [
            "The page's own URL",
            "https://schema.org",
            "The site's domain",
            "application/ld+json",
          ],
          correct: 1,
          why: "It names the vocabulary. In practice it is the same line on every page you will ever write." },
        { level: "easy",
          q: "What does structured data actually earn you?",
          options: [
            "A ranking boost",
            "Faster indexing",
            "A rich result — the same position, presented more usefully",
            "Exemption from robots.txt",
          ],
          correct: 2,
          why: "Stars, a price, a cook time, an expandable FAQ. Often worth more than a position." },
        { level: "medium",
          q: "What is the one rule that turns structured data into a penalty?",
          options: [
            "Using more than one type on a page",
            "Putting the block in the body rather than the head",
            "Describing values a visitor cannot see anywhere on the page",
            "Writing it in JSON-LD rather than microdata",
          ],
          correct: 2,
          why: "The honest test: could a person reading the page verify every value in your JSON? If not, remove the value." },
        { level: "medium",
          q: "A trailing comma is left after the last property. What happens?",
          options: [
            "The last property is ignored",
            "The whole block fails to parse and is discarded, silently",
            "The browser logs a syntax error",
            "Nothing — JSON allows trailing commas",
          ],
          correct: 1,
          why: "JavaScript object literals allow it and JSON does not — and this is data, so nothing executes and nothing complains." },
        { level: "medium",
          q: "Why is nothing logged to the console when a JSON-LD block is malformed?",
          options: [
            "Because errors in the head are suppressed",
            "Because JSON errors are always silent",
            "Because the block is inside a script tag that browsers skip entirely",
            "Because the type marks it as data, so the browser never executes it and there is no runtime to complain",
          ],
          correct: 3,
          why: "The same silent-failure shape as <code>name=</code> on an Open Graph tag: valid markup, ignored, no warning anywhere." },
        { level: "hard",
          q: "Which decision inside the block is the one that matters most?",
          options: [
            "@type — it is the main claim, and the wrong one asks for a result the page can never qualify for",
            "@context, which must match the site",
            "The order of the properties",
            "Whether the block sits in head or body",
          ],
          correct: 0,
          why: "Choosing the type correctly is most of the work. Most pages need exactly one." },
        { level: "hard",
          q: "How do you check that structured data is working?",
          options: [
            "Look at the page",
            "Check the browser console",
            "Validate the HTML",
            "Run the URL or the markup through Google's Rich Results Test",
          ],
          correct: 3,
          why: "It renders nothing, so looking tells you nothing — the same situation as a share card in Module 10." },
        { level: "hard",
          q: "The recipe page states \"20 minutes\" in a <code>&lt;time&gt;</code> element AND in the JSON-LD. Why is the repetition correct rather than wasteful?",
          options: [
            "It is a fallback in case one fails",
            "One is for a person and one is for a machine, and their agreement is the whole contract",
            "Search engines require every value twice",
            "The time element is deprecated for this use",
          ],
          correct: 1,
          why: "The <code>&lt;time&gt;</code> element was this same idea at the scale of one value. This is it at the scale of a page." },
      ] },
    ],
  },

  /* ---------------------------------------------------------------------------
   * MODULE 14 — MEDIA AND EMBEDS
   *
   * THE PRACTICE AREA SHIPS REAL MEDIA, like Module 5 did for images:
   * public/media-lab/ holds `tone.wav` (two seconds, generated by hand as PCM —
   * WAV is the one audio container that is a header plus samples, so no encoder
   * was needed) and `captions.vtt`. Both were measured rather than assumed: the
   * WAV decodes to duration 2.00 INSIDE a `sandbox=""` frame, which is the
   * workbench's actual condition, and the VTT is served as `text/vtt`.
   *
   * THERE IS DELIBERATELY NO VIDEO FILE. An MP4 or WebM needs a real encoder,
   * and rather than fake one the lessons use that absence: a <video> with a
   * `poster` and no playable source shows the poster, which is exactly what a
   * poster is for and is honest about what the reader is looking at.
   *
   * ⚠️ NEVER ASSERT ON `svg[viewBox]`. The browser matches BOTH `[viewBox]` and
   * `[viewbox]`; linkedom matches NEITHER. Measured. Everything else checked
   * here agrees 14 of 15 — video/source/poster/controls, track with kind,
   * srclang, label and default, iframe with title and loading, and
   * `svg[role="img"]` with a `<title>` child, including its text.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-media",
    order: 34,
    title: "Video and Audio, Without a Plugin",
    minutes: 16,
    content: [
      { t: "objectives", items: [
        "Put a video and an audio player on a page with no library at all",
        "Say why <code>controls</code> is not optional",
        "Explain the one condition under which a browser will autoplay",
        "Add captions, and know who they are actually for",
      ] },

      { t: "hook",
        q: "Before 2010, playing a video on a web page meant Flash — a plugin the visitor had to install, that drained batteries, that phones never supported, and that was a permanent security problem. What replaced it?",
        why: "Two elements. <code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code> made playback part of the browser, so a video became as ordinary as an image — no plugin, no library, works on a phone, and readable by everything. It is the single biggest thing HTML5 added." },

      { t: "def",
        term: "Media element",
        en: "The video or audio element — a built-in player the browser supplies, controlled entirely by attributes." },

      { t: "syntax",
        intro: "Both elements take the same attributes. This is nearly all of them.",
        form: "<video src=\"clip.mp4\" controls poster=\"/img-lab/photo.png\"\n       width=\"320\" height=\"200\" preload=\"metadata\">\n  Your browser cannot play this video.\n</video>\n\n<audio src=\"/media-lab/tone.wav\" controls></audio>",
        parts: [
          { bit: "controls", says: "Show the play button, the scrubber, the volume. <b>Without it there is no way to start the media at all</b> unless you write JavaScript — the element renders and does nothing." },
          { bit: "poster", says: "An image shown before playback starts. Without one, a video is a black rectangle until it has loaded enough to show a frame." },
          { bit: "width", says: "Real pixel dimensions, exactly as on an image and for the same reason — the space is reserved and the page does not jump when the media arrives." },
          { bit: "preload", says: "How much to fetch before play is pressed: <code>none</code>, <code>metadata</code> (duration and dimensions only), or <code>auto</code>. <code>metadata</code> is the sensible default for anything the visitor may not watch." },
          { bit: "Your browser cannot", says: "The fallback: content between the tags shows only when the element is not supported. A modern browser never displays it, which is why it is usually left as a link to download the file." },
        ],
        note: "The element is the player. There is no library, no initialisation and no script — which is worth stating because a great many tutorials add one before showing you this.",
      },

      { t: "code", file: "audio.html", code: "<h3>Listen</h3>\n<audio src=\"/media-lab/tone.wav\" controls></audio>", output: "A player with a play button. The file is two seconds of two notes." },
      { t: "psoft", html: "<b>This one really plays.</b> The practice area ships <code>/media-lab/tone.wav</code>, so press <b>Try it yourself</b>, then press play in the preview. Then delete <code>controls</code> and look again: the player is still there, and there is now no way to start it." },

      { t: "h2", n: "1", text: "One element, several files" },
      { t: "p", html: "Browsers do not all play the same formats. The <code>&lt;source&gt;</code> form lists several files and the browser takes the first it can play — the same shape as the fallback idea everywhere else in HTML." },

      { t: "code", file: "sources.html", code: "<video controls poster=\"/img-lab/photo.png\" width=\"320\" height=\"200\">\n  <source src=\"clip.webm\" type=\"video/webm\">\n  <source src=\"clip.mp4\" type=\"video/mp4\">\n  <p>No supported format. <a href=\"clip.mp4\">Download the video</a>.</p>\n</video>", output: "A 320x200 player showing the poster image. There is no clip file here, so the poster is all you get — which is precisely what a poster is for." },
      { t: "psoft", html: "<b>The lab has no video file, and that is deliberate.</b> Making one needs a real encoder; the lesson uses the gap instead. What you see in the preview is the <code>poster</code> doing its job — the same thing a visitor sees on a slow connection before a single frame has arrived." },

      { t: "note", variant: "tip", html: "<code>type</code> on each <code>&lt;source&gt;</code> saves the browser downloading a file it cannot use. In practice <b>MP4 with H.264 plays everywhere</b>, so one MP4 is a complete answer; WebM is smaller where it is supported, which is why it goes first when both exist." },

      { t: "h2", n: "2", text: "Autoplay, and why it usually does not" },
      { t: "p", html: "<code>autoplay</code> is real and browsers mostly ignore it. Video that starts talking at you was disliked enough that every major browser now <b>blocks autoplay with sound</b> outright." },
      { t: "note", variant: "key", html: "<b>A browser will autoplay only if the media is muted.</b> So <code>autoplay muted</code> works and plain <code>autoplay</code> silently does not — the video simply sits there, and nothing in your markup or console explains why. That combination is what every silent looping background video on the web is using:<br><br><code>&lt;video autoplay muted loop playsinline&gt;</code><br><br>Add <code>controls</code> anyway, so a visitor who wants sound has a way to ask for it." },

      { t: "h2", n: "3", text: "Captions are part of the media" },
      { t: "syntax",
        intro: "A caption file attached to the player, with the four attributes it needs.",
        form: "<video controls poster=\"/img-lab/photo.png\" width=\"320\" height=\"200\">\n  <source src=\"clip.mp4\" type=\"video/mp4\">\n  <track kind=\"captions\" src=\"/media-lab/captions.vtt\"\n         srclang=\"en\" label=\"English\" default>\n</video>",
        parts: [
          { bit: "<track", says: "An empty element, inside the media element, pointing at a timed-text file." },
          { bit: "kind=\"captions\"", says: "What this track is. <code>captions</code> for the dialogue plus the sounds that matter; <code>subtitles</code> for a translation of speech only." },
          { bit: "srclang", says: "The track's language, so the browser can label and choose it." },
          { bit: "label", says: "What the visitor sees in the captions menu." },
          { bit: "default", says: "Turn this track on without being asked. Present or absent." },
        ],
        note: "The file is <b>WebVTT</b> — plain text: <code>WEBVTT</code> on the first line, then a time range and the line to show. The practice area ships one at <code>/media-lab/captions.vtt</code>, so you can point a track at it and see the shape.",
      },

      { t: "note", variant: "warn", html: "<b>Captions are not only for deaf viewers, and framing them that way is why they get skipped.</b> They are used by anyone watching without sound — on a train, in a lecture, in an open-plan office, beside a sleeping child — which on most sites is a large share of the audience. They also give search engines the words in your video, which is otherwise a file they cannot read at all." },

      { t: "mistakes", items: [
        { bad: "<video src=\"clip.mp4\"></video>", why: "No controls, so there is no way to play it without writing JavaScript. It renders as a still rectangle that does nothing.", fix: "<video src=\"clip.mp4\" controls></video>" },
        { bad: "<video autoplay>", why: "Blocked by every major browser because it has sound. It does not play, and nothing tells you why.", fix: "<video autoplay muted loop playsinline>" },
        { bad: "<video controls> with no width, height or poster", why: "A black box that changes size when the file arrives — the layout shift from Module 5, in a larger element.", fix: "Give it real dimensions and a poster." },
        { bad: "A video with no <track>", why: "Unusable without sound, and its content is invisible to search.", fix: "Add a captions track — the file is plain text." },
      ] },

      { t: "recap", items: [
        "<code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code> are the player — no plugin, no library",
        "<b>No <code>controls</code>, no way to play it</b>",
        "<code>&lt;source&gt;</code> offers several files; the browser takes the first it can use",
        "<code>poster</code> and real dimensions stop a black, jumping box",
        "<b>Autoplay only works muted</b> — plain <code>autoplay</code> fails silently",
        "<code>&lt;track kind=\"captions\"&gt;</code> serves everyone watching without sound",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "Why does a video with the autoplay attribute often not play?", a: "Because browsers block autoplay that has sound. A video will start on its own only if it is muted, so autoplay muted plays and autoplay alone does not — with no error and nothing in the console. It is the policy behind every silent looping background video, which is autoplay, muted, loop and playsinline together." },
        { level: "medium", q: "What does the track element do, and who benefits?", a: "It attaches a timed-text file — usually WebVTT — to a video or audio element, giving it captions or subtitles. Deaf and hard-of-hearing viewers need them, and the larger group in practice is everyone watching without sound: on public transport, in an office, in any situation where audio is not an option. They also make the spoken content readable by search engines, which cannot otherwise see inside a media file." },
      ] },
    ],
  },

  {
    slug: "html-embeds",
    order: 35,
    title: "Embeds: Somebody Else's Page Inside Yours",
    minutes: 15,
    content: [
      { t: "objectives", items: [
        "Embed a map or a video with an <code>&lt;iframe&gt;</code>, safely",
        "Give an embed a name, and say what happens without one",
        "Stop a third-party embed slowing your page down",
        "Choose between an image, inline SVG and a canvas",
      ] },

      { t: "hook",
        q: "You paste an embed code from YouTube and a video appears on your page. Whose page is it? Whose code is running? And what can it see of yours?",
        why: "It is <b>their</b> page, running <b>their</b> code, inside a box on yours — and by default it cannot read your page at all, because the browser treats a different origin as a separate world. That isolation is the whole reason an iframe is safe enough to use, and the reason it can never be styled by your CSS." },

      { t: "def",
        term: "iframe",
        en: "An inline frame — a complete, separate web page displayed inside a box on this one." },

      { t: "syntax",
        intro: "The attributes worth writing on every embed.",
        form: "<iframe src=\"https://www.youtube.com/embed/xyz\"\n        title=\"How to make poha chivda\"\n        width=\"560\" height=\"315\"\n        loading=\"lazy\"\n        allowfullscreen></iframe>",
        parts: [
          { bit: "src", says: "The page to load. For a video or a map this is the provider's own embed URL, not the address you saw in your address bar." },
          { bit: "title", says: "<b>Required in practice.</b> An iframe is announced to a screen reader as just \"iframe\" without it — a box in the page with no name and no way to tell what is inside." },
          { bit: "width", says: "Dimensions, for the same reason as an image: reserve the space so nothing jumps when the frame loads." },
          { bit: "loading=\"lazy\"", says: "Do not load until the reader scrolls near it. It matters more here than on an image — an embed pulls in an entire other page, often with its own scripts." },
          { bit: "allowfullscreen", says: "Permit the fullscreen button. Video embeds want it; a map does not need it." },
        ],
        note: "You cannot style what is inside an iframe, and you cannot read it. It is a different document from a different origin — that is a security boundary, not a limitation to work around.",
      },

      { t: "note", variant: "warn", html: "<b>An embed is a third party on your page.</b> It runs their code, loads their fonts and scripts, and usually sets their cookies — which is why embeds are the commonest thing to appear in a site's privacy policy. Two habits worth having: <b>only embed people you would name in that policy</b>, and add <code>sandbox</code> if the source is not one you trust, which restricts what the frame is allowed to do. This course's own practice preview is a <code>sandbox=\"\"</code> iframe, for exactly that reason: it renders markup a stranger typed." },

      { t: "h2", n: "1", text: "Lazy, because an embed is expensive" },
      { t: "p", html: "An image below the fold costs you an image. An embed below the fold costs an entire page — HTML, CSS, JavaScript, fonts, and often several network requests to services you have never heard of. <code>loading=\"lazy\"</code> is one attribute and on an embed-heavy page it is one of the largest performance wins available in plain HTML." },

      { t: "h2", n: "2", text: "Image, SVG or canvas" },
      { t: "note", variant: "tip", html: "<b><code>&lt;img&gt;</code></b> — a picture in a file. Photographs, and any graphic you do not need to change. Simplest, cached, works everywhere.<br><b>Inline <code>&lt;svg&gt;</code></b> — the shapes written into the page as elements. Scales to any size, can be styled by your CSS, and every part of it is in the DOM. For icons, logos and diagrams.<br><b><code>&lt;canvas&gt;</code></b> — a blank rectangle that <b>only JavaScript can draw on</b>. For things that change every frame: games, live charts, video effects.<br><br><b>An empty <code>&lt;canvas&gt;</code> is genuinely empty</b> — no script, no picture — and it holds no elements, so nothing inside it can be read by a screen reader or found by search. That is the trade for being able to draw anything." },

      { t: "code", file: "svg-inline.html", code: "<svg role=\"img\" width=\"80\" height=\"40\">\n  <title>Sales rose in the second quarter</title>\n  <rect x=\"0\" y=\"20\" width=\"20\" height=\"20\" fill=\"#3a7ca5\"></rect>\n  <rect x=\"30\" y=\"8\" width=\"20\" height=\"32\" fill=\"#f5a524\"></rect>\n</svg>", output: "Two small bars, drawn by the page itself rather than loaded from a file." },
      { t: "psoft", html: "<code>role=\"img\"</code> and a <code>&lt;title&gt;</code> as the first child are inline SVG's version of <code>alt</code> — without them a screen reader may announce the individual shapes or nothing at all. A <b>decorative</b> inline SVG takes <code>aria-hidden=\"true\"</code> instead, exactly as a decorative image took <code>alt=\"\"</code> in Module 5." },

      { t: "mistakes", items: [
        { bad: "<iframe src=\"...\"></iframe> with no title", why: "Announced as just \"iframe\". A screen reader user is told there is a frame and nothing about what is in it.", fix: "<iframe src=\"...\" title=\"Location map\"></iframe>" },
        { bad: "Six embeds at the bottom of a page, none of them lazy", why: "Each one loads a whole page with its own scripts, before the visitor has scrolled anywhere near them.", fix: "loading=\"lazy\" on every embed below the first screen." },
        { bad: "<canvas></canvas> — expecting something to appear", why: "A canvas is a blank rectangle until JavaScript draws on it. There is no markup that puts anything in it.", fix: "Use <img> or inline <svg> for a picture; canvas only when a script is drawing." },
        { bad: "<svg> for a logo, with no title and no role", why: "Announced as a group of shapes, or skipped entirely. Inline SVG has no alt attribute to fall back on.", fix: "<svg role=\"img\"><title>Company logo</title>…</svg>" },
      ] },

      { t: "recap", items: [
        "An <code>&lt;iframe&gt;</code> is a whole separate page inside a box — you cannot style or read it",
        "<code>title</code> is what stops it being announced as just \"iframe\"",
        "<code>loading=\"lazy\"</code> matters most here: an embed costs an entire page",
        "An embed is a third party on your site — trust it, or <code>sandbox</code> it",
        "<code>img</code> for pictures · inline <code>svg</code> for shapes you style · <code>canvas</code> only with script",
        "Inline SVG needs <code>role=\"img\"</code> + <code>&lt;title&gt;</code>, or <code>aria-hidden</code> if decorative",
      ] },

      { t: "interview", items: [
        { level: "easy", q: "What is the difference between svg and canvas?", a: "Inline SVG is markup: every shape is an element in the DOM, so it can be styled with CSS, given a title for assistive technology, and it scales to any size without blurring. A canvas is a blank bitmap that only JavaScript can draw on — nothing inside it exists as an element, so it cannot be read or styled. SVG suits icons, logos and diagrams; canvas suits things redrawn constantly, like games and live visualisations." },
        { level: "medium", q: "What should you always add to an iframe embed?", a: "A title, so it is announced as something more useful than \"iframe\"; real width and height, so the layout does not shift when it loads; and loading=\"lazy\" if it is below the first screen, because an embed pulls in an entire other page with its own scripts. If the source is not fully trusted, a sandbox attribute to limit what the frame may do." },
      ] },
    ],
  },
];
