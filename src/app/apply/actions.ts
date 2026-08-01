"use server";

import { tutorApplicationSchema } from "@/lib/validations/tutor-application";
import { addTutorApplication } from "@/lib/store/tutors";
import { notifyAdmins } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export type ApplyActionState = { error: string } | { success: true } | null;

export async function submitTutorApplication(
  _prevState: ApplyActionState,
  formData: FormData,
): Promise<ApplyActionState> {
  const parsed = tutorApplicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subjects: formData.getAll("subjects"),
    qualifications: formData.get("qualifications"),
    experience: formData.get("experience"),
    availability: formData.get("availability"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await addTutorApplication(parsed.data);
  } catch {
    return { error: "Something went wrong submitting your application — please try again." };
  }

  await notifyAdmins({
    title: "New tutor application",
    message: `${parsed.data.fullName} applied to teach ${parsed.data.subjects.join(", ")}.`,
  });
  await logActivity(parsed.data.fullName, "Applied to teach", parsed.data.subjects.join(", "));

  return { success: true };
}
