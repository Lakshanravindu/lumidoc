"use client";

import { useState, useTransition } from "react";
import { FileText, Trash2, MessageSquare, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import ProcessingStatus from "./ProcessingStatus";
import { toast } from "@/components/ui/toast";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const fileLabel =
    FILE_ICONS[doc.mime_type] ?? doc.mime_type.split("/")[1]?.toUpperCase() ?? "FILE";

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(doc.id);
        toast("Document deleted");
      } else {
        toast("Could not delete document", "error");
      }
    } catch {
      toast("Could not delete document", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
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
            <div className="animate-pop-in absolute right-0 top-8 z-10 min-w-[150px] origin-top-right rounded-xl border border-paper/[0.08] bg-ink-raised py-1 shadow-[0_18px_44px_-12px_var(--lumi-shadow)]">
              <button
                onClick={handleChat}
                disabled={doc.status !== "ready"}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-paper-dim hover:bg-paper/[0.05] hover:text-paper disabled:opacity-40"
              >
                <MessageSquare className="size-3.5" />
                Chat
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmDelete(true);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#b4302a] hover:bg-red-500/[0.08]"
              >
                <Trash2 className="size-3.5" />
                Delete
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

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div className="animate-pop-in absolute inset-0 z-20 flex flex-col justify-center gap-3 rounded-2xl border border-paper/[0.08] bg-ink-soft/95 p-5 shadow-[0_18px_50px_-12px_var(--lumi-shadow)] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#b4302a]">
              <Trash2 className="size-4" />
            </span>
            <p className="text-sm font-semibold text-paper">Delete document?</p>
          </div>
          <p className="text-xs leading-relaxed text-paper-dim">
            <span className="font-medium text-paper">“{doc.name}”</span> will be permanently
            removed.
          </p>
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-9 flex-1 rounded-xl bg-[#b4302a] text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgba(180,48,42,0.6)] transition hover:bg-[#9c2823] active:scale-[0.98] disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="h-9 rounded-xl border border-paper/15 px-4 text-sm text-paper-dim transition hover:bg-paper/[0.04] hover:text-paper"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
