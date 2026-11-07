"use client";
import { useState } from "react";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (isSignup && password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, username, password } : { username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
      window.location.href = "/";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-top">
          <div className="pill">30-day plan</div>
          <h1 style={{ marginTop: 10 }}>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p>{isSignup ? "Start your own 30-day skin & gut routine." : "Log in to see today's routine."}</p>
        </div>
        <form className="auth-body" onSubmit={submit}>
          {isSignup && (
            <>
              <label htmlFor="name">Your name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </>
          )}
          <label htmlFor="username">Login ID</label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? 8 : undefined}
            required
          />
          {isSignup && (
            <>
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
              <p className="muted small" style={{ margin: "8px 0 0" }}>At least 8 characters.</p>
            </>
          )}
          {error && <div className="err" role="alert">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}</button>
          <p className="switch">
            {isSignup ? (
              <>Already have an account? <Link href="/login">Log in</Link></>
            ) : (
              <>New here? <Link href="/signup">Create an account</Link></>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
