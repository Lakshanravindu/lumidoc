"use client";

import { Sparkles } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-gold" />
        <span className="text-xs text-paper-faint">Follow-up suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-xs bg-ink-soft hover:bg-paper/[0.06] border border-paper/10 hover:border-gold/40 text-paper-dim hover:text-paper rounded-full px-3 py-1.5 transition-all text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
