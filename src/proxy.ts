import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ROLE_HOME, type UserRole } from "@/lib/roles";

const PROTECTED_PREFIXES: Record<string, UserRole> = {
  "/admin": "admin",
  "/tutor": "tutor",
  "/student": "student",
};

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, role } = await updateSession(request);
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
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  const requiredRole = PROTECTED_PREFIXES[matchedPrefix];

  // Route-level guard as defense-in-depth on top of RLS, not instead of it —
  // RLS is what actually stops a wrong-role user from reading data.
  if (role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = role ? ROLE_HOME[role] : "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
