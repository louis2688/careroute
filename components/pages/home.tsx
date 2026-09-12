import Link from "next/link";
import { Icon } from "@/components/icons";
import { getSite } from "@/lib/content";
import { href, ui, type Lang } from "@/lib/i18n";

const eyebrow = "text-sm font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-400";
const h2 = "mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100";
const card = "rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900";

export function HomePage({ lang }: { lang: Lang }) {
  const site = getSite(lang);
  const t = ui[lang].home;
  return (
    <>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className={eyebrow}>{t.eyebrow}</p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">{t.h1}</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">{site.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={href(lang, "/book")} className="btn-primary">
                {ui[lang].nav.book}
                <Icon name="arrow-right" className="size-4" />
              </Link>
              <a href={site.phoneHref} className="btn-secondary">
                <Icon name="phone" className="size-4" />
                {t.callDispatch}
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {site.hours}. {t.notEmergencies}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{t.includes}</h2>
            <ul className="mt-5 space-y-5">
              {site.included.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-sky-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-sky-400 dark:ring-slate-700">
                    <Icon name={f.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{f.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label={t.credentials} className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {site.proof.map((p) => (
            <li key={p.title} className="flex gap-3">
              <Icon name={p.icon} className="size-6 shrink-0 text-sky-300 dark:text-sky-700" />
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="mt-0.5 text-sm text-slate-300 dark:text-slate-600">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className={eyebrow}>
              {t.about} {site.name}
            </p>
            <h2 className={h2}>{t.whoWeAre}</h2>
            {site.about.map((p) => (
              <p key={p} className="mt-4 text-slate-600 dark:text-slate-400">
                {p}
              </p>
            ))}
            <h3 className="mt-8 font-heading font-semibold text-slate-900 dark:text-slate-100">{t.whoWeServe}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {site.serves.map((s) => (
                <li key={s} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:self-start">
            <div className={card}>
              <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{t.mission}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{site.mission}</p>
            </div>
            <div className={card}>
              <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{t.vision}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{site.vision}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>{t.services}</p>
              <h2 className={h2}>{t.servicesTitle}</h2>
            </div>
            <Link href={href(lang, "/services")} className="btn-secondary">
              {t.allServices}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`${href(lang, "/services")}#${s.slug}`}
                  className="block h-full rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-sky-700 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-sky-700 text-white">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-heading font-semibold text-slate-900 dark:text-slate-100">{s.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <p className={eyebrow}>{t.how}</p>
        <h2 className={h2}>{t.howTitle}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {site.steps.map((step, i) => (
            <li key={step.title} className={card}>
              <span className="grid size-9 place-items-center rounded-full bg-slate-900 font-heading font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                {i + 1}
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sky-700">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">{t.ctaTitle}</h2>
            <p className="mt-2 text-sky-100">{t.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={href(lang, "/book")} className="btn-secondary">
              {ui[lang].nav.book}
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
