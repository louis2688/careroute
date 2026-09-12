import type { Metadata } from "next";
import { listFacilities, type Facility } from "@/lib/db";
import { saveFacility } from "../actions";

export const metadata: Metadata = { title: "Facilities", robots: { index: false } };
export const dynamic = "force-dynamic";

const input =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export default async function FacilitiesPage() {
  let facilities: Facility[] = [];
  let error = "";
  try {
    facilities = await listFacilities();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="pb-10">
      <div className="mt-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Facilities</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Hospitals, dialysis centers, and care homes that book for their patients. Each signs in to the
          facility portal with its access code.
        </p>
      </div>

      <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100">Add a facility</summary>
        <form action={saveFacility} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Facility name
            <input name="name" required className={input} />
          </label>
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Access code
            <input name="access_code" required pattern="[A-Za-z0-9-]{6,32}" placeholder="e.g. RIVERSIDE-2026" className={input} />
          </label>
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Contact
            <input name="contact_name" className={input} />
          </label>
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Phone
            <input name="phone" type="tel" className={input} />
          </label>
          <div className="self-end">
            <button className="btn-primary min-h-9 px-4 py-1.5 text-sm">Add facility</button>
          </div>
        </form>
      </details>

      {error ? (
        <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Could not load facilities. {error}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Facility</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Access code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {facilities.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{f.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {f.contact_name ?? ""}
                    {f.phone && <span className="block">{f.phone}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">{f.access_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
