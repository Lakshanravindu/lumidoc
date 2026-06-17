import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("title, created_at")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (convError || !conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgError) {
    return new Response("Failed to load messages", { status: 500 });
  }

  const date = new Date(conversation.created_at).toISOString().split("T")[0];
  const lines: string[] = [
    `# ${conversation.title}`,
    `*Exported from LumiDoc on ${new Date().toLocaleDateString()}*`,
    "",
  ];

  for (const msg of messages ?? []) {
    const label = msg.role === "user" ? "**You**" : "**LumiDoc**";
    lines.push(`### ${label}`);
    lines.push(msg.content);
    lines.push("");
  }

  const markdown = lines.join("\n");
  const filename = `lumidoc-${conversation.title
    .slice(0, 40)
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()}-${date}.md`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
