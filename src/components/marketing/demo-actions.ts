"use server";

import { revalidatePath } from "next/cache";
import { addDemoRequest } from "@/lib/store/demo-requests";
import { notifyUsers } from "@/lib/store/notifications";
import { logActivity } from "@/lib/store/activity";

export async function submitDemoRequest(input: {
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  preferredTime: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.name.trim() || !input.phone.trim()) {
    return { ok: false, error: "Name and phone are required" };
  }
  const request = addDemoRequest(input);
  notifyUsers(["admin-1"], {
    title: "New demo request",
    message: `${request.name} (${request.phone}) wants a free demo — ${request.courseInterest}.`,
    kind: "demo_request",
    relatedEntityId: request.id,
  });
  logActivity(request.name, "Requested a free demo", request.courseInterest);
  revalidatePath("/admin/demo-requests");
  return { ok: true };
}
