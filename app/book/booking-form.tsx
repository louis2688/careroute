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
import { MOBILITY, PURPOSES, oneOf, TRIP_TYPES } from "@/lib/booking";
import { drivingRoute, searchPlaces, type Place } from "@/lib/geo";
import { estimateFare, kmToMiles, money } from "@/lib/pricing";
import { submitBooking } from "./actions";

type Quote = { km: number; minutes: number; cents: number };

const input =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-700";
const legend = "font-heading text-lg font-semibold text-slate-900";
const groupLabel = "text-sm font-medium text-slate-800";

const noop = () => () => {};
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

const mobilityHelp: Record<(typeof MOBILITY)[number], string> = {
  ambulatory: "Can walk with little or no help. A cane or walker is fine.",
  wheelchair: "Rides in a wheelchair, their own or a loaner.",
  stretcher: "Must stay lying down for the trip.",
};

type AddressKey = "pickup" | "dropoff";

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

export function BookingForm({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  // Warm up the two hosts the form talks to, before the passenger starts typing.
  preconnect("https://photon.komoot.io");
  preconnect("https://router.project-osrm.org");
  const [state, action, pending] = useActionState(submitBooking, null);
  // Client-only value with no effect: empty on the server, the passenger's local date after hydration.
  const minDate = useSyncExternalStore(noop, today, () => "");

  const [options, setOptions] = useState<Record<AddressKey, Place[]>>({ pickup: [], dropoff: [] });
  const [picked, setPicked] = useState<Partial<Record<AddressKey, Place>>>({});
  const [quote, setQuote] = useState<Quote | null | "loading">(null);
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
    const sent = [state.notified.email && "your email", state.notified.sms && "your phone"].filter(Boolean);
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <Icon name="check-circle" className="size-10 text-emerald-700" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">Request received</h2>
        <p className="mt-3 text-slate-700">
          Your reference number is{" "}
          <strong className="font-semibold text-slate-900">{state.ref}</strong>. Dispatch will call
          or email you within one business hour to confirm the pickup window and the price.
          {sent.length > 0 && ` A confirmation is on its way to ${sent.join(" and ")}.`}
        </p>
        <p className="mt-2 text-slate-700">
          Need to change something? Call{" "}
          <a href={phoneHref} className="font-medium text-sky-700 underline">
            {phone}
          </a>{" "}
          and give the reference number.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/trip/${state.ref}`} className="btn-primary">
            Track your ride
            <Icon name="arrow-right" className="size-4" />
          </Link>
          <a href="/book" className="btn-secondary">
            Book another ride
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={action} onChange={onFormChange} className="space-y-10">
      {state && !state.ok && (
        <p
          role="alert"
          className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <Icon name="alert-circle" className="size-5 shrink-0" />
          {state.error}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className={legend}>Passenger</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input name="name" required autoComplete="name" className={input} />
          </Field>
          <Field label="Phone number" required hint="We text and call this number about the ride.">
            <input name="phone" type="tel" required autoComplete="tel" className={input} />
          </Field>
          <Field label="Email" required>
            <input name="email" type="email" required autoComplete="email" className={input} />
          </Field>
          <Field label="Reason for the trip">
            <select name="purpose" className={input}>
              {PURPOSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>Trip details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pickup address" required hint="Start typing, then pick from the suggestions.">
            <input name="pickup" list="pickup-list" required autoComplete="off" className={input} />
            <datalist id="pickup-list">
              {options.pickup.map((p) => (
                <option key={p.label} value={p.label} />
              ))}
            </datalist>
          </Field>
          <Field label="Destination" required hint="Facility name or address.">
            <input name="dropoff" list="dropoff-list" required autoComplete="off" className={input} />
            <datalist id="dropoff-list">
              {options.dropoff.map((p) => (
                <option key={p.label} value={p.label} />
              ))}
            </datalist>
          </Field>
          <Field label="Appointment date" required>
            <input name="date" type="date" required min={minDate} className={input} />
          </Field>
          <Field label="Pickup time" required hint="We suggest 45 minutes before the appointment.">
            <input name="time" type="time" required className={input} />
          </Field>
          <fieldset>
            <legend className={groupLabel}>
              Trip type
              <Star />
            </legend>
            <div className="mt-1.5 flex gap-6">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-slate-800">
                <input
                  type="radio"
                  name="tripType"
                  value="one-way"
                  required
                  defaultChecked
                  className="size-4 accent-sky-700"
                />
                One-way
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-slate-800">
                <input type="radio" name="tripType" value="round-trip" className="size-4 accent-sky-700" />
                Round trip
              </label>
            </div>
          </fieldset>
          <Field
            label="Return pickup time"
            hint="Round trips only. Leave blank if the driver should wait."
          >
            <input name="returnTime" type="time" className={input} />
          </Field>
        </div>
        <input type="hidden" name="pickup_lat" value={picked.pickup?.lat ?? ""} />
        <input type="hidden" name="pickup_lon" value={picked.pickup?.lon ?? ""} />
        <input type="hidden" name="dropoff_lat" value={picked.dropoff?.lat ?? ""} />
        <input type="hidden" name="dropoff_lon" value={picked.dropoff?.lon ?? ""} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>Transportation needs</legend>
        <fieldset>
          <legend className={groupLabel}>
            Mobility
            <Star />
          </legend>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
            {MOBILITY.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer gap-3 rounded-lg border border-slate-300 bg-white p-3 transition-colors has-checked:border-sky-700 has-checked:bg-sky-50"
              >
                <input
                  type="radio"
                  name="mobility"
                  value={m}
                  required
                  className="mt-1 size-4 shrink-0 accent-sky-700"
                />
                <span>
                  <span className="block font-medium text-slate-900 capitalize">{m}</span>
                  <span className="block text-sm text-slate-600">{mobilityHelp[m]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Companions" hint="One companion rides free.">
            <select name="companions" className={input}>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Special requirements"
          hint="Oxygen, bariatric vehicle, loaner wheelchair, stairs at the pickup, preferred language, or anything else the driver should know."
        >
          <textarea name="notes" rows={4} maxLength={2000} className={input} />
        </Field>
      </fieldset>

      <div className="space-y-5 border-t border-slate-200 pt-6">
        <div aria-live="polite" className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          {quote === "loading" ? (
            <p className="text-sm text-slate-600">Calculating a fare estimate…</p>
          ) : quote ? (
            <>
              <p className="text-sm font-medium text-sky-900">Estimated fare</p>
              <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{money(quote.cents)}</p>
              <p className="mt-1 text-sm text-slate-600">
                {kmToMiles(quote.km).toFixed(1)} miles each way, about {Math.round(quote.minutes)} minutes
                of driving. Dispatch confirms the final price.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Pick the pickup and destination from the address suggestions and choose a mobility
              option to see a fare estimate.
            </p>
          )}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" name="agree" required className="mt-0.5 size-4 shrink-0 accent-sky-700" />
          <span>
            I have read and agree to the{" "}
            <Link href="/terms" className="font-medium text-sky-700 underline">
              Terms & Conditions
            </Link>
            , including the cancellation and no-show policy.
            <Star />
          </span>
        </label>
        <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
          {pending ? "Sending request…" : "Submit ride request"}
        </button>
        <p className="text-sm text-slate-500">
          This is a request, not a confirmed booking. Dispatch confirms every ride by phone, text,
          or email.
        </p>
      </div>
    </form>
  );
}
