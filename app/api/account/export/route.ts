import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch all user data in parallel
  const [profile, workspaces, documents, conversations, messages] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("workspaces").select("*").eq("user_id", user.id),
    supabase
      .from("documents")
      .select("id, name, mime_type, size_bytes, status, created_at")
      .eq("user_id", user.id),
    supabase.from("conversations").select("*").eq("user_id", user.id),
    supabase
      .from("messages")
      .select("id, conversation_id, role, content, feedback, created_at")
      .eq("user_id", user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile.data,
    workspaces: workspaces.data ?? [],
    documents: documents.data ?? [],
    conversations: conversations.data ?? [],
    messages: messages.data ?? [],
  };

  const filename = `lumidoc-export-${new Date().toISOString().split("T")[0]}.json`;

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
