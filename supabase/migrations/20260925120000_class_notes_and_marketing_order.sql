-- 1) Student class notes. The Classes page let students "save" a note per
--    class but only kept it in React state — it vanished on reload. Persist it,
--    one note per (student, class), private to that student.
create table public.class_notes (
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  note text not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, class_id)
);

alter table public.class_notes enable row level security;

create policy "class_notes_own_all"
  on public.class_notes for all
  to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- 2) Results and testimonials had no ordering column, so the homepage and
--    /testimonials showed them in arbitrary (and shifting) order. Newest first.
alter table public.results
  add column created_at timestamptz not null default now();

alter table public.testimonials
  add column created_at timestamptz not null default now();

-- 3) Fees are collected offline after registration; admins record it here.
alter table public.students
  add column fee_paid boolean not null default false;

-- 4) Column-level protection for students rows. The UPDATE policy lets a
--    student update their *own* row (needed for phone/address edits and the
--    attendance recalculation that runs in their session) — but RLS is
--    row-level, so without this a student calling the API directly could also
--    move batches, clear a tutor's tag, set attendance to 100% or mark their
--    own fee paid. Non-admin changes to protected columns are silently reset.
create or replace function public.students_guard_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  -- Placement, enrolment and fee status are admin-only.
  new.course_id := old.course_id;
  new.batch_id := old.batch_id;
  new.student_category := old.student_category;
  new.status := old.status;
  new.fee_paid := old.fee_paid;

  -- attendance_pct is derived data: always recompute it from the entries
  -- rather than trusting whatever value the caller sent.
  new.attendance_pct := coalesce((
    select round(100.0 * count(*) filter (where attended) / nullif(count(*), 0))::int
    from public.attendance_entries
    where student_id = new.id
  ), 0);

  -- Tags belong to the student's tutors; the student can't edit their own.
  if old.batch_id is null or not public.is_tutor_for_batch(old.batch_id) then
    new.tag := old.tag;
    new.tag_note := old.tag_note;
  end if;

  return new;
end;
$$;

create trigger students_guard_columns
  before update on public.students
  for each row execute function public.students_guard_columns();
