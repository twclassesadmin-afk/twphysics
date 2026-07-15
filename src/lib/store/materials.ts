import { db, nextId } from "./db";
import type { StudyMaterial } from "./types";

export function listMaterialsByBatch(batchId: string): StudyMaterial[] {
  return db.materials.filter((m) => m.batchId === batchId);
}

export function listMaterialsByBatches(batchIds: string[]): StudyMaterial[] {
  return db.materials.filter((m) => batchIds.includes(m.batchId));
}

export function listAllMaterials(): StudyMaterial[] {
  return db.materials;
}

export function addMaterial(input: {
  batchId: string;
  batchName: string;
  title: string;
  type: "pdf" | "link";
  url: string;
  uploadedBy: string;
}): StudyMaterial {
  const material: StudyMaterial = {
    id: nextId("sm"),
    uploadedAt: new Date().toISOString().slice(0, 10),
    ...input,
  };
  db.materials.unshift(material);
  return material;
}

export function removeMaterial(id: string): void {
  db.materials = db.materials.filter((m) => m.id !== id);
}
