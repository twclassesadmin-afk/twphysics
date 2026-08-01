-- The tutor application form is public (unauthenticated visitors), but
-- notify_admins()/log_activity() were only granted to `authenticated` —
-- an anonymous submission would insert the application fine and then throw
-- a permission error trying to notify admins about it.

grant execute on function public.notify_admins(text, text, text, uuid) to anon;
grant execute on function public.log_activity(text, text, text) to anon;
