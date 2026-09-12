import { createHmac, timingSafeEqual } from "node:crypto";

// Tiny signed token: "<role>:<id>:<hmac>". No JWT library, no session table.
export type Session = { role: "driver" | "facility"; id: string };

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export function encodeSession(s: Session, secret: string): string {
  const payload = `${s.role}:${s.id}`;
  return `${payload}:${sign(payload, secret)}`;
}

export function decodeSession(token: string | undefined, secret: string): Session | null {
  if (!token || !secret) return null;
  const [role, id, sig] = token.split(":");
  if (!role || !id || !sig || (role !== "driver" && role !== "facility")) return null;
  const want = sign(`${role}:${id}`, secret);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  return { role, id };
}
