// Client-visible time check only — a motivated user could bypass a disabled
// "Start"/"Join" button via devtools (e.g. calling a Server Action directly).
// Every Server Action that mutates exam-attempt or attendance state re-checks
// these same functions server-side (see store/exams.ts), not just the UI.
// Full tamper-resistant enforcement (DB-level, keyed off server time) is
// deferred to the real Supabase backend phase.

export function hasStarted(scheduledAt: string | Date, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(scheduledAt).getTime();
}

export function hasEnded(scheduledAt: string | Date, durationMinutes: number, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(scheduledAt).getTime() + durationMinutes * 60_000;
}

export function getWindow(scheduledAt: string | Date, durationMinutes: number): { startsAt: Date; endsAt: Date } {
  const startsAt = new Date(scheduledAt);
  return { startsAt, endsAt: new Date(startsAt.getTime() + durationMinutes * 60_000) };
}

export function msUntilStart(scheduledAt: string | Date, now: Date = new Date()): number {
  return new Date(scheduledAt).getTime() - now.getTime();
}

export function msUntilEnd(scheduledAt: string | Date, durationMinutes: number, now: Date = new Date()): number {
  return new Date(scheduledAt).getTime() + durationMinutes * 60_000 - now.getTime();
}
