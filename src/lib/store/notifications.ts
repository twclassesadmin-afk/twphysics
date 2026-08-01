import { createClient } from "@/lib/supabase/server";
import type { Notification, NotificationKind } from "./types";

function mapNotification(row: {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  kind: NotificationKind;
  related_entity_id: string | null;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    kind: row.kind,
    relatedEntityId: row.related_entity_id ?? undefined,
  };
}

export async function listNotificationsForUser(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapNotification);
}

// Fan-out insert targeting *other* users — goes through the notify_users()
// security-definer RPC (see supabase/migrations/20260727120005_notifications.sql)
// rather than a direct table insert, since no insert policy exists on
// notifications for exactly that reason.
export async function notifyUsers(
  userIds: string[],
  input: { title: string; message: string; kind?: NotificationKind; relatedEntityId?: string },
): Promise<void> {
  if (userIds.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("notify_users", {
    target_user_ids: userIds,
    p_title: input.title,
    p_message: input.message,
    p_kind: input.kind ?? "generic",
    p_related_entity_id: input.relatedEntityId ?? null,
  });
  if (error) throw error;
}

// Fans out to every admin without the caller needing to know their user
// ids (RLS blocks a non-admin from looking that up) — see notify_admins() in
// supabase/migrations/20260727130001_notify_admins.sql.
export async function notifyAdmins(input: {
  title: string;
  message: string;
  kind?: NotificationKind;
  relatedEntityId?: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("notify_admins", {
    p_title: input.title,
    p_message: input.message,
    p_kind: input.kind ?? "generic",
    p_related_entity_id: input.relatedEntityId ?? null,
  });
  if (error) throw error;
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
  if (error) throw error;
}
