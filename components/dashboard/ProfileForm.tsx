"use client";

import { useState } from "react";
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
    <div className="rounded-xl border border-paper/10 bg-ink-soft p-6">
      <h2 className="mb-4 text-sm font-medium text-paper">Profile</h2>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-lg font-semibold text-gold">
          {initialAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initialAvatar} alt="" className="size-14 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-paper">{displayName || email}</p>
          <p className="text-xs text-paper-faint">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-paper-dim">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="lumi-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-paper-dim">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="lumi-input cursor-not-allowed opacity-60"
          />
          <p className="mt-1 text-xs text-paper-faint">Email cannot be changed here</p>
        </div>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
