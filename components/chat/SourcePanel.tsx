"use client";

import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SourceChunk } from "@/types";

interface SourcePanelProps {
  sources: SourceChunk[];
  onClose: () => void;
}

export function SourcePanel({ sources, onClose }: SourcePanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const byDocument = sources.reduce<Record<string, SourceChunk[]>>((acc, s) => {
    const key = s.document_id;
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="w-80 flex-shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-200">Sources</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {Object.entries(byDocument).map(([docId, chunks]) => {
          const docName = chunks[0].document_name ?? "Document";
          const isOpen = expanded === docId;

          return (
            <div key={docId} className="rounded-xl border border-zinc-800 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : docId)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-800 hover:bg-zinc-750 transition-colors text-left"
              >
                <span className="text-xs font-medium text-zinc-200 truncate flex-1">{docName}</span>
                <span className="text-xs text-zinc-500 mr-2">
                  {chunks.length} chunk{chunks.length !== 1 ? "s" : ""}
                </span>
                {isOpen ? (
                  <ChevronUp size={13} className="text-zinc-400" />
                ) : (
                  <ChevronDown size={13} className="text-zinc-400" />
                )}
              </button>

              {isOpen && (
                <div className="divide-y divide-zinc-800">
                  {chunks.map((chunk) => (
                    <div key={chunk.chunk_id} className="px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-zinc-500">Chunk {chunk.chunk_index + 1}</span>
                        <RelevanceBar score={chunk.combined_score} />
                        <span className="text-xs text-zinc-500 ml-auto">
                          {(chunk.combined_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RelevanceBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score * 100));
  return (
    <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full",
          pct > 70 ? "bg-emerald-500" : pct > 40 ? "bg-amber-500" : "bg-zinc-500"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
