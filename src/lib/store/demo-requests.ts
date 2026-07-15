import { db, nextId } from "./db";
import type { DemoRequest } from "./types";

export function listDemoRequests(): DemoRequest[] {
  return db.demoRequests;
}

export function addDemoRequest(input: {
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  preferredTime: string;
}): DemoRequest {
  const request: DemoRequest = {
    id: nextId("dr"),
    status: "new",
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    ...input,
  };
  db.demoRequests.unshift(request);
  return request;
}

export function updateDemoRequestStatus(id: string, status: DemoRequest["status"]): void {
  const request = db.demoRequests.find((r) => r.id === id);
  if (request) request.status = status;
}
