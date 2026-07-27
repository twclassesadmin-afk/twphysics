"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { getTutorApplication, reviewTutorApplication, createTutorFromApplication } from "@/lib/store/tutors";
import { createAccount, getAccountByEmail, setPasswordByLinkedId } from "@/lib/store/accounts";
import { addStudent, assignStudentToBatch, getStudent } from "@/lib/store/students";
import { getBatch } from "@/lib/store/batches";
import { logActivity } from "@/lib/store/activity";
import { notifyUsers } from "@/lib/store/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function approveTutorApplication(applicationId: string, initialPassword: string): Promise<ActionResult> {
  if (initialPassword.trim().length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  const application = getTutorApplication(applicationId);
  if (!application) return { ok: false, error: "Application not found" };
  if (application.status !== "pending") return { ok: false, error: "Application already reviewed" };

  const user = await getCurrentUser();
  const tutor = createTutorFromApplication(application);
  createAccount({ email: application.email, password: initialPassword, role: "tutor", linkedId: tutor.id });
  reviewTutorApplication(applicationId, "approved", user?.fullName ?? "Admin");
  logActivity(user?.fullName ?? "Admin", "Approved tutor application", application.fullName);

  revalidatePath("/admin/users");
  revalidatePath("/admin/tutors");
  return { ok: true };
}

export async function rejectTutorApplication(applicationId: string): Promise<ActionResult> {
  const application = getTutorApplication(applicationId);
  if (!application) return { ok: false, error: "Application not found" };
  const user = await getCurrentUser();
  reviewTutorApplication(applicationId, "rejected", user?.fullName ?? "Admin");
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
  if (getAccountByEmail(input.email)) return { ok: false, error: "An account with this email already exists" };
  const batch = getBatch(input.batchId);
  if (!batch) return { ok: false, error: "Select a batch" };

  const student = addStudent({
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone,
    age: input.age || null,
    parentName: input.parentName,
    parentPhone: input.parentPhone,
    address: input.address,
    courseId: batch.courseId,
    courseName: batch.course,
    batchId: batch.id,
    batchName: batch.name,
  });
  createAccount({ email: input.email.trim(), password: input.password, role: "student", linkedId: student.id });
  notifyUsers([student.id], {
    title: "Welcome to TWPHYSICS!",
    message: `You're enrolled in ${batch.course} — ${batch.name} (${batch.dailyTime}).`,
  });

  const user = await getCurrentUser();
  logActivity(user?.fullName ?? "Admin", "Added student manually", `${student.name} — ${batch.name}`);

  revalidatePath("/admin/users");
  revalidatePath("/admin/batches");
  return { ok: true };
}

export async function assignStudentBatch(studentId: string, batchId: string): Promise<ActionResult> {
  const student = getStudent(studentId);
  if (!student) return { ok: false, error: "Student not found" };
  const batch = getBatch(batchId);
  if (!batch) return { ok: false, error: "Batch not found" };

  assignStudentToBatch(studentId, batch.id, batch.name, batch.courseId, batch.course);
  notifyUsers([studentId], {
    title: "Batch assigned",
    message: `You've been placed in ${batch.name} (${batch.dailyTime}).`,
    kind: "class",
  });

  const user = await getCurrentUser();
  logActivity(user?.fullName ?? "Admin", "Assigned batch", `${student.name} → ${batch.name}`);

  revalidatePath("/admin/users");
  revalidatePath("/admin/batches");
  return { ok: true };
}

export async function changeTutorPassword(tutorId: string, newPassword: string): Promise<ActionResult> {
  if (newPassword.trim().length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  setPasswordByLinkedId(tutorId, newPassword);
  revalidatePath("/admin/tutors");
  return { ok: true };
}
