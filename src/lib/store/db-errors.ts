// A malformed id (wrong format for the column type — e.g. not a valid uuid)
// should read as "not found", not crash the page with a raw Postgres error.
// Ids can arrive from stale client state, old bookmarked links, etc. — genuinely
// untrusted input, not just an internal programming error.
export function isInvalidIdError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "22P02";
}
