import { db, nextId } from "./db";
import type { SyllabusItem } from "./types";

export function listSyllabus(): SyllabusItem[] {
  return db.syllabus;
}

export function listSyllabusByBatch(batchId: string): SyllabusItem[] {
  return db.syllabus.filter((s) => s.batchId === batchId);
}

export function addSyllabusItem(input: {
  batchId: string;
  batchName: string;
  topic: string;
  subject: string;
  deadline: string;
}): SyllabusItem {
  const item: SyllabusItem = { id: nextId("sy"), status: "not_started", ...input };
  db.syllabus.push(item);
  return item;
}

export function advanceSyllabusStatus(id: string): SyllabusItem | undefined {
  const item = db.syllabus.find((s) => s.id === id);
  if (!item) return undefined;
  if (item.status === "not_started") item.status = "in_progress";
  else if (item.status === "in_progress") item.status = "completed";
  return item;
}
