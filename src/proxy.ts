import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { ROLE_HOME, type UserRole } from "@/lib/roles";

const PROTECTED_PREFIXES: Record<string, UserRole> = {
  "/admin": "admin",
  "/tutor": "tutor",
  "/student": "student",
};

// Mock-phase role gating: reads the signed tw_session cookie (see
// src/lib/session.ts), set by src/app/(auth)/actions.ts against the shared
// in-memory store (src/lib/store/**). Flip this to false only if a UI review
// temporarily needs every dashboard route freely browsable again. Swap back
// to real Supabase JWT claims (src/lib/supabase/middleware.ts) once the
// backend phase lands.
const ROLE_GUARD_ENABLED = true;

export async function proxy(request: NextRequest) {
  if (!ROLE_GUARD_ENABLED) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);
  const user = session ? { id: session.userId } : null;
  const role = session?.role ?? null;
  const path = request.nextUrl.pathname;

  const matchedPrefix = Object.keys(PROTECTED_PREFIXES).find((prefix) =>
    path.startsWith(prefix),
  );

  // Already logged in, visiting /login or /signup — bounce to their dashboard.
  if (!matchedPrefix && (path === "/login" || path === "/signup") && user && role) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    return NextResponse.redirect(url);
  }

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  const requiredRole = PROTECTED_PREFIXES[matchedPrefix];

  // Route-level guard as defense-in-depth on top of RLS, not instead of it —
  // RLS is what actually stops a wrong-role user from reading data, once the
  // real backend lands.
  if (role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = role ? ROLE_HOME[role] : "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
