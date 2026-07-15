import { db, nextId } from "./db";
import type { Broadcast } from "./types";

export function listBroadcastsByTutor(tutorId: string): Broadcast[] {
  return db.broadcasts.filter((b) => b.tutorId === tutorId);
}

export function listBroadcastsByBatch(batchId: string): Broadcast[] {
  return db.broadcasts.filter((b) => b.batchId === batchId);
}

export function addBroadcast(input: {
  batchId: string;
  batchName: string;
  tutorId: string;
  tutorName: string;
  message: string;
}): Broadcast {
  const broadcast: Broadcast = {
    id: nextId("tb"),
    sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    ...input,
  };
  db.broadcasts.unshift(broadcast);
  return broadcast;
}
