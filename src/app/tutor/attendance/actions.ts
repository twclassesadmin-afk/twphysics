"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { subjectsForTutorInBatch } from "@/lib/store/batches";
import { recordAttendanceForBatchSubjectDate } from "@/lib/store/students";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveAttendance(
  batchId: string,
  subject: string,
  date: string,
  entries: { studentId: string; attended: boolean }[],
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  if (!date) return { ok: false, error: "Pick a date" };
  if (date > new Date().toISOString().slice(0, 10)) return { ok: false, error: "Can't mark attendance for a future date" };

  const mySubjects = await subjectsForTutorInBatch(user.userId, batchId);
  if (!mySubjects.includes(subject)) {
    return { ok: false, error: "You're not assigned to teach that subject in this batch" };
  }

  await recordAttendanceForBatchSubjectDate(batchId, subject, date, entries);

  revalidatePath("/tutor/attendance");
  revalidatePath("/tutor/students");
  revalidatePath("/student/progress");
  revalidatePath("/admin/users");
  return { ok: true };
}
