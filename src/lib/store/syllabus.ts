import { createClient } from "@/lib/supabase/server";
import type { SyllabusItem } from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function batchNameLookup(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("batches").select("id, name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((b) => [b.id, b.name]));
}

async function mapItems(
  supabase: SupabaseClient,
  rows: { id: string; batch_id: string; topic: string; subject: string; deadline: string; status: SyllabusItem["status"] }[],
): Promise<SyllabusItem[]> {
  const batchNames = await batchNameLookup(supabase, rows.map((r) => r.batch_id));
  return rows.map((row) => ({
    id: row.id,
    batchId: row.batch_id,
    batchName: batchNames.get(row.batch_id) ?? "",
    topic: row.topic,
    subject: row.subject,
    deadline: row.deadline,
    status: row.status,
  }));
}

export async function listSyllabus(): Promise<SyllabusItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("syllabus_items").select("*");
  if (error) throw error;
  return mapItems(supabase, data);
}

export async function listSyllabusByBatch(batchId: string): Promise<SyllabusItem[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("syllabus_items").select("*").eq("batch_id", batchId);
  if (error) throw error;
  return mapItems(supabase, data);
}

export async function addSyllabusItem(input: {
  batchId: string;
  batchName: string;
  topic: string;
  subject: string;
  deadline: string;
}): Promise<SyllabusItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("syllabus_items")
    .insert({ batch_id: input.batchId, topic: input.topic, subject: input.subject, deadline: input.deadline })
    .select()
    .single();
  if (error) throw error;
  const [item] = await mapItems(supabase, [data]);
  return item;
}

export async function advanceSyllabusStatus(id: string): Promise<SyllabusItem | undefined> {
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("syllabus_items")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!existing) return undefined;

  const next = existing.status === "not_started" ? "in_progress" : existing.status === "in_progress" ? "completed" : existing.status;
  const { data, error } = await supabase.from("syllabus_items").update({ status: next }).eq("id", id).select().maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const [item] = await mapItems(supabase, [data]);
  return item;
}
