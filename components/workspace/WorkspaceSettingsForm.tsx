"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { WorkspaceSettings } from "@/types";

interface WorkspaceSettingsFormProps {
  workspaceId: string;
  initialSettings: WorkspaceSettings;
}

const STYLE_OPTIONS: { value: WorkspaceSettings["response_style"]; label: string; desc: string }[] =
  [
    { value: "concise", label: "Concise", desc: "Brief, direct answers" },
    { value: "detailed", label: "Detailed", desc: "Thorough with explanations" },
    { value: "bullets", label: "Bullet Points", desc: "Structured lists" },
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
      await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Response Style */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Response Style</label>
        <div className="grid grid-cols-3 gap-3">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSettings((s) => ({ ...s, response_style: opt.value }))}
              className={`p-3 rounded-xl border text-left transition-colors ${
                settings.response_style === opt.value
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Response Language</label>
        <select
          value={settings.language}
          onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
          className="w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 mt-1.5">
          AI will respond in this language regardless of query language.
        </p>
      </div>

      {/* Strict Mode */}
      <div>
        <div className="flex items-center justify-between max-w-sm">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Strict Mode</label>
            <p className="text-xs text-zinc-500 mt-0.5">
              Only answer from uploaded documents. Refuse outside knowledge.
            </p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, strict_mode: !s.strict_mode }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.strict_mode ? "bg-violet-600" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                settings.strict_mode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          <Save size={14} />
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
