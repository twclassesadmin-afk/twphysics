begin;

select plan(6);

-- Fixtures: inserting into auth.users fires on_auth_user_created, which creates
-- a 'student' profile row for each via the trigger under test elsewhere.
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'student-a@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'student-b@test.local');

update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';

-- Student A can read their own profile.
set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "user_role": "student"}';

select results_eq(
  $$ select id from public.profiles where id = '22222222-2222-2222-2222-222222222222' $$,
  $$ values ('22222222-2222-2222-2222-222222222222'::uuid) $$,
  'student can read own profile'
);

-- Student A cannot read Student B's profile (zero rows, not an error).
select is_empty(
  $$ select id from public.profiles where id = '33333333-3333-3333-3333-333333333333' $$,
  'student cannot read another student''s profile'
);

-- Student A cannot escalate their own role via direct update (column privilege revoked).
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '22222222-2222-2222-2222-222222222222' $$,
  '42501',
  null,
  'student cannot update the role column directly'
);

reset role;

-- Admin can read every profile.
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "user_role": "admin"}';

select is(
  (select count(*) from public.profiles)::int, 3,
  'admin can read all profiles'
);

-- Admin can promote a user's role via the security-definer RPC.
select lives_ok(
  $$ select public.admin_set_user_role('33333333-3333-3333-3333-333333333333', 'tutor') $$,
  'admin can call admin_set_user_role'
);

reset role;

-- Unauthenticated requests get zero rows, not an error.
set local role anon;

select is_empty(
  $$ select id from public.profiles $$,
  'anonymous user reads zero profile rows'
);

select * from finish();

rollback;
