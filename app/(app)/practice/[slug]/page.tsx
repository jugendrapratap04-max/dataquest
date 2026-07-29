import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SITE_URL, clamp } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { PracticeWorkbench, type ProblemData } from "@/components/PracticeWorkbench";
import { SqlWorkbench, type SqlProblemData } from "@/components/SqlWorkbench";

// Match the /practice list's order: Easy → Medium → Hard → Super Hard, then by
// each problem's own order, then title.
const DIFF_RANK: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2, "Super Hard": 3 };

// Which problem "Agla problem →" opens after a solve.
//
// It used to sort every problem on the platform by difficulty and hand back the
// next one in that global list — so finishing an Easy loops problem could drop
// you into a strings problem from a lesson you had not opened yet. The student
// is mid-topic and the app changes the subject on them.
//
// Now it stays where the learning is, in this order:
//   1. Anything still unsolved in the SAME lesson — finish the topic you are on.
//   2. Unsolved problems from EARLIER lessons in the same track, nearest first —
//      revision of ground already covered, never a topic not yet taught.
//   3. Only when nothing is left behind, the next unsolved anywhere. By then
//      moving forward is the right answer, and the button never dies.
async function nextUnsolvedSlug(currentSlug: string, userId: string): Promise<string | null> {
  const all = await prisma.problem.findMany({
    select: {
      id: true, slug: true, difficulty: true, order: true, title: true, lessonId: true,
      lesson: { select: { order: true, trackId: true } },
    },
  });

  const byDifficulty = (a: (typeof all)[number], b: (typeof all)[number]) =>
    (DIFF_RANK[a.difficulty] ?? 9) - (DIFF_RANK[b.difficulty] ?? 9) ||
    a.order - b.order ||
    a.title.localeCompare(b.title);

  const solvedIds = new Set(
    (
      await prisma.submission.findMany({
        where: { userId, passed: true },
        distinct: ["problemId"],
        select: { problemId: true },
      })
    ).map((s) => s.problemId)
  );

  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return null;
  const open = all.filter((p) => p.slug !== currentSlug && !solvedIds.has(p.id));

  // 1. Same lesson, easiest first.
  const sameLesson = open
    .filter((p) => current.lessonId && p.lessonId === current.lessonId)
    .sort(byDifficulty);
  if (sameLesson.length) return sameLesson[0].slug;

  // 2. Earlier lessons in the same track, nearest lesson first — revision that
  //    stays close to what the student has just been reading.
  if (current.lesson) {
    const earlier = open
      .filter(
        (p) =>
          p.lesson &&
          p.lesson.trackId === current.lesson!.trackId &&
          p.lesson.order < current.lesson!.order
      )
      .sort((a, b) => b.lesson!.order - a.lesson!.order || byDifficulty(a, b));
    if (earlier.length) return earlier[0].slug;
  }

  // 3. Nothing left behind — move on.
  return open.sort(byDifficulty)[0]?.slug ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { title: true, slug: true, difficulty: true, descriptionMd: true, kind: true },
  });
  if (!problem) return { title: "Problem not found — DataMarg" };

  const lang = problem.kind === "sql" ? "SQL" : "Python";
  const title = `${problem.title} — ${problem.difficulty} ${lang} practice | DataMarg`;
  const description =
    clamp(problem.descriptionMd) ||
    `Solve ${problem.title}, a ${problem.difficulty.toLowerCase()} ${lang} problem you can run and check in the browser.`;
  const url = `${SITE_URL}/practice/${problem.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", siteName: "DataMarg" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: { lesson: true },
  });
  if (!problem) notFound();

  const user = await getCurrentUser();
  const nextSlug = user ? await nextUnsolvedSlug(slug, user.id) : null;

  const common = {
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tagsCsv.split(",").filter(Boolean),
    descriptionMd: problem.descriptionMd,
    examples: JSON.parse(problem.examplesJson || "[]"),
    hints: JSON.parse(problem.hintsJson || "[]"),
    xp: problem.xp,
    recap: "",
    lessonSlug: problem.lesson?.slug,
    nextSlug,
  };

  if (problem.kind === "sql") {
    const sqlData: SqlProblemData = {
      ...common,
      starterCode: problem.starterCode || "SELECT ",
      solutionCode: problem.solutionCode,
      sqlSetup: problem.sqlSetup,
    };
    // key remounts the workbench when navigating problem→problem so the editor
    // and results reset instead of carrying over the previous problem's state.
    return <SqlWorkbench key={problem.slug} p={sqlData} />;
  }

  const data: ProblemData = {
    ...common,
    starterCode: problem.starterCode || `def ${problem.functionName}():\n    pass\n`,
    functionName: problem.functionName,
    tests: JSON.parse(problem.testsJson || "[]"),
  };

  return <PracticeWorkbench key={problem.slug} p={data} />;
}
