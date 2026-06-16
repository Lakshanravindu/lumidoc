"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage, SourceChunk } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, value: 1 | -1) => void;
  onRegenerate?: () => void;
  onSourceClick?: (chunk: SourceChunk) => void;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  onFeedback,
  onRegenerate,
  onSourceClick,
  isStreaming,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("flex gap-3 group", isAssistant ? "flex-row" : "flex-row-reverse")}>
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
          isAssistant ? "bg-violet-600 text-white" : "bg-zinc-700 text-zinc-200"
        )}
      >
        {isAssistant ? "L" : "U"}
      </div>

      <div
        className={cn("flex flex-col gap-1 max-w-[80%]", isAssistant ? "items-start" : "items-end")}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isAssistant
              ? "bg-zinc-800 text-zinc-100 rounded-tl-sm"
              : "bg-violet-600 text-white rounded-tr-sm"
          )}
        >
          {isAssistant ? (
            <div className="prose prose-invert prose-sm max-w-none prose-pre:p-0 prose-code:text-violet-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse ml-1 align-middle" />
          )}
        </div>

        {isAssistant && message.sources && message.sources.length > 0 && !isStreaming && (
          <div className="flex flex-wrap gap-1 mt-1">
            {[...new Map(message.sources.map((s) => [s.document_id, s])).values()].map((s) => (
              <button
                key={s.document_id}
                onClick={() => onSourceClick?.(s)}
                className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-full px-2 py-0.5 transition-colors"
              >
                {s.document_name ?? "Document"}
              </button>
            ))}
          </div>
        )}

        {isAssistant && !isStreaming && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton onClick={handleCopy} title={copied ? "Copied!" : "Copy"}>
              <Copy size={13} />
            </ActionButton>
            {onRegenerate && (
              <ActionButton onClick={onRegenerate} title="Regenerate">
                <RefreshCw size={13} />
              </ActionButton>
            )}
            {onFeedback && (
              <>
                <ActionButton
                  onClick={() => onFeedback(message.id, 1)}
                  title="Good response"
                  active={message.feedback === 1}
                >
                  <ThumbsUp size={13} />
                </ActionButton>
                <ActionButton
                  onClick={() => onFeedback(message.id, -1)}
                  title="Bad response"
                  active={message.feedback === -1}
                >
                  <ThumbsDown size={13} />
                </ActionButton>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700",
        active && "text-violet-400 bg-zinc-700"
      )}
    >
      {children}
    </button>
  );
}
