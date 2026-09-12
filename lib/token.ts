import { createHmac, timingSafeEqual } from "node:crypto";

// Tiny signed token: "<base64url json>.<hmac>". No JWT library, no session table.
export type Session = {
  role: "driver" | "facility" | "user";
  id: string;
  name?: string;
  picture?: string;
};

const ROLES = new Set(["driver", "facility", "user"]);

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export function encodeSession(s: Session, secret: string): string {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function decodeSession(token: string | undefined, secret: string): Session | null {
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const want = sign(payload, secret);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return ROLES.has(s.role) && typeof s.id === "string" && s.id ? s : null;
  } catch {
    return null;
  }
}
