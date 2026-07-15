"use client";

import { useState } from "react";
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
import type { Notification, UserRole } from "@/lib/store/types";
import { notificationHref } from "@/lib/store/notifications";
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
