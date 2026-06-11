import { createClient } from "@/lib/supabase/server";
import WorkspaceList from "@/components/workspace/WorkspaceList";
import type { Tables } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Workspaces</h1>
        <p className="mt-1 text-sm text-neutral-400">Organise your documents into workspaces</p>
      </div>
      <WorkspaceList workspaces={(workspaces ?? []) as Tables<"workspaces">[]} />
    </div>
  );
}
