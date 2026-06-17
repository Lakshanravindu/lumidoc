"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "password" | "magic-link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMagicSent(true);
    }
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
          <h1 className="font-display text-3xl italic text-paper">Welcome back</h1>
          <p className="mt-1.5 text-sm text-paper-dim">Sign in to your LumiDoc account</p>
        </div>
      </div>

      {/* Card */}
      <div className="lumi-card rounded-2xl border border-paper/[0.08] bg-ink-soft/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Tabs */}
        <div className="mb-5 flex rounded-xl border border-paper/[0.07] bg-ink-raised/50 p-1">
          {(["password", "magic-link"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError(null);
                setMagicSent(false);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                tab === t
                  ? "bg-ink-soft text-paper shadow-sm ring-1 ring-paper/10"
                  : "text-paper-faint hover:text-paper-dim"
              }`}
            >
              {t === "password" ? "Password" : "Magic link"}
            </button>
          ))}
        </div>

        {tab === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : magicSent ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
              <svg
                className="h-5 w-5 text-gold"
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
            <p className="text-sm text-paper-dim">
              Check your inbox — we sent a link to{" "}
              <strong className="font-medium text-paper">{email}</strong>
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="mt-4 text-xs text-paper-faint underline-offset-4 transition hover:text-paper-dim hover:underline"
            >
              Send again
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
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
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-paper-faint">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-paper-dim underline-offset-4 transition hover:text-paper hover:underline"
        >
          Sign up
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
