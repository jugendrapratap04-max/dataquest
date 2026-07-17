import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PracticeWorkbench, type ProblemData } from "@/components/PracticeWorkbench";
import { SqlWorkbench, type SqlProblemData } from "@/components/SqlWorkbench";

// Match the /practice list's order: Easy → Medium → Hard → Super Hard, then by
// each problem's own order, then title.
const DIFF_RANK: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2, "Super Hard": 3 };

// The problem the "Agla problem →" button should open on a solve: the next
// unsolved one after this in list order, or the earliest unsolved anywhere if
// there's nothing after (surfaces skipped ones), or null when everything's done.
async function nextUnsolvedSlug(currentSlug: string, userId: string): Promise<string | null> {
  const all = await prisma.problem.findMany({
    select: { id: true, slug: true, difficulty: true, order: true, title: true },
  });
  all.sort(
    (a, b) =>
      (DIFF_RANK[a.difficulty] ?? 9) - (DIFF_RANK[b.difficulty] ?? 9) ||
      a.order - b.order ||
      a.title.localeCompare(b.title)
  );
  const solvedIds = new Set(
    (
      await prisma.submission.findMany({
        where: { userId, passed: true },
        distinct: ["problemId"],
        select: { problemId: true },
      })
    ).map((s) => s.problemId)
  );
  const i = all.findIndex((p) => p.slug === currentSlug);
  if (i < 0) return null;
  const candidate = (p: { id: string; slug: string }) => p.slug !== currentSlug && !solvedIds.has(p.id);
  return all.slice(i + 1).find(candidate)?.slug ?? all.find(candidate)?.slug ?? null;
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
