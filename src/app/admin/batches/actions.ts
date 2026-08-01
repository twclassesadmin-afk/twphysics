"use server";

import { revalidatePath } from "next/cache";
import {
  addCourse,
  addBatch,
  assignTutorToBatchSubject as assignTutorToBatchSubjectStore,
  getBatch,
  listBatchTutors,
  updateBatchDailyTime,
} from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";
import { getCurrentUser } from "@/lib/get-current-user";
import {
  addPricingTier,
  updatePricingTier as updatePricingTierStore,
  removePricingTier,
} from "@/lib/store/pricing";
import type { StudentCategory } from "@/lib/store/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCourse(input: {
  name: string;
  tagline: string;
  durationMonths: number;
  highlights: string[];
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required" };
  await addCourse({ ...input, highlights: input.highlights.filter((h) => h.trim()) });
  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}

export async function createBatch(input: {
  name: string;
  courseId: string;
  course: string;
  studentCategory: StudentCategory;
  capacity: number;
  dailyTime: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required" };
  await addBatch(input);
  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}

export async function editBatchTiming(batchId: string, dailyTime: string): Promise<ActionResult> {
  if (!dailyTime.trim()) return { ok: false, error: "Timing is required" };
  const batch = await getBatch(batchId);
  if (!batch) return { ok: false, error: "Batch not found" };

  await updateBatchDailyTime(batchId, dailyTime);

  const students = await listStudentsByBatch(batchId);
  const tutors = await listBatchTutors(batchId);
  const recipientIds = [...students.map((s) => s.id), ...new Set(tutors.map((bt) => bt.tutorId))];
  await notifyUsers(recipientIds, {
    title: "Batch timing changed",
    message: `${batch.name}'s daily timing is now ${dailyTime}.`,
    kind: "class",
  });

  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Changed batch timing", `${batch.name} → ${dailyTime}`);

  revalidatePath("/admin/batches");
  revalidatePath("/tutor/batches");
  revalidatePath("/student/classes");
  return { ok: true };
}

export async function assignTutorToBatchSubject(
  batchId: string,
  subject: string,
  tutorId: string,
  tutorName: string,
): Promise<ActionResult> {
  const batch = await getBatch(batchId);
  if (!batch) return { ok: false, error: "Batch not found" };
  if (!subject.trim()) return { ok: false, error: "Select a subject" };

  await assignTutorToBatchSubjectStore(batchId, subject, tutorId, tutorName);

  const students = await listStudentsByBatch(batchId);
  await notifyUsers(students.map((s) => s.id), {
    title: "Tutor assigned",
    message: `${tutorName} is now teaching ${subject} for ${batch.name}.`,
  });
  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Assigned tutor", `${tutorName} → ${subject} — ${batch.name}`);

  revalidatePath("/admin/batches");
  revalidatePath("/admin/tutors");
  revalidatePath("/student/course");
  revalidatePath("/tutor/batches");
  return { ok: true };
}

export async function createPricingTier(input: {
  batchSize: number;
  label: string;
  subjectsCount: number;
  daysPerSubjectPerMonth: number;
  monthlyFeeInr: number;
}): Promise<ActionResult> {
  if (!input.label.trim()) return { ok: false, error: "Label is required" };
  if (input.batchSize < 1) return { ok: false, error: "Batch size must be at least 1" };
  if (input.monthlyFeeInr <= 0) return { ok: false, error: "Monthly fee is required" };

  await addPricingTier(input);
  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Added pricing tier", `${input.label} — ₹${input.monthlyFeeInr}/mo`);

  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}

export async function editPricingTier(
  id: string,
  patch: {
    batchSize: number;
    label: string;
    subjectsCount: number;
    daysPerSubjectPerMonth: number;
    monthlyFeeInr: number;
  },
): Promise<ActionResult> {
  if (!patch.label.trim()) return { ok: false, error: "Label is required" };
  if (patch.batchSize < 1) return { ok: false, error: "Batch size must be at least 1" };
  if (patch.monthlyFeeInr <= 0) return { ok: false, error: "Monthly fee is required" };

  const updated = await updatePricingTierStore(id, patch);
  if (!updated) return { ok: false, error: "Pricing tier not found" };
  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Edited pricing tier", `${patch.label} — ₹${patch.monthlyFeeInr}/mo`);

  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePricingTier(id: string): Promise<ActionResult> {
  await removePricingTier(id);
  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Removed pricing tier", id);

  revalidatePath("/admin/batches");
  revalidatePath("/");
  return { ok: true };
}
