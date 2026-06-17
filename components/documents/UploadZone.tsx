"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import type { DocumentRecord } from "@/types";

const ACCEPTED_EXTENSIONS =
  ".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.md,.json,.js,.ts,.py,.jpg,.jpeg,.png,.webp";
const MAX_MB = 20;

interface UploadZoneProps {
  workspaceId: string;
  onUploaded: (doc: DocumentRecord) => void;
}

export default function UploadZone({ workspaceId, onUploaded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`"${file.name}" exceeds the ${MAX_MB} MB limit.`);
        return;
      }

      setUploading(true);
      setError(null);
      setUploadingName(file.name);
      setProgress(10);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("workspaceId", workspaceId);

      try {
        setProgress(40);
        const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
        setProgress(80);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setProgress(100);
        onUploaded(data.document as DocumentRecord);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      } finally {
        setUploading(false);
        setUploadingName(null);
        setProgress(0);
      }
    },
    [workspaceId, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="mb-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-all ${
          dragging
            ? "border-gold/60 bg-gold/[0.06]"
            : "border-paper/[0.12] hover:border-gold/30 hover:bg-gold/[0.03]"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleChange}
        />

        {uploading ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.08]">
              <Upload className="size-5 animate-pulse text-gold" />
            </div>
            <div className="w-full max-w-xs">
              <p className="mb-1.5 text-center text-sm text-paper-dim">
                Uploading <span className="font-medium text-paper">{uploadingName}</span>…
              </p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-paper/[0.08]">
                <div
                  className="h-full rounded-full bg-gold/60 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.08]">
              <Upload className="size-5 text-gold/70" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-paper-dim">
                Drop a file here, or{" "}
                <span className="text-gold underline-offset-2 hover:underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-paper-faint">
                PDF, DOCX, XLSX, PPTX, TXT, MD, CSV, JSON, images · max {MAX_MB} MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-red-400/60 hover:text-red-400"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
