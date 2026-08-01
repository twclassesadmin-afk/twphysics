import { createClient } from "@/lib/supabase/server";
import { isInvalidIdError } from "./db-errors";
import type { Batch, BatchTutorAssignment, Course, StudentCategory } from "./types";

function mapCourse(row: {
  id: string;
  name: string;
  tagline: string;
  duration_months: number;
  highlights: string[];
}): Course {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    durationMonths: row.duration_months,
    highlights: row.highlights,
  };
}

export async function listCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("*").order("name");
  if (error) throw error;
  return data.map(mapCourse);
}

export async function getCourse(id: string): Promise<Course | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  return data ? mapCourse(data) : undefined;
}

export async function addCourse(input: {
  name: string;
  tagline: string;
  durationMonths: number;
  highlights: string[];
}): Promise<Course> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({ name: input.name, tagline: input.tagline, duration_months: input.durationMonths, highlights: input.highlights })
    .select()
    .single();
  if (error) throw error;
  return mapCourse(data);
}

export async function removeCourse(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

async function mapBatch(
  row: {
    id: string;
    name: string;
    course_id: string;
    student_category: StudentCategory;
    start_date: string;
    daily_time: string;
    capacity: number;
  },
  courseNamesById: Map<string, string>,
): Promise<Batch> {
  return {
    id: row.id,
    name: row.name,
    courseId: row.course_id,
    course: courseNamesById.get(row.course_id) ?? "",
    studentCategory: row.student_category,
    startDate: row.start_date,
    dailyTime: row.daily_time,
    capacity: row.capacity,
  };
}

async function courseNameLookup(supabase: Awaited<ReturnType<typeof createClient>>): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("courses").select("id, name");
  if (error) throw error;
  return new Map(data.map((c) => [c.id, c.name]));
}

export async function listBatches(): Promise<Batch[]> {
  const supabase = await createClient();
  const [{ data, error }, courseNames] = await Promise.all([
    supabase.from("batches").select("*").order("name"),
    courseNameLookup(supabase),
  ]);
  if (error) throw error;
  return Promise.all(data.map((row) => mapBatch(row, courseNames)));
}

export async function getBatch(id: string): Promise<Batch | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("batches").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  if (!data) return undefined;
  const courseNames = await courseNameLookup(supabase);
  return mapBatch(data, courseNames);
}

export async function listBatchesByTutor(tutorId: string): Promise<Batch[]> {
  const supabase = await createClient();
  const { data: assignments, error: assignmentsError } = await supabase
    .from("batch_tutors")
    .select("batch_id")
    .eq("tutor_id", tutorId);
  if (assignmentsError) throw assignmentsError;
  const batchIds = [...new Set(assignments.map((a) => a.batch_id))];
  if (batchIds.length === 0) return [];

  const [{ data, error }, courseNames] = await Promise.all([
    supabase.from("batches").select("*").in("id", batchIds).order("name"),
    courseNameLookup(supabase),
  ]);
  if (error) throw error;
  return Promise.all(data.map((row) => mapBatch(row, courseNames)));
}

async function tutorNameLookup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tutorIds: string[],
): Promise<Map<string, string>> {
  if (tutorIds.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", tutorIds);
  if (error) throw error;
  return new Map(data.map((p) => [p.id, p.full_name ?? ""]));
}

export async function listBatchTutors(batchId: string): Promise<BatchTutorAssignment[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("batch_tutors").select("*").eq("batch_id", batchId);
  if (error) throw error;
  const tutorNames = await tutorNameLookup(supabase, data.map((bt) => bt.tutor_id));
  return data.map((bt) => ({
    id: bt.id,
    batchId: bt.batch_id,
    subject: bt.subject,
    tutorId: bt.tutor_id,
    tutorName: tutorNames.get(bt.tutor_id) ?? "",
  }));
}

// The subjects a specific tutor is assigned to teach within one batch —
// scopes what they're allowed to schedule a class for in that batch.
export async function subjectsForTutorInBatch(tutorId: string, batchId: string): Promise<string[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batch_tutors")
    .select("subject")
    .eq("batch_id", batchId)
    .eq("tutor_id", tutorId);
  if (error) throw error;
  return data.map((row) => row.subject);
}

export async function batchTutorSummary(batchId: string): Promise<string> {
  const assignments = await listBatchTutors(batchId);
  if (assignments.length === 0) return "Unassigned";
  return assignments.map((bt) => `${bt.subject} — ${bt.tutorName}`).join(", ");
}

export async function listBatchesByCourse(courseId: string): Promise<Batch[]> {
  const supabase = await createClient();
  const [{ data, error }, courseNames] = await Promise.all([
    supabase.from("batches").select("*").eq("course_id", courseId).order("name"),
    courseNameLookup(supabase),
  ]);
  if (error) throw error;
  return Promise.all(data.map((row) => mapBatch(row, courseNames)));
}

// Always derived from real enrollment — never stored — so it can't drift out
// of sync with the actual student roster.
export async function getBatchFilledCount(batchId: string): Promise<number> {
  if (!batchId) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("batch_id", batchId);
  if (error) throw error;
  return count ?? 0;
}

export async function getCourseSeatsLeft(courseId: string): Promise<number> {
  const batches = await listBatchesByCourse(courseId);
  const counts = await Promise.all(batches.map((b) => getBatchFilledCount(b.id)));
  return batches.reduce((sum, batch, i) => sum + Math.max(0, batch.capacity - counts[i]), 0);
}

export async function addBatch(input: {
  name: string;
  courseId: string;
  course: string;
  studentCategory: StudentCategory;
  capacity: number;
  dailyTime: string;
}): Promise<Batch> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batches")
    .insert({
      name: input.name,
      course_id: input.courseId,
      student_category: input.studentCategory,
      daily_time: input.dailyTime,
      capacity: input.capacity,
    })
    .select()
    .single();
  if (error) throw error;
  return mapBatch(data, new Map([[input.courseId, input.course]]));
}

export async function firstOpenBatchForCourse(courseId: string): Promise<Batch | undefined> {
  const batches = await listBatchesByCourse(courseId);
  for (const batch of batches) {
    if ((await getBatchFilledCount(batch.id)) < batch.capacity) return batch;
  }
  return undefined;
}

// Registration matches on both course and student category (college-going vs
// long-term) since the two categories run on different daily timings.
export async function firstOpenBatchForCourseAndCategory(
  courseId: string,
  studentCategory: StudentCategory,
): Promise<Batch | undefined> {
  const batches = (await listBatchesByCourse(courseId)).filter((b) => b.studentCategory === studentCategory);
  for (const batch of batches) {
    if ((await getBatchFilledCount(batch.id)) < batch.capacity) return batch;
  }
  return undefined;
}

// Upserts the (batch, subject) assignment — a subject that's already taught
// by someone else in this batch gets reassigned rather than duplicated.
export async function assignTutorToBatchSubject(
  batchId: string,
  subject: string,
  tutorId: string,
  _tutorName: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("batch_tutors")
    .upsert({ batch_id: batchId, subject, tutor_id: tutorId }, { onConflict: "batch_id,subject" });
  if (error) throw error;
}

export async function updateBatchDailyTime(batchId: string, dailyTime: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("batches").update({ daily_time: dailyTime }).eq("id", batchId);
  if (error) throw error;
}
