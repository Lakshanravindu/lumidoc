import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DocumentList from "@/components/documents/DocumentList";
import type { DocumentRecord } from "@/types";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .eq("user_id", user!.id)
    .single();

  if (!workspace) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const docs = (documents ?? []) as DocumentRecord[];
  const readyCount = docs.filter((d) => d.status === "ready").length;

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-paper-faint transition-colors hover:text-paper-dim"
      >
        <ArrowLeft className="size-3.5" />
        Workspaces
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-paper-faint">Workspace</p>
        <h1 className="mt-0.5 font-display text-3xl italic text-paper">{workspace.name}</h1>
        {workspace.description && (
          <p className="mt-1 text-sm text-paper-dim">{workspace.description}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-paper-faint">
          <span>
            {docs.length} {docs.length === 1 ? "document" : "documents"}
          </span>
          {readyCount > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-paper-faint/50" />
              <span className="text-gold">{readyCount} ready</span>
            </>
          )}
        </div>
      </div>

      <DocumentList workspaceId={workspaceId} initialDocuments={docs} />
    </div>
  );
}
