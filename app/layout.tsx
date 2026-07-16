import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataQuest — Learn. Practice. Get Job-Ready.",
  description: "Ek jagah data science padho, practice karo, aur job-ready bano.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
