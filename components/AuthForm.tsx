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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Kuch galat ho gaya."); setBusy(false); return; }
      router.push("/");
      router.refresh();
    } catch {
      setErr("Network issue — dobara try karo.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">
          <div className="mark">D</div>
          <div><span className="wm">DataQuest</span></div>
        </div>
        <h1>{isSignup ? "Naya account banao" : "Wapas aa gaye? 👋"}</h1>
        <p className="sub">{isSignup ? "Ek account, aur poora data science safar tumhara." : "Login karo aur wahin se shuru karo jahan chhoda tha."}</p>

        {err && <div className="auth-err">{err}</div>}

        {isSignup && (
          <div className="auth-field">
            <label>Naam</label>
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
          {busy ? "Ruko…" : isSignup ? "Account banao →" : "Login →"}
        </button>

        <div className="auth-alt">
          {isSignup ? <>Pehle se account hai? <Link href="/login">Login karo</Link></> : <>Naye ho? <Link href="/signup">Account banao</Link></>}
        </div>
      </form>
    </div>
  );
}
