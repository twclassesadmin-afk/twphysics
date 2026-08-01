import { createClient } from "@/lib/supabase/server";
import { isInvalidIdError } from "./db-errors";
import type { ScheduledClass } from "./types";

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

async function mapClasses(
  supabase: SupabaseClient,
  rows: {
    id: string;
    batch_id: string;
    subject: string;
    topic: string;
    tutor_id: string;
    scheduled_at: string;
    duration_minutes: number;
    join_url: string;
  }[],
): Promise<ScheduledClass[]> {
  const [batchNames, tutorNames] = await Promise.all([
    batchNameLookup(supabase, rows.map((r) => r.batch_id)),
    tutorNameLookup(supabase, rows.map((r) => r.tutor_id)),
  ]);
  return rows.map((row) => ({
    id: row.id,
    batchId: row.batch_id,
    batchName: batchNames.get(row.batch_id) ?? "",
    subject: row.subject,
    topic: row.topic,
    tutorId: row.tutor_id,
    tutorName: tutorNames.get(row.tutor_id) ?? "",
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    joinUrl: row.join_url,
  }));
}

export async function listClassesByBatch(batchId: string): Promise<ScheduledClass[]> {
  if (!batchId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("batch_id", batchId)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return mapClasses(supabase, data);
}

export async function listClassesByTutor(tutorId: string): Promise<ScheduledClass[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("*").eq("tutor_id", tutorId);
  if (error) throw error;
  return mapClasses(supabase, data);
}

export async function getClass(id: string): Promise<ScheduledClass | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  if (!data) return undefined;
  const [scheduled] = await mapClasses(supabase, [data]);
  return scheduled;
}

export async function scheduleClass(input: {
  batchId: string;
  batchName: string;
  subject: string;
  topic: string;
  tutorId: string;
  tutorName: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl: string;
}): Promise<ScheduledClass> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      batch_id: input.batchId,
      subject: input.subject,
      topic: input.topic,
      tutor_id: input.tutorId,
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes,
      join_url: input.joinUrl,
    })
    .select()
    .single();
  if (error) throw error;
  const [scheduled] = await mapClasses(supabase, [data]);
  return scheduled;
}

export async function rescheduleClass(
  classId: string,
  patch: { scheduledAt?: string; durationMinutes?: number; joinUrl?: string },
): Promise<ScheduledClass | undefined> {
  const supabase = await createClient();
  const update: Record<string, string | number> = {};
  if (patch.scheduledAt !== undefined) update.scheduled_at = patch.scheduledAt;
  if (patch.durationMinutes !== undefined) update.duration_minutes = patch.durationMinutes;
  if (patch.joinUrl !== undefined) update.join_url = patch.joinUrl;
  const { data, error } = await supabase.from("classes").update(update).eq("id", classId).select().maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const [scheduled] = await mapClasses(supabase, [data]);
  return scheduled;
}
