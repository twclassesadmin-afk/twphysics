import { createClient } from "@/lib/supabase/server";
import type { Broadcast } from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function batchNameLookup(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("batches").select("id, name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((b) => [b.id, b.name]));
}

async function tutorNameLookup(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((p) => [p.id, p.full_name ?? ""]));
}

async function mapBroadcasts(
  supabase: SupabaseClient,
  rows: { id: string; batch_id: string; tutor_id: string; message: string; sent_at: string }[],
): Promise<Broadcast[]> {
  const [batchNames, tutorNames] = await Promise.all([
    batchNameLookup(supabase, rows.map((r) => r.batch_id)),
    tutorNameLookup(supabase, rows.map((r) => r.tutor_id)),
  ]);
  return rows.map((row) => ({
    id: row.id,
    batchId: row.batch_id,
    batchName: batchNames.get(row.batch_id) ?? "",
    tutorId: row.tutor_id,
    tutorName: tutorNames.get(row.tutor_id) ?? "",
    message: row.message,
    sentAt: row.sent_at,
  }));
}

export async function listBroadcastsByTutor(tutorId: string): Promise<Broadcast[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("broadcasts").select("*").eq("tutor_id", tutorId);
  if (error) throw error;
  return mapBroadcasts(supabase, data);
}

export async function listBroadcastsByBatch(batchId: string): Promise<Broadcast[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("broadcasts").select("*").eq("batch_id", batchId);
  if (error) throw error;
  return mapBroadcasts(supabase, data);
}

export async function addBroadcast(input: {
  batchId: string;
  batchName: string;
  tutorId: string;
  tutorName: string;
  message: string;
}): Promise<Broadcast> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("broadcasts")
    .insert({ batch_id: input.batchId, tutor_id: input.tutorId, message: input.message })
    .select()
    .single();
  if (error) throw error;
  const [broadcast] = await mapBroadcasts(supabase, [data]);
  return broadcast;
}
