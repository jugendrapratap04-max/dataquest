"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Two screens: the questions, then the welcome.
//
// The questions are deliberately NOT on the signup form. Of 14 real signups, 12
// never opened a lesson, and a six-field wall is exactly how that number gets
// worse. Signup stays three fields; this runs immediately after, and every
// question here can be skipped.
//
// The welcome plays once. `welcomedAt` on the account is what guarantees it —
// not a localStorage flag, which a second device would replay.

const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "unspecified", label: "Prefer not to say" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hi", label: "Hindi" },
];

const INTERESTS = [
  "Data Science", "Machine Learning", "Web Development", "App Development",
  "DSA & Interviews", "Cloud", "Cyber Security", "Just exploring",
];

// Three welcomes, one per answer. Same warmth, different figure — the neutral
// one is a real welcome, not a fallback with the personality removed.
const WELCOME: Record<string, { art: string; line: string }> = {
  male: { art: "🙋‍♂️", line: "Good to have you here." },
  female: { art: "🙋‍♀️", line: "Good to have you here." },
  unspecified: { art: "👋", line: "Good to have you here." },
};

export function Onboarding({ name, firstLesson }: { name: string; firstLesson: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "welcome">("form");
  const [gender, setGender] = useState("unspecified");
  const [institution, setInstitution] = useState("");
  const [language, setLanguage] = useState("en");
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const toggle = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  async function save(skip = false) {
    setBusy(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        skip ? { gender: "unspecified" } : { gender, institution, language, interests }
      ),
    }).catch(() => null);
    setBusy(false);
    setStep("welcome");
  }

  // Record that the welcome has been seen the moment it is shown, so closing the
  // tab mid-animation does not make it play again on the next visit.
  useEffect(() => {
    if (step !== "welcome") return;
    fetch("/api/onboarding", { method: "PATCH" }).catch(() => null);
  }, [step]);

  if (step === "welcome") {
    const w = WELCOME[gender] ?? WELCOME.unspecified;
    return (
      <div className="ob-welcome">
        <div className="ob-art" aria-hidden="true">{w.art}</div>
        <h1>Welcome, {name.split(" ")[0]}!</h1>
        <p className="ob-line">{w.line}</p>
        <p className="ob-sub">
          Here is how this works: read a topic, solve two problems from it, and the next topic
          opens. Finish a chapter and you can download its notes. Nothing is unlocked by scrolling.
        </p>
        <button className="btn btn-primary ob-cta" onClick={() => router.push(`/learn/${firstLesson}`)}>
          Start your first topic →
        </button>
      </div>
    );
  }

  return (
    <div className="ob-form">
      <div className="eyebrow">One quick step</div>
      <h1>Tell us a little about you</h1>
      <p className="ob-sub">All of it is optional, and you can change it later.</p>

      <div className="ob-field">
        <span className="ob-label">You are</span>
        <div className="ob-choices">
          {GENDERS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`ob-chip${gender === g.id ? " on" : ""}`}
              onClick={() => setGender(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ob-field">
        <label className="ob-label" htmlFor="ob-inst">Class or college</label>
        <input
          id="ob-inst"
          className="auth-input"
          placeholder="B.Tech CSE, 2nd year"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
      </div>

      <div className="ob-field">
        <span className="ob-label">What are you here for</span>
        <div className="ob-choices">
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              className={`ob-chip${interests.includes(i) ? " on" : ""}`}
              onClick={() => toggle(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="ob-field">
        <span className="ob-label">Language you are most comfortable in</span>
        <div className="ob-choices">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`ob-chip${language === l.id ? " on" : ""}`}
              onClick={() => setLanguage(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        {/* Said plainly rather than implied. Asking for a preference and then
            ignoring it is the kind of thing this platform keeps having to undo. */}
        <p className="ob-note">Every lesson is in English today. We are recording this for when that changes.</p>
      </div>

      <div className="ob-actions">
        <button className="btn btn-primary" onClick={() => save(false)} disabled={busy}>
          {busy ? "Saving…" : "Continue →"}
        </button>
        <button className="btn btn-ghost" onClick={() => save(true)} disabled={busy}>
          Skip
        </button>
      </div>
    </div>
  );
}
