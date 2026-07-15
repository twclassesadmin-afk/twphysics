import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionCookieValue, type SessionPayload } from "./session";

// Parallel to the untouched src/lib/get-profile.ts (the real Supabase path,
// kept intact for the eventual swap-back). When Supabase Auth lands, this
// file's body gets replaced with getCurrentProfile()'s body and callers don't
// change (same return shape).
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  return raw ? verifySessionCookieValue(raw) : null;
}
