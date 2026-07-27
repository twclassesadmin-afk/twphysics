-- Per-user notifications feed. Indexed on (user_id, is_read) for the bell
-- query; realtime is enabled on this table in a later migration (Phase 5).

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  kind text not null default 'generic'
    check (kind in ('issue', 'material', 'class', 'tutor_application', 'syllabus', 'generic')),
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create index notifications_user_id_is_read_idx on public.notifications (user_id, is_read);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Notifications are always fan-out inserts targeting *other* users (e.g. a
-- student raises an issue, admin + tutor get notified) — a broad
-- "authenticated" insert policy would let anyone insert a notification
-- claiming to be for anyone. Instead, all notification writes go through
-- this RPC (security definer, same pattern as admin_set_user_role()), which
-- performs the fan-out server-side without exposing raw table insert.
create or replace function public.notify_users(
  target_user_ids uuid[],
  p_title text,
  p_message text,
  p_kind text default 'generic',
  p_related_entity_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, title, message, kind, related_entity_id)
  select uid, p_title, p_message, p_kind, p_related_entity_id
  from unnest(target_user_ids) as uid;
end;
$$;

grant execute on function public.notify_users(uuid[], text, text, text, uuid) to authenticated;
