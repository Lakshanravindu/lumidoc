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
      <div className="absolute inset-0 bg-paper/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-ink-soft border border-paper/12 rounded-2xl shadow-[0_24px_70px_-12px_var(--lumi-shadow)] flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-paper/10">
          <div>
            <h2 className="text-base font-semibold text-paper">New Conversation</h2>
            <p className="text-xs text-paper-faint mt-0.5">Select documents to query</p>
          </div>
          <button onClick={onClose} className="text-paper-faint hover:text-paper transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Select all / none */}
        <div className="px-5 py-2.5 border-b border-paper/10 flex items-center justify-between">
          <span className="text-xs text-paper-faint">
            {selected.size} of {documents.length} selected
          </span>
          <div className="flex gap-3">
            <button onClick={selectAll} className="text-xs text-gold hover:text-gold-soft">
              All
            </button>
            <button onClick={deselectAll} className="text-xs text-paper-faint hover:text-paper">
              None
            </button>
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {documents.length === 0 ? (
            <p className="text-xs text-paper-faint text-center py-8">No ready documents</p>
          ) : (
            documents.map((doc) => {
              const isChecked = selected.has(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isChecked
                      ? "bg-gold/10 border border-gold/35"
                      : "bg-paper/[0.04] border border-transparent hover:border-paper/12"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked ? "bg-gold border-gold" : "border-paper/25"
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-2.5 h-2.5 text-ink"
                        fill="none"
                        viewBox="0 0 10 8"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    )}
                  </div>
                  <FileText size={14} className="flex-shrink-0 text-paper-faint" />
                  <span className="text-sm text-paper-dim truncate">{doc.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-paper/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-paper-dim hover:text-paper transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selected.size === 0 || creating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gold hover:bg-gold-soft disabled:opacity-50 disabled:cursor-not-allowed text-ink text-sm font-medium transition-colors"
          >
            <MessageSquarePlus size={14} />
            {creating ? "Creating…" : "Start Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}
