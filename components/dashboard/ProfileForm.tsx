"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

interface ProfileFormProps {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export default function ProfileForm({
  userId,
  email,
  displayName: initialName,
  avatarUrl: initialAvatar,
}: ProfileFormProps) {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({ display_name: displayName.trim() || null })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setError(error.message);
      toast("Could not save profile", "error");
    } else {
      setSaved(true);
      toast("Profile saved");
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl border border-paper/[0.07] bg-ink-soft p-6 shadow-[0_1px_2px_rgba(60,44,18,0.04)] sm:p-7">
      <div className="mb-6 flex items-center gap-2.5 border-b border-paper/[0.07] pb-4">
        <span className="flex size-8 items-center justify-center rounded-lg border border-gold/20 bg-gold/[0.08] text-gold">
          <User className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-paper">Profile</h2>
          <p className="text-xs text-paper-faint">Your personal information</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-xl font-semibold text-gold ring-2 ring-gold/10">
          {initialAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initialAvatar} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-paper">{displayName || email}</p>
          <p className="truncate text-xs text-paper-faint">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-paper-dim">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="lumi-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-paper-dim">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="lumi-input cursor-not-allowed opacity-60"
          />
          <p className="mt-1.5 text-xs text-paper-faint">Email cannot be changed here</p>
        </div>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_8px_20px_-10px_rgba(176,116,20,0.6)] transition hover:bg-gold-soft active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="animate-pop-in text-xs font-medium text-gold">Saved ✓</span>}
        </div>
      </form>
    </div>
  );
}
