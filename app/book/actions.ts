"use server";

import { after } from "next/server";
import { occurrences, validateBooking } from "@/lib/booking";
import { bookingRow, insertBookings } from "@/lib/db";
import { drivingRoute } from "@/lib/geo";
import { channels, notify, siteUrl } from "@/lib/notify";
import { estimateFare } from "@/lib/pricing";
import { getSession } from "@/lib/session";

export type BookingState =
  | { ok: true; ref: string; count: number; until?: string; notified: { email: boolean; sms: boolean } }
  | { ok: false; error: string }
  | null;

const newRef = () => `CR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const result = validateBooking(form);
  if (!result.ok) return { ok: false, error: result.error };
  const b = result.booking;
  // Never trust a price from the browser: route and price again here.
  const route = b.coords ? await drivingRoute(b.coords.pickup, b.coords.dropoff) : null;
  const quote = route && { ...route, cents: estimateFare(route.km, b.mobility, b.tripType) };
  // A facility signed in to the portal books on behalf of its patients.
  const facility = await getSession("facility");

  const dates = b.recurrence ? occurrences(b.date, b.recurrence.days, b.recurrence.until) : [b.date];
  const series_id = dates.length > 1 ? crypto.randomUUID() : null;
  const rows = dates.map((date) => bookingRow(newRef(), b, quote, { date, series_id, facility_id: facility?.id }));
  try {
    await insertBookings(rows);
  } catch (e) {
    console.error(`[booking ${rows[0].ref}] save failed`, e);
    return { ok: false, error: "We could not save your request. Please call dispatch." };
  }
  const base = await siteUrl();
  const note = series_id ? `This is a standing order: ${rows.length} rides through ${b.recurrence!.until}.` : "";
  after(() => notify({ ...b, ref: rows[0].ref }, "new", base, note));
  return { ok: true, ref: rows[0].ref, count: rows.length, until: b.recurrence?.until, notified: channels() };
}
