"use server";

import { getCurrentUser } from "@/lib/get-current-user";
import { markAllRead } from "@/lib/store/notifications";

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  markAllRead(user.userId);
}
