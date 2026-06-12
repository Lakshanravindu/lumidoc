import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { hydeRetrieve } from "@/lib/retrieval/hyde";
import {
  streamChatResponse,
  buildContext,
  generateFollowUpSuggestions,
} from "@/lib/anthropic/chat";

const ChatRequestSchema = z.object({
  conversation_id: z.string().uuid(),
  query: z.string().min(1).max(4000),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { conversation_id, query } = parsed.data;

  // Load conversation + scoped documents
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*, conversation_documents(document_id)")
    .eq("id", conversation_id)
    .eq("user_id", user.id)
    .single();

  if (convError || !conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const documentIds = (conversation.conversation_documents as { document_id: string }[]).map(
    (cd) => cd.document_id
  );

  if (documentIds.length === 0) {
    return new Response("No documents linked to this conversation", { status: 400 });
  }

  // Persist user message
  const serviceClient = createServiceClient();
  await serviceClient.from("messages").insert({
    conversation_id,
    user_id: user.id,
    role: "user",
    content: query,
  });

  // Load recent history (last 10 turns) for context
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversation_id)
    .order("created_at", { ascending: false })
    .limit(11);

  const messageHistory = (history ?? [])
    .reverse()
    .slice(0, -1) // exclude the user message we just inserted
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // HyDE retrieval
  const chunks = await hydeRetrieve(query, documentIds);

  // Fetch document names for source attribution
  const { data: docs } = await supabase
    .from("documents")
    .select("id, name")
    .in("id", [...new Set(chunks.map((c) => c.document_id))]);

  const docNameMap = Object.fromEntries((docs ?? []).map((d) => [d.id, d.name]));
  const chunksWithNames = chunks.map((c) => ({ ...c, document_name: docNameMap[c.document_id] }));

  const context = buildContext(chunksWithNames);
  const sourceChunkIds = chunks.map((c) => c.chunk_id);

  // Stream with onFinish callback to persist assistant message
  const result = streamChatResponse(query, context, messageHistory, async (text) => {
    await serviceClient.from("messages").insert({
      conversation_id,
      user_id: user.id,
      role: "assistant",
      content: text,
      source_chunk_ids: sourceChunkIds,
    });

    // Auto-title conversation on first assistant message
    if (!conversation.title || conversation.title === "New conversation") {
      const shortTitle = query.slice(0, 60) + (query.length > 60 ? "…" : "");
      await serviceClient
        .from("conversations")
        .update({ title: shortTitle, updated_at: new Date().toISOString() })
        .eq("id", conversation_id);
    }
  });

  const sourcesJson = JSON.stringify(chunksWithNames);

  return result.toTextStreamResponse({
    headers: {
      "X-Sources": sourcesJson,
    },
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("query") ?? "";
  const suggestions = await generateFollowUpSuggestions(query, "").catch(() => []);
  return Response.json({ suggestions });
}
