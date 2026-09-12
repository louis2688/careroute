import { cookies } from "next/headers";
import { decodeSession, encodeSession, type Session } from "@/lib/token";

export const COOKIE = "session";
// ponytail: falls back to the admin password as the signing secret so the demo needs no extra env var.
export const sessionSecret = () => process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 12,
};

export async function getSession(role: Session["role"]): Promise<Session | null> {
  const s = decodeSession((await cookies()).get(COOKIE)?.value, sessionSecret());
  return s?.role === role ? s : null;
}

export async function setSession(s: Session) {
  (await cookies()).set(COOKIE, encodeSession(s, sessionSecret()), cookieOptions);
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
