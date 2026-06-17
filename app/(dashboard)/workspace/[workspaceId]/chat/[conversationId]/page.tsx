import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { ChatMessage, ConversationRecord } from "@/types";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ workspaceId: string; conversationId: string }>;
}) {
  const { workspaceId, conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*, conversation_documents(documents(name))")
    .eq("id", conversationId)
    .eq("workspace_id", workspaceId)
    .eq("user_id", user!.id)
    .single();

  if (error || !conversation) notFound();

  const documentNames = (
    (conversation.conversation_documents as { documents: { name: string } | null }[]) ?? []
  )
    .map((cd) => cd.documents?.name)
    .filter((n): n is string => Boolean(n));

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const chatMessages: ChatMessage[] = (messages ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    feedback: m.feedback as -1 | 1 | null,
    created_at: m.created_at,
  }));

  return (
    <ChatWindow
      conversation={conversation as ConversationRecord}
      initialMessages={chatMessages}
      documentNames={documentNames}
    />
  );
}
