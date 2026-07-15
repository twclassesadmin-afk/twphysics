"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addBroadcast } from "@/lib/store/broadcasts";
import { addIssueComment, updateIssueStatus, getIssue } from "@/lib/store/issues";
import { getBatch } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { notifyUsers } from "@/lib/store/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function sendBroadcast(batchId: string, message: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  if (!message.trim()) return { ok: false, error: "Message is required" };
  const batch = getBatch(batchId);
  if (!batch) return { ok: false, error: "Batch not found" };

  addBroadcast({
    batchId: batch.id,
    batchName: batch.name,
    tutorId: user.userId,
    tutorName: user.fullName,
    message,
  });
  notifyUsers(
    listStudentsByBatch(batch.id).map((s) => s.id),
    { title: `Announcement — ${batch.name}`, message },
  );

  revalidatePath("/tutor/communication");
  revalidatePath("/student");
  return { ok: true };
}

export async function replyToIssue(issueId: string, reply: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  if (!reply.trim()) return { ok: false, error: "Reply is required" };
  const issue = getIssue(issueId);
  if (!issue) return { ok: false, error: "Issue not found" };

  addIssueComment(issueId, user.fullName, reply);
  updateIssueStatus(issueId, "resolved");
  notifyUsers([issue.raisedById], {
    title: "Your issue was answered",
    message: `${user.fullName} replied to "${issue.subject}".`,
    kind: "issue",
    relatedEntityId: issue.id,
  });

  revalidatePath("/tutor/communication");
  revalidatePath("/student/issues");
  revalidatePath("/admin/issues");
  return { ok: true };
}
