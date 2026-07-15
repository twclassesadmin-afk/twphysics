import { db, nextId } from "./db";
import type { Batch, Course } from "./types";

export function listCourses(): Course[] {
  return db.courses;
}

export function getCourse(id: string): Course | undefined {
  return db.courses.find((c) => c.id === id);
}

export function addCourse(input: {
  name: string;
  tagline: string;
  priceInInr: number;
  emiFromInr: number;
  durationMonths: number;
  highlights: string[];
}): Course {
  const course: Course = {
    id: nextId("c"),
    name: input.name,
    tagline: input.tagline,
    priceInInr: input.priceInInr,
    emiFromInr: input.emiFromInr,
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
  return db.batches.filter((b) => b.tutorId === tutorId);
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

export function addBatch(input: { name: string; courseId: string; course: string; capacity: number; dailyTime: string }): Batch {
  const batch: Batch = {
    id: nextId("b"),
    name: input.name,
    courseId: input.courseId,
    course: input.course,
    startDate: new Date().toISOString().slice(0, 10),
    dailyTime: input.dailyTime,
    capacity: input.capacity,
    tutorId: null,
    tutor: "Unassigned",
  };
  db.batches.push(batch);
  return batch;
}

export function firstOpenBatchForCourse(courseId: string): Batch | undefined {
  return db.batches.find((b) => b.courseId === courseId && getBatchFilledCount(b.id) < b.capacity);
}

export function assignTutorToBatch(batchId: string, tutorId: string, tutorName: string): void {
  const batch = db.batches.find((b) => b.id === batchId);
  if (!batch) return;
  batch.tutorId = tutorId;
  batch.tutor = tutorName;
}
