import { db, nextId } from "./db";
import type { ResultEntry, Testimonial } from "./types";

export function listResults(): ResultEntry[] {
  return db.results;
}

export function addResult(input: {
  name: string;
  exam: string;
  rank: string;
  score: string;
  quote: string;
}): ResultEntry {
  const result: ResultEntry = { id: nextId("res-entry"), ...input };
  db.results.unshift(result);
  return result;
}

export function removeResult(id: string): void {
  db.results = db.results.filter((r) => r.id !== id);
}

export function listTestimonials(): Testimonial[] {
  return db.testimonials;
}

export function addTestimonial(input: { name: string; role: string; quote: string }): Testimonial {
  const testimonial: Testimonial = { id: nextId("test"), ...input };
  db.testimonials.unshift(testimonial);
  return testimonial;
}

export function removeTestimonial(id: string): void {
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
}
