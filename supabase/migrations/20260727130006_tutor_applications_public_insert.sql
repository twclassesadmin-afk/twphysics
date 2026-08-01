-- Public tutor application form (replaces the external Google Form) needs
-- anonymous visitors to insert their own application — the existing
-- tutor_applications_admin_only policy only covers `authenticated`, so anon
-- submissions were rejected by RLS. Scoped to insert-only, and only as a
-- fresh pending application (can't submit a pre-approved/reviewed row).

create policy "tutor_applications_insert_public"
  on public.tutor_applications for insert
  to anon, authenticated
  with check (status = 'pending' and reviewed_by is null and reviewed_at is null);
