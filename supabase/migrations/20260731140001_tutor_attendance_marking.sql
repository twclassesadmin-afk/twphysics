-- Tutors had no way to mark attendance at all — only a student's own
-- "Join Class" click wrote an attendance_entries row (self-attested, present
-- only). Adds the missing piece: a tutor marks present/absent for their
-- whole roster per class, which is the authoritative record.
--
-- Keyed on (student_id, class_id) so a tutor's mark and a student's earlier
-- self-mark for the same class reconcile to one row (upsert) instead of
-- duplicating — the tutor's mark wins since it's applied last. Existing rows
-- with class_id null (historical/free-standing entries) are unaffected: a
-- unique constraint doesn't restrict NULLs against each other in Postgres.

alter table public.attendance_entries
  add constraint attendance_entries_student_class_unique unique (student_id, class_id);

create policy "attendance_entries_update_staff_only"
  on public.attendance_entries for update
  to authenticated
  using (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  )
  with check (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(public.student_batch_id(student_id)))
  );
