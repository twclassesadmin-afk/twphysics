"use server";

import { revalidatePath } from "next/cache";
import { updateDemoRequestStatus } from "@/lib/store/demo-requests";
import type { DemoRequest } from "@/lib/store/types";

export async function setDemoRequestStatus(id: string, status: DemoRequest["status"]) {
  updateDemoRequestStatus(id, status);
  revalidatePath("/admin/demo-requests");
  return { ok: true as const };
}
