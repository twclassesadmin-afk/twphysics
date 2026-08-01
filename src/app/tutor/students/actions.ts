"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addStudentFlag } from "@/lib/store/students";
import type { StudentFlag } from "@/lib/store/types";

export async function tagStudent(
  studentId: string,
  tag: StudentFlag["type"] | "none",
  note: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  if (tag === "none") return { ok: true };

  await addStudentFlag(studentId, {
    type: tag,
    note,
    authorId: user.userId,
    authorName: user.fullName,
    authorRole: "tutor",
  });
  revalidatePath("/tutor/students");
  revalidatePath("/admin/users");
  return { ok: true };
}
