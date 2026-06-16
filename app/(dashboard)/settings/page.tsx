import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, avatar_url")
    .eq("id", user!.id)
    .single();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-paper">Settings</h1>
        <p className="mt-1 text-sm text-paper-dim">Manage your account</p>
      </div>

      <div className="max-w-lg">
        <ProfileForm
          userId={user!.id}
          email={user!.email ?? ""}
          displayName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? ""}
        />
      </div>
    </div>
  );
}
