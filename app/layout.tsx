import type { Metadata } from "next";
import "./globals.css";
import { SCHEDULE, THEME_IDS, THEME_KEY, MODE_KEY } from "@/lib/theme-schedule";

/* The pre-paint script, built rather than typed.
 *
 * It cannot import anything — it runs as the body parses, before any module
 * exists — so the schedule is INTERPOLATED into it from lib/theme-schedule.ts.
 * The hours are the part that would drift if they were written out twice, and a
 * drifted boundary shows up as the page painting one theme and settling on
 * another a frame later.
 *
 * Auto is the default: a student who has never opened the theme menu has no
 * `dq-theme-mode`, so the clock decides. A student who has picked one has
 * "manual" there, and the clock is not consulted at all. */
const themeBootScript = `(function(){try{
var d=document.documentElement;
var ids=${JSON.stringify(THEME_IDS)};
var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});
var manual=localStorage.getItem(${JSON.stringify(MODE_KEY)})==='manual';
if(!(manual&&ids.indexOf(t)>=0)){
var s=${JSON.stringify(SCHEDULE.map((x) => [x.from, x.theme]))};
var h=new Date().getHours();
var p=s[s.length-1][1];
for(var k=0;k<s.length;k++){if(h>=s[k][0]){p=s[k][1];}}
if(p==='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches){p='dark';}
t=p;
}
d.setAttribute('data-theme',t);
localStorage.removeItem('dq-reading');
var q=[['dq-nav','data-nav','mini'],['dq-rail','data-rail','off'],['dq-focus','data-focus','1']];
for(var i=0;i<q.length;i++){if(localStorage.getItem(q[i][0])===q[i][2]){d.setAttribute(q[i][1],q[i][2]);}}
}catch(e){}})();`.replace(/\n/g, "");

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
        {/* Set the theme AND the reading width before first paint, so neither a
            saved preference nor the clock flashes the wrong one. This runs
            synchronously as the body parses; it only sets attributes on <html>
            (never React-managed DOM), and the html's suppressHydrationWarning
            covers the attribute diff. Topbar and ReadingToggle read the same keys
            on mount, so the script and the components never disagree.

            The panel states matter here more than they look: without this line
            the sidebars render and then vanish a frame later, which reads as a
            bug. `dq-reading` is the retired single on/off switch — it is cleared
            rather than honoured, so nobody is left in a layout whose control no
            longer exists. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
      </body>
    </html>
  );
}
