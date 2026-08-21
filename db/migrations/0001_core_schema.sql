-- VentureForge core schema
-- Run in the Supabase SQL editor, or via `supabase db push` / the Supabase CLI,
-- in numeric filename order.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: one row per auth.users row
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);

-- ─────────────────────────────────────────────────────────────────────────
-- projects: one venture/business idea a user is evaluating
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Untitled Venture',
  template_slug text,
  industry text,
  business_type text,
  country text,
  region text,
  city text,
  service_radius text,
  business_scope text, -- local | regional | national | online
  status text not null default 'draft', -- draft | generating | ready | launch_ready | error
  generation_status jsonb not null default '{}'::jsonb, -- { step: string, completedSteps: string[], error?: string }
  is_sample boolean not null default false,
  entitlement text not null default 'free', -- free | launch | pro
  venture_score int,
  startup_cost numeric,
  year1_revenue numeric,
  year1_profit numeric,
  breakeven_month int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_status_idx on public.projects(status);

-- ─────────────────────────────────────────────────────────────────────────
-- project_inputs: the wizard's captured answers (one row per project)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.project_inputs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  business_idea text,
  location jsonb not null default '{}'::jsonb,
  business_model jsonb not null default '{}'::jsonb,
  owner_goals jsonb not null default '{}'::jsonb,
  capital jsonb not null default '{}'::jsonb,
  experience jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  wizard_step int not null default 1,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- business_analyses: modular AI-generated narrative output, versioned
-- module examples: classification, market_analysis, operations_plan,
-- growth_strategy
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.business_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  module text not null,
  version int not null default 1,
  content jsonb not null,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists business_analyses_project_id_idx on public.business_analyses(project_id);
create unique index if not exists business_analyses_project_module_version_idx
  on public.business_analyses(project_id, module, version);

-- ─────────────────────────────────────────────────────────────────────────
-- venture_scores
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.venture_scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  overall int not null,
  label text not null,
  verdict text,
  profit_potential int not null,
  cash_flow int not null,
  scalability int not null,
  owner_freedom int not null,
  startup_efficiency int not null,
  risk int not null,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists venture_scores_project_id_idx on public.venture_scores(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- financial_assumptions: editable inputs driving the deterministic engine
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.financial_assumptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  data jsonb not null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists financial_assumptions_project_id_idx on public.financial_assumptions(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- startup_costs
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.startup_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  minimum numeric not null default 0,
  recommended numeric not null default 0,
  updated_at timestamptz not null default now()
);

create unique index if not exists startup_costs_project_id_idx on public.startup_costs(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- service_packages (Starter / Core / Premium pricing tiers)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.service_packages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  packages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists service_packages_project_id_idx on public.service_packages(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- financial_forecasts: monthly/yearly projections, break-even, unit
-- economics and scenarios -- all computed deterministically from assumptions
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.financial_forecasts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  unit_economics jsonb not null default '{}'::jsonb,
  monthly jsonb not null default '[]'::jsonb,
  yearly jsonb not null default '[]'::jsonb,
  breakeven jsonb not null default '{}'::jsonb,
  scenarios jsonb not null default '{}'::jsonb,
  goal_reverse_engineering jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists financial_forecasts_project_id_idx on public.financial_forecasts(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- marketing_plans / sales_kits
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.marketing_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  channels jsonb not null default '[]'::jsonb,
  content jsonb not null default '{}'::jsonb,
  website_copy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists marketing_plans_project_id_idx on public.marketing_plans(project_id);

create table if not exists public.sales_kits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists sales_kits_project_id_idx on public.sales_kits(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- launch_tasks (30-day launch plan, individually completable)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.launch_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  week int not null,
  task text not null,
  priority text not null default 'medium',
  estimated_time text,
  status text not null default 'pending', -- pending | in_progress | done
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists launch_tasks_project_id_idx on public.launch_tasks(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- risk_analyses
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.risk_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  risks jsonb not null default '[]'::jsonb,
  best_case jsonb not null default '{}'::jsonb,
  expected_case jsonb not null default '{}'::jsonb,
  worst_case jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists risk_analyses_project_id_idx on public.risk_analyses(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ai_chat_messages ("Ask VentureForge")
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null, -- user | assistant
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_messages_project_id_idx on public.ai_chat_messages(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- subscriptions (Stripe-synced, server-authoritative)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  plan text not null, -- pro | pro_annual
  status text not null, -- active | trialing | past_due | canceled | incomplete
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- ─────────────────────────────────────────────────────────────────────────
-- purchases (one-time Launch plan purchases)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_checkout_session_id text,
  plan text not null default 'launch',
  amount_cents int not null,
  status text not null default 'pending', -- pending | succeeded | failed | refunded
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on public.purchases(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ai_usage: per-call cost/usage logging for abuse prevention and cost control
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  feature text not null, -- e.g. classification, market_analysis, chat
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  estimated_cost_cents numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_id_idx on public.ai_usage(user_id);
create index if not exists ai_usage_created_at_idx on public.ai_usage(created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- exports (download audit trail)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null, -- pdf | xlsx
  created_at timestamptz not null default now()
);

create index if not exists exports_project_id_idx on public.exports(project_id);

-- ─────────────────────────────────────────────────────────────────────────
-- admin_roles: supplementary to ADMIN_EMAILS env var allowlist
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
