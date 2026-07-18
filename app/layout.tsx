import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataMarg — Learn. Practice. Get Job-Ready.",
  description: "Ek jagah data science padho, practice karo, aur job-ready bano.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Set the theme before first paint so a saved preference doesn't flash
            the wrong one. This runs synchronously as the body parses; it only
            sets an attribute on <html> (never React-managed DOM), and the html's
            suppressHydrationWarning covers the attribute diff. Topbar reads the
            same key on mount for its toggle, so the two never disagree. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('dq-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
