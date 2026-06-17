import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/dashboard/ProfileForm";
import AccountActions from "@/components/dashboard/AccountActions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl italic text-paper">Settings</h1>
        <p className="mt-1.5 text-sm text-paper-dim">Manage your account and your data</p>
      </div>

      <div className="space-y-5">
        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          displayName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? ""}
        />
        <AccountActions email={user.email ?? ""} />
      </div>
    </div>
  );
}
