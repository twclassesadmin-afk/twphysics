"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Notification, NotificationKind, UserRole } from "@/lib/store/types";
import { notificationHref } from "@/lib/notification-href";
import { markAllNotificationsRead } from "./notifications-actions";

export function NotificationsMenu({
  initialNotifications = [],
  role,
}: {
  initialNotifications?: Notification[];
  role: UserRole;
}) {
  const [items, setItems] = useState(initialNotifications);
  const unreadCount = items.filter((item) => !item.isRead).length;

  // Live updates: new notifications append without a page refresh. Initial
  // state still comes from the server-rendered `initialNotifications` prop —
  // this only adds what arrives after mount.
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      // Checked inside the callback, not just at cleanup — this effect can be
      // torn down before getUser() resolves (React dev-mode double-invoke,
      // or a fast navigation away). createBrowserClient() is a singleton and
      // RealtimeClient.channel() returns the SAME channel object for a topic
      // it's already seen, so subscribing here after teardown would call
      // .on() on an already-subscribed channel and throw.
      if (!userId || cancelled) return;

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            const row = payload.new as {
              id: string;
              user_id: string;
              title: string;
              message: string;
              is_read: boolean;
              kind: NotificationKind;
              related_entity_id: string | null;
              created_at: string;
            };
            const notification: Notification = {
              id: row.id,
              userId: row.user_id,
              title: row.title,
              message: row.message,
              isRead: row.is_read,
              createdAt: row.created_at,
              kind: row.kind,
              relatedEntityId: row.related_entity_id ?? undefined,
            };
            setItems((prev) => [notification, ...prev]);
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    if (unreadCount > 0) void markAllNotificationsRead();
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) markAllRead();
      }}
    >
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label="Notifications" />}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
          >
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.length === 0 ? (
            <p className="px-1.5 py-4 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            items.map((item) => {
              const href = notificationHref(item, role);
              const content = (
                <>
                  <span className={cn("text-sm font-medium", !item.isRead && "text-foreground")}>
                    {!item.isRead && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary" />}
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.message}</span>
                  <span className="text-[11px] text-muted-foreground">{item.createdAt}</span>
                </>
              );
              return (
                <DropdownMenuItem
                  key={item.id}
                  className="flex-col items-start gap-0.5 whitespace-normal"
                  render={href ? <Link href={href} /> : undefined}
                >
                  {content}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
