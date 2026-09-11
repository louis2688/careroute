import { NextResponse, type NextRequest } from "next/server";
import { checkBasicAuth } from "@/lib/auth";

// Gate /admin behind the browser's built-in password prompt. No login UI, no session table.
export function proxy(request: NextRequest) {
  if (checkBasicAuth(request.headers.get("authorization"), process.env.ADMIN_PASSWORD)) {
    return NextResponse.next();
  }
  return new NextResponse("Dispatch login required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="CareRoute dispatch"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };
