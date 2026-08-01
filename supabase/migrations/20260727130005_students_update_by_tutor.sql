-- A tutor tagging a student (topper/weak/focus_needed via
-- tutor/students/actions.ts's tagStudent) writes to student_flags (already
-- tutor-writable) AND updates students.tag/tag_note as a display shortcut —
-- but students_update_own_or_admin only allowed the student themself or an
-- admin to UPDATE students, so the tag_note update silently affected 0 rows
-- (an RLS-blocked UPDATE has no error, unlike INSERT) — confirmed by a live
-- before/after check, not just "no error thrown".

drop policy "students_update_own_or_admin" on public.students;

create policy "students_update_own_staff_or_batch_tutor"
  on public.students for update
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or (batch_id is not null and (select public.is_tutor_for_batch(batch_id)))
  )
  with check (
    id = (select auth.uid())
    or (select public.is_admin())
    or (batch_id is not null and (select public.is_tutor_for_batch(batch_id)))
  );
