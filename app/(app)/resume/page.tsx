import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ResumeBuilder } from "@/components/ResumeBuilder";

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <>
      <p className="page-intro">
        Build your resume and see straight away how it would score in <b>ATS</b> — the software companies use to filter applications.
        Work through each tip to raise the score, and the resume is job-ready. 🎯
      </p>
      <ResumeBuilder name={user.name} role={user.role} />
    </>
  );
}
