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
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl italic text-paper">Workspaces</h1>
          <p className="mt-1.5 text-sm text-paper-dim">Organise your documents into workspaces</p>
        </div>
        {/* Decorative gold rule */}
        <div className="hidden h-px w-32 bg-gradient-to-l from-transparent via-gold/30 to-transparent lg:block" />
      </div>
      <WorkspaceList workspaces={(workspaces ?? []) as Tables<"workspaces">[]} />
    </div>
  );
}
