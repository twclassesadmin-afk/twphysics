"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addSyllabusItem } from "@/lib/store/syllabus";
import { getBatch, listBatchTutors } from "@/lib/store/batches";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export async function createSyllabusTopic(input: {
  batchId: string;
  topic: string;
  subject: string;
  deadline: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false, error: "Not authorized" };
  if (!input.topic.trim() || !input.subject.trim() || !input.deadline) {
    return { ok: false, error: "Fill in all fields" };
  }
  const batch = await getBatch(input.batchId);
  if (!batch) return { ok: false, error: "Select a batch" };

  await addSyllabusItem({
    batchId: batch.id,
    batchName: batch.name,
    topic: input.topic,
    subject: input.subject,
    deadline: input.deadline,
  });
  const batchTutors = await listBatchTutors(batch.id);
  const subjectTutorIds = batchTutors.filter((bt) => bt.subject === input.subject).map((bt) => bt.tutorId);
  if (subjectTutorIds.length > 0) {
    await notifyUsers(subjectTutorIds, {
      title: "Syllabus updated",
      message: `New topic "${input.topic}" added to ${batch.name} (due ${input.deadline}).`,
      kind: "syllabus",
    });
  }
  await logActivity(user.fullName, "Added syllabus topic", `${input.topic} — ${batch.name}`);

  revalidatePath("/admin/syllabus");
  revalidatePath("/tutor/syllabus");
  revalidatePath("/student/progress");
  return { ok: true };
}
