-- Foundation: role enum, profiles, admin_settings, auth trigger, custom access token hook, RLS.

create type public.user_role as enum ('admin', 'tutor', 'student');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- profiles
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- New auth.users rows always get a 'student' profile. Tutor/admin accounts are
-- provisioned separately (tutor approval pipeline, direct admin action) and never
-- via self-signup metadata, so role is never read from client-supplied data here.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Role helpers, backed by the JWT claim set by custom_access_token_hook below
-- (not a table lookup, so these are safe to use inside RLS policies without recursion).
-- ============================================================

create or replace function public.jwt_role()
returns public.user_role
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'user_role')::public.user_role,
    'student'::public.user_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_role() = 'admin';
$$;

-- ============================================================
-- profiles RLS
-- ============================================================

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- Role changes must go through this function, never a direct column update:
-- it's the only path that can flip role, and it re-checks admin status server-side.
revoke update (role) on public.profiles from authenticated;

create or replace function public.admin_set_user_role(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'only admins can change user roles';
  end if;

  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;

-- ============================================================
-- admin_settings
-- ============================================================

create table public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at();

alter table public.admin_settings enable row level security;

create policy "admin_settings_admin_only"
  on public.admin_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Custom access token hook: stamps `user_role` onto every issued JWT so RLS
-- policies and the app's route middleware can read it without a DB round trip.
-- Registered in supabase/config.toml under [auth.hook.custom_access_token].
-- ============================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  role_for_user public.user_role;
begin
  select role into role_for_user
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(role_for_user, 'student')));
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on public.profiles to supabase_auth_admin;

create policy "profiles_select_auth_admin"
  on public.profiles for select
  to supabase_auth_admin
  using (true);
