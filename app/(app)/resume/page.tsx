import { getCurrentUser } from "@/lib/session";
import { ResumeBuilder } from "@/components/ResumeBuilder";

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <>
      <p className="page-intro">
        Apna resume banao aur turant dekho ki <b>ATS</b> (jo software companies resumes filter karne ko use karti hain) me kitna score karega.
        Har tip follow karke score badhao — job-ready resume ready! 🎯
      </p>
      <ResumeBuilder name={user.name} role={user.role} />
    </>
  );
}
