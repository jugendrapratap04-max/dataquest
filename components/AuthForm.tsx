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
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErr("Network problem — please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      {/* noValidate: our own validate() owns the messaging (Hinglish, specific),
          so the browser's native English bubbles don't fire first. */}
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-logo">
          <div className="mark">D</div>
          <div><span className="wm">DataMarg</span></div>
        </div>
        <h1>{isSignup ? "Create your account" : "Welcome back 👋"}</h1>
        <p className="sub">{isSignup ? "One account, and the whole data science path is yours." : "Sign in and pick up exactly where you left off."}</p>

        {err && <div className="auth-err">{err}</div>}

        {isSignup && (
          <div className="auth-field">
            <label>Name</label>
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jugendra Pratap" autoComplete="name" />
          </div>
        )}
        <div className="auth-field">
          <label>Email</label>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? "6+ characters" : "••••••••"} autoComplete={isSignup ? "new-password" : "current-password"} />
        </div>

        <button className="btn btn-primary auth-btn" type="submit" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Create account →" : "Sign in →"}
        </button>

        <div className="auth-alt">
          {isSignup ? <>Already have an account? <Link href="/login">Sign in</Link></> : <>New here? <Link href="/signup">Create an account</Link></>}
        </div>
      </form>
    </div>
  );
}
