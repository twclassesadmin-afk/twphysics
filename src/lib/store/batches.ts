import { db, nextId } from "./db";
import type { Batch, BatchTutorAssignment, Course, StudentCategory } from "./types";

export function listCourses(): Course[] {
  return db.courses;
}

export function getCourse(id: string): Course | undefined {
  return db.courses.find((c) => c.id === id);
}

export function addCourse(input: {
  name: string;
  tagline: string;
  durationMonths: number;
  highlights: string[];
}): Course {
  const course: Course = {
    id: nextId("c"),
    name: input.name,
    tagline: input.tagline,
    durationMonths: input.durationMonths,
    highlights: input.highlights,
  };
  db.courses.push(course);
  return course;
}

export function removeCourse(id: string): void {
  db.courses = db.courses.filter((c) => c.id !== id);
}

export function listBatches(): Batch[] {
  return db.batches;
}

export function getBatch(id: string): Batch | undefined {
  return db.batches.find((b) => b.id === id);
}

export function listBatchesByTutor(tutorId: string): Batch[] {
  const batchIds = new Set(db.batchTutors.filter((bt) => bt.tutorId === tutorId).map((bt) => bt.batchId));
  return db.batches.filter((b) => batchIds.has(b.id));
}

export function listBatchTutors(batchId: string): BatchTutorAssignment[] {
  return db.batchTutors.filter((bt) => bt.batchId === batchId);
}

// The subjects a specific tutor is assigned to teach within one batch —
// scopes what they're allowed to schedule a class for in that batch.
export function subjectsForTutorInBatch(tutorId: string, batchId: string): string[] {
  return db.batchTutors.filter((bt) => bt.batchId === batchId && bt.tutorId === tutorId).map((bt) => bt.subject);
}

export function batchTutorSummary(batchId: string): string {
  const assignments = listBatchTutors(batchId);
  if (assignments.length === 0) return "Unassigned";
  return assignments.map((bt) => `${bt.subject} — ${bt.tutorName}`).join(", ");
}

export function listBatchesByCourse(courseId: string): Batch[] {
  return db.batches.filter((b) => b.courseId === courseId);
}

// Always derived from real enrollment — never stored — so it can't drift out
// of sync with the actual student roster.
export function getBatchFilledCount(batchId: string): number {
  return db.students.filter((s) => s.batchId === batchId).length;
}

export function getCourseSeatsLeft(courseId: string): number {
  return listBatchesByCourse(courseId).reduce(
    (sum, batch) => sum + Math.max(0, batch.capacity - getBatchFilledCount(batch.id)),
    0,
  );
}

export function addBatch(input: {
  name: string;
  courseId: string;
  course: string;
  studentCategory: StudentCategory;
  capacity: number;
  dailyTime: string;
}): Batch {
  const batch: Batch = {
    id: nextId("b"),
    name: input.name,
    courseId: input.courseId,
    course: input.course,
    studentCategory: input.studentCategory,
    startDate: new Date().toISOString().slice(0, 10),
    dailyTime: input.dailyTime,
    capacity: input.capacity,
  };
  db.batches.push(batch);
  return batch;
}

export function firstOpenBatchForCourse(courseId: string): Batch | undefined {
  return db.batches.find((b) => b.courseId === courseId && getBatchFilledCount(b.id) < b.capacity);
}

// Registration matches on both course and student category (college-going vs
// long-term) since the two categories run on different daily timings.
export function firstOpenBatchForCourseAndCategory(
  courseId: string,
  studentCategory: StudentCategory,
): Batch | undefined {
  return db.batches.find(
    (b) => b.courseId === courseId && b.studentCategory === studentCategory && getBatchFilledCount(b.id) < b.capacity,
  );
}

// Upserts the (batch, subject) assignment — a subject that's already taught
// by someone else in this batch gets reassigned rather than duplicated.
export function assignTutorToBatchSubject(
  batchId: string,
  subject: string,
  tutorId: string,
  tutorName: string,
): void {
  const existing = db.batchTutors.find((bt) => bt.batchId === batchId && bt.subject === subject);
  if (existing) {
    existing.tutorId = tutorId;
    existing.tutorName = tutorName;
    return;
  }
  db.batchTutors.push({ id: nextId("bt"), batchId, subject, tutorId, tutorName });
}

export function updateBatchDailyTime(batchId: string, dailyTime: string): void {
  const batch = db.batches.find((b) => b.id === batchId);
  if (!batch) return;
  batch.dailyTime = dailyTime;
}
