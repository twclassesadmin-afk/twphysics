"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { addMaterial, removeMaterial } from "@/lib/store/materials";
import { getBatch } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { notifyUsers } from "@/lib/store/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function uploadMaterial(input: {
  batchId: string;
  title: string;
  type: "pdf" | "link";
  url: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  if (!input.title.trim()) return { ok: false, error: "Title is required" };
  if (!input.url.trim()) return { ok: false, error: "PDF/link URL is required" };
  const batch = await getBatch(input.batchId);
  if (!batch) return { ok: false, error: "Select a batch" };

  await addMaterial({
    batchId: batch.id,
    batchName: batch.name,
    title: input.title,
    type: input.type,
    url: input.url.trim(),
    uploadedBy: user.userId,
  });
  const students = await listStudentsByBatch(batch.id);
  await notifyUsers(
    students.map((s) => s.id),
    { title: "New study material", message: `"${input.title}" was added to ${batch.name}.`, kind: "material" },
  );

  revalidatePath("/tutor/materials");
  revalidatePath("/student/course");
  revalidatePath("/admin/materials");
  return { ok: true };
}

export async function deleteMaterial(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "tutor") return { ok: false, error: "Not authorized" };
  await removeMaterial(id);
  revalidatePath("/tutor/materials");
  revalidatePath("/student/course");
  return { ok: true };
}
