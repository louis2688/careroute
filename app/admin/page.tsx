import type { Metadata } from "next";
import Link from "next/link";
import { NEXT_STEP, STATUS_LABEL, listBookings, type BookingRow, type Status } from "@/lib/db";
import { channels } from "@/lib/notify";
import { kmToMiles, money } from "@/lib/pricing";
import { site } from "@/lib/site";
import { setStatus } from "./actions";

export const metadata: Metadata = { title: "Dispatch", robots: { index: false } };
export const dynamic = "force-dynamic";

const badge: Record<Status, string> = {
  new: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  en_route: "bg-sky-100 text-sky-900",
  completed: "bg-slate-800 text-white",
  cancelled: "bg-slate-200 text-slate-700",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: site.timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default async function AdminPage() {
  let rows: BookingRow[] = [];
  let error = "";
  try {
    rows = await listBookings();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  const open = rows.filter((r) => r.status === "new").length;
  const ch = channels();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">Dispatch</p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-slate-900">Ride requests</h1>
        </div>
        <p className="text-sm text-slate-600">
          {rows.length} total, <span className="font-semibold text-slate-900">{open} waiting for confirmation</span>
        </p>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Passenger notifications: email {ch.email ? "on" : "off"}, SMS {ch.sms ? "on" : "off"}.
        {!(ch.email && ch.sms) && " Channels that are off print the message to the server log instead. Add the Resend and Twilio keys to switch them on."}
      </p>

      {error ? (
        <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load bookings. {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No ride requests yet. New submissions from the booking form show up here.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Ref</th>
                <th className="px-4 py-3 font-semibold">Passenger</th>
                <th className="px-4 py-3 font-semibold">Trip</th>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Needs</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {rows.map((r) => {
                const next = NEXT_STEP[r.status];
                const closed = r.status === "completed" || r.status === "cancelled";
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/trip/${r.ref}`} className="font-mono font-semibold text-sky-700 hover:underline">
                        {r.ref}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">{when(r.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{r.name}</p>
                      <p className="text-slate-600">
                        <a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a>
                      </p>
                      <p className="text-slate-600">
                        <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a>
                      </p>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="text-slate-900">{r.pickup}</p>
                      <p className="text-slate-500">to {r.dropoff}</p>
                      {r.quote_cents != null && r.distance_km != null && (
                        <p className="mt-1 text-slate-700">
                          Est. {money(r.quote_cents)}, {kmToMiles(r.distance_km).toFixed(1)} mi
                        </p>
                      )}
                      {r.notes && <p className="mt-1 text-xs text-slate-600">Note: {r.notes}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-slate-900">{r.date}</p>
                      <p className="text-slate-600">
                        {r.time.slice(0, 5)} {r.trip_type === "round-trip" ? "round trip" : "one-way"}
                      </p>
                      {r.return_time && <p className="text-slate-600">return {r.return_time.slice(0, 5)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900 capitalize">{r.mobility}</p>
                      <p className="text-slate-600">{r.purpose}</p>
                      {r.companions > 0 && (
                        <p className="text-slate-600">
                          {r.companions} companion{r.companions > 1 ? "s" : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!closed && (
                        <form action={setStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={r.id} />
                          {next && (
                            <button name="status" value={next.status} className="btn-primary min-h-9 px-3 py-1.5 text-xs whitespace-nowrap">
                              {next.label}
                            </button>
                          )}
                          <button name="status" value="cancelled" className="btn-secondary min-h-9 px-3 py-1.5 text-xs">
                            Cancel
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
