import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Transportation for every level of mobility"
        intro="Every service below comes with a trained driver, a vehicle matched to the passenger, and a dispatcher who confirms the trip. Pick the one that fits, or call and we will help you choose."
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {site.services.map((s) => (
            <li
              key={s.slug}
              id={s.slug}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
            >
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-700 text-white">
                  <Icon name={s.icon} className="size-6" />
                </span>
                <h2 className="font-heading text-xl font-semibold text-slate-900">{s.name}</h2>
              </div>
              <p className="mt-4 text-slate-600">{s.summary}</p>
              <ul className="mt-4 space-y-2">
                {s.details.map((d) => (
                  <li key={d} className="flex gap-2 text-sm text-slate-700">
                    <Icon name="check" className="mt-0.5 size-4 shrink-0 text-sky-700" />
                    {d}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <section className="mt-12 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-slate-900">Vehicles and safety</h2>
            <p className="mt-3 text-slate-600">
              Sedans and minivans for ambulatory passengers. Lift-equipped vans with four-point
              tie-downs for wheelchairs. Dedicated stretcher vehicles with two attendants. Every
              vehicle is inspected daily, cleaned between trips, and carries a first aid kit.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-slate-900">Not sure which service fits?</h2>
            <p className="mt-3 text-slate-600">
              Describe the passenger and the appointment. Dispatch will match the vehicle and quote
              the trip before anything is confirmed.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary">
                Book a ride
              </Link>
              <a href={site.phoneHref} className="btn-secondary">
                <Icon name="phone" className="size-4" />
                {site.phone}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
