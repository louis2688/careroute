import { PageHeader } from "@/components/page-header";
import { getSite } from "@/lib/content";
import { ui, type Lang } from "@/lib/i18n";

const slug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");

export function TermsPage({ lang }: { lang: Lang }) {
  const site = getSite(lang);
  const t = ui[lang].terms;
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro(site.termsEffective, site.name)} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_1fr] lg:py-16">
        <nav aria-label={t.onThisPage} className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.onThisPage}</p>
          <ol className="mt-3 space-y-1 text-sm">
            {site.terms.map((s, i) => (
              <li key={s.title}>
                <a href={`#${slug(s.title)}`} className="inline-block py-1 text-slate-600 transition-colors hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-400">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-10">
          {site.terms.map((s, i) => (
            <section key={s.title} id={slug(s.title)} className="scroll-mt-24">
              <h2 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">
                {i + 1}. {s.title}
              </h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="border-t border-slate-200 pt-8 text-slate-700 dark:border-slate-800 dark:text-slate-300">
            {t.questions}{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-sky-700 underline dark:text-sky-400">
              {site.email}
            </a>{" "}
            {t.orCall}{" "}
            <a href={site.phoneHref} className="font-medium text-sky-700 underline dark:text-sky-400">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
