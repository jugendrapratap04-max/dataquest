"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Catch the obvious mistakes here so an empty field or a typo'd email shows an
  // answer immediately, instead of a round-trip to the server and back. The
  // server still validates — this is only about not making the user wait for a
  // bounce it can already see.
  function validate(): string | null {
    if (isSignup && !name.trim()) return "Enter your name.";
    if (!email.trim()) return "Enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "That email does not look right — check it again.";
    if (!password) return "Enter a password.";
    if (isSignup && password.length < 6) return "Use a password of at least 6 characters.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) { setErr(problem); return; }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Something went wrong."); setBusy(false); return; }
      // A brand-new account goes to the one-time welcome, which asks four
      // optional questions and then drops them into lesson 1 — not to the
      // dashboard. Of 14 real signups, 12 never opened a single lesson, and what
      // they were shown one click earlier was a progress dashboard with no
      // progress in it. Returning users still land on the dashboard, which is
      // genuinely theirs by then.
      router.push(isSignup ? "/welcome" : "/dashboard");
      router.refresh();
    } catch {
      setErr("Network problem — please try again.");
      setBusy(false);
    }
  }

  return (
    // <main>, not a bare <div>. /login and /signup sit outside the app layout,
    // so they inherited neither its landmark nor its skip link and reached a
    // screen reader as an unstructured page. They need no skip link — the form
    // is the first thing in the tab order already — but they do need somewhere
    // for "jump to the content" to land.
    <main className="auth-wrap" id="main">
      {/* noValidate: our own validate() owns the messaging (Hinglish, specific),
          so the browser's native English bubbles don't fire first. */}
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-logo">
          <div className="mark">E</div>
          <div><span className="wm">Etudo</span></div>
        </div>
        <h1>{isSignup ? "Create your account" : "Welcome back 👋"}</h1>
        <p className="sub">{isSignup ? "One account, and the whole data science path is yours." : "Sign in and pick up exactly where you left off."}</p>

        {err && <div className="auth-err">{err}</div>}

        {/* htmlFor/id on every field: a label that is merely a sibling of its
            input is not a label to a screen reader, and this is the first form
            anyone meets. */}
        {isSignup && (
          <div className="auth-field">
            <label htmlFor="auth-name">Name</label>
            <input id="auth-name" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jugendra Pratap" autoComplete="name" />
          </div>
        )}
        <div className="auth-field">
          <label htmlFor="auth-email">Email</label>
          <input id="auth-email" className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        </div>
        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? "6+ characters" : "••••••••"} autoComplete={isSignup ? "new-password" : "current-password"} />
        </div>

        <button className="btn btn-primary auth-btn" type="submit" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Create account →" : "Sign in →"}
        </button>

        {/* Shown at the moment the account is created, which is when consent
            actually has to be given — not buried in a footer somewhere. */}
        {isSignup && (
          <p className="auth-legal">
            By creating an account you agree to our <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/guidelines">Community Guidelines</Link>, and to the{" "}
            <Link href="/privacy">Privacy Policy</Link>. If you are under 18, please use Etudo
            with a parent or guardian&apos;s permission.
          </p>
        )}

        <div className="auth-alt">
          {isSignup ? <>Already have an account? <Link href="/login">Sign in</Link></> : <>New here? <Link href="/signup">Create an account</Link></>}
        </div>
      </form>
    </main>
  );
}
