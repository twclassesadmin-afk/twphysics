-- profiles didn't originally carry email (PostgREST can't query the `auth`
-- schema directly, and most reads need a user's email for display without
-- requiring the service-role Admin API on every request) — denormalize it
-- onto profiles, kept in sync at signup by handle_new_user().

alter table public.profiles add column email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;
