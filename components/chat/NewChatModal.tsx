"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, MessageSquarePlus } from "lucide-react";
import type { DocumentRecord, ConversationRecord } from "@/types";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  documents: DocumentRecord[];
}

export function NewChatModal({ open, onClose, workspaceId, documents }: NewChatModalProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  // Pre-select all docs when modal opens
  useEffect(() => {
    if (open) {
      setSelected(new Set(documents.map((d) => d.id)));
    }
  }, [open, documents]);

  function toggleDoc(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(documents.map((d) => d.id)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleCreate() {
    if (selected.size === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          document_ids: [...selected],
        }),
      });
      const data = (await res.json()) as { conversation: ConversationRecord };
      onClose();
      router.push(`/workspace/${workspaceId}/chat/${data.conversation.id}`);
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white">New Conversation</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Select documents to query</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Select all / none */}
        <div className="px-5 py-2.5 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {selected.size} of {documents.length} selected
          </span>
          <div className="flex gap-3">
            <button onClick={selectAll} className="text-xs text-violet-400 hover:text-violet-300">
              All
            </button>
            <button onClick={deselectAll} className="text-xs text-zinc-500 hover:text-zinc-300">
              None
            </button>
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {documents.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-8">No ready documents</p>
          ) : (
            documents.map((doc) => {
              const isChecked = selected.has(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isChecked
                      ? "bg-violet-500/10 border border-violet-500/30"
                      : "bg-zinc-800/50 border border-transparent hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked ? "bg-violet-500 border-violet-500" : "border-zinc-600"
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 10 8"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    )}
                  </div>
                  <FileText size={14} className="flex-shrink-0 text-zinc-500" />
                  <span className="text-sm text-zinc-300 truncate">{doc.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selected.size === 0 || creating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <MessageSquarePlus size={14} />
            {creating ? "Creating…" : "Start Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}
