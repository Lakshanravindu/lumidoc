"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

interface WorkspaceListProps {
  workspaces: Tables<"workspaces">[];
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
      setWorkspaces((prev) => [data, ...prev]);
      setCreateName("");
      setShowCreate(false);
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
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? data : w)));
    }
    setRenamingId(null);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (!error) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    }
    setMenuOpenId(null);
  }

  function openWorkspace(id: string) {
    startTransition(() => router.push(`/workspace/${id}`));
  }

  return (
    <div>
      {/* Create button */}
      {showCreate ? (
        <form onSubmit={handleCreate} className="mb-6 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Workspace name"
            className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
          />
          <button
            type="submit"
            disabled={creating || !createName.trim()}
            className="h-9 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCreate(false);
              setCreateName("");
            }}
            className="h-9 rounded-lg border border-white/10 px-3 text-sm text-neutral-400 transition hover:text-white"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="mb-6 flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-neutral-400 transition hover:border-white/40 hover:text-white"
        >
          <Plus className="size-4" />
          New workspace
        </button>
      )}

      {workspaces.length === 0 ? (
        <div className="py-16 text-center">
          <Folder className="mx-auto mb-3 size-10 text-neutral-700" />
          <p className="text-sm text-neutral-500">No workspaces yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="group relative rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              {renamingId === ws.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRename(ws.id);
                  }}
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    type="text"
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-white/30"
                  />
                  <button type="submit" className="text-xs text-white hover:underline">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => openWorkspace(ws.id)}
                  className="block w-full text-left"
                  disabled={isPending}
                >
                  <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-white/10">
                    <Folder className="size-4 text-white" />
                  </div>
                  <p className="truncate font-medium text-white">{ws.name}</p>
                  {ws.description && (
                    <p className="mt-0.5 truncate text-xs text-neutral-400">{ws.description}</p>
                  )}
                  <p className="mt-2 text-xs text-neutral-600">
                    {new Date(ws.updated_at).toLocaleDateString()}
                  </p>
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
                    className="rounded p-1 text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                  {menuOpenId === ws.id && (
                    <div className="absolute right-0 top-7 z-10 min-w-[130px] rounded-lg border border-white/10 bg-neutral-900 py-1 shadow-xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameName(ws.name);
                          setRenamingId(ws.id);
                          setMenuOpenId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                      >
                        <Pencil className="size-3.5" />
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ws.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
