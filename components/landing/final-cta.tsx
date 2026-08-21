import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="border-t border-border bg-secondary py-24 text-secondary-foreground">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Stop Wondering. Start Knowing.</h2>
        <p className="mt-3 text-white/70">
          Turn your business idea into a launch plan in about 10 minutes.
        </p>
        <Link href="/signup" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          Analyze My Business Idea
        </Link>
      </div>
    </section>
  );
}
