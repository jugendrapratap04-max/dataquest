import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — Etudo",
  description: "The terms you agree to when you use Etudo.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" current="/terms">
      <p className="legal-lead">
        These are the terms you agree to by using Etudo. They are written to be read, not to be
        skipped.
      </p>

      <h2>1. Who can use Etudo</h2>
      <p>
        Etudo is meant for learners aged 16 and over. If you are under 18, you may use it only
        with the permission of a parent or guardian, and they are agreeing to these terms with you.
      </p>

      <h2>2. Your account</h2>
      <p>
        You need an account to save progress, write notes and join study rooms. Keep your password
        to yourself — anything done from your account is treated as done by you. Tell us straight
        away if you think someone else has got into it.
      </p>
      <p>Reading the lessons does not require an account and never will.</p>

      <h2>3. How you may behave</h2>
      <p>
        You must follow the <Link href="/guidelines">Community Guidelines</Link>, and you must obey
        the law while using Etudo. You are responsible for what you say, type, submit and share,
        including everything you say in a voice study room.
      </p>

      <h2>4. What Etudo is, and is not</h2>
      <p>
        Etudo gives you lessons, a code editor, practice problems and tools for studying with
        other people. It is an educational platform. It is not an employer, a recruiter, or a
        guarantee of a job, a salary or an exam result — the roadmap describes a path that has
        worked for people, not a promise about your outcome.
      </p>
      <p>
        Conversations and content created by users are theirs, not ours. We do not check them
        before they happen, and voice calls are not recorded at all, so we cannot review them
        afterwards either.
      </p>

      <h2>5. Your content</h2>
      <p>
        The code, notes and messages you write stay yours. You give us only the permission we need
        to run the service — storing your work so you can come back to it, and showing what you
        deliberately share, such as a doubt you push to a room&apos;s discussion queue.
      </p>

      <h2>6. When we can suspend an account</h2>
      <p>
        We may warn, restrict, suspend or permanently close an account that breaks these terms or
        the Community Guidelines, or that puts other learners at risk. Where it is reasonable to do
        so, we will tell you why.
      </p>

      <h2>7. Availability</h2>
      <p>
        Etudo is a young platform running on free infrastructure. It may be slow, may be down,
        and features may change or be removed. We do not promise uninterrupted service.
      </p>

      <h2>8. Liability</h2>
      <p>
        To the extent the law allows, Etudo is provided as it is. We are not liable for loss you
        suffer from using it, from another user&apos;s behaviour, or from decisions you take based
        on its content.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms. If a change is significant we will say so in the app. Continuing
        to use Etudo after a change means you accept the updated terms.
      </p>

      <h2>10. Law</h2>
      <p>These terms are governed by the laws of India.</p>
    </LegalShell>
  );
}
