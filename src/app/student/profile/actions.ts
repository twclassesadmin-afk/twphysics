"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { updateStudentContact } from "@/lib/store/students";

export async function saveStudentProfile(input: { phone: string; address: string }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return { ok: false as const, error: "Not authorized" };
  updateStudentContact(user.userId, input);
  revalidatePath("/student/profile");
  return { ok: true as const };
}
