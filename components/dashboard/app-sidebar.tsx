import Link from "next/link";
import { LayoutDashboard, FolderKanban, PlusCircle, CreditCard, User, LifeBuoy, ShieldCheck } from "lucide-react";
import { appConfig } from "@/config/app";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ventures", label: "My Ventures", icon: FolderKanban },
  { href: "/ventures/new", label: "New Analysis", icon: PlusCircle },
  { href: "/account", label: "Account", icon: User },
  { href: "/account/billing", label: "Billing", icon: CreditCard },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-muted/20 md:flex md:flex-col">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          {appConfig.name}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>
      <div className="space-y-1 px-3 pb-6">
        <a
          href={`mailto:${appConfig.supportEmail}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LifeBuoy className="h-4 w-4" />
          Support
        </a>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            Log Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
