import type { Notification, UserRole } from "./store/types";

// Resolves where a notification should navigate to, per the viewing role —
// the same notification kind can point at a different page depending on
// whether a student, tutor, or admin is looking at it.
//
// Lives outside src/lib/store/notifications.ts on purpose: that file also
// exports Supabase-server-backed functions (import chain reaches
// next/headers), and this pure function is imported directly by a "use
// client" component (notifications-menu.tsx) — bundling it alongside the
// server-only exports breaks the client build.
export function notificationHref(notification: Notification, role: UserRole): string | undefined {
  switch (notification.kind) {
    case "issue":
      if (role === "student") return "/student/issues";
      if (role === "tutor") return "/tutor/communication";
      return "/admin/issues";
    case "material":
      return role === "student" ? "/student/course" : "/tutor/materials";
    case "class":
      if (role === "student") return "/student/classes";
      if (role === "tutor") return "/tutor/batches";
      return "/admin/batches";
    case "tutor_application":
      return "/admin/users";
    case "syllabus":
      if (role === "student") return "/student/progress";
      if (role === "tutor") return "/tutor/syllabus";
      return "/admin/syllabus";
    default:
      return undefined;
  }
}
