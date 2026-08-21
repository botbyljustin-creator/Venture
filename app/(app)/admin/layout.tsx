import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser, isAdminUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const admin = await isAdminUser(user.id);
  if (!admin) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center gap-6 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground">Overview</Link>
          <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
