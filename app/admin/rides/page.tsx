import type { Metadata } from "next";
import Link from "next/link";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import {
  NEXT_STEP,
  STATUS_LABEL,
  listBookings,
  listDrivers,
  type BookingRow,
  type Driver,
  type Status,
} from "@/lib/db";
import { channels } from "@/lib/notify";
import { kmToMiles, money } from "@/lib/pricing";
import { site } from "@/lib/site";
import { assignDriver, setStatus } from "../actions";

export const metadata: Metadata = { title: "Ride requests", robots: { index: false } };
export const dynamic = "force-dynamic";

const badge: Record<Status, string> = {
  new: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  en_route: "bg-sky-100 text-sky-900",
  picked_up: "bg-violet-100 text-violet-900",
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

const select =
  "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-sky-700";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const raw = (await searchParams).date ?? "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";

  let rows: BookingRow[] = [];
  let drivers: Driver[] = [];
  let error = "";
  try {
    [rows, drivers] = await Promise.all([listBookings({ date }), listDrivers()]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  const active = drivers.filter((d) => d.active);
  const open = rows.filter((r) => r.status === "new").length;
  const unassigned = rows.filter((r) => !r.driver_id && !["completed", "cancelled"].includes(r.status)).length;
  const ch = channels();

  return (
    <div className="pb-10">
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
            {date ? `Schedule for ${date}` : "Ride requests"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length} rides, <span className="font-semibold text-slate-900">{open} waiting for confirmation</span>,{" "}
            {unassigned} without a driver
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="text-sm font-medium text-slate-800">
              Day
              <input type="date" name="date" defaultValue={date} className={`${select} mt-1 block`} />
            </label>
            <button className="btn-secondary min-h-9 px-3 py-1.5 text-sm">Show</button>
            {date && (
              <Link href="/admin/rides" className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                Newest first
              </Link>
            )}
          </form>
          <form method="get" action="/admin/export" className="flex flex-wrap items-end gap-2">
            <label className="text-sm font-medium text-slate-800">
              From
              <input type="date" name="from" defaultValue={date} className={`${select} mt-1 block`} />
            </label>
            <label className="text-sm font-medium text-slate-800">
              To
              <input type="date" name="to" defaultValue={date} className={`${select} mt-1 block`} />
            </label>
            <button className="btn-secondary min-h-9 px-3 py-1.5 text-sm">Export CSV</button>
          </form>
        </div>
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
          {date ? `No rides on ${date}.` : "No ride requests yet. New submissions from the booking form show up here."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[80rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Ref</th>
                <th className="px-4 py-3 font-semibold">Passenger</th>
                <th className="px-4 py-3 font-semibold">Trip</th>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Needs</th>
                <th className="px-4 py-3 font-semibold">Driver</th>
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
                // Drivers whose vehicle matches the passenger's needs come first.
                const options = [...active].sort(
                  (a, b) => Number(b.vehicle_type === r.mobility) - Number(a.vehicle_type === r.mobility),
                );
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
                      {(r.series_id || r.facility) && (
                        <p className="mt-1 flex flex-wrap gap-1">
                          {r.series_id && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800">Standing order</span>}
                          {r.facility && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">{r.facility.name}</span>}
                        </p>
                      )}
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
                    <td className="px-4 py-3">
                      {closed ? (
                        <p className="text-slate-700">{r.driver?.name ?? "Unassigned"}</p>
                      ) : (
                        <form action={assignDriver}>
                          <input type="hidden" name="id" value={r.id} />
                          <AutoSubmitSelect
                            name="driver_id"
                            defaultValue={r.driver_id ?? ""}
                            aria-label={`Driver for ${r.ref}`}
                            className={select}
                          >
                            <option value="">Unassigned</option>
                            {options.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.vehicle_type})
                              </option>
                            ))}
                          </AutoSubmitSelect>
                        </form>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                      {r.signature && (
                        // eslint-disable-next-line @next/next/no-img-element -- data URL drawn by the passenger
                        <img src={r.signature} alt="Passenger signature" className="mt-2 h-10 rounded border border-slate-200 bg-white" />
                      )}
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
