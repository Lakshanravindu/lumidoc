"use client";

import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage, SourceChunk } from "@/types";

interface MessageListProps {
  messages: ChatMessage[];
  streamingContent?: string;
  onFeedback?: (messageId: string, value: 1 | -1) => void;
  onRegenerate?: () => void;
  onSourceClick?: (chunk: SourceChunk) => void;
}

export function MessageList({
  messages,
  streamingContent,
  onFeedback,
  onRegenerate,
  onSourceClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingContent]);

  if (messages.length === 0 && !streamingContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-paper-faint select-none">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center">
          <MessagesSquare className="size-6 text-gold" />
        </div>
        <p className="text-sm">Ask anything about your documents</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onFeedback={onFeedback}
            onRegenerate={
              i === messages.length - 1 && msg.role === "assistant" ? onRegenerate : undefined
            }
            onSourceClick={onSourceClick}
          />
        ))}

        {streamingContent !== undefined && (
          <MessageBubble
            message={{
              id: "streaming",
              role: "assistant",
              content: streamingContent,
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
