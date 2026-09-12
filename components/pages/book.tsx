import { BookingForm } from "@/app/book/booking-form";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { getSite } from "@/lib/content";
import { ui, type Lang } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export async function BookPage({ lang }: { lang: Lang }) {
  const site = getSite(lang);
  const t = ui[lang].book;
  const user = await getSession("user");
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro(site.phone)} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <BookingForm
            lang={lang}
            phone={site.phone}
            phoneHref={site.phoneHref}
            defaults={{ name: user?.name ?? "", email: user?.id ?? "" }}
          />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-heading text-lg font-semibold text-slate-900">{t.whatNext}</h2>
            <ol className="mt-4 space-y-4">
              {site.steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{step.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-heading text-lg font-semibold text-slate-900">{t.needToday}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.needTodayText}</p>
            <a href={site.phoneHref} className="btn-secondary mt-4 w-full">
              <Icon name="phone" className="size-4" />
              {site.phone}
            </a>
            <p className="mt-3 text-xs text-slate-500">{site.hours}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
