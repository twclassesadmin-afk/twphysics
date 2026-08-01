-- Enables the notifications bell to update live (Phase 5) instead of only
-- refreshing on navigation/revalidatePath.
alter publication supabase_realtime add table public.notifications;
