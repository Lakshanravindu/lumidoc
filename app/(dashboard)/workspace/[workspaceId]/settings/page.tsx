import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="mx-auto max-w-2xl p-6 lg:p-10">
      <Link
        href={`/workspace/${workspaceId}`}
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-paper-faint transition-colors hover:text-paper-dim"
      >
        <ArrowLeft className="size-3.5" />
        Back to workspace
      </Link>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold">{workspace.name} / Settings</p>
        <h1 className="mt-1 font-display text-3xl italic text-paper">AI Behaviour</h1>
        <p className="mt-1.5 text-sm text-paper-dim">
          Customize how the AI responds within this workspace.
        </p>
      </div>

      <WorkspaceSettingsForm workspaceId={workspaceId} initialSettings={settings} />
    </div>
  );
}
