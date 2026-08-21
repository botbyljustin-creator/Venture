import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { businessTemplates, getTemplate } from "@/config/templates";
import { appConfig } from "@/config/app";
import { buttonVariants } from "@/components/ui/button";

const GENERIC_SLUG = "business-idea-calculator";
const SUFFIX = "-business-calculator";

function resolveSlug(calculator: string): { isGeneric: boolean; templateSlug?: string } | null {
  if (calculator === GENERIC_SLUG) return { isGeneric: true };
  if (calculator.endsWith(SUFFIX)) {
    const templateSlug = calculator.slice(0, -SUFFIX.length);
    if (getTemplate(templateSlug)) return { isGeneric: false, templateSlug };
  }
  return null;
}

export function generateStaticParams() {
  return [{ calculator: GENERIC_SLUG }, ...businessTemplates.map((t) => ({ calculator: `${t.slug}${SUFFIX}` }))];
}

export async function generateMetadata({ params }: { params: Promise<{ calculator: string }> }): Promise<Metadata> {
  const { calculator } = await params;
  const resolved = resolveSlug(calculator);
  if (!resolved) return {};

  if (resolved.isGeneric) {
    return {
      title: "Free Business Idea Calculator",
      description: "Score any business idea, estimate startup costs and revenue, and get a launch plan in minutes.",
    };
  }

  const template = getTemplate(resolved.templateSlug!)!;
  return {
    title: `${template.name} Business Calculator — Startup Costs & Revenue`,
    description: `Estimate startup costs, pricing, and Year 1 revenue for a ${template.name.toLowerCase()} business. Get a free Venture Score and launch plan.`,
  };
}

export default async function CalculatorPage({ params }: { params: Promise<{ calculator: string }> }) {
  const { calculator } = await params;
  const resolved = resolveSlug(calculator);
  if (!resolved) notFound();

  const template = resolved.isGeneric ? null : getTemplate(resolved.templateSlug!)!;
  const title = template ? `${template.name} Business Calculator` : "Business Idea Calculator";
  const subtitle = template
    ? `Estimate startup costs, pricing, and revenue potential for a ${template.name.toLowerCase()} business — and get a full launch plan.`
    : "Enter any business idea and get a Venture Score, financial model, and launch plan in minutes.";
  const ctaHref = template ? `/ventures/new?template=${template.slug}` : "/signup";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much does it cost to start a${template ? ` ${template.name.toLowerCase()}` : ""} business?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: template
            ? `Typical startup capital for a ${template.name.toLowerCase()} business is ${template.defaultStartupCapital}, though this varies by location and scope. ${appConfig.name} generates a detailed, editable startup cost breakdown.`
            : `Startup costs vary widely by business type. ${appConfig.name} generates a detailed, editable startup cost breakdown for any business idea.`,
        },
      },
      {
        "@type": "Question",
        name: "Is this calculator free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. ${appConfig.name} offers a free limited analysis. Full financial models, exports, and the AI advisor are available on paid plans.`,
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      <Link href={ctaHref} className={buttonVariants({ size: "lg", className: "mt-8" })}>
        Calculate My Numbers
      </Link>

      <div className="mt-16 space-y-8">
        <section>
          <h2 className="text-xl font-semibold">What You&apos;ll Get</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
            <li>A Venture Score from 0-100 across profit potential, cash flow, scalability, and risk</li>
            <li>A realistic startup cost checklist{template ? ` for a ${template.name.toLowerCase()} business` : ""}</li>
            <li>Recommended pricing packages and unit economics</li>
            <li>A 12-month financial forecast and 3-year projection</li>
            <li>A 30-day, week-by-week launch plan</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="mt-3 space-y-4">
            {jsonLd.mainEntity.map((q) => (
              <div key={q.name}>
                <p className="font-medium">{q.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
