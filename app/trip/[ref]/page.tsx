import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { Icon } from "@/components/icons";
import { STATUSES, STATUS_LABEL, getBooking, type Status } from "@/lib/db";
import { kmToMiles, money } from "@/lib/pricing";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Track your ride", robots: { index: false } };
export const dynamic = "force-dynamic";

const STEPS = STATUSES.filter((s) => s !== "cancelled");

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: site.timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

export default async function TripPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const trip = /^CR-[0-9A-F]{8}$/.test(ref) ? await getBooking(ref) : null;
  if (!trip) notFound();

  const at: Partial<Record<Status, string>> = {};
  for (const e of trip.booking_events) at[e.status] ??= e.at;
  const cancelled = trip.status === "cancelled";
  const reached = cancelled ? STEPS.filter((s) => at[s]).length : (STEPS as readonly Status[]).indexOf(trip.status) + 1;
  const first = trip.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <AutoRefresh seconds={30} />
      <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">Ride {trip.ref}</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {cancelled ? "This ride was cancelled" : STATUS_LABEL[trip.status]}
      </h1>
      <p className="mt-3 text-slate-600">
        Hi {first}. This page updates on its own every 30 seconds, so you can keep it open.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem]">
        <ol className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          {STEPS.map((s, i) => {
            const done = i < reached;
            const current = !cancelled && trip.status !== "completed" && i === reached - 1;
            return (
              <li key={s} className="flex gap-4">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full font-heading font-bold ${
                    done ? "bg-sky-700 text-white" : "border-2 border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {done ? <Icon name="check" className="size-5" /> : i + 1}
                </span>
                <div>
                  <p className={`font-medium ${done ? "text-slate-900" : "text-slate-500"}`}>
                    {STATUS_LABEL[s]}
                    {current && (
                      <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">
                        Now
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{at[s] ? fmt(at[s]) : "Pending"}</p>
                </div>
              </li>
            );
          })}
          {cancelled && (
            <li className="flex gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
                <Icon name="alert-circle" className="size-5" />
              </span>
              <div>
                <p className="font-medium text-slate-900">Cancelled</p>
                <p className="text-sm text-slate-500">{at.cancelled ? fmt(at.cancelled) : ""}</p>
              </div>
            </li>
          )}
        </ol>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm md:self-start">
          <div>
            <p className="font-semibold text-slate-900">Pickup</p>
            <p className="text-slate-600">
              {trip.date} at {trip.time.slice(0, 5)}
              {trip.trip_type === "round-trip" ? ", round trip" : ""}
            </p>
            <p className="mt-1 text-slate-600">{trip.pickup}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Destination</p>
            <p className="text-slate-600">{trip.dropoff}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Vehicle</p>
            <p className="text-slate-600 capitalize">
              {trip.mobility}
              {trip.companions > 0 && `, ${trip.companions} companion${trip.companions > 1 ? "s" : ""}`}
            </p>
          </div>
          {trip.quote_cents != null && trip.distance_km != null && (
            <div>
              <p className="font-semibold text-slate-900">Estimated fare</p>
              <p className="text-slate-600">
                {money(trip.quote_cents)}, {kmToMiles(trip.distance_km).toFixed(1)} miles each way
              </p>
            </div>
          )}
          <p className="border-t border-slate-200 pt-4 text-slate-600">
            Need to change something? Call{" "}
            <a href={site.phoneHref} className="font-medium text-sky-700 underline">
              {site.phone}
            </a>{" "}
            and give reference {trip.ref}.
          </p>
        </aside>
      </div>
    </div>
  );
}
