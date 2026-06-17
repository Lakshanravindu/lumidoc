"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyPrompt, setVerifyPrompt] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setVerifyPrompt(true);
    }
  }

  if (verifyPrompt) {
    return (
      <div className="w-full max-w-md">
        <div className="lumi-card rounded-2xl border border-paper/[0.08] bg-ink-soft/90 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
            <svg
              className="h-6 w-6 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl italic text-paper">Check your email</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-dim">
            We sent a verification link to{" "}
            <strong className="font-medium text-paper">{email}</strong>. Click it to activate your
            account.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-1.5 text-sm text-paper-faint transition-colors hover:text-paper-dim"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo + heading */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-gold/20 to-transparent">
            <span className="absolute inset-0 rounded-xl bg-gold/10 blur-lg transition group-hover:bg-gold/20" />
            <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-gold" fill="none">
              <path
                d="M12 2.5v19M5 6.5l14 11M5 17.5l14-11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-display text-xl tracking-tight text-paper">LumiDoc</span>
        </Link>
        <div className="text-center">
          <h1 className="font-display text-3xl italic text-paper">Create an account</h1>
          <p className="mt-1.5 text-sm text-paper-dim">Start chatting with your documents</p>
        </div>
      </div>

      {/* Card */}
      <div className="lumi-card rounded-2xl border border-paper/[0.08] bg-ink-soft/90 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleRegister} className="space-y-4">
          <Field label="Display name">
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="lumi-input"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="lumi-input"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="lumi-input"
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-ink transition hover:bg-gold-soft active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-paper-faint">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-paper-dim underline-offset-4 transition hover:text-paper hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-paper-dim">{label}</label>
      {children}
    </div>
  );
}
