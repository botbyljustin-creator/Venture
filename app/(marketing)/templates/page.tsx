import Link from "next/link";
import { businessTemplates } from "@/config/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Business Templates" };

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Business Templates</h1>
        <p className="mt-3 text-muted-foreground">
          Start from a pre-filled template for popular local service businesses — every
          assumption stays fully editable.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {businessTemplates.map((t) => (
          <Card key={t.slug}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.industry}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">Typical startup capital: {t.defaultStartupCapital}</p>
              <Link href={`/ventures/new?template=${t.slug}`} className={buttonVariants({ className: "mt-4 w-full" })}>
                Start With This Template
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
