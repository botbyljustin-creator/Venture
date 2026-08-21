"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function tabs(id: string) {
  return [
    { href: `/ventures/${id}`, label: "Overview" },
    { href: `/ventures/${id}/score`, label: "Score" },
    { href: `/ventures/${id}/financials`, label: "Financials" },
    { href: `/ventures/${id}/pricing`, label: "Pricing" },
    { href: `/ventures/${id}/startup-costs`, label: "Startup Costs" },
    { href: `/ventures/${id}/marketing`, label: "Marketing" },
    { href: `/ventures/${id}/sales`, label: "Sales" },
    { href: `/ventures/${id}/operations`, label: "Operations" },
    { href: `/ventures/${id}/launch-plan`, label: "Launch Plan" },
    { href: `/ventures/${id}/risks`, label: "Risks" },
    { href: `/ventures/${id}/advisor`, label: "AI Advisor" },
    { href: `/ventures/${id}/export`, label: "Export" },
  ];
}

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const items = tabs(projectId);

  return (
    <div className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
        {items.map((item) => {
          const active = item.href === `/ventures/${projectId}` ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
