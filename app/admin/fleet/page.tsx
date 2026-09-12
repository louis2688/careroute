import type { Metadata } from "next";
import { MOBILITY } from "@/lib/booking";
import { listDrivers, type Driver } from "@/lib/db";
import { CREDENTIALS, expiryTone, todayISO, type Tone } from "@/lib/fleet";
import { saveDriver } from "../actions";

export const metadata: Metadata = { title: "Drivers & fleet", robots: { index: false } };
export const dynamic = "force-dynamic";

const tone: Record<Tone, string> = {
  expired: "bg-red-100 text-red-800",
  soon: "bg-amber-100 text-amber-900",
  ok: "bg-emerald-50 text-emerald-800",
  missing: "bg-slate-100 text-slate-600",
};
const toneLabel: Record<Tone, string> = { expired: "Expired", soon: "Due soon", ok: "Valid", missing: "Missing" };

const input =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-sky-700";

function DriverForm({ driver }: { driver?: Driver }) {
  return (
    <form action={saveDriver} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {driver && <input type="hidden" name="id" value={driver.id} />}
      <label className="text-sm font-medium text-slate-800">
        Name
        <input name="name" required defaultValue={driver?.name} className={input} />
      </label>
      <label className="text-sm font-medium text-slate-800">
        Phone
        <input name="phone" type="tel" required defaultValue={driver?.phone} className={input} />
      </label>
      <label className="text-sm font-medium text-slate-800">
        Vehicle
        <select name="vehicle_type" defaultValue={driver?.vehicle_type ?? "wheelchair"} className={input}>
          {MOBILITY.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-800">
        Plate
        <input name="plate" required defaultValue={driver?.plate} className={input} />
      </label>
      {CREDENTIALS.map(([key, label]) => (
        <label key={key} className="text-sm font-medium text-slate-800">
          {label} expires
          <input name={key} type="date" defaultValue={driver?.[key] ?? ""} className={input} />
        </label>
      ))}
      <label className="text-sm font-medium text-slate-800">
        Driver app PIN {driver && <span className="font-normal text-slate-500">(blank keeps {driver.pin})</span>}
        <input name="pin" inputMode="numeric" pattern="\d{4,8}" required={!driver} className={input} />
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-800">
        <input type="checkbox" name="active" defaultChecked={driver ? driver.active : true} className="size-4 accent-sky-700" />
        Active
      </label>
      <div className="self-end">
        <button className="btn-primary min-h-9 px-4 py-1.5 text-sm">{driver ? "Save" : "Add driver"}</button>
      </div>
    </form>
  );
}

export default async function FleetPage() {
  let drivers: Driver[] = [];
  let error = "";
  try {
    drivers = await listDrivers();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  const today = todayISO();
  const tones = drivers
    .filter((d) => d.active)
    .flatMap((d) => CREDENTIALS.map(([k]) => expiryTone(d[k], today)));
  const expired = tones.filter((t) => t === "expired").length;
  const soon = tones.filter((t) => t === "soon").length;

  return (
    <div className="pb-10">
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Drivers & fleet</h1>
          <p className="mt-1 text-sm text-slate-600">
            {drivers.filter((d) => d.active).length} active drivers.{" "}
            <span className={expired ? "font-semibold text-red-700" : ""}>{expired} credentials expired</span>,{" "}
            <span className={soon ? "font-semibold text-amber-800" : ""}>{soon} due within 30 days</span>.
          </p>
        </div>
      </div>

      <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-medium text-slate-900">Add a driver</summary>
        <div className="mt-4">
          <DriverForm />
        </div>
      </details>

      {error ? (
        <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load drivers. {error}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Driver</th>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                {CREDENTIALS.map(([k, label]) => (
                  <th key={k} className="px-4 py-3 font-semibold">
                    {label}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {drivers.map((d) => (
                <tr key={d.id} className={d.active ? "" : "opacity-60"}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {d.name}
                      {!d.active && <span className="ml-2 text-xs text-slate-500">inactive</span>}
                    </p>
                    <p className="text-slate-600">{d.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-900 capitalize">{d.vehicle_type}</p>
                    <p className="text-slate-600">{d.plate}</p>
                  </td>
                  {CREDENTIALS.map(([k]) => {
                    const t = expiryTone(d[k], today);
                    return (
                      <td key={k} className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tone[t]}`}>
                          {toneLabel[t]}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">{d[k] ?? "no date"}</p>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-sky-700">Edit</summary>
                      <div className="mt-3 w-[56rem] max-w-[80vw]">
                        <DriverForm driver={d} />
                      </div>
                    </details>
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
