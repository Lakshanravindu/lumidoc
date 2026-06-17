"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Folder, MoreHorizontal, Pencil, Trash2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import type { Tables } from "@/types/database";

export type WorkspaceWithCount = Tables<"workspaces"> & { docCount: number };

interface WorkspaceListProps {
  workspaces: WorkspaceWithCount[];
}

export default function WorkspaceList({ workspaces: initial }: WorkspaceListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [workspaces, setWorkspaces] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: createName.trim(), user_id: user!.id })
      .select()
      .single();
    setCreating(false);
    if (!error && data) {
      setWorkspaces((prev) => [{ ...data, docCount: 0 }, ...prev]);
      setCreateName("");
      setShowCreate(false);
      toast("Workspace created");
    } else {
      toast("Could not create workspace", "error");
    }
  }

  async function handleRename(id: string) {
    if (!renameName.trim()) return;
    const { data, error } = await supabase
      .from("workspaces")
      .update({ name: renameName.trim() })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
      toast("Workspace renamed");
    } else {
      toast("Could not rename workspace", "error");
    }
    setRenamingId(null);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (!error) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      toast("Workspace deleted");
    } else {
      toast("Could not delete workspace", "error");
    }
    setConfirmDeleteId(null);
    setMenuOpenId(null);
  }

  function openWorkspace(id: string) {
    startTransition(() => router.push(`/workspace/${id}`));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {/* New workspace card */}
      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className="flex flex-col justify-center gap-2 rounded-2xl border border-dashed border-gold/30 bg-gold/[0.04] p-5"
        >
          <input
            autoFocus
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Workspace name…"
            className="lumi-input"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={creating || !createName.trim()}
              className="h-9 flex-1 rounded-xl bg-gold text-sm font-semibold text-ink transition hover:bg-gold-soft active:scale-[0.98] disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setCreateName("");
              }}
              className="h-9 rounded-xl border border-paper/10 px-3 text-sm text-paper-faint transition hover:text-paper-dim"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="group flex min-h-[140px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-gold/25 text-sm text-paper-faint transition hover:border-gold/45 hover:bg-gold/[0.03] hover:text-paper-dim"
        >
          <span className="flex size-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.08] transition group-hover:bg-gold/[0.14]">
            <Plus className="size-4.5 text-gold" />
          </span>
          New workspace
        </button>
      )}

      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className="group relative rounded-2xl border border-paper/[0.07] bg-ink-soft transition-all hover:border-gold/25 hover:bg-ink-raised"
        >
          {renamingId === ws.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRename(ws.id);
              }}
              className="flex items-center gap-2 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                type="text"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                className="lumi-input flex-1"
              />
              <button type="submit" className="text-xs font-medium text-gold hover:text-gold-soft">
                Save
              </button>
              <button
                type="button"
                onClick={() => setRenamingId(null)}
                className="text-xs text-paper-faint hover:text-paper-dim"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => openWorkspace(ws.id)}
              className="block w-full p-5 text-left"
              disabled={isPending}
            >
              {/* Folder icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.08]">
                <Folder className="size-4.5 text-gold" />
              </div>

              <p className="truncate text-sm font-semibold text-paper">{ws.name}</p>
              {ws.description && (
                <p className="mt-0.5 truncate text-xs text-paper-faint">{ws.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-paper-faint/70">
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3" />
                  {ws.docCount} {ws.docCount === 1 ? "doc" : "docs"}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-paper-faint/40" />
                <span>
                  {new Date(ws.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </button>
          )}

          {/* Context menu */}
          {renamingId !== ws.id && (
            <div className="absolute right-3 top-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === ws.id ? null : ws.id);
                }}
                className="rounded-lg p-1.5 text-paper-faint opacity-0 transition group-hover:opacity-100 hover:bg-paper/[0.06] hover:text-paper-dim"
              >
                <MoreHorizontal className="size-4" />
              </button>
              {menuOpenId === ws.id && (
                <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-xl border border-paper/[0.08] bg-ink-raised py-1 shadow-2xl">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameName(ws.name);
                      setRenamingId(ws.id);
                      setMenuOpenId(null);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-paper-dim hover:bg-paper/[0.05] hover:text-paper"
                  >
                    <Pencil className="size-3.5" />
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      setConfirmDeleteId(ws.id);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600/90 hover:bg-red-500/[0.08] hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete confirmation overlay */}
          {confirmDeleteId === ws.id && (
            <div className="absolute inset-0 z-20 flex flex-col justify-center gap-3 rounded-2xl border border-red-500/30 bg-ink-soft/95 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-paper">Delete “{ws.name}”?</p>
              <p className="text-xs text-paper-dim">
                This permanently removes the workspace and all its documents.
              </p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => handleDelete(ws.id)}
                  className="h-9 flex-1 rounded-xl bg-red-600 text-sm font-medium text-white transition hover:bg-red-500 active:scale-[0.98]"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="h-9 rounded-xl border border-paper/10 px-3 text-sm text-paper-dim transition hover:text-paper"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
