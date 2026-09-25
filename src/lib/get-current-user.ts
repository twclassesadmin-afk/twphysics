import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/roles";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  email: string;
  fullName: string;
};

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", auth.user.id)
    .single();
  if (!profile) return null;

  return {
    userId: auth.user.id,
    role: profile.role,
    email: auth.user.email ?? "",
    fullName: profile.full_name ?? "",
  };
}

// Server Actions are public HTTP endpoints — the UI hiding a button is not
// access control. Every privileged action must call this first, especially
// ones that use the service-role client (which bypasses RLS entirely).
export async function requireRole(role: UserRole): Promise<SessionPayload | null> {
  const user = await getCurrentUser();
  return user?.role === role ? user : null;
}
