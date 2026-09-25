"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAuthUser, deleteAuthUser } from "@/lib/supabase/admin";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { ROLE_HOME, isUserRole } from "@/lib/roles";
import { addStudent } from "@/lib/store/students";
import {
  getCourse,
  firstOpenBatchForCourseAndCategory,
} from "@/lib/store/batches";
import { notifyUsers, notifyAdmins } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export type AuthActionState = { error: string } | null;

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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return { error: "Invalid email or password" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const role = isUserRole(profile?.role) ? profile.role : "student";
  redirect(safeRedirect(redirectTo, ROLE_HOME[role]));
}

// redirectTo comes from the query string, so it's attacker-controllable
// (e.g. /login?redirectTo=https://evil.site). Only follow it when it's a path
// inside the user's own portal; anything else lands on their dashboard.
function safeRedirect(target: string, home: string): string {
  const isLocalPath =
    target.startsWith("/") &&
    !target.startsWith("//") &&
    !target.includes("\\");
  return isLocalPath && (target === home || target.startsWith(`${home}/`))
    ? target
    : home;
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

  const course = await getCourse(parsed.data.courseId);
  if (!course) {
    return { error: "Select a course to enroll in" };
  }

  // Created via the admin API (email_confirm: true) rather than
  // supabase.auth.signUp() — the hosted project requires email confirmation
  // before a self-signed-up user gets an active session, which would leave
  // no auth.uid() for the addStudent() insert below to satisfy RLS with.
  // Creating pre-confirmed and immediately signing in sidesteps that gate
  // entirely, matching the "register and land straight in your dashboard"
  // flow this app has always had.
  const created = await createAuthUser({
    email: parsed.data.email,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    role: "student",
  });
  if ("error" in created) {
    return {
      error: created.error.includes("already been registered")
        ? "An account with this email already exists"
        : created.error,
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signInError) {
    await deleteAuthUser(created.id);
    return {
      error: "We couldn't finish creating your account. Please try again.",
    };
  }

  // No hard-fail if every batch for this course+category is full — register
  // the student unassigned and let admin place them into a batch (or open a
  // new one) instead of turning them away at the door.
  const batch = await firstOpenBatchForCourseAndCategory(
    course.id,
    parsed.data.studentCategory,
  );

  let student: Awaited<ReturnType<typeof addStudent>>;
  try {
    student = await addStudent({
      id: created.id,
      phone: parsed.data.phone,
      parentName: parsed.data.parentName,
      parentPhone: parsed.data.parentPhone,
      courseId: course.id,
      batchId: batch?.id ?? "",
      studentCategory: parsed.data.studentCategory,
      stream: parsed.data.stream,
      targetExams: parsed.data.targetExams,
      learningMode: parsed.data.learningMode,
      learningType: parsed.data.learningType,
    });
  } catch (err) {
    // Roll back so the student can simply retry with the same email.
    console.error("Student record insert failed during signup", err);
    await supabase.auth.signOut();
    await deleteAuthUser(created.id);
    return {
      error: "We couldn't finish creating your account. Please try again.",
    };
  }

  // Registration is complete at this point — a failed notification or log
  // write must not turn it into an error screen the student can't retry from.
  try {
    if (batch) {
      await notifyAdmins({
        title: "New student registered",
        message: `${student.name} registered for ${course.name} (${batch.name}).`,
      });
      await notifyUsers([student.id], {
        title: "Welcome to TWPHYSICS!",
        message: `You're registered for ${course.name} — ${batch.name} (${batch.dailyTime}).`,
      });
    } else {
      await notifyAdmins({
        title: "Student needs a batch",
        message: `${student.name} registered for ${course.name} but every matching batch is full — assign them a batch.`,
      });
      await notifyUsers([student.id], {
        title: "Welcome to TWPHYSICS!",
        message: `You're registered for ${course.name} — we'll confirm your batch and timing shortly.`,
      });
    }
    await logActivity(
      student.name,
      "Registered",
      `${course.name}${batch ? ` — ${batch.name}` : " — awaiting batch"}`,
    );
  } catch (err) {
    console.error("Post-signup notifications failed", err);
  }

  redirect("/student");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
