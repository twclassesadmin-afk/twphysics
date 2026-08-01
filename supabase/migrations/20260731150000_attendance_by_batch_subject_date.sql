-- Attendance marking required a pre-scheduled `classes` row (tutor had to
-- use "Schedule Class" first), but that's a separate admin/tutor concept
-- (batches carry a recurring daily_time; nothing auto-creates a `classes`
-- row from it) — tutors expected to just mark today's roster present/absent
-- without that extra step. Re-key attendance_entries on
-- (student_id, date, subject) instead of (student_id, class_id): this is
-- the actually-correct identity of "this student's attendance for this
-- subject on this day" — it naturally reconciles a student's self-mark
-- (clicking Join on a real scheduled class, class_id set) with a tutor's
-- roll call (no class needed, class_id null) into the same row instead of
-- risking a double-counted duplicate.

alter table public.attendance_entries
  drop constraint attendance_entries_student_class_unique;

alter table public.attendance_entries
  add constraint attendance_entries_student_date_subject_unique unique (student_id, date, subject);
