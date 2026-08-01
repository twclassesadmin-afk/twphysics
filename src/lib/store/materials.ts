import { createClient } from "@/lib/supabase/server";
import type { StudyMaterial } from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function batchNameLookup(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("batches").select("id, name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((b) => [b.id, b.name]));
}

async function profileNameLookup(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((p) => [p.id, p.full_name ?? ""]));
}

async function mapMaterials(
  supabase: SupabaseClient,
  rows: {
    id: string;
    batch_id: string;
    title: string;
    type: "pdf" | "link";
    url: string;
    uploaded_by: string;
    created_at: string;
  }[],
): Promise<StudyMaterial[]> {
  const [batchNames, uploaderNames] = await Promise.all([
    batchNameLookup(supabase, rows.map((r) => r.batch_id)),
    profileNameLookup(supabase, rows.map((r) => r.uploaded_by)),
  ]);
  return rows.map((row) => ({
    id: row.id,
    batchId: row.batch_id,
    batchName: batchNames.get(row.batch_id) ?? "",
    title: row.title,
    type: row.type,
    url: row.url,
    uploadedAt: row.created_at.slice(0, 10),
    uploadedBy: uploaderNames.get(row.uploaded_by) ?? "",
  }));
}

export async function listMaterialsByBatch(batchId: string): Promise<StudyMaterial[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("study_materials").select("*").eq("batch_id", batchId);
  if (error) throw error;
  return mapMaterials(supabase, data);
}

export async function listMaterialsByBatches(batchIds: string[]): Promise<StudyMaterial[]> {
  if (batchIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("study_materials").select("*").in("batch_id", batchIds);
  if (error) throw error;
  return mapMaterials(supabase, data);
}

export async function listAllMaterials(): Promise<StudyMaterial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("study_materials").select("*");
  if (error) throw error;
  return mapMaterials(supabase, data);
}

export async function addMaterial(input: {
  batchId: string;
  batchName: string;
  title: string;
  type: "pdf" | "link";
  url: string;
  uploadedBy: string;
}): Promise<StudyMaterial> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_materials")
    .insert({ batch_id: input.batchId, title: input.title, type: input.type, url: input.url, uploaded_by: input.uploadedBy })
    .select()
    .single();
  if (error) throw error;
  const [material] = await mapMaterials(supabase, [data]);
  return material;
}

export async function removeMaterial(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("study_materials").delete().eq("id", id);
  if (error) throw error;
}
