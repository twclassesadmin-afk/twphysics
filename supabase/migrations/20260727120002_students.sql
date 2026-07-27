-- Students — extends profiles 1:1 (a student *is* a profile with role
-- 'student', auto-created by handle_new_user() on signup; this table holds
-- the student-specific fields collected during the app's registration flow).

create type public.stream as enum ('MPC', 'BiPC');
create type public.learning_mode as enum ('online', 'offline');
create type public.learning_type as enum ('individual', 'group');
create type public.student_tag as enum ('topper', 'weak', 'focus_needed');
create type public.student_status as enum ('active', 'expiring_soon');

create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  phone text not null default '',
  age integer,
  parent_name text not null default '',
  parent_phone text not null default '',
  address text not null default '',
  course_id uuid references public.courses (id) on delete set null,
  batch_id uuid references public.batches (id) on delete set null,
  student_category public.student_category,
  stream public.stream,
  target_exams text[] not null default '{}',
  learning_mode public.learning_mode,
  learning_type public.learning_type,
  status public.student_status not null default 'active',
  attendance_pct integer not null default 0,
  tag public.student_tag,
  tag_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_course_id_idx on public.students (course_id);
create index students_batch_id_idx on public.students (batch_id);

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

alter table public.students enable row level security;

create policy "students_select_own_or_staff"
  on public.students for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or (batch_id is not null and (select public.is_tutor_for_batch(batch_id)))
  );

-- Registration inserts the row itself (id = auth.uid(), right after
-- supabase.auth.signUp() in the same request); admin can also add a student
-- manually.
create policy "students_insert_self_or_admin"
  on public.students for insert
  to authenticated
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy "students_update_own_or_admin"
  on public.students for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy "students_delete_admin_only"
  on public.students for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- Role helper: is the current user a student enrolled in this batch? Used by
-- other batch-scoped tables (materials, syllabus, classes) to grant students
-- read access to their own batch's shared content.
-- ============================================================

create or replace function public.is_in_batch(target_batch_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.students
    where id = (select auth.uid()) and batch_id = target_batch_id
  );
$$;

create or replace function public.student_batch_id(target_student_id uuid)
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select batch_id from public.students where id = target_student_id;
$$;

-- ============================================================
-- student_flags — tag history (type/note/author), full audit trail behind
-- the student's current tag/tag_note shortcut columns above.
-- ============================================================

create table public.student_flags (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  type public.student_tag not null,
  note text not null default '',
  author_id uuid not null references public.profiles (id),
  author_role public.user_role not null,
  created_at timestamptz not null default now()
);

create index student_flags_student_id_idx on public.student_flags (student_id);

alter table public.student_flags enable row level security;

create policy "student_flags_select_own_or_staff"
  on public.student_flags for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  );

create policy "student_flags_write_staff_only"
  on public.student_flags for insert
  to authenticated
  with check (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  );

-- ============================================================
-- attendance_entries — per-class attendance log behind attendance_pct.
-- class_id is added once public.classes exists (next migration); nullable FK
-- added there via a follow-up alter to avoid a forward reference.
-- ============================================================

create table public.attendance_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid,
  date date not null,
  subject text not null,
  attended boolean not null,
  created_at timestamptz not null default now()
);

create index attendance_entries_student_id_idx on public.attendance_entries (student_id);

alter table public.attendance_entries enable row level security;

create policy "attendance_entries_select_own_or_staff"
  on public.attendance_entries for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  );

create policy "attendance_entries_write_staff_only"
  on public.attendance_entries for insert
  to authenticated
  with check (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  );
