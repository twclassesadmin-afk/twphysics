"use server";

import { revalidatePath } from "next/cache";
import { addCourse, addBatch, assignTutorToBatch as assignTutorToBatchStore, getBatch } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { getAccountByLinkedId } from "@/lib/store/accounts";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";
import { getCurrentUser } from "@/lib/get-current-user";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCourse(input: {
  name: string;
  tagline: string;
  priceInInr: number;
  emiFromInr: number;
  durationMonths: number;
  highlights: string[];
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required" };
  addCourse({ ...input, highlights: input.highlights.filter((h) => h.trim()) });
  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}

export async function createBatch(input: {
  name: string;
  courseId: string;
  course: string;
  capacity: number;
  dailyTime: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required" };
  addBatch(input);
  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}

export async function assignTutorToBatch(batchId: string, tutorId: string, tutorName: string): Promise<ActionResult> {
  const batch = getBatch(batchId);
  if (!batch) return { ok: false, error: "Batch not found" };

  assignTutorToBatchStore(batchId, tutorId, tutorName);

  const studentIdsWithAccounts = listStudentsByBatch(batchId)
    .filter((s) => getAccountByLinkedId(s.id))
    .map((s) => s.id);
  notifyUsers(studentIdsWithAccounts, {
    title: "Tutor reassigned",
    message: `Your batch's tutor has been changed to ${tutorName}.`,
  });
  const user = await getCurrentUser();
  logActivity(user?.fullName ?? "Admin", "Assigned tutor", `${tutorName} → ${batch.name}`);

  revalidatePath("/admin/batches");
  revalidatePath("/admin/tutors");
  return { ok: true };
}
