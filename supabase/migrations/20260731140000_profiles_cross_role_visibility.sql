-- profiles_select_own_or_admin only let a user see their OWN profile (or
-- admin, everything). But every list of students/tutors across the app does
-- a name lookup against profiles (hydrateStudents, tutorNameLookup, etc.) —
-- a tutor viewing their own student roster, or a student viewing their
-- batch-mates/tutor, got every OTHER name silently blanked out by RLS (no
-- error — SELECT rows just don't come back). Confirmed live: batch,
-- attendance %, and tag rendered fine (those come from `students`, which
-- already has a tutor-scoped policy) while `name` (from `profiles`) was
-- empty for every row but the viewer's own.

create or replace function public.shares_batch_with_caller(target_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.students me
    where me.id = (select auth.uid())
      and me.batch_id is not null
      and (
        exists (select 1 from public.students st where st.id = target_id and st.batch_id = me.batch_id)
        or exists (select 1 from public.batch_tutors bt where bt.tutor_id = target_id and bt.batch_id = me.batch_id)
      )
  );
$$;

drop policy "profiles_select_own_or_admin" on public.profiles;

create policy "profiles_select_own_admin_or_related"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_tutor_of_student(id))
    or (select public.shares_batch_with_caller(id))
  );
