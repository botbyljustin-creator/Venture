import Link from "next/link";
import { searchUsers } from "@/lib/admin/data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const users = await searchUsers(q || "");

  return (
    <div className="space-y-6">
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="Search by email…" className="max-w-sm" />
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-3">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-primary hover:underline">
                      {u.email}
                    </Link>
                  </td>
                  <td className="p-3">{u.full_name || "—"}</td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {u.is_admin && <Badge>Admin</Badge>}
                      {u.disabled && <Badge variant="danger">Disabled</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
