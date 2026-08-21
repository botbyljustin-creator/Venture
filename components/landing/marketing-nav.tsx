import Link from "next/link";
import { appConfig } from "@/config/app";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {appConfig.name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Log In
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Analyze My Business Idea
          </Link>
        </div>
      </div>
    </header>
  );
}
