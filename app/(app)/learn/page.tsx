import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LearnIndex() {
  const first = await prisma.lesson.findFirst({
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
  });
  if (first) redirect(`/learn/${first.slug}`);
  return <p className="page-intro">No lessons yet. Run the seed script.</p>;
}
