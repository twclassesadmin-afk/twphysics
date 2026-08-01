"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { scheduleClass as scheduleClassStore, rescheduleClass as rescheduleClassStore, getClass } from "@/lib/store/classes";
import { getBatch, subjectsForTutorInBatch } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { notifyUsers, notifyAdmins } from "@/lib/store/notifications";
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
  const batch = await getBatch(input.batchId);
  if (!batch) return { ok: false, error: "Batch not found" };
  const mySubjects = await subjectsForTutorInBatch(user.userId, batch.id);
  if (!mySubjects.includes(input.subject)) {
    return { ok: false, error: "You're not assigned to teach that subject in this batch" };
  }

  await scheduleClassStore({
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

  const students = await listStudentsByBatch(batch.id);
  await notifyUsers(students.map((s) => s.id), {
    title: "Class scheduled",
    message: `${input.subject} — ${input.topic} starts ${new Date(input.scheduledAt).toLocaleString("en-IN")}.`,
    kind: "class",
  });
  await logActivity(user.fullName, "Scheduled a class", `${input.subject} — ${batch.name}`);

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

  const existing = await getClass(input.classId);
  if (!existing) return { ok: false, error: "Class not found" };
  if (existing.tutorId !== user.userId) return { ok: false, error: "Not authorized" };

  const updated = await rescheduleClassStore(input.classId, {
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    joinUrl: input.joinUrl,
  });
  if (!updated) return { ok: false, error: "Class not found" };

  const students = await listStudentsByBatch(existing.batchId);
  await notifyUsers(students.map((s) => s.id), {
    title: "Class rescheduled",
    message: `${existing.subject} — ${existing.topic} moved to ${new Date(input.scheduledAt).toLocaleString("en-IN")}.`,
    kind: "class",
  });
  await notifyAdmins({
    title: "Class rescheduled",
    message: `${existing.subject} — ${existing.topic} moved to ${new Date(input.scheduledAt).toLocaleString("en-IN")}.`,
    kind: "class",
  });
  await logActivity(user.fullName, "Rescheduled a class", `${existing.subject} — ${existing.batchName}`);

  revalidatePath("/tutor/batches");
  revalidatePath("/student/classes");
  revalidatePath("/admin/batches");
  return { ok: true };
}
