"use server";

import { getCurrentUser } from "@/lib/get-current-user";
import { getClass } from "@/lib/store/classes";
import { recordAttendance } from "@/lib/store/students";

export async function markAttendance(classId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false, error: "Not authorized" };
  const scheduledClass = getClass(classId);
  if (!scheduledClass) return { ok: false, error: "Class not found" };

  recordAttendance(user.userId, {
    classId: scheduledClass.id,
    date: scheduledClass.scheduledAt.slice(0, 10),
    subject: scheduledClass.subject,
    attended: true,
  });
  return { ok: true };
}
