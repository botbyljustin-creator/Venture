import { requireUser } from "@/lib/auth/session";
import { isAdminUser } from "@/lib/auth/session";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = await isAdminUser(user.id);

  return (
    <div className="flex min-h-screen">
      <AppSidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
