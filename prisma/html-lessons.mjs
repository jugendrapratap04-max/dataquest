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
    ],
  },
];
