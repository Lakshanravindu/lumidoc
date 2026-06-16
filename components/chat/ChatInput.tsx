"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  onStop,
  isLoading,
  disabled,
  placeholder = "Ask a question about your documents…",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 bg-zinc-800 border border-zinc-700 rounded-2xl px-3 py-2 focus-within:border-violet-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm text-zinc-100 placeholder:text-zinc-500 outline-none leading-relaxed py-1 max-h-[200px]"
        />
        <button
          onClick={isLoading ? onStop : handleSubmit}
          disabled={(!isLoading && !value.trim()) || disabled}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors mb-0.5",
            isLoading
              ? "bg-zinc-600 hover:bg-zinc-500 text-zinc-200"
              : value.trim()
                ? "bg-violet-600 hover:bg-violet-500 text-white"
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
          )}
        >
          {isLoading ? <Square size={14} /> : <Send size={14} />}
        </button>
      </div>
      <p className="text-xs text-zinc-600 text-center mt-2">
        Shift+Enter for new line · Enter to send
      </p>
    </div>
  );
}
