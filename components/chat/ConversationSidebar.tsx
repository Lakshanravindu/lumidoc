"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquarePlus, Pin, Trash2, Pencil, Check, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewChatModal } from "@/components/chat/NewChatModal";
import type { ConversationRecord, DocumentRecord } from "@/types";

interface ConversationSidebarProps {
  workspaceId: string;
  conversations: ConversationRecord[];
  documents: DocumentRecord[];
}

export function ConversationSidebar({
  workspaceId,
  conversations,
  documents,
}: ConversationSidebarProps) {
  const params = useParams();
  const router = useRouter();
  const activeId = params?.conversationId as string | undefined;
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const readyDocs = documents.filter((d) => d.status === "ready");

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  async function handleDelete(e: React.MouseEvent, convId: string) {
    e.preventDefault();
    await fetch(`/api/conversations/${convId}`, { method: "DELETE" });
    if (activeId === convId) {
      router.push(`/workspace/${workspaceId}/chat`);
    }
    router.refresh();
  }

  async function handlePin(e: React.MouseEvent, conv: ConversationRecord) {
    e.preventDefault();
    await fetch(`/api/conversations/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !conv.pinned }),
    });
    router.refresh();
  }

  async function handleRename(convId: string) {
    if (!renameValue.trim()) return;
    await fetch(`/api/conversations/${convId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: renameValue.trim() }),
    });
    setRenamingId(null);
    router.refresh();
  }

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-3 border-b border-zinc-800 space-y-2">
          <button
            onClick={() => setShowNewChatModal(true)}
            disabled={readyDocs.length === 0}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <MessageSquarePlus size={15} />
            New Chat
          </button>
          {readyDocs.length === 0 && (
            <p className="text-xs text-zinc-500 text-center">Upload documents first</p>
          )}
          {/* Search */}
          {conversations.length > 0 && (
            <input
              type="search"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredConversations.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-8">
              {searchQuery ? "No matches" : "No conversations yet"}
            </p>
          )}
          {filteredConversations.map((conv) => (
            <div key={conv.id} className="group relative">
              {renamingId === conv.id ? (
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(conv.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="flex-1 text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => handleRename(conv.id)}
                    className="text-violet-400 hover:text-violet-300"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setRenamingId(null)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <Link
                  href={`/workspace/${workspaceId}/chat/${conv.id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeId === conv.id
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  )}
                >
                  {conv.pinned && <Pin size={11} className="text-violet-400 flex-shrink-0" />}
                  <span className="flex-1 truncate">{conv.title}</span>
                  <span className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setRenamingId(conv.id);
                        setRenameValue(conv.title);
                      }}
                      className="p-0.5 text-zinc-500 hover:text-zinc-300"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => handlePin(e, conv)}
                      className="p-0.5 text-zinc-500 hover:text-violet-400"
                    >
                      <Pin size={11} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="p-0.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Workspace settings link */}
        <div className="p-3 border-t border-zinc-800">
          <Link
            href={`/workspace/${workspaceId}/settings`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            <Settings size={13} />
            AI Settings
          </Link>
        </div>
      </aside>

      <NewChatModal
        open={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        workspaceId={workspaceId}
        documents={readyDocs}
      />
    </>
  );
}
