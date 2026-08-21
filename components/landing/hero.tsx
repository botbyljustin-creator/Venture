import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { appConfig } from "@/config/app";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/40 to-background">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          Built for entrepreneurs, not spreadsheets
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {appConfig.tagline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
          {appConfig.description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Analyze My Business Idea <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/#sample-results" className={buttonVariants({ variant: "outline", size: "lg" })}>
            See Example Report
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">No credit card required to start.</p>
      </div>
    </section>
  );
}
