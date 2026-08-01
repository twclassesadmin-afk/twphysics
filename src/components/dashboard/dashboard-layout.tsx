"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronsUpDown, LogOut, User } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "./sidebar-nav";
import { NotificationsMenu } from "./notifications-menu";
import { ROLE_NAV, ROLE_LABEL, ROLE_PROFILE_HREF, type DashboardRole } from "./nav-items";
import type { Notification } from "@/lib/store/types";

export function DashboardLayout({
  role,
  userName,
  pageTitle,
  notifications = [],
  children,
}: {
  role: DashboardRole;
  userName: string;
  pageTitle: string;
  notifications?: Notification[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = ROLE_NAV[role];
  const roleLabel = ROLE_LABEL[role];
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-primary">
            TWPHYSICS
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav items={navItems} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetTitle className="px-4 pt-4 text-primary">TWPHYSICS</SheetTitle>
                <div className="p-3">
                  <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
              <h1 className="text-lg font-semibold leading-tight">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NotificationsMenu initialNotifications={notifications} role={role} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className="h-auto gap-2 px-2 py-1.5" />}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{userName}</span>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href={ROLE_PROFILE_HREF[role]} />}>
                    <User />
                    Profile settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={logout} className="contents">
                    <DropdownMenuItem
                      nativeButton
                      render={<button type="submit" className="w-full" />}
                    >
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
