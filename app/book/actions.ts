"use server";

import { after } from "next/server";
import { validateBooking } from "@/lib/booking";
import { insertBooking } from "@/lib/db";
import { drivingRoute } from "@/lib/geo";
import { channels, notify, siteUrl } from "@/lib/notify";
import { estimateFare } from "@/lib/pricing";

export type BookingState =
  | { ok: true; ref: string; notified: { email: boolean; sms: boolean } }
  | { ok: false; error: string }
  | null;

export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const result = validateBooking(form);
  if (!result.ok) return { ok: false, error: result.error };
  const b = result.booking;
  const ref = `CR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  // Never trust a price from the browser: route and price again here.
  const route = b.coords ? await drivingRoute(b.coords.pickup, b.coords.dropoff) : null;
  const quote = route && { ...route, cents: estimateFare(route.km, b.mobility, b.tripType) };
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
