import Link from "next/link";
import { Icon } from "@/components/icons";
import { site } from "@/lib/site";

const eyebrow = "text-sm font-semibold tracking-wide text-sky-700 uppercase";
const h2 = "mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900";
const card = "rounded-xl border border-slate-200 bg-white p-6";

export default function Home() {
  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className={eyebrow}>Non-emergency medical transportation</p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Rides to medical appointments, with help at the door.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">{site.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary">
                Book a ride
                <Icon name="arrow-right" className="size-4" />
              </Link>
              <a href={site.phoneHref} className="btn-secondary">
                <Icon name="phone" className="size-4" />
                Call dispatch
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">{site.hours}. Not for emergencies.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Every ride includes</h2>
            <ul className="mt-5 space-y-5">
              {site.included.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-sky-700 ring-1 ring-slate-200">
                    <Icon name={f.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{f.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label="Credentials" className="bg-slate-900 text-white">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {site.proof.map((p) => (
            <li key={p.title} className="flex gap-3">
              <Icon name={p.icon} className="size-6 shrink-0 text-sky-300" />
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="mt-0.5 text-sm text-slate-300">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className={eyebrow}>About {site.name}</p>
            <h2 className={h2}>Who we are</h2>
            {site.about.map((p) => (
              <p key={p} className="mt-4 text-slate-600">
                {p}
              </p>
            ))}
            <h3 className="mt-8 font-heading font-semibold text-slate-900">Who we serve</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {site.serves.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:self-start">
            <div className={card}>
              <h3 className="font-heading text-lg font-semibold text-slate-900">Our mission</h3>
              <p className="mt-2 text-slate-600">{site.mission}</p>
            </div>
            <div className={card}>
              <h3 className="font-heading text-lg font-semibold text-slate-900">Our vision</h3>
              <p className="mt-2 text-slate-600">{site.vision}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Services</p>
              <h2 className={h2}>Transportation for every level of mobility</h2>
            </div>
            <Link href="/services" className="btn-secondary">
              All services
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services#${s.slug}`}
                  className="block h-full rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-sky-700 hover:bg-white"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-sky-700 text-white">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-heading font-semibold text-slate-900">{s.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <p className={eyebrow}>How booking works</p>
        <h2 className={h2}>Three steps from request to pickup</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {site.steps.map((step, i) => (
            <li key={step.title} className={card}>
              <span className="grid size-9 place-items-center rounded-full bg-slate-900 font-heading font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sky-700">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              Ready to schedule a ride?
            </h2>
            <p className="mt-2 text-sky-100">
              Book online in about two minutes, or call dispatch and we will take the details over
              the phone.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/book" className="btn-secondary">
              Book a ride
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/40 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Icon name="phone" className="size-4" />
              {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
