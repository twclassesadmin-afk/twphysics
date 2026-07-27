"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { createSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/session";
import { ROLE_HOME, type UserRole } from "@/lib/roles";
import { createAccount, getAccountByEmail, resolveAccountFullName, verifyCredentials } from "@/lib/store/accounts";
import { addStudent } from "@/lib/store/students";
import { getCourse, firstOpenBatchForCourseAndCategory } from "@/lib/store/batches";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export type AuthActionState = { error: string } | null;

// Mock/static phase: login accepts ANY email+password. If the email matches a
// seeded account, that identity is used; otherwise the session falls back to
// the demo identity for the role implied by where the user came from
// (/admin → admin, /tutor → tutor, homepage login → student). Real credential
// checks return when Supabase Auth is wired in the backend phase.

const DEMO_IDENTITY: Record<UserRole, { userId: string; fullName: string }> = {
  admin: { userId: "admin-1", fullName: "Admin User" },
  tutor: { userId: "tut1", fullName: "Dr. Ramesh Chandra" },
  student: { userId: "s1", fullName: "Anjali Sharma" },
};

function roleFromRedirect(redirectTo: string): UserRole {
  if (redirectTo.startsWith("/admin")) return "admin";
  if (redirectTo.startsWith("/tutor")) return "tutor";
  return "student";
}

async function setSession(payload: { userId: string; role: UserRole; email: string; fullName: string }) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, await createSessionCookieValue(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const redirectTo = String(formData.get("redirectTo") ?? "");
  const account = verifyCredentials(parsed.data.email, parsed.data.password);

  if (account) {
    await setSession({
      userId: account.linkedId,
      role: account.role,
      email: account.email,
      fullName: resolveAccountFullName(account),
    });
    redirect(redirectTo || ROLE_HOME[account.role]);
  }

  // Unknown credentials — static phase: log in as the demo identity for the
  // role implied by the page they were trying to reach.
  const role = roleFromRedirect(redirectTo);
  const demo = DEMO_IDENTITY[role];
  await setSession({
    userId: demo.userId,
    role,
    email: parsed.data.email,
    fullName: demo.fullName,
  });
  redirect(redirectTo || ROLE_HOME[role]);
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    parentName: formData.get("parentName"),
    parentPhone: formData.get("parentPhone"),
    email: formData.get("email"),
    password: formData.get("password"),
    studentCategory: formData.get("studentCategory"),
    courseId: formData.get("courseId"),
    stream: formData.get("stream"),
    targetExams: formData.getAll("targetExams"),
    learningMode: formData.get("learningMode"),
    learningType: formData.get("learningType"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (getAccountByEmail(parsed.data.email)) {
    return { error: "An account with this email already exists" };
  }

  const course = getCourse(parsed.data.courseId);
  if (!course) {
    return { error: "Select a course to enroll in" };
  }

  // No hard-fail if every batch for this course+category is full — register
  // the student unassigned and let admin place them into a batch (or open a
  // new one) instead of turning them away at the door.
  const batch = firstOpenBatchForCourseAndCategory(course.id, parsed.data.studentCategory);

  const student = addStudent({
    name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    parentName: parsed.data.parentName,
    parentPhone: parsed.data.parentPhone,
    courseId: course.id,
    courseName: course.name,
    batchId: batch?.id ?? "",
    batchName: batch?.name ?? "Awaiting batch assignment",
    studentCategory: parsed.data.studentCategory,
    stream: parsed.data.stream,
    targetExams: parsed.data.targetExams,
    learningMode: parsed.data.learningMode,
    learningType: parsed.data.learningType,
  });
  createAccount({
    email: parsed.data.email,
    password: parsed.data.password,
    role: "student",
    linkedId: student.id,
  });

  if (batch) {
    notifyUsers(["admin-1"], {
      title: "New student registered",
      message: `${student.name} registered for ${course.name} (${batch.name}).`,
    });
    notifyUsers([student.id], {
      title: "Welcome to TWPHYSICS!",
      message: `You're registered for ${course.name} — ${batch.name} (${batch.dailyTime}).`,
    });
  } else {
    notifyUsers(["admin-1"], {
      title: "Student needs a batch",
      message: `${student.name} registered for ${course.name} but every matching batch is full — assign them a batch.`,
    });
    notifyUsers([student.id], {
      title: "Welcome to TWPHYSICS!",
      message: `You're registered for ${course.name} — we'll confirm your batch and timing shortly.`,
    });
  }
  logActivity(student.name, "Registered", `${course.name}${batch ? ` — ${batch.name}` : " — awaiting batch"}`);

  await setSession({
    userId: student.id,
    role: "student",
    email: parsed.data.email,
    fullName: student.name,
  });

  redirect("/student");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
