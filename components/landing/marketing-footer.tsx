import Link from "next/link";
import { appConfig } from "@/config/app";
import { businessTemplates } from "@/config/templates";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-semibold tracking-tight">{appConfig.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{appConfig.tagline}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="/#sample-results" className="hover:text-foreground">Sample Report</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Business Calculators</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {businessTemplates.slice(0, 4).map((t) => (
                <li key={t.slug}>
                  <Link href={`/${t.slug}-business-calculator`} className="hover:text-foreground">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href={`mailto:${appConfig.supportEmail}`} className="hover:text-foreground">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {appConfig.legalEntityName}. All rights reserved.</p>
          <p className="mt-2 max-w-3xl">{appConfig.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
