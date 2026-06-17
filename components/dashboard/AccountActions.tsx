"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ShieldAlert, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

export default function AccountActions({ email }: { email: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (confirmText !== email || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await createClient().auth.signOut();
      router.push("/");
    } catch {
      toast("Could not delete account", "error");
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Data */}
      <div className="rounded-2xl border border-paper/[0.07] bg-ink-soft p-6 shadow-[0_1px_2px_rgba(60,44,18,0.04)] sm:p-7">
        <div className="mb-5 flex items-center gap-2.5 border-b border-paper/[0.07] pb-4">
          <span className="flex size-8 items-center justify-center rounded-lg border border-gold/20 bg-gold/[0.08] text-gold">
            <Database className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-paper">Your data</h2>
            <p className="text-xs text-paper-faint">Download a copy of everything you’ve stored</p>
          </div>
        </div>
        <a
          href="/api/account/export"
          download
          className="inline-flex items-center gap-2 rounded-xl border border-paper/12 px-4 py-2.5 text-sm font-medium text-paper-dim transition hover:border-gold/40 hover:text-paper"
        >
          <Download className="size-4" />
          Export my data
        </a>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-2.5 border-b border-red-500/15 pb-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-[#b4302a]">
            <ShieldAlert className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-paper">Danger zone</h2>
            <p className="text-xs text-paper-faint">Irreversible account actions</p>
          </div>
        </div>

        {!confirming ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-paper-dim">
              Permanently delete your account, workspaces, documents, and conversations.
            </p>
            <button
              onClick={() => setConfirming(true)}
              className="shrink-0 rounded-xl border border-[#b4302a]/40 px-4 py-2.5 text-sm font-medium text-[#b4302a] transition hover:bg-red-500/[0.06]"
            >
              Delete account
            </button>
          </div>
        ) : (
          <div className="animate-pop-in space-y-3">
            <p className="text-xs leading-relaxed text-paper-dim">
              This cannot be undone. Type <span className="font-medium text-paper">{email}</span> to
              confirm.
            </p>
            <input
              type="email"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={email}
              className="lumi-input"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={confirmText !== email || deleting}
                className="rounded-xl bg-[#b4302a] px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgba(180,48,42,0.6)] transition hover:bg-[#9c2823] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete my account"}
              </button>
              <button
                onClick={() => {
                  setConfirming(false);
                  setConfirmText("");
                }}
                disabled={deleting}
                className="rounded-xl border border-paper/12 px-4 py-2.5 text-sm text-paper-dim transition hover:bg-paper/[0.04] hover:text-paper"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
