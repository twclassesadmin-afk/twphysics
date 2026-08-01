import { createClient } from "@/lib/supabase/server";
import type { ActivityEntry } from "./types";

export async function listActivity(): Promise<ActivityEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("activity_log").select("*").order("at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({ id: row.id, actor: row.actor, action: row.action, target: row.target, at: row.at }));
}

// Goes through the log_activity() RPC (security definer) rather than a
// direct insert — see supabase/migrations/20260727120006_activity_and_marketing.sql.
export async function logActivity(actor: string, action: string, target: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_activity", { p_actor: actor, p_action: action, p_target: target });
  if (error) throw error;
}
