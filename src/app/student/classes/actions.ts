"use server";

import { getCurrentUser } from "@/lib/get-current-user";
import { getClass } from "@/lib/store/classes";
import { getStudent, recordAttendance } from "@/lib/store/students";
import { hasEnded, hasStarted } from "@/lib/time-gate";
import { removeClassNote, upsertClassNote } from "@/lib/store/class-notes";

// Students may join a little early (clock skew, "waiting room" habit).
const EARLY_JOIN_MS = 10 * 60_000;

export async function markAttendance(classId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false, error: "Not authorized" };
  const [scheduledClass, student] = await Promise.all([getClass(classId), getStudent(user.userId)]);
  if (!scheduledClass) return { ok: false, error: "Class not found" };

  // This action is callable directly, not just via the Join button — so
  // re-check server-side that it's the student's own batch and the class is
  // actually live, otherwise anyone could mark themselves present anywhere.
  if (!student || student.batchId !== scheduledClass.batchId) {
    return { ok: false, error: "Not authorized" };
  }
  const now = new Date();
  const opensAt = new Date(now.getTime() + EARLY_JOIN_MS);
  if (!hasStarted(scheduledClass.scheduledAt, opensAt) || hasEnded(scheduledClass.scheduledAt, scheduledClass.durationMinutes, now)) {
    return { ok: false, error: "This class isn't live right now" };
  }

  await recordAttendance(user.userId, {
    classId: scheduledClass.id,
    date: scheduledClass.scheduledAt.slice(0, 10),
    subject: scheduledClass.subject,
    attended: true,
  });
  return { ok: true };
}

const MAX_NOTE_LENGTH = 5000;

export async function saveClassNote(classId: string, note: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false, error: "Not authorized" };
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "Note is empty" };
  if (trimmed.length > MAX_NOTE_LENGTH) return { ok: false, error: `Keep notes under ${MAX_NOTE_LENGTH} characters` };
  const [scheduledClass, student] = await Promise.all([getClass(classId), getStudent(user.userId)]);
  if (!scheduledClass || !student || student.batchId !== scheduledClass.batchId) {
    return { ok: false, error: "Class not found" };
  }
  await upsertClassNote(user.userId, classId, trimmed);
  return { ok: true };
}

export async function deleteClassNote(classId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false, error: "Not authorized" };
  await removeClassNote(user.userId, classId);
  return { ok: true };
}
