const faqs = [
  {
    q: "Is this financial advice?",
    a: "No. VentureForge provides estimates and educational business planning tools based on assumptions you can edit. Always verify costs, regulations, and market conditions independently.",
  },
  {
    q: "Can I use it for any business idea, not just home services?",
    a: "Yes. The templates are a shortcut, but you can describe any legitimate business concept — ecommerce, agencies, software, professional services, and more.",
  },
  {
    q: "What happens after I purchase the Launch plan?",
    a: "Your project unlocks immediately: full financial model, PDF export, and the complete launch kit. No manual approval needed.",
  },
  {
    q: "Can I edit the AI's assumptions?",
    a: "Yes. Every number — pricing, growth rate, costs, overhead — is editable, and your financial model recalculates instantly using deterministic math, not another AI call.",
  },
  {
    q: "Do you store my payment details?",
    a: "No. All payments are processed by Stripe. VentureForge never sees or stores your card information.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-center text-3xl font-semibold tracking-tight">Frequently Asked Questions</h2>
      <div className="mt-12 divide-y divide-border">
        {faqs.map((f) => (
          <div key={f.q} className="py-6">
            <h3 className="font-medium">{f.q}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
