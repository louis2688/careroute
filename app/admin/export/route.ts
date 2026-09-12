import type { NextRequest } from "next/server";
import { csvRow } from "@/lib/csv";
import { listForExport, type Status } from "@/lib/db";
import { kmToMiles } from "@/lib/pricing";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Proof-of-service export for billing and broker claims. Gated by the /admin password in proxy.ts.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const from = DATE.test(q.get("from") ?? "") ? q.get("from")! : "";
  const to = DATE.test(q.get("to") ?? "") ? q.get("to")! : "";
  const rows = await listForExport(from, to);

  const header = [
    "ref", "date", "time", "status", "passenger", "phone", "pickup", "dropoff", "mobility", "trip_type",
    "distance_mi", "fare_usd", "driver", "plate", "en_route_at", "picked_up_at", "picked_up_lat", "picked_up_lon",
    "completed_at", "completed_lat", "completed_lon", "signed",
  ];
  const lines = rows.map((r) => {
    const ev = (s: Status) => r.booking_events.find((e) => e.status === s);
    const up = ev("picked_up");
    const done = ev("completed");
    return csvRow([
      r.ref, r.date, r.time.slice(0, 5), r.status, r.name, r.phone, r.pickup, r.dropoff, r.mobility, r.trip_type,
      r.distance_km == null ? "" : kmToMiles(r.distance_km).toFixed(1),
      r.quote_cents == null ? "" : (r.quote_cents / 100).toFixed(2),
      r.driver?.name ?? "", r.driver?.plate ?? "",
      ev("en_route")?.at ?? "", up?.at ?? "", up?.lat ?? "", up?.lon ?? "",
      done?.at ?? "", done?.lat ?? "", done?.lon ?? "", r.signature ? "yes" : "no",
    ]);
  });

  return new Response([csvRow(header), ...lines].join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="careroute-rides-${from || "all"}-${to || "all"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
