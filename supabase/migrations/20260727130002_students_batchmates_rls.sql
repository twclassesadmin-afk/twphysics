-- students_select_own_or_staff only let a student read their OWN row — but
-- /student/course shows "batch-mates" (other students in the same batch),
-- which every student needs read access to. Caught by a live RLS smoke test
-- (scripts/_tmp-verify-rls.mjs) rather than assumed correct from the schema.

create or replace function public.my_batch_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select batch_id from public.students where id = (select auth.uid());
$$;

drop policy "students_select_own_or_staff" on public.students;

create policy "students_select_own_batchmates_or_staff"
  on public.students for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or (batch_id is not null and (select public.is_tutor_for_batch(batch_id)))
    or (batch_id is not null and batch_id = (select public.my_batch_id()))
  );
