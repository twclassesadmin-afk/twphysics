import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Only ever used by server-only
// Server Actions that provision or manage auth users on an admin's behalf
// (creating a tutor account, resetting a password). Never import this from
// client code, and never let the service-role key reach the browser.
function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function createAuthUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: "admin" | "tutor" | "student";
}): Promise<{ id: string } | { error: string }> {
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (error) return { error: error.message };

  // handle_new_user() always creates the profile with role 'student' —
  // promote it here for tutor/admin accounts.
  if (input.role !== "student") {
    const { error: roleError } = await supabase.from("profiles").update({ role: input.role }).eq("id", data.user.id);
    if (roleError) return { error: roleError.message };
  }
  return { id: data.user.id };
}

export async function setUserPassword(userId: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  const supabase = adminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function getAuthUserByEmail(email: string): Promise<{ id: string; email: string } | undefined> {
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
  return user ? { id: user.id, email: user.email ?? "" } : undefined;
}
