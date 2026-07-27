-- Admin activity audit log, plus marketing-facing exam results and
-- testimonials (public read, admin write).

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text not null,
  at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "activity_log_select_admin_only"
  on public.activity_log for select
  to authenticated
  using ((select public.is_admin()));

-- Logged via the same notify_users()-style trusted RPC pattern rather than a
-- broad authenticated insert policy, since the log must not be tamperable by
-- whichever role happens to trigger an action.
create or replace function public.log_activity(p_actor text, p_action text, p_target text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activity_log (actor, action, target) values (p_actor, p_action, p_target);
end;
$$;

grant execute on function public.log_activity(text, text, text) to authenticated;

-- ============================================================
-- results — published exam results shown on the marketing site
-- ============================================================

create table public.results (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam text not null,
  rank text not null,
  score text not null,
  quote text not null default ''
);

alter table public.results enable row level security;

create policy "results_select_all"
  on public.results for select
  to authenticated, anon
  using (true);

create policy "results_write_admin_only"
  on public.results for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- testimonials
-- ============================================================

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  quote text not null
);

alter table public.testimonials enable row level security;

create policy "testimonials_select_all"
  on public.testimonials for select
  to authenticated, anon
  using (true);

create policy "testimonials_write_admin_only"
  on public.testimonials for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
