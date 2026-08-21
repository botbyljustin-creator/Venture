import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm fullName={profile?.full_name || ""} email={profile?.email || user.email || ""} />
        </CardContent>
      </Card>
    </div>
  );
}
