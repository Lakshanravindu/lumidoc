"use client";

import { useState, useTransition } from "react";
import { FileText, Trash2, MessageSquare, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import ProcessingStatus from "./ProcessingStatus";
import type { DocumentRecord } from "@/types";

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "text/plain": "TXT",
  "text/markdown": "MD",
  "text/csv": "CSV",
  "application/json": "JSON",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentCardProps {
  document: DocumentRecord;
  workspaceId: string;
  onDelete: (id: string) => void;
}

export default function DocumentCard({ document: doc, workspaceId, onDelete }: DocumentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const fileLabel =
    FILE_ICONS[doc.mime_type] ?? doc.mime_type.split("/")[1]?.toUpperCase() ?? "FILE";

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (res.ok) onDelete(doc.id);
    } finally {
      setDeleting(false);
    }
  }

  function handleChat() {
    startTransition(() => router.push(`/workspace/${workspaceId}/chat?doc=${doc.id}`));
  }

  return (
    <div className="group relative flex flex-col rounded-2xl border border-paper/[0.07] bg-ink-soft p-5 transition-all hover:border-gold/20 hover:bg-ink-raised">
      {/* File type badge + status */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.08]">
            <FileText className="size-4.5 text-gold" />
          </div>
          <span className="rounded-md border border-paper/[0.08] bg-paper/[0.04] px-2 py-0.5 text-xs font-semibold text-paper-dim">
            {fileLabel}
          </span>
        </div>

        {/* Context menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-1.5 text-paper-faint opacity-0 transition group-hover:opacity-100 hover:bg-paper/[0.06] hover:text-paper-dim"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-xl border border-paper/[0.08] bg-ink-raised py-1 shadow-2xl">
              <button
                onClick={handleChat}
                disabled={doc.status !== "ready"}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-paper-dim hover:bg-paper/[0.05] hover:text-paper disabled:opacity-40"
              >
                <MessageSquare className="size-3.5" />
                Chat
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/[0.06] hover:text-red-400 disabled:opacity-40"
              >
                <Trash2 className="size-3.5" />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <p className="mb-1 truncate text-sm font-semibold text-paper" title={doc.name}>
        {doc.name}
      </p>

      {/* Meta */}
      <p className="mb-3 text-xs text-paper-faint">
        {formatBytes(doc.size_bytes)}
        {doc.status === "ready" && doc.chunk_count > 0 && ` · ${doc.chunk_count} chunks`}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <ProcessingStatus status={doc.status} />
        <span className="text-xs text-paper-faint/60">
          {new Date(doc.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {doc.status === "error" && doc.error_msg && (
        <p className="mt-2 truncate text-xs text-red-400/70" title={doc.error_msg}>
          {doc.error_msg}
        </p>
      )}
    </div>
  );
}
