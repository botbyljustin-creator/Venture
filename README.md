# VentureForge

Turn any business idea into a launch plan. VentureForge takes a plain-English
business idea, asks smart follow-up questions, and generates a Venture
Score, a deterministic financial model, startup costs, pricing, marketing
and sales kits, a 30-day launch plan, and risk analysis — then lets the
user export a professional PDF/Excel report and buy access via Stripe.

This is a real, working MVP: every page is wired to a real database schema,
real Stripe checkout/webhooks, and a real (Zod-validated, retrying) Claude
integration. Nothing is mocked. The only things missing are *your*
credentials — see "Environment Variables" below.

---

## 1. What Was Built

- **Marketing site** — landing page, pricing, business templates, and
  programmatic SEO calculator pages (`/pressure-washing-business-calculator`,
  etc.), with sitemap.xml/robots.txt.
- **Auth** — Supabase Auth signup/login/logout/password reset, protected
  routes via Next.js proxy (middleware), auto-provisioned `profiles` row.
- **7-step venture wizard** with autosave to Postgres at every step.
- **AI analysis engine** (`lib/ai/`) — one module per analysis type
  (classification, startup costs, pricing, financial assumptions,
  qualitative scoring, operations, marketing, sales, launch plan, risk,
  business plan), each a Claude tool-use call whose output is validated
  against a Zod schema with automatic retry on validation failure.
- **Deterministic financial engine** (`lib/financial/`) — the AI proposes
  *assumptions* only; all math (unit economics, 12-month forecast, 3-year
  projection, break-even, scenarios, Venture Score, goal-reverse-engineering)
  is plain, tested TypeScript. 18 passing unit tests.
- **Generation pipeline** (`lib/generation/pipeline.ts`) — orchestrates every
  AI module + the financial engine, persists results, and tracks live
  progress shown in a polished progress UI.
- **Full venture workspace** — Overview, Score, Financials (with an
  interactive What-If calculator and scenario/goal-reverse-engineering
  tools), Pricing, Startup Costs, Marketing, Sales, Operations, Launch Plan
  (checkable tasks), Risks, and an AI Advisor chat scoped to that venture's
  numbers.
- **Stripe billing** — Checkout (one-time Launch purchase + Pro/Pro Annual
  subscriptions), Billing Portal, webhook-synced subscriptions/purchases,
  server-authoritative entitlement checks (client state is never trusted).
- **Exports** — a structured (not screenshotted) PDF report via
  `@react-pdf/renderer` and an Excel workbook via `exceljs`.
- **Admin dashboard** — MRR/ARR, conversion rate, AI cost tracking, user
  search, per-user entitlement management (disable account, grant/revoke
  manual Pro access, promote to admin).
- **Transactional email** (Resend) and **analytics** (GA4/PostHog)
  abstractions — provider-agnostic, wired to real events throughout the app.
- **AI usage logging + daily quotas** to keep variable AI costs in check.
- **Row Level Security** on every table — a user can never read or write
  another user's data.

---

## 2. Application Architecture

```
app/
  (marketing)/        Public site: landing, pricing, templates, SEO calculators
  (auth)/              Login, signup, password reset
  (app)/                Authenticated app shell (sidebar layout)
    dashboard/
    ventures/[id]/      Venture wizard, generation progress, and every
                        venture sub-page (score, financials, pricing, ...)
    account/, admin/
  api/                  Route handlers: Stripe checkout/portal/webhook,
                        AI chat, PDF/XLSX export, generation trigger
  auth/callback/        Supabase email-confirmation / password-reset callback

components/             UI kit (components/ui), and feature components
                        grouped by domain (landing, wizard, project, admin, billing)

lib/
  ai/                   Anthropic client, Zod schemas, one module per
                        analysis type, structured-output helper with retry
  financial/             Deterministic math engine + tests live in /tests
  stripe/                 Checkout, customer, webhook helpers
  supabase/               Browser/server/admin Supabase clients + proxy session refresh
  auth/, permissions/     Session helpers, server-authoritative entitlements
  generation/             The pipeline that ties AI + financial engine together
  projects/               Server actions + data loaders for ventures
  email/, analytics/      Provider-agnostic abstractions
  validation/             Zod schemas for every form/wizard step

config/                  app.ts (branding), pricing.ts (plans), templates.ts
types/                   Domain types + hand-maintained Supabase Database type
db/migrations/           SQL migrations, run in numeric order
db/seed/                 Seeds the public sample venture (runs the real pipeline)
tests/                   Vitest: financial engine + AI schema validation
```

