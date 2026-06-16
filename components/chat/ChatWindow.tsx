"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SourcePanel } from "./SourcePanel";
import { SuggestionChips } from "./SuggestionChips";
import type { ChatMessage, ConversationRecord, SourceChunk } from "@/types";

interface ChatWindowProps {
  conversation: ConversationRecord;
  initialMessages: ChatMessage[];
}

export function ChatWindow({ conversation, initialMessages }: ChatWindowProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [streamingContent, setStreamingContent] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceChunk[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (query: string) => {
      if (isLoading) return;

      const optimisticUser: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUser]);
      setStreamingContent("");
      setIsLoading(true);
      setSuggestions([]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: conversation.id, query }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`Chat API error ${res.status}`);
        }

        // Parse sources from header
        const sourcesHeader = res.headers.get("X-Sources");
        const sources: SourceChunk[] = sourcesHeader
          ? JSON.parse(decodeURIComponent(sourcesHeader))
          : [];

        // Stream raw text tokens from toTextStreamResponse
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingContent(accumulated);
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: accumulated,
          sources,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setActiveSources(sources.length > 0 ? sources : null);

        // Fetch follow-up suggestions
        const suggestRes = await fetch(
          `/api/chat?conversation_id=${conversation.id}&query=${encodeURIComponent(query)}`
        );
        if (suggestRes.ok) {
          const { suggestions: s } = (await suggestRes.json()) as { suggestions: string[] };
          setSuggestions(s ?? []);
        }

        // Refresh router to update conversation title in sidebar
        router.refresh();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } finally {
        setStreamingContent(undefined);
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [conversation.id, isLoading, router]
  );

  function handleStop() {
    abortRef.current?.abort();
  }

  async function handleFeedback(messageId: string, value: 1 | -1) {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback: value } : m)));
    await fetch(`/api/messages/${messageId}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: value }),
    }).catch(() => null);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-paper/10 flex-shrink-0">
          <h2 className="text-sm font-medium text-paper-dim truncate">{conversation.title}</h2>
          <a
            href={`/api/conversations/${conversation.id}/export`}
            download
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-paper-faint hover:text-paper hover:bg-paper/[0.06] transition-colors"
            title="Export as Markdown"
          >
            <Download size={13} />
            Export
          </a>
        </div>

        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          onFeedback={handleFeedback}
          onRegenerate={() => {
            const lastUser = [...messages].reverse().find((m) => m.role === "user");
            if (lastUser) {
              setMessages((prev) => prev.slice(0, -1));
              sendMessage(lastUser.content);
            }
          }}
          onSourceClick={(chunk) => setActiveSources([chunk])}
        />

        <SuggestionChips suggestions={suggestions} onSelect={sendMessage} />

        <ChatInput onSubmit={sendMessage} onStop={handleStop} isLoading={isLoading} />
      </div>

      {/* Source panel */}
      {activeSources && activeSources.length > 0 && (
        <SourcePanel sources={activeSources} onClose={() => setActiveSources(null)} />
      )}
    </div>
  );
}
