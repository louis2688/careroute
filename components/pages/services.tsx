import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { getSite } from "@/lib/content";
import { href, ui, type Lang } from "@/lib/i18n";

export function ServicesPage({ lang }: { lang: Lang }) {
  const site = getSite(lang);
  const t = ui[lang].services;
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {site.services.map((s) => (
            <li key={s.slug} id={s.slug} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
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
            <h2 className="font-heading text-xl font-semibold text-slate-900">{t.vehiclesTitle}</h2>
            <p className="mt-3 text-slate-600">{t.vehiclesText}</p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-slate-900">{t.notSureTitle}</h2>
            <p className="mt-3 text-slate-600">{t.notSureText}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={href(lang, "/book")} className="btn-primary">
                {ui[lang].nav.book}
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
