import { createClient } from "@/lib/supabase/server";
import type { ResultEntry, Testimonial } from "./types";

export async function listResults(): Promise<ResultEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("results").select("*");
  if (error) throw error;
  return data;
}

export async function addResult(input: {
  name: string;
  exam: string;
  rank: string;
  score: string;
  quote: string;
}): Promise<ResultEntry> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("results").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function removeResult(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("results").delete().eq("id", id);
  if (error) throw error;
}

export async function listTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonials").select("*");
  if (error) throw error;
  return data;
}

export async function addTestimonial(input: { name: string; role: string; quote: string }): Promise<Testimonial> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonials").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function removeTestimonial(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}
