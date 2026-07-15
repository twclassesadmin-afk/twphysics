import type { NextRequest } from "next/server";
import type { UserRole } from "./store/types";

export const SESSION_COOKIE_NAME = "tw_session";

// Mock-phase-only secret — documented dev fallback, not for production use.
// Real Supabase Auth (JWT-based) replaces this whole module in the backend phase.
const SECRET = process.env.MOCK_SESSION_SECRET ?? "twphysics-mock-dev-secret-not-for-production";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  email: string;
  fullName: string;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

// Uses Web Crypto (globalThis.crypto.subtle) exclusively so the identical
// verify function runs unmodified in both the Node runtime (Server Actions)
// and the Edge runtime (proxy.ts) — no duplicated implementations.
export async function createSessionCookieValue(payload: SessionPayload): Promise<string> {
  const payloadPart = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey();
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  const signaturePart = toBase64Url(new Uint8Array(signature));
  return `${payloadPart}.${signaturePart}`;
}

export async function verifySessionCookieValue(value: string): Promise<SessionPayload | null> {
  const [payloadPart, signaturePart] = value.split(".");
  if (!payloadPart || !signaturePart) return null;
  try {
    const key = await hmacKey();
    const valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signaturePart) as BufferSource,
      new TextEncoder().encode(payloadPart),
    );
    if (!valid) return null;
    const json = new TextDecoder().decode(fromBase64Url(payloadPart));
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return raw ? verifySessionCookieValue(raw) : null;
}
