import { cookies } from "next/headers";
import { decodeSession, encodeSession, type Session } from "@/lib/token";

const COOKIE = "session";
// ponytail: falls back to the admin password as the signing secret so the demo needs no extra env var.
const secret = () => process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "";

export async function getSession(role: Session["role"]): Promise<Session | null> {
  const s = decodeSession((await cookies()).get(COOKIE)?.value, secret());
  return s?.role === role ? s : null;
}

export async function setSession(s: Session) {
  (await cookies()).set(COOKIE, encodeSession(s, secret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
