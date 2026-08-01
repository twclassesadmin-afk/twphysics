import { createClient } from "@/lib/supabase/server";
import type { PricingTier } from "./types";

function mapTier(row: {
  id: string;
  batch_size: number;
  label: string;
  subjects_count: number;
  days_per_subject_per_month: number;
  monthly_fee_inr: number;
}): PricingTier {
  return {
    id: row.id,
    batchSize: row.batch_size,
    label: row.label,
    subjectsCount: row.subjects_count,
    daysPerSubjectPerMonth: row.days_per_subject_per_month,
    monthlyFeeInr: row.monthly_fee_inr,
  };
}

export async function listPricingTiers(): Promise<PricingTier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("pricing_tiers").select("*").order("batch_size", { ascending: false });
  if (error) throw error;
  return data.map(mapTier);
}

export async function addPricingTier(input: {
  batchSize: number;
  label: string;
  subjectsCount: number;
  daysPerSubjectPerMonth: number;
  monthlyFeeInr: number;
}): Promise<PricingTier> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_tiers")
    .insert({
      batch_size: input.batchSize,
      label: input.label,
      subjects_count: input.subjectsCount,
      days_per_subject_per_month: input.daysPerSubjectPerMonth,
      monthly_fee_inr: input.monthlyFeeInr,
    })
    .select()
    .single();
  if (error) throw error;
  return mapTier(data);
}

export async function updatePricingTier(
  id: string,
  patch: Partial<{
    batchSize: number;
    label: string;
    subjectsCount: number;
    daysPerSubjectPerMonth: number;
    monthlyFeeInr: number;
  }>,
): Promise<PricingTier | undefined> {
  const supabase = await createClient();
  const update: Record<string, string | number> = {};
  if (patch.batchSize !== undefined) update.batch_size = patch.batchSize;
  if (patch.label !== undefined) update.label = patch.label;
  if (patch.subjectsCount !== undefined) update.subjects_count = patch.subjectsCount;
  if (patch.daysPerSubjectPerMonth !== undefined) update.days_per_subject_per_month = patch.daysPerSubjectPerMonth;
  if (patch.monthlyFeeInr !== undefined) update.monthly_fee_inr = patch.monthlyFeeInr;
  const { data, error } = await supabase.from("pricing_tiers").update(update).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return data ? mapTier(data) : undefined;
}

export async function removePricingTier(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("pricing_tiers").delete().eq("id", id);
  if (error) throw error;
}
