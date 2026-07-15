"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createExamSchema } from "@/lib/validations/exam";
import { getCurrentUser } from "@/lib/get-current-user";
import {
  createExam as createExamStore,
  publishResults,
  deleteExamResults as deleteExamResultsStore,
  listAttemptsForExam,
  getExam,
} from "@/lib/store/exams";
import { getBatch } from "@/lib/store/batches";
import { listStudentsByBatch, recordExamResult } from "@/lib/store/students";
import { getAccountByLinkedId } from "@/lib/store/accounts";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export type ActionResult = { ok: true; examId: string } | { ok: false; error: string };

function batchRecipientIds(batchId: string): string[] {
  const students = listStudentsByBatch(batchId)
    .filter((s) => getAccountByLinkedId(s.id))
    .map((s) => s.id);
  const batch = getBatch(batchId);
  const tutorId = batch?.tutorId && getAccountByLinkedId(batch.tutorId) ? [batch.tutorId] : [];
  return [...students, ...tutorId];
}

export async function createExam(input: unknown): Promise<ActionResult> {
  const parsed = createExamSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false, error: "Not authorized" };

  const batch = getBatch(parsed.data.batchId);
  if (!batch) return { ok: false, error: "Batch not found" };

  const exam = createExamStore({
    title: parsed.data.title,
    subject: parsed.data.subject,
    batchId: batch.id,
    batchName: batch.name,
    scheduledAt: parsed.data.scheduledAt,
    durationMinutes: parsed.data.durationMinutes,
    createdBy: user.fullName,
    questions: parsed.data.questions,
  });

  notifyUsers(batchRecipientIds(batch.id), {
    title: "New exam scheduled",
    message: `${exam.title} starts ${new Date(exam.scheduledAt).toLocaleString("en-IN")}.`,
    kind: "exam_scheduled",
    relatedEntityId: exam.id,
  });
  logActivity(user.fullName, "Created exam", `${exam.title} — ${batch.name}`);

  revalidatePath("/admin/exams");
  revalidatePath("/tutor/exams");
  revalidatePath("/student/exams");
  redirect(`/admin/exams/${exam.id}`);
}

export async function publishExamResults(examId: string, batchId: string, title: string): Promise<ActionResult> {
  publishResults(examId);

  const exam = getExam(examId);
  if (exam) {
    for (const attempt of listAttemptsForExam(examId)) {
      if (attempt.submittedAt && attempt.score !== null) {
        recordExamResult(attempt.studentId, exam.title, attempt.score, exam.totalMarks);
      }
    }
  }

  notifyUsers(batchRecipientIds(batchId), {
    title: "Results published",
    message: `${title} results are now available.`,
    kind: "exam_published",
    relatedEntityId: examId,
  });
  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/tutor/exams");
  revalidatePath("/student/exams");
  return { ok: true, examId };
}

export async function deleteExamResults(examId: string): Promise<ActionResult> {
  deleteExamResultsStore(examId);
  revalidatePath(`/admin/exams/${examId}`);
  return { ok: true, examId };
}
