-- Batches, tutor applications, tutors, and per-subject batch/tutor
-- assignments (a batch can have several tutors, one per subject).

create type public.student_category as enum ('college_going', 'long_term');

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid not null references public.courses (id) on delete restrict,
  student_category public.student_category not null,
  start_date date not null default current_date,
  daily_time text not null default 'TBD',
  capacity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index batches_course_id_idx on public.batches (course_id);

create trigger batches_set_updated_at
  before update on public.batches
  for each row execute function public.set_updated_at();

alter table public.batches enable row level security;

create policy "batches_select_all"
  on public.batches for select
  to authenticated, anon
  using (true);

create policy "batches_write_admin_only"
  on public.batches for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- tutor_applications — pre-account records; no profiles link until the
-- admin approves and a real account is provisioned (see public.tutors below).
-- ============================================================

create table public.tutor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  subjects text[] not null default '{}',
  qualifications text not null default '',
  experience text not null default '',
  availability text not null default '',
  bio text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz
);

alter table public.tutor_applications enable row level security;

create policy "tutor_applications_admin_only"
  on public.tutor_applications for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- tutors — extends profiles 1:1 (a tutor *is* a profile with role 'tutor').
-- ============================================================

create table public.tutors (
  id uuid primary key references public.profiles (id) on delete cascade,
  application_id uuid references public.tutor_applications (id),
  phone text not null default '',
  subjects text[] not null default '{}',
  qualifications text not null default '',
  availability text not null default '',
  bio text not null default '',
  joined_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tutors_set_updated_at
  before update on public.tutors
  for each row execute function public.set_updated_at();

alter table public.tutors enable row level security;

create policy "tutors_select_authenticated"
  on public.tutors for select
  to authenticated
  using (true);

create policy "tutors_update_own_or_admin"
  on public.tutors for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy "tutors_insert_admin_only"
  on public.tutors for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "tutors_delete_admin_only"
  on public.tutors for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- batch_tutors — one row per (batch, subject); assigning a subject that
-- already has a tutor replaces the row rather than adding a second.
-- ============================================================

create table public.batch_tutors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  subject text not null,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (batch_id, subject)
);

create index batch_tutors_batch_id_idx on public.batch_tutors (batch_id);
create index batch_tutors_tutor_id_idx on public.batch_tutors (tutor_id);

alter table public.batch_tutors enable row level security;

create policy "batch_tutors_select_authenticated"
  on public.batch_tutors for select
  to authenticated
  using (true);

create policy "batch_tutors_write_admin_only"
  on public.batch_tutors for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- Role helper: is this tutor assigned to teach (any subject in) this batch?
-- security definer + stable so it's a cheap indexed lookup inside RLS
-- policies on other tables, not a per-row table scan.
-- ============================================================

create or replace function public.is_tutor_for_batch(target_batch_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.batch_tutors
    where batch_id = target_batch_id and tutor_id = (select auth.uid())
  );
$$;
