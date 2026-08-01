"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { createAuthUser, setUserPassword, getAuthUserByEmail } from "@/lib/supabase/admin";
import { getTutorApplication, reviewTutorApplication, createTutorFromApplication } from "@/lib/store/tutors";
import { addStudent, assignStudentToBatch, getStudent } from "@/lib/store/students";
import { getBatch } from "@/lib/store/batches";
import { logActivity } from "@/lib/store/activity";
import { notifyUsers } from "@/lib/store/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function approveTutorApplication(applicationId: string, initialPassword: string): Promise<ActionResult> {
  if (initialPassword.trim().length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  const application = await getTutorApplication(applicationId);
  if (!application) return { ok: false, error: "Application not found" };
  if (application.status !== "pending") return { ok: false, error: "Application already reviewed" };

  const created = await createAuthUser({
    email: application.email,
    password: initialPassword,
    fullName: application.fullName,
    role: "tutor",
  });
  if ("error" in created) return { ok: false, error: created.error };

  await createTutorFromApplication(created.id, application);
  const user = await getCurrentUser();
  await reviewTutorApplication(applicationId, "approved", user?.userId ?? null);
  await logActivity(user?.fullName ?? "Admin", "Approved tutor application", application.fullName);

  revalidatePath("/admin/users");
  revalidatePath("/admin/tutors");
  return { ok: true };
}

export async function rejectTutorApplication(applicationId: string): Promise<ActionResult> {
  const application = await getTutorApplication(applicationId);
  if (!application) return { ok: false, error: "Application not found" };
  const user = await getCurrentUser();
  await reviewTutorApplication(applicationId, "rejected", user?.userId ?? null);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function addStudentAction(input: {
  name: string;
  email: string;
  phone: string;
  age: number;
  parentName: string;
  parentPhone: string;
  address: string;
  batchId: string;
  password: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required" };
  if (!input.email.trim()) return { ok: false, error: "Email is required" };
  if (input.password.trim().length < 6) return { ok: false, error: "Password must be at least 6 characters" };
  const existing = await getAuthUserByEmail(input.email);
  if (existing) return { ok: false, error: "An account with this email already exists" };
  const batch = await getBatch(input.batchId);
  if (!batch) return { ok: false, error: "Select a batch" };

  const created = await createAuthUser({
    email: input.email.trim(),
    password: input.password,
    fullName: input.name.trim(),
    role: "student",
  });
  if ("error" in created) return { ok: false, error: created.error };

  const student = await addStudent({
    id: created.id,
    phone: input.phone,
    age: input.age || null,
    parentName: input.parentName,
    parentPhone: input.parentPhone,
    address: input.address,
    courseId: batch.courseId,
    batchId: batch.id,
  });
  await notifyUsers([student.id], {
    title: "Welcome to TWPHYSICS!",
    message: `You're enrolled in ${batch.course} — ${batch.name} (${batch.dailyTime}).`,
  });

  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Added student manually", `${student.name} — ${batch.name}`);

  revalidatePath("/admin/users");
  revalidatePath("/admin/batches");
  return { ok: true };
}

export async function assignStudentBatch(studentId: string, batchId: string): Promise<ActionResult> {
  const student = await getStudent(studentId);
  if (!student) return { ok: false, error: "Student not found" };
  const batch = await getBatch(batchId);
  if (!batch) return { ok: false, error: "Batch not found" };

  await assignStudentToBatch(studentId, batch.id, batch.name, batch.courseId, batch.course);
  await notifyUsers([studentId], {
    title: "Batch assigned",
    message: `You've been placed in ${batch.name} (${batch.dailyTime}).`,
    kind: "class",
  });

  const user = await getCurrentUser();
  await logActivity(user?.fullName ?? "Admin", "Assigned batch", `${student.name} → ${batch.name}`);

  revalidatePath("/admin/users");
  revalidatePath("/admin/batches");
  return { ok: true };
}

export async function changeTutorPassword(tutorId: string, newPassword: string): Promise<ActionResult> {
  if (newPassword.trim().length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  const result = await setUserPassword(tutorId, newPassword);
  if ("error" in result) return { ok: false, error: result.error };
  revalidatePath("/admin/tutors");
  return { ok: true };
}
