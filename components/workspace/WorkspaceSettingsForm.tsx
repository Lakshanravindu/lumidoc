"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Zap, AlignLeft, List, Languages, ShieldCheck, type LucideIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { WorkspaceSettings } from "@/types";

interface WorkspaceSettingsFormProps {
  workspaceId: string;
  initialSettings: WorkspaceSettings;
}

const STYLE_OPTIONS: {
  value: WorkspaceSettings["response_style"];
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { value: "concise", label: "Concise", desc: "Brief, direct answers", icon: Zap },
  { value: "detailed", label: "Detailed", desc: "Thorough with explanations", icon: AlignLeft },
  { value: "bullets", label: "Bullet Points", desc: "Structured lists", icon: List },
];

const LANGUAGE_OPTIONS = [
  "English",
  "Sinhala",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Arabic",
];

export function WorkspaceSettingsForm({
  workspaceId,
  initialSettings,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<WorkspaceSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      toast("Settings saved");
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast("Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-paper/[0.07] bg-ink-soft p-6 shadow-[0_1px_2px_rgba(60,44,18,0.04)] sm:p-7">
        <div className="space-y-7">
          {/* Response Style */}
          <section>
            <div className="mb-3">
              <label className="block text-sm font-medium text-paper">Response Style</label>
              <p className="text-xs text-paper-faint">How detailed the answers should be</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {STYLE_OPTIONS.map((opt) => {
                const active = settings.response_style === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSettings((s) => ({ ...s, response_style: opt.value }))}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      active
                        ? "border-gold/50 bg-gold/10 shadow-[0_8px_22px_-14px_var(--lumi-shadow)]"
                        : "border-paper/10 bg-ink-raised/40 hover:border-paper/20 hover:bg-ink-raised"
                    }`}
                  >
                    <span
                      className={`mb-2 flex size-8 items-center justify-center rounded-lg border ${
                        active
                          ? "border-gold/30 bg-gold/15 text-gold"
                          : "border-paper/10 bg-paper/[0.04] text-paper-faint"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <p className={`text-sm font-medium ${active ? "text-gold" : "text-paper"}`}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-paper-dim">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="h-px bg-paper/[0.06]" />

          {/* Language */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Languages className="size-4 text-paper-faint" />
              <label className="text-sm font-medium text-paper">Response Language</label>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
              className="w-full max-w-xs rounded-xl border border-paper/10 bg-ink-raised px-3 py-2.5 text-sm text-paper transition focus:border-gold/50 focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-paper-faint">
              AI will respond in this language regardless of query language.
            </p>
          </section>

          <div className="h-px bg-paper/[0.06]" />

          {/* Strict Mode */}
          <section className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-paper-faint" />
              <div>
                <label className="block text-sm font-medium text-paper">Strict Mode</label>
                <p className="mt-0.5 text-xs text-paper-faint">
                  Only answer from uploaded documents. Refuse outside knowledge.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings((s) => ({ ...s, strict_mode: !s.strict_mode }))}
              aria-pressed={settings.strict_mode}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                settings.strict_mode ? "bg-gold" : "bg-paper/15"
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-ink-raised shadow transition-transform ${
                  settings.strict_mode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </section>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_8px_20px_-10px_rgba(176,116,20,0.6)] transition hover:bg-gold-soft active:scale-[0.98] disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span className="animate-pop-in text-xs font-medium text-gold">Saved ✓</span>}
      </div>
    </div>
  );
}
