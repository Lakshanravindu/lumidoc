"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-sm font-medium text-white">Profile</h2>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
          {initialAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initialAvatar} alt="" className="size-14 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{displayName || email}</p>
          <p className="text-xs text-neutral-500">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-300">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-300">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-500 outline-none cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-neutral-600">Email cannot be changed here</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
