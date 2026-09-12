import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { STATUS_LABEL, listBookings, listDrivers, type BookingRow, type Driver, type Status } from "@/lib/db";
import { CREDENTIALS, daysAgoISO, expiryTone, todayISO } from "@/lib/fleet";
import { money } from "@/lib/pricing";

export const metadata: Metadata = { title: "Dispatch dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

const badge: Record<Status, string> = {
  new: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  confirmed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
  en_route: "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-200",
  picked_up: "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100",
  completed: "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900",
  cancelled: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const card = "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900";

function Stat({ label, value, hint, tone = "" }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <div className={card}>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className={`mt-1 font-heading text-3xl font-bold tracking-tight ${tone || "text-slate-900 dark:text-slate-100"}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const today = todayISO();
  const weekAgo = daysAgoISO(7);
  let open: BookingRow[] = [];
  let recent: BookingRow[] = [];
  let drivers: Driver[] = [];
  let error = "";
  try {
    [open, recent, drivers] = await Promise.all([
      listBookings({ open: true }),
      listBookings({ from: weekAgo }),
      listDrivers(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const todays = recent.filter((r) => r.date === today);
  const waiting = open.filter((r) => r.status === "new");
  const unassigned = open.filter((r) => !r.driver_id);
  const week = recent.filter((r) => r.date <= today);
  const completed = week.filter((r) => r.status === "completed");
  const cancelled = week.filter((r) => r.status === "cancelled");
  const revenue = completed.reduce((sum, r) => sum + (r.quote_cents ?? 0), 0);
  const alerts = drivers
    .filter((d) => d.active)
    .flatMap((d) =>
      CREDENTIALS.map(([key, label]) => ({ driver: d.name, label, date: d[key], tone: expiryTone(d[key], today) })),
    )
    .filter((a) => a.tone === "expired" || a.tone === "soon")
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="pb-10">
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{today}. Numbers refresh on every load.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/book" className="btn-primary min-h-10 px-4 py-2 text-sm">
            Book for a caller
          </Link>
          <a href={`/admin/export?from=${weekAgo}&to=${today}`} className="btn-secondary min-h-10 px-4 py-2 text-sm">
            Export last 7 days
          </a>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Could not load data. {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Rides today" value={todays.length} hint={`${todays.filter((r) => r.status === "completed").length} completed so far`} />
        <Stat label="Waiting for confirmation" value={waiting.length} tone={waiting.length ? "text-amber-700 dark:text-amber-300" : ""} hint="Passengers expect a reply within one business hour" />
        <Stat label="Open rides without a driver" value={unassigned.length} tone={unassigned.length ? "text-red-700 dark:text-red-300" : ""} />
        <Stat label="Completed, last 7 days" value={completed.length} hint={`${money(revenue)} in estimated fares, ${cancelled.length} cancelled`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={card}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Today&apos;s schedule</h2>
            <Link href={`/admin/rides?date=${today}`} className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400">
              Open the day view
            </Link>
          </div>
          {todays.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">No rides scheduled for today.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {todays.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                  <span className="w-12 font-mono font-semibold text-slate-900 dark:text-slate-100">{r.time.slice(0, 5)}</span>
                  <span className="min-w-40 flex-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{r.name}</span>
                    <span className="text-slate-500 dark:text-slate-400"> · {r.mobility}</span>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">{r.driver?.name ?? "Unassigned"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className={card}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Needs a reply</h2>
              <Link href="/admin/rides" className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400">
                All requests
              </Link>
            </div>
            {waiting.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Every request has been answered.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {waiting.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center gap-3">
                    <Icon name="clock" className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="flex-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{r.name}</span>
                      <span className="text-slate-500 dark:text-slate-400"> · {r.date} {r.time.slice(0, 5)}</span>
                    </span>
                    <Link href={`/trip/${r.ref}`} className="font-mono text-xs text-sky-700 hover:underline dark:text-sky-400">
                      {r.ref}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Credential alerts</h2>
              <Link href="/admin/fleet" className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400">
                Fleet
              </Link>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">All driver and vehicle credentials are current.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {alerts.map((a) => (
                  <li key={`${a.driver}-${a.label}`} className="flex items-center gap-3">
                    <Icon name="alert-circle" className={`size-4 shrink-0 ${a.tone === "expired" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} />
                    <span className="flex-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{a.driver}</span>
                      <span className="text-slate-500 dark:text-slate-400"> · {a.label}</span>
                    </span>
                    <span className={a.tone === "expired" ? "font-semibold text-red-700 dark:text-red-300" : "text-amber-800 dark:text-amber-200"}>
                      {a.tone === "expired" ? "expired" : "due"} {a.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
