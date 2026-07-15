"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import {
  addFreeResource,
  removeFreeResource,
  addResult,
  removeResult,
  addTestimonial,
  removeTestimonial,
} from "@/lib/store/marketing";
import type { FreeResource } from "@/lib/store/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function createFreeResource(input: {
  title: string;
  description: string;
  type: FreeResource["type"];
  url: string;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized" };
  if (!input.title.trim()) return { ok: false, error: "Title is required" };
  if (input.type !== "demo" && !input.url.trim()) return { ok: false, error: "URL is required" };
  addFreeResource(input);
  revalidatePath("/admin/marketing");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFreeResource(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized" };
  removeFreeResource(id);
  revalidatePath("/admin/marketing");
  revalidatePath("/");
  return { ok: true };
}

export async function createResult(input: {
  name: string;
  exam: string;
  rank: string;
  score: string;
  quote: string;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized" };
  if (!input.name.trim() || !input.exam.trim()) return { ok: false, error: "Name and exam are required" };
  addResult(input);
  revalidatePath("/admin/marketing");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteResult(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized" };
  removeResult(id);
  revalidatePath("/admin/marketing");
  revalidatePath("/");
  return { ok: true };
}

export async function createTestimonial(input: {
  name: string;
  role: string;
  quote: string;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized" };
  if (!input.name.trim() || !input.quote.trim()) return { ok: false, error: "Name and quote are required" };
  addTestimonial(input);
  revalidatePath("/admin/marketing");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized" };
  removeTestimonial(id);
  revalidatePath("/admin/marketing");
  revalidatePath("/");
  return { ok: true };
}
