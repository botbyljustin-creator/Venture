const audiences = [
  "First-time entrepreneurs evaluating a business idea",
  "Tradespeople considering going independent",
  "Side-hustlers weighing a full-time leap",
  "People buying an existing local business",
  "Anyone comparing multiple business ideas at once",
];

export function WhoItsFor() {
  return (
    <section className="border-y border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Who It&apos;s For</h2>
        <p className="mt-3 text-muted-foreground">
          Built for anyone weighing whether to start or buy a business — not just landscapers and
          plumbers. Enter any legitimate business concept.
        </p>
        <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {audiences.map((a) => (
            <li key={a} className="flex items-start gap-3 rounded-lg bg-background p-4 text-sm shadow-sm">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
