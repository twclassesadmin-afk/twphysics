import { createClient } from "@/lib/supabase/server";
import { isInvalidIdError } from "./db-errors";
import type {
  AttendanceEntry,
  LearningMode,
  LearningType,
  Stream,
  Student,
  StudentCategory,
  StudentFlag,
  StudentTag,
} from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function nameLookup(supabase: SupabaseClient, table: "batches" | "courses", ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from(table).select("id, name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((row) => [row.id, row.name]));
}

async function profileNameEmailLookup(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, { name: string; email: string }>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((row) => [row.id, { name: row.full_name ?? "", email: row.email ?? "" }]));
}

async function flagsByStudent(supabase: SupabaseClient, studentIds: string[]): Promise<Map<string, StudentFlag[]>> {
  if (studentIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("student_flags")
    .select("*")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const authorIds = data.map((f) => f.author_id);
  const authors = await profileNameEmailLookup(supabase, authorIds);
  const map = new Map<string, StudentFlag[]>();
  for (const row of data) {
    const flag: StudentFlag = {
      id: row.id,
      type: row.type,
      note: row.note,
      authorId: row.author_id,
      authorName: authors.get(row.author_id)?.name ?? "",
      authorRole: row.author_role,
      createdAt: row.created_at,
    };
    const list = map.get(row.student_id) ?? [];
    list.push(flag);
    map.set(row.student_id, list);
  }
  return map;
}

async function attendanceByStudent(supabase: SupabaseClient, studentIds: string[]): Promise<Map<string, AttendanceEntry[]>> {
  if (studentIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("attendance_entries")
    .select("*")
    .in("student_id", studentIds)
    .order("date", { ascending: false });
  if (error) throw error;
  const map = new Map<string, AttendanceEntry[]>();
  for (const row of data) {
    const entry: AttendanceEntry = {
      id: row.id,
      classId: row.class_id,
      date: row.date,
      subject: row.subject,
      attended: row.attended,
    };
    const list = map.get(row.student_id) ?? [];
    list.push(entry);
    map.set(row.student_id, list);
  }
  return map;
}

async function hydrateStudents(supabase: SupabaseClient, rows: Record<string, unknown>[]): Promise<Student[]> {
  const ids = rows.map((r) => r.id as string);
  const [profiles, batchNames, courseNames, flags, attendanceLogs] = await Promise.all([
    profileNameEmailLookup(supabase, ids),
    nameLookup(supabase, "batches", rows.map((r) => r.batch_id as string)),
    nameLookup(supabase, "courses", rows.map((r) => r.course_id as string)),
    flagsByStudent(supabase, ids),
    attendanceByStudent(supabase, ids),
  ]);

  return rows.map((row) => {
    const r = row as {
      id: string;
      phone: string;
      age: number | null;
      parent_name: string;
      parent_phone: string;
      address: string;
      course_id: string | null;
      batch_id: string | null;
      student_category: StudentCategory | null;
      stream: Stream | null;
      target_exams: string[];
      learning_mode: LearningMode | null;
      learning_type: LearningType | null;
      status: "active" | "expiring_soon";
      attendance_pct: number;
      fee_paid?: boolean;
      tag: StudentTag;
      tag_note: string;
    };
    const profile = profiles.get(r.id);
    return {
      id: r.id,
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: r.phone,
      age: r.age,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      address: r.address,
      courseId: r.course_id ?? "",
      courseName: r.course_id ? courseNames.get(r.course_id) ?? "" : "",
      batchId: r.batch_id ?? "",
      batchName: r.batch_id ? batchNames.get(r.batch_id) ?? "Awaiting batch assignment" : "Awaiting batch assignment",
      studentCategory: r.student_category,
      stream: r.stream,
      targetExams: r.target_exams ?? [],
      learningMode: r.learning_mode,
      learningType: r.learning_type,
      status: r.status,
      attendancePct: r.attendance_pct,
      feePaid: r.fee_paid ?? false,
      tag: r.tag,
      tagNote: r.tag_note,
      attendanceLog: attendanceLogs.get(r.id) ?? [],
      flags: flags.get(r.id) ?? [],
    };
  });
}

export async function listStudents(): Promise<Student[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("students").select("*");
  if (error) throw error;
  return hydrateStudents(supabase, data);
}

export async function getStudent(id: string): Promise<Student | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  if (!data) return undefined;
  const [student] = await hydrateStudents(supabase, [data]);
  return student;
}

export async function listStudentsByBatch(batchId: string): Promise<Student[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("students").select("*").eq("batch_id", batchId);
  if (error) throw error;
  return hydrateStudents(supabase, data);
}

// A student's `students` row is the extension of a real Supabase Auth
// account — the caller creates the auth user first (self-signup or admin
// manual-add), then calls this with that user's id.
export async function addStudent(input: {
  id: string;
  courseId: string;
  batchId: string;
  phone?: string;
  age?: number | null;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  studentCategory?: StudentCategory | null;
  stream?: Stream | null;
  targetExams?: string[];
  learningMode?: LearningMode | null;
  learningType?: LearningType | null;
}): Promise<Student> {
  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({
    id: input.id,
    phone: input.phone ?? "",
    age: input.age ?? null,
    parent_name: input.parentName ?? "",
    parent_phone: input.parentPhone ?? "",
    address: input.address ?? "",
    course_id: input.courseId || null,
    batch_id: input.batchId || null,
    student_category: input.studentCategory ?? null,
    stream: input.stream ?? null,
    target_exams: input.targetExams ?? [],
    learning_mode: input.learningMode ?? null,
    learning_type: input.learningType ?? null,
  });
  if (error) throw error;
  const student = await getStudent(input.id);
  if (!student) throw new Error("Failed to load student after insert");
  return student;
}

export async function assignStudentToBatch(
  studentId: string,
  batchId: string,
  _batchName: string,
  courseId: string,
  _courseName: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ batch_id: batchId, course_id: courseId })
    .eq("id", studentId);
  if (error) throw error;
}

