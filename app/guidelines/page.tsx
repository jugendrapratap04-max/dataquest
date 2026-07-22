import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Community Guidelines — DataMarg",
  description: "The rules for studying together on DataMarg, including voice study rooms.",
};

export default function GuidelinesPage() {
  return (
    <LegalShell title="Community Guidelines" current="/guidelines">
      <p className="legal-lead">
        DataMarg exists so people can learn data science together. These guidelines keep it a place
        where a beginner is comfortable saying &quot;I don&apos;t understand this&quot; out loud.
      </p>

      <h2>What belongs here</h2>
      <ul>
        <li>Studying together, quietly or out loud.</li>
        <li>Asking questions at any level. Nobody here started knowing this.</li>
        <li>Helping other learners, and giving feedback that is meant to help.</li>
        <li>Sharing knowledge, notes and approaches.</li>
      </ul>

      <h2>What does not</h2>
      <ul>
        <li>Harassment, bullying, hate speech, or targeting someone for who they are.</li>
        <li>Abusive, threatening or sexual language, and sexual content of any kind.</li>
        <li>Spam, advertising, referral links, or trying to sell something.</li>
        <li>Scams, phishing, or asking other learners for money, OTPs or account details.</li>
        <li>Pretending to be someone else, including staff.</li>
        <li>Sharing anyone&apos;s personal information without their permission.</li>
        <li>Trying to break, overload or exploit the platform.</li>
        <li>Anything illegal under Indian law.</li>
      </ul>

      <h2>Voice study rooms</h2>
      <p>
        Voice rooms are for studying. They are not a general chat line, and they are not a place to
        meet strangers.
      </p>
      <p>
        Two things you should know about how voice works here, because they affect what we can and
        cannot do:
      </p>
      <ul>
        <li>
          <b>Calls are not recorded, by anyone.</b> Audio travels directly between the people in the
          room and never reaches our servers, so there is no recording for us — or for you — to
          replay later. We say this plainly because it means a report about something said in a
          call has no audio for us to review.
        </li>
        <li>
          <b>Voice is currently invite-only.</b> While it is being tested it works only in rooms
          opened by the DataMarg team, so you will not end up in a voice room with strangers.
        </li>
      </ul>
      <p>
        Because we cannot listen to calls, we rely on you. If someone behaves badly in a room, leave
        the room and report them. Repeated reports about the same account are acted on even without
        a recording.
      </p>

      <h2>Reporting</h2>
      <p>
        Use the report option to tell us about behaviour that breaks these guidelines, or write to
        the Grievance Officer below. Tell us who, where and roughly when — that is usually enough for
        us to act.
      </p>

      <h2>What happens to accounts that break the rules</h2>
      <p>
        Depending on how serious it is, and whether it has happened before: a warning, losing access
        to study rooms, temporary suspension, or a permanent ban. Threats, sexual content involving
        minors, and anything illegal skip straight to a permanent ban and, where required, a report
        to the authorities.
      </p>
    </LegalShell>
  );
}
