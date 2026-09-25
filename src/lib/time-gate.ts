// Shared class-window checks. The UI uses them to enable/disable "Join", but
// that's cosmetic — a Server Action can be called directly — so the actions
// that record attendance (student/classes/actions.ts) re-run them on the
// server with server time.

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
