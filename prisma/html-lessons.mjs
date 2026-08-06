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
        en: "One of the things that runs <i>on</i> the Internet: a system of documents that link to each other, reached through a browser." },

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
        q: "The HTML file you wrote in the last module opened perfectly in your browser. Why can nobody else see it?",
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
        en: "The number that identifies a machine on a network — like <code>142.250.4.100</code>. Every device that talks to the Internet has one." },

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
   * MODULE 2 — HTML BASICS
   *
   * Where the first line of markup is written, and where graded practice starts.
   * ------------------------------------------------------------------------- */

  {
    slug: "html-what-it-is",
    order: 6,
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
    order: 7,
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
    order: 8,
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
