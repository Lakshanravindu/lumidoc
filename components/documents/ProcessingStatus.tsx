import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { DocumentStatus } from "@/types";

const config: Record<
  DocumentStatus,
  { icon: React.ElementType; label: string; classes: string; spin: boolean }
> = {
  processing: {
    icon: Loader2,
    label: "Processing",
    classes: "text-gold/80 bg-gold/10 border-gold/20",
    spin: true,
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready",
    classes: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    spin: false,
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    classes: "text-red-400 bg-red-400/10 border-red-400/20",
    spin: false,
  },
};

export default function ProcessingStatus({ status }: { status: DocumentStatus }) {
  const { icon: Icon, label, classes, spin } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      <Icon className={`size-3 shrink-0${spin ? " animate-spin" : ""}`} />
      {label}
    </span>
  );
}
