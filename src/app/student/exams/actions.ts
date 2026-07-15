"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { startAttempt, submitAttempt } from "@/lib/store/exams";
import type { ExamAnswer } from "@/lib/store/types";

export async function startExamAttempt(examId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false as const, error: "Not authorized" };
  const result = startAttempt(examId, user.userId);
  if (!result.ok) {
    return { ok: false as const, error: result.error === "not_started" ? "This exam hasn't started yet" : "This exam has ended" };
  }
  return { ok: true as const };
}

export async function submitExamAttempt(examId: string, answers: ExamAnswer[], autoSubmitted = false) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false as const, error: "Not authorized" };

  const result = submitAttempt(examId, user.userId, answers, autoSubmitted);
  if (!result.ok) {
    const messages = {
      not_started: "This exam hasn't started yet",
      no_attempt: "No attempt found",
      already_submitted: "You've already submitted this exam",
    } as const;
    return { ok: false as const, error: messages[result.error] };
  }

  revalidatePath("/student/exams");
  revalidatePath(`/admin/exams/${examId}`);
  return { ok: true as const };
}
