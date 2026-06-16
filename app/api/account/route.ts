import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // 1. Delete all storage files for this user's documents
  const { data: docs } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("user_id", user.id);

  if (docs && docs.length > 0) {
    const paths = docs.map((d) => d.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await serviceClient.storage.from("documents").remove(paths);
    }
  }

  // 2. Delete DB rows — cascade handles children (workspaces → documents → chunks,
  //    conversations → messages → conversation_documents, user_profiles)
  const { error: profileErr } = await serviceClient
    .from("user_profiles")
    .delete()
    .eq("id", user.id);

  if (profileErr) {
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }

  // 3. Delete the auth.users record (requires service role)
  const { error: authDeleteErr } = await serviceClient.auth.admin.deleteUser(user.id);

  if (authDeleteErr) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
