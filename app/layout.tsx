import type { Metadata } from "next";
import "./globals.css";

// No "job-ready" in the title or the description. It is a claim about an outcome
// nobody here controls, and it was the first thing Google showed for every page.
export const metadata: Metadata = {
  title: "DataMarg — Learn it. Practise it. Build with it.",
  description: "Learn data science and practise it in the browser — real Python and SQL that run as you type, with visuals that make the concepts click.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Set the theme AND the reading width before first paint, so a saved
            preference doesn't flash the wrong one. This runs synchronously as the
            body parses; it only sets attributes on <html> (never React-managed
            DOM), and the html's suppressHydrationWarning covers the attribute
            diff. Topbar and ReadingToggle read the same keys on mount, so the
            script and the components never disagree.

            Reading width matters here more than it looks: without this line the
            sidebars render and then vanish a frame later, which reads as a bug. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('dq-theme');if(['light','dark','focus','sunset'].indexOf(t)<0){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(localStorage.getItem('dq-reading')==='1'){document.documentElement.setAttribute('data-reading','1');}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
