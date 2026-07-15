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
  const scheduled: ScheduledClass = { id: nextId("cl"), recordingUrl: null, ...input };
  db.classes.push(scheduled);
  return scheduled;
}

export function markClassRecorded(classId: string, recordingUrl: string): void {
  const scheduled = db.classes.find((c) => c.id === classId);
  if (!scheduled) return;
  scheduled.recordingUrl = recordingUrl;
}
