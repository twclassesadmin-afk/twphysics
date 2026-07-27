import { db, nextId } from "./db";
import type { ScheduledClass } from "./types";

export function listClassesByBatch(batchId: string): ScheduledClass[] {
  return db.classes
    .filter((c) => c.batchId === batchId)
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1));
}

export function listClassesByTutor(tutorId: string): ScheduledClass[] {
  return db.classes.filter((c) => c.tutorId === tutorId);
}

export function getClass(id: string): ScheduledClass | undefined {
  return db.classes.find((c) => c.id === id);
}

export function scheduleClass(input: {
  batchId: string;
  batchName: string;
  subject: string;
  topic: string;
  tutorId: string;
  tutorName: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl: string;
}): ScheduledClass {
  const scheduled: ScheduledClass = { id: nextId("cl"), ...input };
  db.classes.push(scheduled);
  return scheduled;
}

export function rescheduleClass(
  classId: string,
  patch: { scheduledAt?: string; durationMinutes?: number; joinUrl?: string },
): ScheduledClass | undefined {
  const scheduled = db.classes.find((c) => c.id === classId);
  if (!scheduled) return undefined;
  if (patch.scheduledAt !== undefined) scheduled.scheduledAt = patch.scheduledAt;
  if (patch.durationMinutes !== undefined) scheduled.durationMinutes = patch.durationMinutes;
  if (patch.joinUrl !== undefined) scheduled.joinUrl = patch.joinUrl;
  return scheduled;
}
