-- Enable RLS on every table and lock access down to the owning user.
-- Service-role clients (webhooks, admin routes, background jobs) bypass RLS
-- entirely and are the only writers for billing/usage tables.

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_inputs enable row level security;
alter table public.business_analyses enable row level security;
alter table public.venture_scores enable row level security;
alter table public.financial_assumptions enable row level security;
alter table public.startup_costs enable row level security;
alter table public.service_packages enable row level security;
alter table public.financial_forecasts enable row level security;
alter table public.marketing_plans enable row level security;
alter table public.sales_kits enable row level security;
alter table public.launch_tasks enable row level security;
alter table public.risk_analyses enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;
alter table public.ai_usage enable row level security;
alter table public.exports enable row level security;
alter table public.admin_roles enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── projects ────────────────────────────────────────────────────────────
create policy "projects_select_own_sample_or_admin" on public.projects
  for select using (
    auth.uid() = user_id or is_sample = true or public.is_admin(auth.uid())
  );
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- ── generic helper macro (applied per table below) ─────────────────────
-- A row in a child table is visible/editable iff the parent project belongs
-- to the current user (or the parent project is the public sample, for
-- read-only access; or the caller is an admin).

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'project_inputs', 'business_analyses', 'venture_scores',
    'financial_assumptions', 'startup_costs', 'service_packages',
    'financial_forecasts', 'marketing_plans', 'sales_kits',
    'launch_tasks', 'risk_analyses', 'ai_chat_messages'
  ]
  loop
    execute format($f$
      create policy "%1$s_select_via_project" on public.%1$I
        for select using (
          exists (
            select 1 from public.projects p
            where p.id = %1$I.project_id
              and (p.user_id = auth.uid() or p.is_sample = true or public.is_admin(auth.uid()))
          )
        );
      create policy "%1$s_insert_via_project" on public.%1$I
        for insert with check (
          exists (
            select 1 from public.projects p
            where p.id = %1$I.project_id and p.user_id = auth.uid()
          )
        );
      create policy "%1$s_update_via_project" on public.%1$I
        for update using (
          exists (
            select 1 from public.projects p
            where p.id = %1$I.project_id and p.user_id = auth.uid()
          )
        );
      create policy "%1$s_delete_via_project" on public.%1$I
        for delete using (
          exists (
            select 1 from public.projects p
            where p.id = %1$I.project_id and p.user_id = auth.uid()
          )
        );
    $f$, tbl);
  end loop;
end $$;

-- ── billing / usage / export tables: read-only for the owning user,
--    all writes happen server-side via the service role client ──────────
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "ai_usage_select_own" on public.ai_usage
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "exports_select_own" on public.exports
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "exports_insert_own" on public.exports
  for insert with check (auth.uid() = user_id);

-- ── admin_roles: admins only ─────────────────────────────────────────────
create policy "admin_roles_select_admin_only" on public.admin_roles
  for select using (public.is_admin(auth.uid()));
