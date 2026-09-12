import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/notify";
import { COOKIE, cookieOptions, sessionSecret } from "@/lib/session";
import { encodeSession } from "@/lib/token";

// Step 2: Google sends the visitor back with a code. Swap it for their verified email and name.
export async function GET(request: NextRequest) {
  const base = await siteUrl();
  const fail = (why: string) => NextResponse.redirect(new URL(`/account?error=${why}`, base));
  const q = request.nextUrl.searchParams;
  const code = q.get("code");
  const state = request.cookies.get("oauth_state")?.value;
  if (!code || !state || q.get("state") !== state) return fail("state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("config");

  const token = (await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${base}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  }).then((r) => r.json())) as { access_token?: string };
  if (!token.access_token) return fail("token");

  const me = (await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  }).then((r) => r.json())) as { email?: string; email_verified?: boolean; name?: string; picture?: string };
  if (!me.email || !me.email_verified) return fail("email");

  const next = request.cookies.get("oauth_next")?.value ?? "/account";
  const res = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/account", base));
  res.cookies.set(
    COOKIE,
    encodeSession({ role: "user", id: me.email.toLowerCase(), name: me.name, picture: me.picture }, sessionSecret()),
    cookieOptions,
  );
  res.cookies.delete("oauth_state");
  res.cookies.delete("oauth_next");
  return res;
}
