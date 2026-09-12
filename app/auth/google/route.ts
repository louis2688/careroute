import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/notify";
import { cookieOptions } from "@/lib/session";

// Step 1 of "Sign in with Google": remember a random state, send the visitor to Google.
export async function GET(request: Request) {
  const base = await siteUrl();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL("/account?error=config", base));

  const state = crypto.randomUUID();
  const wanted = new URL(request.url).searchParams.get("next") ?? "/account";
  const next = wanted.startsWith("/") && !wanted.startsWith("//") ? wanted : "/account";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${base}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  res.cookies.set("oauth_state", state, { ...cookieOptions, maxAge: 600 });
  res.cookies.set("oauth_next", next, { ...cookieOptions, maxAge: 600 });
  return res;
}
