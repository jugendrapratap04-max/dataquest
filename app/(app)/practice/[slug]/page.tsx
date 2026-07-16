import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PracticeWorkbench, type ProblemData } from "@/components/PracticeWorkbench";
import { SqlWorkbench, type SqlProblemData } from "@/components/SqlWorkbench";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: { lesson: true },
  });
  if (!problem) notFound();

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
  };

  if (problem.kind === "sql") {
    const sqlData: SqlProblemData = {
      ...common,
      starterCode: problem.starterCode || "SELECT ",
      solutionCode: problem.solutionCode,
      sqlSetup: problem.sqlSetup,
    };
    return <SqlWorkbench p={sqlData} />;
  }

  const data: ProblemData = {
    ...common,
    starterCode: problem.starterCode || `def ${problem.functionName}():\n    pass\n`,
    functionName: problem.functionName,
    tests: JSON.parse(problem.testsJson || "[]"),
  };

  return <PracticeWorkbench p={data} />;
}
