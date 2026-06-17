import { createClient } from "@/lib/supabase/server";
import WorkspaceList, { type WorkspaceWithCount } from "@/components/workspace/WorkspaceList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*, documents(count)")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  const list: WorkspaceWithCount[] = (workspaces ?? []).map(({ documents, ...ws }) => ({
    ...ws,
    docCount: Array.isArray(documents) ? (documents[0]?.count ?? 0) : 0,
  }));

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl italic text-paper">Workspaces</h1>
        <p className="mt-1.5 text-sm text-paper-dim">Organise your documents into workspaces</p>
      </div>
      <WorkspaceList workspaces={list} />
    </div>
  );
}
