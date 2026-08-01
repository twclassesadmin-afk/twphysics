-- Three real RLS gaps found by a live mutation audit (scripts, since removed):
--
-- 1. Students couldn't mark their own attendance when joining a class —
--    attendance_entries insert was staff-only.
-- 2. Tutors couldn't read issues raised by their own students at all (only
--    issues they personally raised) — breaking /tutor/communication's whole
--    purpose, not just the reply feature.
-- 3. Tutors couldn't reply to or resolve those issues even once visible.

-- ============================================================
-- Fix 1: attendance_entries — allow self-insert
-- ============================================================

drop policy "attendance_entries_write_staff_only" on public.attendance_entries;

create policy "attendance_entries_write_self_or_staff"
  on public.attendance_entries for insert
  to authenticated
  with check (
    student_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  );

-- ============================================================
-- Fix 2 & 3: issues / issue_comments — a tutor can see, comment on, and
-- update the status of issues raised by a student in one of their batches.
-- ============================================================

create or replace function public.is_tutor_of_student(target_student_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.students st
    where st.id = target_student_id
      and st.batch_id is not null
      and public.is_tutor_for_batch(st.batch_id)
  );
$$;

drop policy "issues_select_own_or_admin" on public.issues;

create policy "issues_select_own_staff_or_students_tutor"
  on public.issues for select
  to authenticated
  using (
    raised_by_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_tutor_of_student(raised_by_id))
  );

drop policy "issues_update_admin_only" on public.issues;

create policy "issues_update_admin_or_students_tutor"
  on public.issues for update
  to authenticated
  using ((select public.is_admin()) or (select public.is_tutor_of_student(raised_by_id)))
  with check ((select public.is_admin()) or (select public.is_tutor_of_student(raised_by_id)));

drop policy "issue_comments_select_via_issue" on public.issue_comments;

create policy "issue_comments_select_own_staff_or_students_tutor"
  on public.issue_comments for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.issues i
      where i.id = issue_id
        and (i.raised_by_id = (select auth.uid()) or public.is_tutor_of_student(i.raised_by_id))
    )
  );

drop policy "issue_comments_insert_via_issue" on public.issue_comments;

create policy "issue_comments_insert_own_staff_or_students_tutor"
  on public.issue_comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      (select public.is_admin())
      or exists (
        select 1 from public.issues i
        where i.id = issue_id
          and (i.raised_by_id = (select auth.uid()) or public.is_tutor_of_student(i.raised_by_id))
      )
    )
  );
