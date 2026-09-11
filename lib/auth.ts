import { timingSafeEqual } from "node:crypto";

// HTTP Basic auth against a single shared password. Username is ignored.
export function checkBasicAuth(header: string | null, password: string | undefined): boolean {
  if (!password || !header?.startsWith("Basic ")) return false;
  const given = Buffer.from(atob(header.slice(6)).split(":").slice(1).join(":"));
  const want = Buffer.from(password);
  return given.length === want.length && timingSafeEqual(given, want);
}
