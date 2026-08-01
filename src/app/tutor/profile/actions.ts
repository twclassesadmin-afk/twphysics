"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { updateTutorProfile } from "@/lib/store/tutors";
import { notifyAdmins } from "@/lib/store/notifications";

export async function saveTutorProfile(input: { phone: string; availability: string; bio: string }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false as const, error: "Not authorized" };
  await updateTutorProfile(user.userId, input);
  revalidatePath("/tutor/profile");
  revalidatePath("/admin/tutors");
  return { ok: true as const };
}

export async function requestLockedFieldChange(field: string, note: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false as const, error: "Not authorized" };
  if (!note.trim()) return { ok: false as const, error: "Describe the change needed" };
  await notifyAdmins({
    title: "Profile change request",
    message: `${user.fullName} requests a change to "${field}": ${note}`,
  });
  return { ok: true as const };
}
