import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { Icon } from "@/components/icons";
import { getSite } from "@/lib/content";
import { STATUSES, getBooking, listSeries, type Status } from "@/lib/db";
import { href, ui, type Lang } from "@/lib/i18n";
import { kmToMiles, money } from "@/lib/pricing";

const STEPS = STATUSES.filter((s) => s !== "cancelled");

export async function TripPage({ code, lang }: { code: string; lang: Lang }) {
  const trip = /^CR-[0-9A-F]{8}$/.test(code) ? await getBooking(code) : null;
  if (!trip) notFound();
  const series = trip.series_id ? await listSeries(trip.series_id) : [];
  const site = getSite(lang);
  const t = ui[lang].trip;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(ui[lang].locale, {
      timeZone: site.timeZone,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

  const at: Partial<Record<Status, string>> = {};
  for (const e of trip.booking_events) at[e.status] ??= e.at;
  const cancelled = trip.status === "cancelled";
  const reached = cancelled ? STEPS.filter((s) => at[s]).length : (STEPS as readonly Status[]).indexOf(trip.status) + 1;
  const first = trip.name.split(" ")[0];
  const mobility = ui[lang].book.form.mobilityNames[trip.mobility];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <AutoRefresh seconds={30} />
      <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">
        {t.ride} {trip.ref}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {cancelled ? t.cancelledTitle : t.statuses[trip.status]}
      </h1>
      <p className="mt-3 text-slate-600">
        {t.hi} {first}. {t.refreshes}
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
                    {t.statuses[s]}
                    {current && (
                      <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">
                        {t.now}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{at[s] ? fmt(at[s]) : t.pending}</p>
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
                <p className="font-medium text-slate-900">{t.cancelled}</p>
                <p className="text-sm text-slate-500">{at.cancelled ? fmt(at.cancelled) : ""}</p>
              </div>
            </li>
          )}
        </ol>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm md:self-start">
          <div>
            <p className="font-semibold text-slate-900">{t.pickup}</p>
            <p className="text-slate-600">
              {trip.date} · {trip.time.slice(0, 5)}
              {trip.trip_type === "round-trip" ? t.roundTrip : ""}
            </p>
            <p className="mt-1 text-slate-600">{trip.pickup}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{t.destination}</p>
            <p className="text-slate-600">{trip.dropoff}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{t.vehicle}</p>
            <p className="text-slate-600">
              {mobility}
              {trip.companions > 0 && t.companion(trip.companions)}
            </p>
          </div>
          {trip.driver && (
            <div>
              <p className="font-semibold text-slate-900">{t.driver}</p>
              <p className="text-slate-600">
                {t.driverLine(trip.driver.name, ui[lang].book.form.mobilityNames[trip.driver.vehicle_type].toLowerCase(), trip.driver.plate)}
              </p>
            </div>
          )}
          {trip.quote_cents != null && trip.distance_km != null && (
            <div>
              <p className="font-semibold text-slate-900">{t.fare}</p>
              <p className="text-slate-600">
                {money(trip.quote_cents)}, {t.milesEachWay(kmToMiles(trip.distance_km).toFixed(1))}
              </p>
            </div>
          )}
          {series.length > 1 && (
            <div>
              <p className="font-semibold text-slate-900">{t.standing}</p>
              <p className="text-slate-600">{t.onSchedule(series.length)}</p>
              <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs text-slate-600">
                {series.map((s) => (
                  <li key={s.ref}>
                    {s.ref === trip.ref ? (
                      <span className="font-semibold text-slate-900">
                        {s.date} {t.thisRide}
                      </span>
                    ) : (
                      <Link href={href(lang, `/trip/${s.ref}`)} className="text-sky-700 hover:underline">
                        {s.date}
                      </Link>
                    )}{" "}
                    · {t.statuses[s.status]}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trip.facility && (
            <div>
              <p className="font-semibold text-slate-900">{t.bookedBy}</p>
              <p className="text-slate-600">{trip.facility.name}</p>
            </div>
          )}
          <p className="border-t border-slate-200 pt-4 text-slate-600">
            {t.change1}{" "}
            <a href={site.phoneHref} className="font-medium text-sky-700 underline">
              {site.phone}
            </a>{" "}
            {t.change2} {trip.ref}.
          </p>
        </aside>
      </div>
    </div>
  );
}
