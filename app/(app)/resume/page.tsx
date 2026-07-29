import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ResumeBuilder } from "@/components/ResumeBuilder";

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // The ATS keyword check reads the skills the platform's own subjects teach,
  // rather than a Data Science list baked into the component. Add a subject and
  // its skills count towards a student's resume score with no code change.
  let keywords: string[] = [];
  try {
    const subjects = await prisma.track.findMany({ select: { title: true, skillsJson: true } });
    keywords = [
      ...new Set(
        subjects.flatMap((s) => {
          let skills: string[] = [];
          try { skills = JSON.parse(s.skillsJson || "[]"); } catch {}
          return [s.title.split(" — ").pop() ?? s.title, ...skills];
        })
          .map((k) => String(k).toLowerCase().trim())
          .filter((k) => k.length > 2)
      ),
    ];
  } catch {
    // Fall through to the component's fallback list rather than break the page.
  }
  return (
    <>
      <p className="page-intro">
        Build your resume and see straight away how it would score in <b>ATS</b> — the software companies use to filter applications.
        Work through each tip to raise the score, and the resume is job-ready. 🎯
      </p>
      <ResumeBuilder name={user.name} role={user.role} keywords={keywords} />
    </>
  );
}
