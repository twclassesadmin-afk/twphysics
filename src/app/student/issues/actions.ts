"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addIssue } from "@/lib/store/issues";
import { getStudent } from "@/lib/store/students";
import { listBatchTutors } from "@/lib/store/batches";
import { notifyUsers, notifyAdmins } from "@/lib/store/notifications";

export async function raiseIssue(
  subject: string,
  description: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false, error: "Not authorized" };
  if (!subject.trim() || !description.trim()) return { ok: false, error: "Fill in all fields" };

  const issue = await addIssue({
    subject,
    description,
    raisedById: user.userId,
    raisedByName: user.fullName,
    raisedByRole: "student",
  });

  const student = await getStudent(user.userId);
  const tutorRecipients: string[] = [];
  if (student?.batchId) {
    for (const bt of await listBatchTutors(student.batchId)) tutorRecipients.push(bt.tutorId);
  }
  await notifyAdmins({
    title: "New issue raised",
    message: `${user.fullName}: ${subject}`,
    kind: "issue",
    relatedEntityId: issue.id,
  });
  if (tutorRecipients.length > 0) {
    await notifyUsers(tutorRecipients, {
      title: "New issue raised",
      message: `${user.fullName}: ${subject}`,
      kind: "issue",
      relatedEntityId: issue.id,
    });
  }

  revalidatePath("/student/issues");
  revalidatePath("/admin/issues");
  revalidatePath("/tutor/communication");
  return { ok: true };
}
