-- Courses and pricing tiers. Both are public-readable (marketing pages have
-- no login) and admin-writable only.

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  duration_months integer not null default 12,
  highlights text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

alter table public.courses enable row level security;

create policy "courses_select_all"
  on public.courses for select
  to authenticated, anon
  using (true);

create policy "courses_write_admin_only"
  on public.courses for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- pricing_tiers — batch-size-driven fee schedule (client-confirmed
-- 2026-07-27: same fee across every stream/course; billed yearly in 3 terms,
-- not monthly — monthly_fee_inr is the unit rate a term is computed from).
-- ============================================================

create table public.pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  batch_size integer not null,
  label text not null,
  subjects_count integer not null default 3,
  days_per_subject_per_month integer not null default 12,
  monthly_fee_inr integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pricing_tiers_set_updated_at
  before update on public.pricing_tiers
  for each row execute function public.set_updated_at();

alter table public.pricing_tiers enable row level security;

create policy "pricing_tiers_select_all"
  on public.pricing_tiers for select
  to authenticated, anon
  using (true);

create policy "pricing_tiers_write_admin_only"
  on public.pricing_tiers for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
