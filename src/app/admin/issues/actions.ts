"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addIssueComment, updateIssueStatus, getIssue } from "@/lib/store/issues";
import { notifyUsers } from "@/lib/store/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function assignIssueToMe(issueId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false, error: "Not authorized" };
  await updateIssueStatus(issueId, "in_progress", user.fullName);
  revalidatePath("/admin/issues");
  return { ok: true };
}

export async function resolveIssue(issueId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false, error: "Not authorized" };
  const issue = await getIssue(issueId);
  if (!issue) return { ok: false, error: "Issue not found" };
  await updateIssueStatus(issueId, "resolved");
  await notifyUsers([issue.raisedById], {
    title: "Issue resolved",
    message: `"${issue.subject}" has been marked resolved.`,
    kind: "issue",
    relatedEntityId: issue.id,
  });
  revalidatePath("/admin/issues");
  revalidatePath("/student/issues");
  revalidatePath("/tutor/communication");
  return { ok: true };
}

export async function commentOnIssue(issueId: string, message: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false, error: "Not authorized" };
  if (!message.trim()) return { ok: false, error: "Comment is required" };
  const issue = await getIssue(issueId);
  if (!issue) return { ok: false, error: "Issue not found" };
  await addIssueComment(issueId, user.userId, message);
  await notifyUsers([issue.raisedById], {
    title: "New reply on your issue",
    message: `${user.fullName} commented on "${issue.subject}".`,
    kind: "issue",
    relatedEntityId: issue.id,
  });
  revalidatePath("/admin/issues");
  revalidatePath("/student/issues");
  return { ok: true };
}
