import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateConversationSchema = z.object({
  workspace_id: z.string().uuid(),
  document_ids: z.array(z.string().uuid()).min(1),
  title: z.string().min(1).max(200).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = request.nextUrl.searchParams.get("workspace_id");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspace_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*, conversation_documents(document_id)")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { workspace_id, document_ids, title } = parsed.data;

  // Verify workspace belongs to user
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspace_id)
    .eq("user_id", user.id)
    .single();

  if (wsError || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      workspace_id,
      user_id: user.id,
      title: title ?? "New conversation",
    })
    .select()
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  const { error: docsError } = await supabase.from("conversation_documents").insert(
    document_ids.map((doc_id) => ({
      conversation_id: conversation.id,
      document_id: doc_id,
    }))
  );

  if (docsError) {
    return NextResponse.json({ error: "Failed to link documents" }, { status: 500 });
  }

  return NextResponse.json({ conversation }, { status: 201 });
}
