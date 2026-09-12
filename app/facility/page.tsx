import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { STATUS_LABEL, listBookings, type BookingRow, type Status } from "@/lib/db";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";
import { facilityLogin, facilityLogout } from "./actions";

export const metadata: Metadata = { title: "Facility portal", robots: { index: false } };
export const dynamic = "force-dynamic";

const badge: Record<Status, string> = {
  new: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  en_route: "bg-sky-100 text-sky-900",
  picked_up: "bg-violet-100 text-violet-900",
  completed: "bg-slate-800 text-white",
  cancelled: "bg-slate-200 text-slate-700",
};

function Login({ error }: { error: boolean }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">Facility portal</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">Sign in</h1>
      <p className="mt-3 text-slate-600">
        For hospitals, dialysis centers, and care homes. Enter the access code dispatch gave your facility to
        book rides for your patients and follow them live.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          That access code was not recognised. Call dispatch at {site.phone} if you need a new one.
        </p>
      )}
      <form action={facilityLogin} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-800">
          Access code
          <input
            name="code"
            required
            autoComplete="off"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-mono text-base tracking-wide text-slate-900 uppercase focus:border-sky-700"
          />
        </label>
        <button className="btn-primary min-h-12 w-full">Open the portal</button>
      </form>
    </div>
  );
}

export default async function FacilityPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getSession("facility");
  if (!session) return <Login error={Boolean((await searchParams).error)} />;
  let rides: BookingRow[] = [];
  let error = "";
  try {
    rides = await listBookings({ facility: session.id });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  const open = rides.filter((r) => !["completed", "cancelled"].includes(r.status));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">Facility portal</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">{session.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {open.length} open ride{open.length === 1 ? "" : "s"}, {rides.length} in total.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/book" className="btn-primary">
            Book for a patient
            <Icon name="arrow-right" className="size-4" />
          </Link>
          <form action={facilityLogout}>
            <button className="btn-secondary">Sign out</button>
          </form>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load rides. {error}
        </p>
      ) : rides.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No rides booked by your facility yet. Use &ldquo;Book for a patient&rdquo; and the ride will appear
          here.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Trip</th>
                <th className="px-4 py-3 font-semibold">Driver</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Track</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {rides.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-900">
                    {r.date}
                    <span className="block text-slate-600">{r.time.slice(0, 5)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <p className="text-slate-600 capitalize">{r.mobility}</p>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="text-slate-900">{r.pickup}</p>
                    <p className="text-slate-500">to {r.dropoff}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.driver?.name ?? "Not yet assigned"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/trip/${r.ref}`} className="font-mono text-sky-700 hover:underline">
                      {r.ref}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
