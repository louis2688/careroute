import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/notify";
import { COOKIE } from "@/lib/session";

export async function POST() {
  const res = NextResponse.redirect(new URL("/", await siteUrl()), 303);
  res.cookies.delete(COOKIE);
  return res;
}
