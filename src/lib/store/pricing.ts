import { db, nextId } from "./db";
import type { PricingTier } from "./types";

export function listPricingTiers(): PricingTier[] {
  return db.pricingTiers.slice().sort((a, b) => b.batchSize - a.batchSize);
}

export function addPricingTier(input: {
  batchSize: number;
  label: string;
  subjectsCount: number;
  daysPerSubjectPerMonth: number;
  monthlyFeeInr: number;
}): PricingTier {
  const tier: PricingTier = { id: nextId("pt"), ...input };
  db.pricingTiers.push(tier);
  return tier;
}

export function updatePricingTier(
  id: string,
  patch: Partial<Omit<PricingTier, "id">>,
): PricingTier | undefined {
  const tier = db.pricingTiers.find((t) => t.id === id);
  if (!tier) return undefined;
  Object.assign(tier, patch);
  return tier;
}

export function removePricingTier(id: string): void {
  db.pricingTiers = db.pricingTiers.filter((t) => t.id !== id);
}
