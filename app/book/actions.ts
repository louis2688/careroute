"use server";

import { validateBooking } from "@/lib/booking";

export type BookingState = { ok: true; ref: string } | { ok: false; error: string } | null;

export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const result = validateBooking(form);
  if (!result.ok) return { ok: false, error: result.error };
  const ref = `CR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  // ponytail: nothing is stored yet. Replace this log with a DB insert or a dispatch email.
  console.log(`[booking ${ref}]`, result.booking);
  return { ok: true, ref };
}