**Why a deterministic financial engine?** The AI never computes revenue,
profit, or break-even. It proposes *assumptions* (average price, growth
rate, cost percentages, overhead...); `lib/financial/*` turns those into
every number the user sees, so the math is reproducible, auditable, and
instantly recalculable client-side in the What-If calculator.

---

## 3. Database Architecture

20 tables, all RLS-protected, migrations in `db/migrations/`:

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`, includes `is_admin`, `disabled`, `stripe_customer_id` |
| `projects` | One venture. Summary columns (`venture_score`, `startup_cost`, `year1_revenue`, ...) power dashboard cards without extra joins |
| `project_inputs` | The wizard's 7-step answers |
| `business_analyses` | Versioned AI narrative output (classification, operations, business plan) |
| `venture_scores` | The 6-category weighted score + verdict |
| `financial_assumptions` | Editable inputs driving the financial engine |
| `financial_forecasts` | Computed unit economics, monthly/yearly forecast, break-even, scenarios, goal funnel |
| `startup_costs`, `service_packages` | Editable line items |
| `marketing_plans`, `sales_kits`, `launch_tasks`, `risk_analyses` | Generated content |
| `ai_chat_messages` | Ask VentureForge history, per project |
| `subscriptions`, `purchases` | Stripe-synced billing state (webhook-only writes) |
| `ai_usage` | Per-call token/cost logging for quotas + admin cost dashboard |
| `exports`, `admin_roles` | Download audit trail, supplementary admin allowlist |

RLS pattern: every child table's policy checks that the parent `projects`
row belongs to `auth.uid()` (or is the public `is_sample` project, or the
caller is an admin per the `is_admin()` SQL function). Billing/usage tables
are read-only for the owning user — all writes go through the service-role
client from webhooks/admin actions.

---

## 4. Important Directories

- `lib/financial/` — start here to understand the numbers. Pure functions, fully unit tested.
- `lib/ai/modules/` — one file per AI analysis module; each is a short, readable prompt + Zod schema.
- `lib/generation/pipeline.ts` — the whole generation flow in one place.
- `app/api/stripe/webhook/route.ts` — the only place subscription/purchase state is written.
- `db/migrations/` — run these against your Supabase project before anything else works.

---

## 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. Nothing here
is optional for a live deployment except the analytics/email keys.

```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only, never expose to the client
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_LAUNCH_PRICE_ID
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_ANNUAL_PRICE_ID
RESEND_API_KEY                   # optional — emails log a warning and no-op without it
ADMIN_EMAILS                     # comma-separated allowlist for /admin
```

---

## 6. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API: copy the Project URL, `anon` key, and
   `service_role` key into `.env.local`.
3. Open the SQL Editor and run each file in `db/migrations/` **in numeric
   order** (`0001_...` through `0004_...`). Each file is idempotent-ish
   (`create table if not exists`) so re-running is safe.
4. Authentication → URL Configuration: set your Site URL and add
   `{APP_URL}/auth/callback` as a redirect URL (needed for email
   confirmation and password reset).
5. Authentication → Email Templates: optionally customize the confirmation
   and reset-password templates.
6. That's it — RLS is already enabled by migration `0003`.

---

## 7. Stripe Setup

1. Create a Stripe account (test mode is fine to start).
2. Create 3 Prices in the Stripe Dashboard:
   - **Launch** — one-time, $49 → copy the Price ID to `STRIPE_LAUNCH_PRICE_ID`
   - **Pro** — recurring monthly, $19/mo → `STRIPE_PRO_MONTHLY_PRICE_ID`
   - **Pro Annual** — recurring yearly, $199/yr → `STRIPE_PRO_ANNUAL_PRICE_ID`
   (Adjust amounts in `config/pricing.ts` if you change these.)
3. Developers → API keys: copy the secret key to `STRIPE_SECRET_KEY` and
   the publishable key to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Developers → Webhooks: add an endpoint at
   `{APP_URL}/api/stripe/webhook` listening for:
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`. Copy the signing secret to
   `STRIPE_WEBHOOK_SECRET`.
5. For local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
6. Customer Portal: Settings → Billing → Customer portal — enable it (used by "Manage Billing").

---

## 8. Anthropic Setup

