import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Onboarding } from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "Welcome — Etudo",
  robots: { index: false },
};

// Runs once, straight after signup (docs/LEARNING-SPEC.md §5).
//
// Guarded both ways: an account that has already seen the welcome is sent on to
// the lessons, so the page cannot be replayed by typing the URL.
export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, welcomedAt: true },
  });
  if (row?.welcomedAt) redirect("/learn");

  const first = await prisma.lesson.findFirst({
    where: { track: { slug: "python" } },
    orderBy: { order: "asc" },
    select: { slug: true },
  });

  return (
    <div className="ob-wrap">
      <Onboarding name={row?.name ?? user.name} firstLesson={first?.slug ?? ""} />
    </div>
  );
}
