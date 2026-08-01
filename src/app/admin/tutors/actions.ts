"use server";

import { revalidatePath } from "next/cache";
import { setUserPassword } from "@/lib/supabase/admin";

export async function resetTutorPassword(
  tutorId: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.trim().length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  const result = await setUserPassword(tutorId, newPassword);
  if ("error" in result) return { ok: false, error: result.error };
  revalidatePath(`/admin/tutors/${tutorId}`);
  return { ok: true };
}
