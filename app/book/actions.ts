"use server";

import { after } from "next/server";
import { MOBILITY, TRIP_TYPES, oneOf, validateBooking, type Booking } from "@/lib/booking";
import { insertBooking } from "@/lib/db";
import { drivingRoute, isPlace, type Place } from "@/lib/geo";
import { channels, notify, siteUrl } from "@/lib/notify";
import { estimateFare } from "@/lib/pricing";

export type Quote = { km: number; minutes: number; cents: number };
export type BookingState =
  | { ok: true; ref: string; notified: { email: boolean; sms: boolean } }
  | { ok: false; error: string }
  | null;

async function quoteFor(
  from: Place,
  to: Place,
  mobility: Booking["mobility"],
  tripType: Booking["tripType"],
): Promise<Quote | null> {
  const r = await drivingRoute(from, to);
  return r && { ...r, cents: estimateFare(r.km, mobility, tripType) };
}

// Live estimate while the passenger fills in the form. Public endpoint: validate everything.
export async function quoteTrip(input: {
  from: unknown;
  to: unknown;
  mobility: string;
  tripType: string;
}): Promise<Quote | null> {
  const { from, to, mobility, tripType } = input;
  if (!isPlace(from) || !isPlace(to) || !oneOf(MOBILITY, mobility) || !oneOf(TRIP_TYPES, tripType)) {
    return null;
  }
  return quoteFor(from, to, mobility, tripType);
}

export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const result = validateBooking(form);
  if (!result.ok) return { ok: false, error: result.error };
  const b = result.booking;
  const ref = `CR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  // Never trust a price from the browser: route and price again here.
  const quote = b.coords ? await quoteFor(b.coords.pickup, b.coords.dropoff, b.mobility, b.tripType) : null;
  try {
    await insertBooking(ref, b, quote);
  } catch (e) {
    console.error(`[booking ${ref}] save failed`, e);
    return { ok: false, error: "We could not save your request. Please call dispatch." };
  }
  const base = await siteUrl();
  after(() => notify({ ...b, ref }, "new", base));
  return { ok: true, ref, notified: channels() };
}
