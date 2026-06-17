"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

let listeners: ((t: ToastItem) => void)[] = [];
let counter = 0;

export function toast(message: string, kind: ToastKind = "success") {
  const item: ToastItem = { id: ++counter, message, kind };
  listeners.forEach((l) => l(item));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-paper/10 bg-ink-raised px-4 py-3 text-sm text-paper shadow-[0_16px_50px_-12px_var(--lumi-shadow)] backdrop-blur-xl"
          style={{ animation: "lumi-toast-in 0.25s ease both" }}
        >
          {t.kind === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 text-gold" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-red-500" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
