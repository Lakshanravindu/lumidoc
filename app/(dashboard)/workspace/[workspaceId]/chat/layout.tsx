import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import type { ConversationRecord, DocumentRecord } from "@/types";

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("id", workspaceId)
    .eq("user_id", user!.id)
    .single();

  if (!workspace) notFound();

  const [{ data: conversations }, { data: documents }] = await Promise.all([
    supabase
      .from("conversations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user!.id)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, name, status")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user!.id),
  ]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ConversationSidebar
        workspaceId={workspaceId}
        conversations={(conversations ?? []) as ConversationRecord[]}
        documents={(documents ?? []) as DocumentRecord[]}
      />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
