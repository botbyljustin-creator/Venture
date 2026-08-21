import { Target, DollarSign, TrendingUp, Megaphone, ClipboardList, MessageSquareText } from "lucide-react";

const features = [
  { icon: Target, title: "Venture Score", body: "A weighted 0-100 score across profit potential, cash flow, scalability, owner freedom, startup efficiency, and risk." },
  { icon: DollarSign, title: "Deterministic Financial Model", body: "Editable assumptions drive real math — startup costs, unit economics, 12-month and 3-year forecasts, break-even." },
  { icon: TrendingUp, title: "Scenario & What-If Modeling", body: "Compare conservative, expected, and aggressive cases, or drag sliders to see the impact instantly." },
  { icon: Megaphone, title: "Marketing & Sales Kits", body: "Channel strategy, website copy, ad headlines, sales scripts, and objection handling — ready to use." },
  { icon: ClipboardList, title: "30-Day Launch Plan", body: "A week-by-week task list to go from idea to first customer, trackable to completion." },
  { icon: MessageSquareText, title: "Ask VentureForge", body: "An AI advisor with full context of your venture's numbers — ask it anything about your plan." },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Everything You Need To Decide</h2>
        <p className="mt-3 text-muted-foreground">Consultant-grade analysis, delivered instantly.</p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border p-6">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
