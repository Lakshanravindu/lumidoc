import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/processors";
import { env } from "@/env";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimitRes = await checkRateLimit(user.id, "upload");
  if (rateLimitRes) return rateLimitRes;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const workspaceId = formData.get("workspaceId") as string | null;

  if (!file || !workspaceId) {
    return NextResponse.json({ error: "file and workspaceId are required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds the 20 MB limit" }, { status: 400 });
  }

  if (!SUPPORTED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  // Verify workspace belongs to user
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const storagePath = `${user.id}/${workspaceId}/${crypto.randomUUID()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const serviceClient = createServiceClient();

  const { error: uploadError } = await serviceClient.storage
    .from("documents")
    .upload(storagePath, arrayBuffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
  }

  const { data: document, error: dbError } = await supabase
    .from("documents")
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      status: "processing",
    })
    .select()
    .single();

  if (dbError || !document) {
    await serviceClient.storage.from("documents").remove([storagePath]);
    return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
  }

  // Trigger Edge Function asynchronously — fire and forget
  fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ documentId: document.id }),
  }).catch(() => {
    // Edge Function trigger failure is non-fatal; document remains in 'processing' state
  });

  return NextResponse.json({ document }, { status: 201 });
}
