"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { advanceSyllabusStatus } from "@/lib/store/syllabus";
import { logActivity } from "@/lib/store/activity";

export async function advanceTopic(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  const item = await advanceSyllabusStatus(id);
  if (!item) return { ok: false, error: "Topic not found" };
  if (item.status === "completed") {
    await logActivity(user.fullName, "Marked syllabus topic complete", `${item.topic} — ${item.batchName}`);
  }
  revalidatePath("/tutor/syllabus");
  revalidatePath("/admin/syllabus");
  revalidatePath("/student/progress");
  return { ok: true };
}
