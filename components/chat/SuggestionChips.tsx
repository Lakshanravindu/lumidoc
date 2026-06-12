"use client";

import { Sparkles } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-violet-400" />
        <span className="text-xs text-zinc-500">Follow-up suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-500 text-zinc-300 hover:text-zinc-100 rounded-full px-3 py-1.5 transition-all text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
