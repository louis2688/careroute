import { getSession } from "@/lib/session";

// Who is signed in, for the header. The session cookie is httpOnly, so the browser asks here.
export async function GET() {
  const s = await getSession("user");
  return Response.json(s ? { email: s.id, name: s.name ?? "", picture: s.picture ?? "" } : null, {
    headers: { "Cache-Control": "no-store" },
  });
}