1. Create an API key at [console.anthropic.com](https://console.anthropic.com).
2. Set `ANTHROPIC_API_KEY`.
3. Optional: override `ANTHROPIC_MODEL_ANALYSIS` / `ANTHROPIC_MODEL_CLASSIFICATION`
   in `.env.local` — defaults are in `lib/ai/models.ts`, which also holds
   the per-model cost estimates used for the admin cost dashboard.

---

## 9. Resend Setup (optional but recommended)

1. Create an account at [resend.com](https://resend.com), verify a sending domain.
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.
3. Without a key set, `lib/email/provider.ts` logs a warning and no-ops —
   the app fully functions without email configured.

---

## 10. Local Development

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm run test          # vitest (financial engine + AI schema validation)
npm run build          # production build
npm run seed             # seeds the public sample venture (needs full env config)
```

---

## 11. Production Deployment (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Add every variable from Section 5 in Vercel → Project → Settings →
   Environment Variables (set `NEXT_PUBLIC_APP_URL` to your real domain).
3. **Function duration**: `/api/projects/[id]/generate` runs ~10
   sequential/parallel Claude calls and can take over a minute. It declares
   `export const maxDuration = 300`, which requires a Vercel plan with
   extended function duration (Pro or higher, or Fluid Compute). On the
   Hobby plan, generation will likely time out — either upgrade your Vercel
   plan or move generation to a background job/queue.
4. Point the Stripe webhook at your production URL
   (`https://yourdomain.com/api/stripe/webhook`).
5. Update Supabase Auth's Site URL / redirect URLs to your production domain.
6. Deploy. Run the SQL migrations against your **production** Supabase
   project if you used a separate one for development.

---

## 12. Admin Setup

Add your email to `ADMIN_EMAILS` (comma-separated) — this grants `/admin`
access immediately, no database change needed. Alternatively, an existing
admin can promote any user from the Admin → Users → user detail page
("Make Admin"), which sets `profiles.is_admin = true`.

---

## 13. Test Account / Sample Data

- Sign up normally at `/signup` — the first venture is free (limited).
- To seed the public sample venture ("Pressure Washing Co.", Tampa, FL)
  shown as an example: fully configure `.env.local` (Supabase + Anthropic
  are required — it runs the real generation pipeline) and run `npm run seed`.
- Stripe test mode card: `4242 4242 4242 4242`, any future expiry/CVC.

---

## 14. Known Limitations

- The public "sample venture" is generated by a seed script you run once
  post-deploy (`npm run seed`); it isn't pre-baked into the repo since it
  requires real AI output.
- No fully public (unauthenticated) venture detail page yet — the landing
  page shows a static sample preview instead; the seeded sample project is
  viewable by any logged-in user once seeded.
- `/api/projects/[id]/generate` needs an extended-duration serverless
  function (see Section 11) or it should be moved to a queue/worker for a
  very high-traffic production deployment.
- AI request rate limiting is a simple daily-count check against the
  `ai_usage` table (see `lib/ai/usage.ts`), not a distributed rate limiter —
  fine for an MVP's traffic level, worth swapping for Upstash/Redis at scale.
- Email templates are minimal inline HTML — swap in a proper templating
  system (react-email, MJML) before high-volume sending.

## 15. Recommended Next Features

Per the product's own roadmap: business acquisition analysis, franchise
analysis, business valuation, loan/equipment financing calculators, a
marketplace, accountant/partner access, white-label accounts, an affiliate
program, business benchmarking, and real-time market data. The codebase
avoids architectural choices that would block any of these (modular AI
layer, versioned `business_analyses`, plan-based entitlements).

---

## GO LIVE CHECKLIST

1. [ ] Run all 4 migrations in `db/migrations/` against your production Supabase project.
2. [ ] Set every environment variable from Section 5 in your hosting provider.
3. [ ] Create the 3 Stripe Prices and set their IDs.
4. [ ] Point the Stripe webhook at `{prod-url}/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.
5. [ ] Set Supabase Auth Site URL + redirect URL to your production domain.
6. [ ] Add your email to `ADMIN_EMAILS`.
7. [ ] Confirm your hosting plan supports the 300s generation function duration.
8. [ ] `npm run build` locally to confirm a clean production build.
9. [ ] Deploy.
10. [ ] Sign up as yourself, run through the full flow: idea → wizard → generation → dashboard → purchase (Stripe test mode) → export PDF/Excel.
11. [ ] Switch Stripe to live mode keys once verified.
12. [ ] Run `npm run seed` to publish the sample venture.
13. [ ] (Optional) Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_POSTHOG_KEY` and `RESEND_API_KEY`.
14. [ ] Start accepting customers.
