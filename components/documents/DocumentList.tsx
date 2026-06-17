"use client";

import { useEffect, useRef, useState } from "react";
import { FileX } from "lucide-react";
import UploadZone from "./UploadZone";
import DocumentCard from "./DocumentCard";
import type { DocumentRecord } from "@/types";

interface DocumentListProps {
  workspaceId: string;
  initialDocuments: DocumentRecord[];
}

const POLL_INTERVAL = 5000;

export default function DocumentList({ workspaceId, initialDocuments }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for status updates on documents that are still processing
  useEffect(() => {
    function startPolling() {
      pollRef.current = setInterval(async () => {
        const processingIds = documents.filter((d) => d.status === "processing").map((d) => d.id);

        if (processingIds.length === 0) {
          clearInterval(pollRef.current!);
          return;
        }

        await Promise.all(
          processingIds.map(async (id) => {
            const res = await fetch(`/api/documents/${id}`);
            if (!res.ok) return;
            const { document } = (await res.json()) as { document: DocumentRecord };
            setDocuments((prev) => prev.map((d) => (d.id === document.id ? document : d)));
          })
        );
      }, POLL_INTERVAL);
    }

    const hasProcessing = documents.some((d) => d.status === "processing");
    if (hasProcessing) startPolling();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.map((d) => d.id + d.status).join(",")]);

  function handleUploaded(doc: DocumentRecord) {
    setDocuments((prev) => [doc, ...prev]);
  }

  function handleDelete(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      <UploadZone workspaceId={workspaceId} onUploaded={handleUploaded} />

      {documents.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-paper/[0.08] bg-paper/[0.03]">
            <FileX className="size-7 text-paper-faint/50" />
          </div>
          <p className="font-display text-lg italic text-paper-dim">No documents yet</p>
          <p className="mt-1.5 text-sm text-paper-faint">
            Upload a file above to start chatting with your documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              workspaceId={workspaceId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
