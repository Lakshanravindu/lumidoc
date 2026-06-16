import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceSettingsForm } from "@/components/workspace/WorkspaceSettingsForm";
import type { WorkspaceSettings } from "@/types";

const DEFAULT_SETTINGS: WorkspaceSettings = {
  response_style: "detailed",
  strict_mode: true,
  language: "English",
};

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, settings")
    .eq("id", workspaceId)
    .eq("user_id", user!.id)
    .single();

  if (!workspace) notFound();

  const settings: WorkspaceSettings = {
    ...DEFAULT_SETTINGS,
    ...(workspace.settings as Partial<WorkspaceSettings>),
  };

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          {workspace.name} / Settings
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">AI Behaviour</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Customize how the AI responds within this workspace.
        </p>
      </div>

      <WorkspaceSettingsForm workspaceId={workspaceId} initialSettings={settings} />
    </div>
  );
}
