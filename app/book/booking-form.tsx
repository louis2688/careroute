"use client";

import Link from "next/link";
import {
  useActionState,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { preconnect } from "react-dom";
import { Icon } from "@/components/icons";
import { MAX_SERIES, MOBILITY, PURPOSES, TRIP_TYPES, oneOf, type Intake } from "@/lib/booking";
import { drivingRoute, searchPlaces, type Place } from "@/lib/geo";
import { href, ui, type Lang } from "@/lib/i18n";
import { estimateFare, kmToMiles, money } from "@/lib/pricing";
import { submitBooking } from "./actions";
import { parseRideRequest } from "./intake";

type Quote = { km: number; minutes: number; cents: number };
type AddressKey = "pickup" | "dropoff";

const input =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-700";
const legend = "font-heading text-lg font-semibold text-slate-900";
const groupLabel = "text-sm font-medium text-slate-800";

const noop = () => () => {};
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

function Star() {
  return (
    <span aria-hidden="true" className="text-red-600">
      {" "}
      *
    </span>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={groupLabel}>
        {label}
        {required && <Star />}
      </span>
      {children}
      {hint && <span className="mt-1 block text-sm text-slate-500">{hint}</span>}
    </label>
  );
}

export function BookingForm({
  lang,
  phone,
  phoneHref,
  defaults,
}: {
  lang: Lang;
  phone: string;
  phoneHref: string;
  defaults: { name: string; email: string };
}) {
  const c = ui[lang].book.form;
  const k = ui[lang].book.confirm;
  // Warm up the two hosts the form talks to, before the passenger starts typing.
  preconnect("https://photon.komoot.io");
  preconnect("https://router.project-osrm.org");
  const [state, action, pending] = useActionState(submitBooking, null);
  // Client-only value with no effect: empty on the server, the passenger's local date after hydration.
  const minDate = useSyncExternalStore(noop, today, () => "");

  const [options, setOptions] = useState<Record<AddressKey, Place[]>>({ pickup: [], dropoff: [] });
  const [picked, setPicked] = useState<Partial<Record<AddressKey, Place>>>({});
  const [quote, setQuote] = useState<Quote | null | "loading">(null);
  const [draft, setDraft] = useState("");
  const [intake, setIntake] = useState<{ busy: boolean; message: string }>({ busy: false, message: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const places = useRef(new Map<string, Place>()); // every suggestion seen, by label
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const quoteSeq = useRef(0);

  const debounce = (key: string, fn: () => void, ms: number) => {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(fn, ms);
  };

  async function requestQuote(form: HTMLFormElement) {
    const fd = new FormData(form);
    const from = places.current.get(String(fd.get("pickup")));
    const to = places.current.get(String(fd.get("dropoff")));
    const mobility = String(fd.get("mobility") ?? "");
    const tripType = String(fd.get("tripType") ?? "one-way");
    if (!from || !to || !oneOf(MOBILITY, mobility) || !oneOf(TRIP_TYPES, tripType)) return setQuote(null);
    const seq = ++quoteSeq.current;
    setQuote("loading");
    // Estimate only. The server routes and prices the trip again when the form is submitted.
    const route = await drivingRoute(from, to);
    if (seq !== quoteSeq.current) return; // a newer request is in flight
    setQuote(route && { ...route, cents: estimateFare(route.km, mobility, tripType) });
  }

  // Writes the assistant's fields into the uncontrolled form, then geocodes the addresses it found.
  async function applyIntake(fields: Partial<Intake>) {
    const form = formRef.current;
    if (!form) return;
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
    const check = (name: string, value: string | number) => {
      const r = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
      if (r) r.checked = true;
    };
    let filled = 0;
    for (const key of ["name", "phone", "email", "date", "time", "returnTime", "notes", "until"] as const) {
      const v = fields[key];
      const el = field(key);
      if (v && el) {
        el.value = v;
        filled++;
      }
    }
    for (const key of ["purpose", "companions"] as const) {
      const v = fields[key];
      const el = field(key);
      if (v != null && el) {
        el.value = String(v);
        filled++;
      }
    }
    if (fields.tripType) {
      check("tripType", fields.tripType);
      filled++;
    }
    if (fields.mobility) {
      check("mobility", fields.mobility);
      filled++;
    }
    if (fields.days?.length) {
      const details = form.querySelector("details");
      if (details) details.open = true;
      for (const d of fields.days) check("days", d);
      filled++;
    }
    for (const key of ["pickup", "dropoff"] as const) {
      const q = fields[key];
      const el = field(key);
      if (!q || !el) continue;
      filled++;
      const found = await searchPlaces(q);
      const top = found[0];
      if (top) {
        for (const p of found) places.current.set(p.label, p);
        setOptions((o) => ({ ...o, [key]: found }));
        setPicked((p) => ({ ...p, [key]: top }));
        el.value = top.label;
      } else {
        el.value = q;
      }
    }
    await requestQuote(form);
    return filled;
  }

  async function runIntake() {
    setIntake({ busy: true, message: c.assistReading });
    const result = await parseRideRequest(draft).catch(() => null);
    if (!result) return setIntake({ busy: false, message: c.assistUnavailable });
    if (!result.ok) return setIntake({ busy: false, message: result.error });
    const filled = (await applyIntake(result.fields)) ?? 0;
    setIntake({ busy: false, message: filled ? c.assistFilled(filled) : c.assistNothing });
  }

  // One handler for the whole form: address typing fetches suggestions, anything else refreshes the quote.
  function onFormChange(e: FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const t = e.target as HTMLInputElement;
    if (t.name === "pickup" || t.name === "dropoff") {
      const key = t.name;
      const q = t.value.trim();
      const place = places.current.get(q); // exact label match means it was picked from the list
      setPicked((p) => ({ ...p, [key]: place }));
      if (!place && q.length >= 3) {
        debounce(
          key,
          async () => {
            const found = await searchPlaces(q);
            for (const p of found) places.current.set(p.label, p);
            setOptions((o) => ({ ...o, [key]: found }));
          },
          300,
        );
      }
    }
    debounce("quote", () => requestQuote(form), 400);
  }

  if (state?.ok) {
    const sent = [state.notified.email && k.yourEmail, state.notified.sms && k.yourPhone].filter(Boolean);
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <Icon name="check-circle" className="size-10 text-emerald-700" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">{k.title}</h2>
        <p className="mt-3 text-slate-700">
          {k.ref1} <strong className="font-semibold text-slate-900">{state.ref}</strong>
          {k.ref2}
          {sent.length > 0 && k.sentTo(sent.join(` ${k.and} `))}
        </p>
        {state.count > 1 && <p className="mt-2 text-slate-700">{k.series(state.count, state.until ?? "")}</p>}
        <p className="mt-2 text-slate-700">
          {k.change1}{" "}
          <a href={phoneHref} className="font-medium text-sky-700 underline">
            {phone}
          </a>{" "}
          {k.change2}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={href(lang, `/trip/${state.ref}`)} className="btn-primary">
            {k.track}
            <Icon name="arrow-right" className="size-4" />
          </Link>
          <a href={href(lang, "/book")} className="btn-secondary">
            {k.another}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} onChange={onFormChange} className="space-y-10">
      <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-5">
        <label className="block">
          <span className="font-heading font-semibold text-slate-900">{c.assistTitle}</span>
          <span className="mt-1 block text-sm text-slate-600">{c.assistExample}</span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={2000}
            className={input}
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={runIntake} disabled={intake.busy || draft.trim().length < 10} className="btn-secondary">
            {intake.busy ? c.assistBusy : c.assistButton}
          </button>
          <p aria-live="polite" className="text-sm text-slate-700">
            {intake.message}
          </p>
        </div>
      </section>

      {state && !state.ok && (
        <p role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <Icon name="alert-circle" className="size-5 shrink-0" />
          {state.error}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className={legend}>{c.passenger}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.fullName} required>
            <input name="name" required autoComplete="name" defaultValue={defaults.name} className={input} />
          </Field>
          <Field label={c.phone} required hint={c.phoneHint}>
            <input name="phone" type="tel" required autoComplete="tel" className={input} />
          </Field>
          <Field label={c.email} required>
            <input name="email" type="email" required autoComplete="email" defaultValue={defaults.email} className={input} />
          </Field>
          <Field label={c.reason}>
            <select name="purpose" className={input}>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {c.purposes[p] ?? p}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>{c.tripDetails}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.pickup} required hint={c.pickupHint}>
            <input name="pickup" list="pickup-list" required autoComplete="off" className={input} />
            <datalist id="pickup-list">
              {options.pickup.map((p) => (
                <option key={p.label} value={p.label} />
              ))}
            </datalist>
          </Field>
          <Field label={c.destination} required hint={c.destinationHint}>
            <input name="dropoff" list="dropoff-list" required autoComplete="off" className={input} />
            <datalist id="dropoff-list">
              {options.dropoff.map((p) => (
                <option key={p.label} value={p.label} />
              ))}
            </datalist>
          </Field>
          <Field label={c.date} required>
            <input name="date" type="date" required min={minDate} className={input} />
          </Field>
          <Field label={c.time} required hint={c.timeHint}>
            <input name="time" type="time" required className={input} />
          </Field>
          <fieldset>
            <legend className={groupLabel}>
              {c.tripType}
              <Star />
            </legend>
            <div className="mt-1.5 flex gap-6">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-slate-800">
                <input type="radio" name="tripType" value="one-way" required defaultChecked className="size-4 accent-sky-700" />
                {c.oneWay}
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-slate-800">
                <input type="radio" name="tripType" value="round-trip" className="size-4 accent-sky-700" />
                {c.roundTrip}
              </label>
            </div>
          </fieldset>
          <Field label={c.returnTime} hint={c.returnHint}>
            <input name="returnTime" type="time" className={input} />
          </Field>
        </div>
        <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-900">{c.repeat}</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className={groupLabel}>{c.repeatOn}</legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {c.weekdays.map((day, i) => (
                  <label
                    key={day}
                    className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 has-checked:border-sky-700 has-checked:bg-sky-50"
                  >
                    <input type="checkbox" name="days" value={i} className="size-4 accent-sky-700" />
                    {day}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label={c.until} hint={c.untilHint(MAX_SERIES)}>
              <input name="until" type="date" min={minDate} className={input} />
            </Field>
          </div>
        </details>
        <input type="hidden" name="pickup_lat" value={picked.pickup?.lat ?? ""} />
        <input type="hidden" name="pickup_lon" value={picked.pickup?.lon ?? ""} />
        <input type="hidden" name="dropoff_lat" value={picked.dropoff?.lat ?? ""} />
        <input type="hidden" name="dropoff_lon" value={picked.dropoff?.lon ?? ""} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>{c.needs}</legend>
        <fieldset>
          <legend className={groupLabel}>
            {c.mobility}
            <Star />
          </legend>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
            {MOBILITY.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer gap-3 rounded-lg border border-slate-300 bg-white p-3 transition-colors has-checked:border-sky-700 has-checked:bg-sky-50"
              >
                <input type="radio" name="mobility" value={m} required className="mt-1 size-4 shrink-0 accent-sky-700" />
                <span>
                  <span className="block font-medium text-slate-900">{c.mobilityNames[m]}</span>
                  <span className="block text-sm text-slate-600">{c.mobilityHelp[m]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.companions} hint={c.companionsHint}>
            <select name="companions" className={input}>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={c.special} hint={c.specialHint}>
          <textarea name="notes" rows={4} maxLength={2000} className={input} />
        </Field>
      </fieldset>

      <div className="space-y-5 border-t border-slate-200 pt-6">
        <div aria-live="polite" className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          {quote === "loading" ? (
            <p className="text-sm text-slate-600">{c.calculating}</p>
          ) : quote ? (
            <>
              <p className="text-sm font-medium text-sky-900">{c.estimated}</p>
              <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{money(quote.cents)}</p>
              <p className="mt-1 text-sm text-slate-600">
                {c.fareDetail(kmToMiles(quote.km).toFixed(1), Math.round(quote.minutes))}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">{c.pickToSee}</p>
          )}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" name="agree" required className="mt-0.5 size-4 shrink-0 accent-sky-700" />
          <span>
            {c.agree1}{" "}
            <Link href={href(lang, "/terms")} className="font-medium text-sky-700 underline">
              {c.agreeLink}
            </Link>
            {c.agree2}
            <Star />
          </span>
        </label>
        <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
          {pending ? c.sending : c.submit}
        </button>
        <p className="text-sm text-slate-500">{c.notConfirmed}</p>
      </div>
    </form>
  );
}
