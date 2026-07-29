import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — DataMarg",
  description: "What DataMarg stores, why, and what it never does with your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" current="/privacy">
      <p className="legal-lead">
        This describes exactly what DataMarg stores and why. It is written from what the code
        actually does, not from a template.
      </p>

      <h2>What we store</h2>
      <ul>
        <li><b>Your account</b> — name, email address, and your password stored only as a salted hash. We never hold your password itself.</li>
        <li>
          <b>What you tell us when you join</b> — the four optional answers on the welcome screen:
          gender, your class or college, what you are here to learn, and the language you are most
          comfortable in. Every one of them can be skipped, and skipping changes nothing except
          which welcome you see. We use them to choose your welcome and to understand who the
          platform is actually reaching. They are never shown to other students, never used for
          advertising, and never sold or shared.
        </li>
        <li><b>Your learning</b> — which lessons you have finished, the code you submit to practice problems, your XP, and the notes you write.</li>
        <li><b>Study sessions</b> — when a focus session or room sitting started and ended, and how much of it you were actually active for.</li>
        <li><b>Study rooms</b> — which rooms you joined, the preset messages and emoji you send in them, and doubts you choose to push to the discussion queue.</li>
        <li><b>Feedback</b> — anything you send through the feedback button, along with the page you were on.</li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell your data, and we never will.</li>
        <li>We run <b>no advertising, no analytics and no third-party trackers</b>. There is no Google Analytics, no pixel, no session recorder in this app — you can check the page source.</li>
        <li>We do not read your private notebook. Notebook entries stay yours until you choose to share one with a room, and even a room&apos;s host cannot open them.</li>
      </ul>

      <h2>Voice calls</h2>
      <p>
        Voice in study rooms is <b>peer to peer</b>. The audio travels directly between the browsers
        of the people in the room and <b>never passes through our servers</b>. Nothing is recorded
        and no audio is stored anywhere by us.
      </p>
      <p>
        The only thing our server handles is the short technical message two browsers swap to find
        each other — it contains network addresses, not speech, and it is deleted the moment the
        other browser collects it.
      </p>

      <h2>Who else can see it</h2>
      <p>We use two service providers to run DataMarg, and your data sits on their infrastructure:</p>
      <ul>
        <li><b>Vercel</b> — hosting and serving the site.</li>
        <li><b>Neon</b> — the database, hosted in Singapore.</li>
      </ul>
      <p>Nobody else receives your data. We do not share it with advertisers or data brokers.</p>

      <h2>How long we keep it</h2>
      <p>
        Your account and learning history stay until you ask us to delete them. Signalling messages
        for voice are deleted within seconds. Feedback is kept so we can act on it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask for a copy of your data, ask us to correct it, or ask us to delete your account
        and everything in it. Write to the Grievance Officer below and we will do it.
      </p>

      <h2>If you are under 18</h2>
      <p>
        DataMarg is intended for learners aged 16 and over, and anyone under 18 should be using it
        with a parent or guardian&apos;s permission. We do not knowingly build profiles of children,
        show them advertising, or track their behaviour — we run no advertising or tracking at all.
        If you are a parent and want your child&apos;s account and data removed, write to us and we
        will remove it.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are hashed with scrypt. Sessions use a signed cookie that expires after 30 days.
        Repeated failed logins from one address are throttled. No system is perfect, and we will
        tell you if something happens that affects your data.
      </p>
    </LegalShell>
  );
}