export async function updateStudentContact(studentId: string, patch: { phone?: string; address?: string }): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, string> = {};
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.address !== undefined) update.address = patch.address;
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from("students").update(update).eq("id", studentId);
  if (error) throw error;
}

export async function setStudentFeePaid(studentId: string, feePaid: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ fee_paid: feePaid }).eq("id", studentId);
  if (error) throw error;
}

export async function setStudentTag(studentId: string, tag: StudentTag, note: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ tag, tag_note: note }).eq("id", studentId);
  if (error) throw error;
}

export async function addStudentFlag(
  studentId: string,
  flag: { type: StudentFlag["type"]; note: string; authorId: string; authorName: string; authorRole: StudentFlag["authorRole"] },
): Promise<void> {
  const supabase = await createClient();
  const { error: flagError } = await supabase.from("student_flags").insert({
    student_id: studentId,
    type: flag.type,
    note: flag.note,
    author_id: flag.authorId,
    author_role: flag.authorRole,
  });
  if (flagError) throw flagError;
  const { error: tagError } = await supabase
    .from("students")
    .update({ tag: flag.type, tag_note: flag.note })
    .eq("id", studentId);
  if (tagError) throw tagError;
}

async function recalcAttendancePct(supabase: SupabaseClient, studentId: string): Promise<void> {
  const { data: rows, error: fetchError } = await supabase
    .from("attendance_entries")
    .select("attended")
    .eq("student_id", studentId);
  if (fetchError) throw fetchError;
  const total = rows.length;
  const attended = rows.filter((r) => r.attended).length;
  const attendancePct = total === 0 ? 0 : Math.round((attended / total) * 100);
  const { error: updateError } = await supabase
    .from("students")
    .update({ attendance_pct: attendancePct })
    .eq("id", studentId);
  if (updateError) throw updateError;
}

export async function recordAttendance(
  studentId: string,
  entry: { classId: string | null; date: string; subject: string; attended: boolean },
): Promise<void> {
  const supabase = await createClient();
  const { error: insertError } = await supabase.from("attendance_entries").insert({
    student_id: studentId,
    class_id: entry.classId,
    date: entry.date,
    subject: entry.subject,
    attended: entry.attended,
  });
  if (insertError) {
    // Already has a row for this exact class (re-clicked Join, or a tutor
    // already marked it) — a no-op, not an error.
    if (insertError.code === "23505") return;
    throw insertError;
  }
  await recalcAttendancePct(supabase, studentId);
}

// Tutor's authoritative daily roll call — no pre-scheduled class needed.
// Upserts one row per student keyed on (student_id, date, subject), so it
// reconciles with (and can override) a student's own self-mark from
// clicking "Join" on an actual scheduled class for that same day/subject,
// instead of risking a second, double-counted row.
export async function getAttendanceForBatchSubjectDate(
  batchId: string,
  subject: string,
  date: string,
): Promise<Map<string, boolean>> {
  const supabase = await createClient();
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("batch_id", batchId);
  if (studentsError) throw studentsError;
  const studentIds = students.map((s) => s.id);
  if (studentIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("attendance_entries")
    .select("student_id, attended")
    .in("student_id", studentIds)
    .eq("date", date)
    .eq("subject", subject);
  if (error) throw error;
  return new Map(data.map((row) => [row.student_id, row.attended]));
}

export async function listRecentAttendanceForStudents(
  studentIds: string[],
  sinceDate: string,
): Promise<{ studentId: string; date: string; subject: string; attended: boolean }[]> {
  if (studentIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance_entries")
    .select("student_id, date, subject, attended")
    .in("student_id", studentIds)
    .gte("date", sinceDate);
  if (error) throw error;
  return data.map((row) => ({
    studentId: row.student_id,
    date: row.date,
    subject: row.subject,
    attended: row.attended,
  }));
}

export async function recordAttendanceForBatchSubjectDate(
  batchId: string,
  subject: string,
  date: string,
  entries: { studentId: string; attended: boolean }[],
): Promise<void> {
  if (entries.length === 0) return;
  const supabase = await createClient();

  // Best-effort link to a real scheduled class for this batch/subject/day,
  // purely informational (class_id isn't part of the uniqueness key) — lets
  // the attendance log point back to a specific session when one exists.
  const studentIds = entries.map((e) => e.studentId);
  const { data: aClass } = await supabase
    .from("classes")
    .select("id, scheduled_at")
    .eq("batch_id", batchId)
    .eq("subject", subject)
    .gte("scheduled_at", `${date}T00:00:00`)
    .lt("scheduled_at", `${date}T23:59:59.999`)
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("attendance_entries").upsert(
    entries.map((e) => ({
      student_id: e.studentId,
      class_id: aClass?.id ?? null,
      date,
      subject,
      attended: e.attended,
    })),
    { onConflict: "student_id,date,subject" },
  );
  if (error) throw error;
  for (const studentId of studentIds) {
    await recalcAttendancePct(supabase, studentId);
  }
}
