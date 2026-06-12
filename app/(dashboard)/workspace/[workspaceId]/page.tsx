import { notFound } from "next/navigation";
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

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-paper-faint">Workspace</p>
          <h1 className="mt-0.5 font-display text-3xl italic text-paper">{workspace.name}</h1>
          {workspace.description && (
            <p className="mt-1 text-sm text-paper-dim">{workspace.description}</p>
          )}
        </div>
        <div className="hidden h-px w-32 bg-gradient-to-l from-transparent via-gold/30 to-transparent lg:block" />
      </div>

      <DocumentList
        workspaceId={workspaceId}
        initialDocuments={(documents ?? []) as DocumentRecord[]}
      />
    </div>
  );
}
