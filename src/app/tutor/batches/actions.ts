"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { scheduleClass as scheduleClassStore } from "@/lib/store/classes";
import { getBatch } from "@/lib/store/batches";
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
