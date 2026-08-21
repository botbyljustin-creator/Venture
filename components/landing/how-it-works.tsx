import { Lightbulb, Calculator, FileText, Rocket } from "lucide-react";

const steps = [
  { icon: Lightbulb, title: "Describe Your Idea", body: "Tell us what business you're considering and where you'd run it." },
  { icon: Calculator, title: "We Run The Numbers", body: "Get a Venture Score, startup costs, pricing, and a 3-year financial model." },
  { icon: FileText, title: "Get Your Launch Kit", body: "Marketing copy, sales scripts, a 30-day launch plan, and a full business plan." },
  { icon: Rocket, title: "Launch With Confidence", body: "Export professional PDF and Excel reports and get moving." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">How It Works</h2>
        <p className="mt-3 text-muted-foreground">From idea to launch plan in about 10 minutes.</p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">Step {i + 1}</p>
            <h3 className="mt-1 font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
