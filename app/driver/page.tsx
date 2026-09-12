import type { Metadata } from "next";
import { GeoFields } from "@/components/geo-fields";
import { Icon } from "@/components/icons";
import { SignaturePad } from "@/components/signature-pad";
import { NEXT_STEP, STATUS_LABEL, getDriver, listDriverRides, type BookingRow } from "@/lib/db";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";
import { driverLogin, driverLogout, driverUpdate } from "./actions";

export const metadata: Metadata = { title: "Driver", robots: { index: false } };
export const dynamic = "force-dynamic";

const input =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:border-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

const stepLabel: Partial<Record<BookingRow["status"], string>> = {
  new: "Confirm pickup",
  confirmed: "Start trip",
  en_route: "Passenger picked up",
  picked_up: "Complete trip",
};

const maps = (q: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

function Login({ error }: { error: boolean }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-400">Driver app</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sign in</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Use the phone number dispatch has on file and your PIN.</p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          No active driver matches that phone number and PIN.
        </p>
      )}
      <form action={driverLogin} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          Phone number
          <input name="phone" type="tel" required autoComplete="tel" className={input} />
        </label>
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          PIN
          <input name="pin" type="password" inputMode="numeric" required autoComplete="current-password" className={input} />
        </label>
        <button className="btn-primary min-h-12 w-full">Sign in</button>
      </form>
    </div>
  );
}

export default async function DriverPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getSession("driver");
  if (!session) return <Login error={Boolean((await searchParams).error)} />;
  const [driver, rides] = await Promise.all([getDriver(session.id), listDriverRides(session.id)]);
  if (!driver) return <Login error={false} />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-400">Driver app</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{driver.name}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {driver.vehicle_type} vehicle {driver.plate}. {rides.length} open ride{rides.length === 1 ? "" : "s"}.
          </p>
        </div>
        <form action={driverLogout}>
          <button className="btn-secondary min-h-10 px-3 py-1.5 text-sm">Sign out</button>
        </form>
      </div>

      {rides.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No rides assigned to you right now. Dispatch: {site.phone}
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {rides.map((r) => {
          const next = NEXT_STEP[r.status];
          return (
            <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {r.date} at {r.time.slice(0, 5)}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="mt-2 text-slate-900 dark:text-slate-100">
                {r.name} · <span className="capitalize">{r.mobility}</span>
                {r.companions > 0 && ` · ${r.companions} companion${r.companions > 1 ? "s" : ""}`}
              </p>
              <a href={`tel:${r.phone}`} className="mt-1 inline-flex min-h-10 items-center gap-2 text-sky-700 underline dark:text-sky-400">
                <Icon name="phone" className="size-4" />
                {r.phone}
              </a>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-slate-700 dark:text-slate-300">Pickup</dt>
                  <dd>
                    <a href={maps(r.pickup)} target="_blank" rel="noreferrer" className="text-sky-700 underline dark:text-sky-400">
                      {r.pickup}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700 dark:text-slate-300">Destination</dt>
                  <dd>
                    <a href={maps(r.dropoff)} target="_blank" rel="noreferrer" className="text-sky-700 underline dark:text-sky-400">
                      {r.dropoff}
                    </a>
                  </dd>
                </div>
                {r.notes && (
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Notes</dt>
                    <dd className="text-slate-600 dark:text-slate-400">{r.notes}</dd>
                  </div>
                )}
              </dl>
              {next && (
                <form action={driverUpdate} className="mt-4 space-y-3">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value={next.status} />
                  <GeoFields />
                  {next.status === "completed" && (
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Passenger signature</p>
                      <div className="mt-1.5">
                        <SignaturePad />
                      </div>
                    </div>
                  )}
                  <button className="btn-primary min-h-12 w-full">{stepLabel[r.status]}</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
