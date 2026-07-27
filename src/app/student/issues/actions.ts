"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addIssue } from "@/lib/store/issues";
import { getStudent } from "@/lib/store/students";
import { listBatchTutors } from "@/lib/store/batches";
import { notifyUsers } from "@/lib/store/notifications";

export async function raiseIssue(
  subject: string,
  description: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false, error: "Not authorized" };
  if (!subject.trim() || !description.trim()) return { ok: false, error: "Fill in all fields" };

  const issue = addIssue({
    subject,
    description,
    raisedById: user.userId,
    raisedByName: user.fullName,
    raisedByRole: "student",
  });

  const recipients = ["admin-1"];
  const student = getStudent(user.userId);
  if (student) {
    for (const bt of listBatchTutors(student.batchId)) recipients.push(bt.tutorId);
  }
  notifyUsers(recipients, {
    title: "New issue raised",
    message: `${user.fullName}: ${subject}`,
    kind: "issue",
    relatedEntityId: issue.id,
  });

  revalidatePath("/student/issues");
  revalidatePath("/admin/issues");
  revalidatePath("/tutor/communication");
  return { ok: true };
}
