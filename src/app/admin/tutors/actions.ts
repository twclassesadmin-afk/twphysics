"use server";

import { revalidatePath } from "next/cache";
import { setPasswordByLinkedId } from "@/lib/store/accounts";

export async function resetTutorPassword(
  tutorId: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.trim().length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  setPasswordByLinkedId(tutorId, newPassword);
  revalidatePath(`/admin/tutors/${tutorId}`);
  return { ok: true };
}
