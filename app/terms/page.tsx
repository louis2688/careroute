import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Terms & Conditions"
        title="Terms and conditions of service"
        intro={`Effective ${site.termsEffective}. These terms cover every ride booked with ${site.name}. They are written in plain language on purpose. If anything is unclear, call dispatch before you book.`}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_1fr] lg:py-16">
        <nav aria-label="Sections" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold text-slate-900">On this page</p>
          <ol className="mt-3 space-y-1 text-sm">
            {site.terms.map((t, i) => (
              <li key={t.title}>
                <a
                  href={`#${slug(t.title)}`}
                  className="inline-block py-1 text-slate-600 transition-colors hover:text-sky-700"
                >
                  {i + 1}. {t.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-10">
          {site.terms.map((t, i) => (
            <section key={t.title} id={slug(t.title)} className="scroll-mt-24">
              <h2 className="font-heading text-xl font-semibold text-slate-900">
                {i + 1}. {t.title}
              </h2>
              {t.body.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="border-t border-slate-200 pt-8 text-slate-700">
            Questions about these terms? Email{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-sky-700 underline">
              {site.email}
            </a>{" "}
            or call{" "}
            <a href={site.phoneHref} className="font-medium text-sky-700 underline">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
