-- Support tickets raised by students/tutors, reviewed by admin.

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  description text not null,
  raised_by_id uuid not null references public.profiles (id) on delete cascade,
  raised_by_role public.user_role not null check (raised_by_role in ('student', 'tutor')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index issues_raised_by_id_idx on public.issues (raised_by_id);

create trigger issues_set_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

alter table public.issues enable row level security;

create policy "issues_select_own_or_admin"
  on public.issues for select
  to authenticated
  using (raised_by_id = (select auth.uid()) or (select public.is_admin()));

create policy "issues_insert_own"
  on public.issues for insert
  to authenticated
  with check (raised_by_id = (select auth.uid()));

create policy "issues_update_admin_only"
  on public.issues for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- issue_comments
-- ============================================================

create table public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  message text not null,
  created_at timestamptz not null default now()
);

create index issue_comments_issue_id_idx on public.issue_comments (issue_id);

alter table public.issue_comments enable row level security;

create policy "issue_comments_select_via_issue"
  on public.issue_comments for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.issues i
      where i.id = issue_id and i.raised_by_id = (select auth.uid())
    )
  );

create policy "issue_comments_insert_via_issue"
  on public.issue_comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.issues i
        where i.id = issue_id and i.raised_by_id = (select auth.uid())
      )
    )
  );
