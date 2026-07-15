import { db, nextId } from "./db";
import type { Notification, NotificationKind, UserRole } from "./types";

export function listNotificationsForUser(userId: string): Notification[] {
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function notifyUsers(
  userIds: string[],
  input: { title: string; message: string; kind?: NotificationKind; relatedEntityId?: string },
): void {
  const createdAt = new Date().toISOString().replace("T", " ").slice(0, 16);
  for (const userId of userIds) {
    const notification: Notification = {
      id: nextId("notif"),
      userId,
      title: input.title,
      message: input.message,
      isRead: false,
      createdAt,
      kind: input.kind ?? "generic",
      relatedEntityId: input.relatedEntityId,
    };
    db.notifications.unshift(notification);
  }
}

export function markAllRead(userId: string): void {
  for (const notification of db.notifications) {
    if (notification.userId === userId) notification.isRead = true;
  }
}

// Resolves where a notification should navigate to, per the viewing role —
// the same notification kind can point at a different page depending on
// whether a student, tutor, or admin is looking at it.
export function notificationHref(notification: Notification, role: UserRole): string | undefined {
  const id = notification.relatedEntityId;
  switch (notification.kind) {
    case "exam_scheduled":
      return id ? `/${role}/exams/${id}` : `/${role}/exams`;
    case "exam_published":
      if (role === "student") return id ? `/student/exams/${id}/review` : "/student/exams";
      return id ? `/tutor/exams/${id}` : "/tutor/exams";
    case "issue":
      if (role === "student") return "/student/issues";
      if (role === "tutor") return "/tutor/communication";
      return "/admin/issues";
    case "material":
      return role === "student" ? "/student/course" : "/tutor/materials";
    case "class":
      return "/student/classes";
    case "demo_request":
      return "/admin/demo-requests";
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
