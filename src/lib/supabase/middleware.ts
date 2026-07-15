import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isUserRole, type UserRole } from "@/lib/roles";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() cryptographically verifies the JWT and returns the custom
  // `user_role` claim stamped by the custom_access_token_hook migration — no
  // extra DB round trip needed just to route the request.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const role: UserRole | null = isUserRole(claims?.user_role) ? claims.user_role : null;

  return { supabaseResponse, user: claims ? { id: claims.sub } : null, role };
}
