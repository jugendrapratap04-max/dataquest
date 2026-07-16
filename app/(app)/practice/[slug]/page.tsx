import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PracticeWorkbench, type ProblemData } from "@/components/PracticeWorkbench";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: { lesson: true },
  });
  if (!problem) notFound();

  const data: ProblemData = {
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tagsCsv.split(",").filter(Boolean),
    descriptionMd: problem.descriptionMd,
    examples: JSON.parse(problem.examplesJson || "[]"),
    starterCode: problem.starterCode || `def ${problem.functionName}():\n    pass\n`,
    functionName: problem.functionName,
    tests: JSON.parse(problem.testsJson || "[]"),
    hints: JSON.parse(problem.hintsJson || "[]"),
    xp: problem.xp,
    recap: "",
    lessonSlug: problem.lesson?.slug,
  };

  return <PracticeWorkbench p={data} />;
}
