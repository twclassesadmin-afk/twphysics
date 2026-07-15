// Mock-phase-only password obfuscation — deliberately synchronous and
// dependency-free so seed data can be hashed at module-init time. This is NOT
// real password security (no salt, trivially reversible by brute force on
// short inputs); it exists only so credentials aren't stored as plain text in
// the in-memory store. Real bcrypt/argon2 hashing lands with Supabase Auth.
export function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
