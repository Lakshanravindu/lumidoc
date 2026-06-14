import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PatchWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  settings: z
    .object({
      response_style: z.enum(["concise", "detailed", "bullets"]).optional(),
      strict_mode: z.boolean().optional(),
      language: z.string().min(1).max(50).optional(),
    })
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = PatchWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let mergedSettings: import("@/types").WorkspaceSettings | undefined;
  if (parsed.data.settings !== undefined) {
    const { data: current } = await supabase
      .from("workspaces")
      .select("settings")
      .eq("id", workspaceId)
      .eq("user_id", user.id)
      .single();

    mergedSettings = {
      ...(current?.settings ?? {}),
      ...parsed.data.settings,
    } as import("@/types").WorkspaceSettings;
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .update({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      ...(mergedSettings !== undefined ? { settings: mergedSettings } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }

  return NextResponse.json({ workspace });
}
