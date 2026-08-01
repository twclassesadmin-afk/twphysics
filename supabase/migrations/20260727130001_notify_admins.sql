-- Several flows (student signup, syllabus falling behind, etc.) need to
-- notify "whichever profiles are admins" — but profiles RLS rightly blocks a
-- non-admin caller (e.g. a student mid-signup) from reading other users'
-- rows to find them. This RPC (security definer, same pattern as
-- notify_users()) resolves admins server-side and fans the notification out.

create or replace function public.notify_admins(
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
  select id, p_title, p_message, p_kind, p_related_entity_id
  from public.profiles
  where role = 'admin';
end;
$$;

grant execute on function public.notify_admins(text, text, text, uuid) to authenticated;
