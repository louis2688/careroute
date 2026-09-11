import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Book a ride" };

export default function BookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="Request a ride"
        intro={`Fill in the trip details below. Dispatch confirms every request by phone or email within one business hour. For a ride today, call ${site.phone}.`}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <BookingForm phone={site.phone} phoneHref={site.phoneHref} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-heading text-lg font-semibold text-slate-900">What happens next</h2>
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
            <h2 className="font-heading text-lg font-semibold text-slate-900">Need a ride today?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Same-day rides depend on which vehicles are free. Call dispatch and we will tell you
              right away.
            </p>
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
