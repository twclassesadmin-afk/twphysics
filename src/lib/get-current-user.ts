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
