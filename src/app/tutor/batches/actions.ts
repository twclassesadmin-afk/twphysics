"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { scheduleClass as scheduleClassStore, rescheduleClass as rescheduleClassStore, getClass } from "@/lib/store/classes";
import { getBatch, subjectsForTutorInBatch } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { getAccountByLinkedId } from "@/lib/store/accounts";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function scheduleClass(input: {
  batchId: string;
  subject: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl: string;
}): Promise<ActionResult> {
  if (!input.subject.trim() || !input.topic.trim() || !input.scheduledAt || !input.joinUrl.trim()) {
    return { ok: false, error: "Fill in all fields" };
  }
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  const batch = getBatch(input.batchId);
  if (!batch) return { ok: false, error: "Batch not found" };
  if (!subjectsForTutorInBatch(user.userId, batch.id).includes(input.subject)) {
    return { ok: false, error: "You're not assigned to teach that subject in this batch" };
  }

  scheduleClassStore({
    batchId: batch.id,
    batchName: batch.name,
    subject: input.subject,
    topic: input.topic,
    tutorId: user.userId,
    tutorName: user.fullName,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    joinUrl: input.joinUrl,
  });

  const studentIds = listStudentsByBatch(batch.id)
    .filter((s) => getAccountByLinkedId(s.id))
    .map((s) => s.id);
  notifyUsers(studentIds, {
    title: "Class scheduled",
    message: `${input.subject} — ${input.topic} starts ${new Date(input.scheduledAt).toLocaleString("en-IN")}.`,
    kind: "class",
  });
  logActivity(user.fullName, "Scheduled a class", `${input.subject} — ${batch.name}`);

  revalidatePath("/tutor/batches");
  revalidatePath("/student/classes");
  return { ok: true };
}

export async function rescheduleClass(input: {
  classId: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl: string;
}): Promise<ActionResult> {
  if (!input.scheduledAt || !input.joinUrl.trim()) {
    return { ok: false, error: "Fill in all fields" };
  }
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };

  const existing = getClass(input.classId);
  if (!existing) return { ok: false, error: "Class not found" };
  if (existing.tutorId !== user.userId) return { ok: false, error: "Not authorized" };

  const updated = rescheduleClassStore(input.classId, {
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    joinUrl: input.joinUrl,
  });
  if (!updated) return { ok: false, error: "Class not found" };

  const recipientIds = listStudentsByBatch(existing.batchId)
    .filter((s) => getAccountByLinkedId(s.id))
    .map((s) => s.id);
  recipientIds.push("admin-1");
  notifyUsers(recipientIds, {
    title: "Class rescheduled",
    message: `${existing.subject} — ${existing.topic} moved to ${new Date(input.scheduledAt).toLocaleString("en-IN")}.`,
    kind: "class",
  });
  logActivity(user.fullName, "Rescheduled a class", `${existing.subject} — ${existing.batchName}`);

  revalidatePath("/tutor/batches");
  revalidatePath("/student/classes");
  revalidatePath("/admin/batches");
  return { ok: true };
}
