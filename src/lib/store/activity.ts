import { db, nextId } from "./db";
import type { ActivityEntry } from "./types";

export function listActivity(): ActivityEntry[] {
  return db.activityLog;
}

export function logActivity(actor: string, action: string, target: string): void {
  const entry: ActivityEntry = {
    id: nextId("act"),
    actor,
    action,
    target,
    at: new Date().toISOString().replace("T", " ").slice(0, 16),
  };
  db.activityLog.unshift(entry);
}
