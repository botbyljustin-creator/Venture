import Link from "next/link";
import { businessTemplates } from "@/config/templates";

export function Industries() {
  return (
    <section id="industries" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Example Industries</h2>
        <p className="mt-3 text-muted-foreground">
          Popular starting points — or describe any business idea of your own.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {businessTemplates.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}-business-calculator`}
            className="rounded-lg border border-border p-4 text-center text-sm font-medium transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            {t.name}
          </Link>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Plus ecommerce, agencies, professional services, software, and any other legitimate
        business concept.
      </p>
    </section>
  );
}
